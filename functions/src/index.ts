import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import {
  queryNearbyPharmacies,
  createHoldTransaction,
  expireDueHolds,
  DuplicateHoldError,
  InsufficientStockError,
  InventoryNotFoundError,
} from "./services/pharmacyRepository";
import { extractMedicationFromImage } from "./services/geminiService";
import { checkDeterministicDDI, DEMO_FALLBACK_MEDICATIONS } from "./services/ddiRules";
import { getActiveMedicationsForUser, type ActiveMedicationRef } from "./services/medicationRepository";

/**
 * 1. searchPharmacies (Workstream 2)
 */
export const searchPharmacies = onCall({ cors: true }, async (request) => {
  const { query, latitude, longitude, radiusKm = 10 } = request.data || {};

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new HttpsError("invalid-argument", "latitude and longitude are required numbers.");
  }

  logger.info("searchPharmacies call received", { query, latitude, longitude, radiusKm });

  const pharmacies = await queryNearbyPharmacies(latitude, longitude, radiusKm, query || "");

  return {
    pharmacies,
    searchRadiusKm: radiusKm,
    totalFound: pharmacies.length,
  };
});

/**
 * 2. createHold (Workstream 2)
 */
export const createHold = onCall({ cors: true }, async (request) => {
  const { pharmacyId, inventoryId, quantity = 1 } = request.data || {};

  if (!pharmacyId || !inventoryId) {
    throw new HttpsError("invalid-argument", "pharmacyId and inventoryId are required.");
  }

  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError("unauthenticated", "You must be signed in to place a hold.");
  }

  try {
    const hold = await createHoldTransaction({ userId, pharmacyId, inventoryId, quantity });
    logger.info("createHold reservation created", { holdId: hold.id, pharmacyId, inventoryId, userId });

    return {
      hold: {
        holdId: hold.id,
        pharmacyId: hold.pharmacyId,
        inventoryId: hold.inventoryId,
        medicationName: hold.medicationName,
        quantity: hold.quantity,
        expiresAt: hold.expiresAt,
        status: hold.status,
      },
    };
  } catch (err) {
    if (err instanceof DuplicateHoldError) {
      throw new HttpsError("already-exists", err.message);
    }
    if (err instanceof InsufficientStockError) {
      throw new HttpsError("failed-precondition", err.message);
    }
    if (err instanceof InventoryNotFoundError) {
      throw new HttpsError("not-found", err.message);
    }
    throw err;
  }
});

/**
 * 3. extractFromScan (Workstream 3 - AI Vision / OCR Engine)
 */
export const extractFromScan = onCall({ cors: true }, async (request) => {
  const { imageBase64, scanType = "PRESCRIPTION" } = request.data || {};

  logger.info("extractFromScan processing", { scanType, hasImage: !!imageBase64 });

  const extracted = await extractMedicationFromImage(
    imageBase64 || "",
    "image/jpeg",
    scanType
  );

  return { extracted };
});

/**
 * 4. checkDDI (Workstream 3 - Drug Safety / Interaction Engine)
 */
export const checkDDI = onCall({ cors: true }, async (request) => {
  const { newMedication } = request.data || {};

  if (!newMedication?.drug_name) {
    throw new HttpsError("invalid-argument", "newMedication.drug_name is required.");
  }

  const newDrugName = newMedication.drug_name;
  const callerUid = request.auth?.uid;
  logger.info("checkDDI screening", { newDrugName, callerUid: callerUid ?? "anonymous" });

  // Only ever read the caller's own subcollection — request.data must never
  // supply a target userId here. CheckDDIRequest.patientId stays reserved
  // and unused until a clinician/admin auth-check design exists.
  let activeMedications: ActiveMedicationRef[] = callerUid
    ? await getActiveMedicationsForUser(callerUid)
    : [];

  if (activeMedications.length === 0) {
    activeMedications = DEMO_FALLBACK_MEDICATIONS;
  }

  const interactions = [];
  let highestSeverity: "NONE" | "LOW" | "MODERATE" | "SEVERE" = "NONE";

  for (const activeMed of activeMedications) {
    const match = checkDeterministicDDI(newDrugName, activeMed.drug_name);
    if (match) {
      interactions.push({
        existingDrugName: activeMed.drug_name,
        newDrugName,
        severity: match.severity,
        description: match.description,
        recommendation: match.recommendation,
        requiresConfirmation: match.requiresConfirmation
      });

      if (match.severity === "SEVERE") {
        highestSeverity = "SEVERE";
      } else if (match.severity === "MODERATE" && highestSeverity !== "SEVERE") {
        highestSeverity = "MODERATE";
      } else if (match.severity === "DIETARY" && highestSeverity === "NONE") {
        highestSeverity = "LOW";
      }
    }
  }

  return {
    interactions,
    overallRiskLevel: highestSeverity
  };
});

