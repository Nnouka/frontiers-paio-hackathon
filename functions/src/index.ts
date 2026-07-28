import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { MOCK_PHARMACIES, MOCK_DDI_RULES } from "./services/mockData";

/**
 * 1. searchPharmacies (Workstream 2)
 */
export const searchPharmacies = onCall({ cors: true }, async (request) => {
  const { query, latitude, longitude, radiusKm = 10 } = request.data || {};
  
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new HttpsError("invalid-argument", "latitude and longitude are required numbers.");
  }

  logger.info("searchPharmacies call received", { query, latitude, longitude, radiusKm });

  const searchLower = (query || "").toLowerCase();
  
  const results = MOCK_PHARMACIES.map((pharmacy) => {
    // Simple Euclidean approximation for mock distance
    const latDiff = pharmacy.latitude - latitude;
    const lonDiff = pharmacy.longitude - longitude;
    const distanceKm = Math.round(Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111 * 10) / 10;

    const matchingInventory = pharmacy.inventory.filter((inv) => {
      if (!query) return true;
      return (
        inv.medication_name.toLowerCase().includes(searchLower) ||
        inv.generic_name.toLowerCase().includes(searchLower)
      );
    });

    return {
      ...pharmacy,
      distanceKm,
      matchingInventory,
    };
  }).filter((p) => p.distanceKm <= radiusKm && p.matchingInventory.length > 0);

  return {
    pharmacies: results,
    searchRadiusKm: radiusKm,
    totalFound: results.length,
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

  const pharmacy = MOCK_PHARMACIES.find((p) => p.id === pharmacyId);
  const inventory = pharmacy?.inventory.find((i) => i.id === inventoryId);

  if (!inventory) {
    throw new HttpsError("not-found", "Requested inventory item was not found.");
  }

  const holdId = `hold-${Date.now()}`;
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 60 minutes TTL

  logger.info("createHold reservation created", { holdId, pharmacyId, inventoryId });

  return {
    hold: {
      holdId,
      pharmacyId,
      inventoryId,
      medicationName: inventory.medication_name,
      quantity,
      expiresAt,
      status: "ACTIVE",
    },
  };
});

/**
 * 3. extractFromScan (Workstream 3)
 */
export const extractFromScan = onCall({ cors: true }, async (request) => {
  const { scanType = "PRESCRIPTION" } = request.data || {};

  logger.info("extractFromScan processing", { scanType });

  // Baseline structured entity payload
  return {
    extracted: {
      drug_name: "Amoxicillin 500mg",
      generic_name: "Amoxicillin",
      dosage_strength: "500 mg",
      form: "Capsule",
      dosage_instruction: "1 capsule 3 times daily after meals",
      duration_days: 7,
      total_quantity: 21,
      warnings: [
        "Take on a full stomach with plenty of water",
        "Complete the full course as prescribed"
      ],
      rawTextConfidence: 0.96
    }
  };
});

/**
 * 4. checkDDI (Workstream 3)
 */
export const checkDDI = onCall({ cors: true }, async (request) => {
  const { newMedication } = request.data || {};

  if (!newMedication?.drug_name) {
    throw new HttpsError("invalid-argument", "newMedication.drug_name is required.");
  }

  const drugNameLower = newMedication.drug_name.toLowerCase();
  logger.info("checkDDI screening", { drugNameLower });

  const interactions = [];
  let overallRiskLevel: "NONE" | "LOW" | "MODERATE" | "SEVERE" = "NONE";

  if (drugNameLower.includes("aspirin")) {
    const rule = MOCK_DDI_RULES["aspirin_warfarin"];
    interactions.push({
      existingDrugName: rule.existing,
      newDrugName: newMedication.drug_name,
      severity: rule.severity,
      description: rule.description,
      recommendation: rule.recommendation,
      requiresConfirmation: true
    });
    overallRiskLevel = "SEVERE";
  } else if (drugNameLower.includes("amoxicillin")) {
    const rule = MOCK_DDI_RULES["amoxicillin_methotrexate"];
    interactions.push({
      existingDrugName: rule.existing,
      newDrugName: newMedication.drug_name,
      severity: rule.severity,
      description: rule.description,
      recommendation: rule.recommendation,
      requiresConfirmation: false
    });
    overallRiskLevel = "MODERATE";
  }

  return {
    interactions,
    overallRiskLevel
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
  
  // Mock remaining calculation
  const currentRemaining = 4; // Mock near threshold
  const newRemaining = action === "TAKEN" ? Math.max(0, currentRemaining - 1) : currentRemaining;
  const refillAlertTriggered = newRemaining <= 3; // 3-day threshold rule

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
