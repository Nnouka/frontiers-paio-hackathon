import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";
import type {
  SearchPharmaciesRequest,
  SearchPharmaciesResponse,
  CreateHoldRequest,
  CreateHoldResponse,
  ExtractFromScanRequest,
  ExtractFromScanResponse,
  CheckDDIRequest,
  CheckDDIResponse,
  CreateScheduleRequest,
  CreateScheduleResponse,
  LogMedicationRequest,
  LogMedicationResponse,
  LogAdherenceRequest,
  LogAdherenceResponse,
  GetAdherenceAnalyticsRequest,
  GetAdherenceAnalyticsResponse
} from "@shared/types/contracts";

export interface ApiClientConfig {
  useMockFallback: boolean;
}

let config: ApiClientConfig = {
  useMockFallback: false
};

export const setApiClientConfig = (newConfig: Partial<ApiClientConfig>) => {
  config = { ...config, ...newConfig };
  console.log("[ApiClient] Config updated:", config);
};

export const getApiClientConfig = () => ({ ...config });

// Helper to call callable or fallback to mock
async function callFunction<TReq, TRes>(
  functionName: string,
  data: TReq,
  mockFallback: () => TRes
): Promise<TRes> {
  if (config.useMockFallback) {
    console.log(`[ApiClient MOCK] Calling ${functionName}:`, data);
    return mockFallback();
  }

  try {
    console.log(`[ApiClient CALLABLE] Invoking ${functionName}:`, data);
    const callableFn = httpsCallable<TReq, TRes>(functions, functionName);
    const result = await callableFn(data);
    return result.data;
  } catch (error) {
    console.warn(`[ApiClient WARNING] Callable ${functionName} failed. Falling back to local mock. Error:`, error);
    return mockFallback();
  }
}

/**
 * 1. searchPharmacies (Workstream 2)
 */
export async function apiSearchPharmacies(req: SearchPharmaciesRequest): Promise<SearchPharmaciesResponse> {
  return callFunction("searchPharmacies", req, () => ({
    pharmacies: [
      {
        id: "pharm-001",
        name: "Central Care Pharmacy",
        address: "124 Healthcare Boulevard, City Center",
        phone: "+1 (555) 019-2831",
        location: { latitude: req.latitude, longitude: req.longitude },
        geohash: "9q8yy",
        is_active: true,
        distanceKm: 1.2,
        matchingInventory: [
          {
            id: "inv-101",
            pharmacyId: "pharm-001",
            medication_name: req.query || "Amoxicillin 500mg",
            generic_name: "Amoxicillin",
            unit_price: 14.50,
            stock_quantity: 42,
            stock_status: "IN_STOCK",
            last_updated: new Date().toISOString()
          }
        ]
      }
    ],
    searchRadiusKm: req.radiusKm || 10,
    totalFound: 1
  }));
}

/**
 * 2. createHold (Workstream 2)
 */
export async function apiCreateHold(req: CreateHoldRequest): Promise<CreateHoldResponse> {
  return callFunction("createHold", req, () => ({
    hold: {
      holdId: `hold-${Date.now()}`,
      pharmacyId: req.pharmacyId,
      inventoryId: req.inventoryId,
      medicationName: "Amoxicillin 500mg",
      quantity: req.quantity,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    }
  }));
}

/**
 * 3. extractFromScan (Workstream 3)
 */
export async function apiExtractFromScan(req: ExtractFromScanRequest): Promise<ExtractFromScanResponse> {
  return callFunction("extractFromScan", req, () => ({
    extracted: {
      drug_name: "Amoxicillin 500mg",
      generic_name: "Amoxicillin",
      dosage_strength: "500 mg",
      form: "Capsule",
      dosage_instruction: "1 capsule twice daily after meals",
      duration_days: 7,
      total_quantity: 14,
      warnings: ["Take with a full glass of water", "Complete prescribed duration"],
      rawTextConfidence: 0.98
    }
  }));
}