/**
 * 5. createSchedule (Workstream 4)
 */
export const createSchedule = onCall({ cors: true }, async (request) => {
  const { medicationId, naturalLanguageInstruction, durationDays = 7, lifestyleAnchors } = request.data || {};

  if (!medicationId || !naturalLanguageInstruction) {
    throw new HttpsError("invalid-argument", "medicationId and naturalLanguageInstruction are required.");
  }

  logger.info("createSchedule parsing instruction", { naturalLanguageInstruction, lifestyleAnchors });

  const now = new Date();
  const scheduledDoses = [];

  for (let day = 0; day < Math.min(durationDays, 3); day++) {
    const morningDate = new Date(now);
    morningDate.setDate(morningDate.getDate() + day);
    morningDate.setHours(8, 0, 0, 0);

    const eveningDate = new Date(now);
    eveningDate.setDate(eveningDate.getDate() + day);
    eveningDate.setHours(20, 0, 0, 0);

    scheduledDoses.push(
      { scheduledTime: morningDate.toISOString(), doseQuantity: 1, notes: "Morning dose with breakfast", status: "PENDING" as const },
      { scheduledTime: eveningDate.toISOString(), doseQuantity: 1, notes: "Evening dose with dinner", status: "PENDING" as const }
    );
  }

  return {
    scheduleId: `sched-${Date.now()}`,
    scheduledDoses,
    createdTasksCount: scheduledDoses.length
  };
});

/**
 * 6. logMedication (Workstream 5)
 */
export const logMedication = onCall({ cors: true }, async (request) => {
  const { medication_name, dosage, frequency_per_day = 1, total_quantity = 30, start_date } = request.data || {};

  if (!medication_name || !dosage) {
    throw new HttpsError("invalid-argument", "medication_name and dosage are required.");
  }

  const medId = `med-${Date.now()}`;
  const createdAt = new Date().toISOString();

  return {
    medication: {
      id: medId,
      userId: request.auth?.uid || "anon-user",
      medication_name,
      dosage,
      frequency_per_day,
      total_quantity,
      remaining_quantity: total_quantity,
      start_date: start_date || createdAt,
      end_date: null,
      created_at: createdAt
    }
  };
});

/**
 * 7. logAdherence (Workstream 5)
 */
export const logAdherence = onCall({ cors: true }, async (request) => {
  const { medicationId, scheduled_time, action = "TAKEN" } = request.data || {};

  if (!medicationId || !scheduled_time) {
    throw new HttpsError("invalid-argument", "medicationId and scheduled_time are required.");
  }

  const logId = `log-${Date.now()}`;
  const nowStr = new Date().toISOString();
  const currentRemaining = 4;
  const newRemaining = action === "TAKEN" ? Math.max(0, currentRemaining - 1) : currentRemaining;
  const refillAlertTriggered = newRemaining <= 3;

  return {
    log: {
      id: logId,
      medicationId,
      scheduled_time,
      taken_time: action === "TAKEN" ? nowStr : null,
      status: action,
      created_at: nowStr
    },
    updatedMedication: {
      id: medicationId,
      userId: request.auth?.uid || "anon-user",
      medication_name: "Amoxicillin 500mg",
      dosage: "500 mg",
      frequency_per_day: 2,
      total_quantity: 20,
      remaining_quantity: newRemaining,
      start_date: nowStr,
      end_date: null,
      created_at: nowStr
    },
    refillAlertTriggered
  };
});

/**
 * 8. getAdherenceAnalytics (Workstream 5)
 */
export const getAdherenceAnalytics = onCall({ cors: true }, async (request) => {
  const { windowDays = 30 } = request.data || {};

  logger.info("getAdherenceAnalytics calculation", { windowDays });

  return {
    analytics: {
      compliancePercentage: 94.2,
      totalDosesScheduled: 60,
      totalDosesTaken: 56,
      totalDosesSkipped: 3,
      totalDosesMissed: 1,
      history: [
        { date: "2026-07-22", compliance: 100 },
        { date: "2026-07-23", compliance: 100 },
        { date: "2026-07-24", compliance: 85 },
        { date: "2026-07-25", compliance: 100 },
        { date: "2026-07-26", compliance: 100 },
        { date: "2026-07-27", compliance: 90 },
        { date: "2026-07-28", compliance: 100 }
      ],
      pdfReportUrl: "https://storage.googleapis.com/frontiers-paio-dev/reports/adherence_summary.pdf"
    }
  };
});

/**
 * 9. expireHolds (Workstream 2) - releases stock from holds past their 60-minute window
 */
export const expireHolds = onSchedule("every 2 minutes", async () => {
  const expiredCount = await expireDueHolds();
  logger.info("expireHolds run complete", { expiredCount });
});