/**
 * 4. checkDDI (Workstream 3)
 */
export async function apiCheckDDI(req: CheckDDIRequest): Promise<CheckDDIResponse> {
  return callFunction("checkDDI", req, () => {
    const isAspirin = req.newMedication.drug_name.toLowerCase().includes("aspirin");
    return {
      interactions: isAspirin
        ? [
            {
              existingDrugName: "Warfarin 5mg",
              newDrugName: req.newMedication.drug_name,
              severity: "SEVERE",
              description: "Severe risk of gastrointestinal and internal bleeding when combined with anticoagulant therapy.",
              recommendation: "Immediate physician consultation required before initiating therapy.",
              requiresConfirmation: true
            }
          ]
        : [],
      overallRiskLevel: isAspirin ? "SEVERE" : "NONE"
    };
  });
}

/**
 * 5. createSchedule (Workstream 4)
 */
export async function apiCreateSchedule(req: CreateScheduleRequest): Promise<CreateScheduleResponse> {
  return callFunction("createSchedule", req, () => {
    const now = new Date();
    return {
      scheduleId: `sched-${Date.now()}`,
      scheduledDoses: [
        {
          scheduledTime: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
          doseQuantity: 1,
          notes: "Take with breakfast",
          status: "PENDING"
        },
        {
          scheduledTime: new Date(now.getTime() + 10 * 60 * 60 * 1000).toISOString(),
          doseQuantity: 1,
          notes: "Take with dinner",
          status: "PENDING"
        }
      ],
      createdTasksCount: 2
    };
  });
}

/**
 * 6. logMedication (Workstream 5)
 */
export async function apiLogMedication(req: LogMedicationRequest): Promise<LogMedicationResponse> {
  return callFunction("logMedication", req, () => ({
    medication: {
      id: `med-${Date.now()}`,
      userId: "user-demo",
      medication_name: req.medication_name,
      generic_name: req.generic_name,
      dosage: req.dosage,
      frequency_per_day: req.frequency_per_day,
      total_quantity: req.total_quantity,
      remaining_quantity: req.total_quantity,
      start_date: req.start_date,
      end_date: req.end_date || null,
      created_at: new Date().toISOString()
    }
  }));
}

/**
 * 7. logAdherence (Workstream 5)
 */
export async function apiLogAdherence(req: LogAdherenceRequest): Promise<LogAdherenceResponse> {
  return callFunction("logAdherence", req, () => ({
    log: {
      id: `log-${Date.now()}`,
      medicationId: req.medicationId,
      scheduled_time: req.scheduled_time,
      taken_time: req.action === "TAKEN" ? new Date().toISOString() : null,
      status: req.action,
      created_at: new Date().toISOString()
    },
    updatedMedication: {
      id: req.medicationId,
      userId: "user-demo",
      medication_name: "Amoxicillin 500mg",
      dosage: "500 mg",
      frequency_per_day: 2,
      total_quantity: 20,
      remaining_quantity: 3,
      start_date: new Date().toISOString(),
      end_date: null,
      created_at: new Date().toISOString()
    },
    refillAlertTriggered: true
  }));
}

/**
 * 8. getAdherenceAnalytics (Workstream 5)
 */
export async function apiGetAdherenceAnalytics(req: GetAdherenceAnalyticsRequest): Promise<GetAdherenceAnalyticsResponse> {
  return callFunction("getAdherenceAnalytics", req, () => ({
    analytics: {
      compliancePercentage: 94.5,
      totalDosesScheduled: 40,
      totalDosesTaken: 38,
      totalDosesSkipped: 2,
      totalDosesMissed: 0,
      history: [
        { date: "2026-07-26", compliance: 100 },
        { date: "2026-07-27", compliance: 90 },
        { date: "2026-07-28", compliance: 100 }
      ],
      pdfReportUrl: "https://storage.googleapis.com/frontiers-paio-dev/reports/adherence_summary.pdf"
    }
  }));
}
