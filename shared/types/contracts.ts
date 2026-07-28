/**
 * Shared API Contracts & Domain Entities
 * Frontiers PAIO - Health Track Ecosystem
 */

// --- Domain Data Models ---

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface InventoryItem {
  id: string;
  pharmacyId: string;
  medication_name: string;
  generic_name: string;
  unit_price: number;
  stock_quantity: number;
  stock_status: StockStatus;
  last_updated: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  location: GeoLocation;
  geohash: string;
  phone: string;
  hours?: string;
  is_active: boolean;
  inventory?: InventoryItem[];
}

export interface PharmacySearchResult extends Pharmacy {
  distanceKm: number;
  matchingInventory: InventoryItem[];
}

export interface MedicationHold {
  holdId: string;
  pharmacyId: string;
  inventoryId: string;
  medicationName: string;
  quantity: number;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'FULFILLED' | 'CANCELLED';
}

export interface ExtractedPrescriptionEntity {
  drug_name: string;
  generic_name?: string;
  dosage_strength: string;
  form: string; // e.g. "Tablet", "Capsule", "Syrup"
  dosage_instruction: string; // e.g. "1 tablet twice daily after meals"
  duration_days: number;
  total_quantity: number;
  warnings: string[];
  rawTextConfidence?: number;
}

export type InteractionSeverity = 'SEVERE' | 'MODERATE' | 'DIETARY';

export interface DrugInteraction {
  existingDrugName: string;
  newDrugName: string;
  severity: InteractionSeverity;
  description: string;
  recommendation: string;
  requiresConfirmation: boolean;
}

export interface ScheduledDose {
  scheduledTime: string; // ISO string
  doseQuantity: number;
  notes?: string;
  status?: 'PENDING' | 'TAKEN' | 'SNOOZED' | 'SKIPPED' | 'MISSED';
}

export interface UserMedication {
  id: string;
  userId: string;
  medication_name: string;
  generic_name?: string;
  dosage: string;
  frequency_per_day: number;
  total_quantity: number;
  remaining_quantity: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
  schedule?: ScheduledDose[];
}

export type AdherenceStatus = 'TAKEN' | 'SNOOZED' | 'SKIPPED' | 'MISSED';

export interface AdherenceLog {
  id: string;
  medicationId: string;
  scheduled_time: string;
  taken_time: string | null;
  status: AdherenceStatus;
  created_at: string;
}

export interface AdherenceAnalytics {
  compliancePercentage: number;
  totalDosesScheduled: number;
  totalDosesTaken: number;
  totalDosesSkipped: number;
  totalDosesMissed: number;
  history: { date: string; compliance: number }[];
  pdfReportUrl?: string;
}

// --- Cloud Functions Callable Contracts ---

// Workstream 2: Geo-Spatial Engine & Pharmacy Portal
export interface SearchPharmaciesRequest {
  query?: string;
  latitude: number;
  longitude: number;
  radiusKm?: number;
  activeComponentOnly?: boolean;
}

export interface SearchPharmaciesResponse {
  pharmacies: PharmacySearchResult[];
  searchRadiusKm: number;
  totalFound: number;
}

export interface CreateHoldRequest {
  pharmacyId: string;
  inventoryId: string;
  quantity: number;
}

export interface CreateHoldResponse {
  hold: MedicationHold;
}

// Workstream 3: AI Vision/OCR & Drug Safety Engine
export interface ExtractFromScanRequest {
  imageBase64?: string;
  storagePath?: string;
  scanType?: 'PRESCRIPTION' | 'MEDICATION_LABEL' | 'RECEIPT';
}

export interface ExtractFromScanResponse {
  extracted: ExtractedPrescriptionEntity;
}

export interface CheckDDIRequest {
  newMedication: {
    drug_name: string;
    active_ingredient?: string;
  };
  patientId?: string;
}

export interface CheckDDIResponse {
  interactions: DrugInteraction[];
  overallRiskLevel: 'NONE' | 'LOW' | 'MODERATE' | 'SEVERE';
}

// Workstream 4: Schedule & Alert Service
export interface LifestyleAnchors {
  breakfast?: string; // e.g. "08:00"
  lunch?: string;     // e.g. "13:00"
  dinner?: string;    // e.g. "20:00"
  bedtime?: string;   // e.g. "22:00"
}

export interface CreateScheduleRequest {
  medicationId: string;
  naturalLanguageInstruction: string;
  durationDays: number;
  totalQuantity: number;
  lifestyleAnchors?: LifestyleAnchors;
}

export interface CreateScheduleResponse {
  scheduleId: string;
  scheduledDoses: ScheduledDose[];
  createdTasksCount: number;
}

// Workstream 5: Data, Auth & Analytics
export interface LogMedicationRequest {
  medication_name: string;
  generic_name?: string;
  dosage: string;
  frequency_per_day: number;
  total_quantity: number;
  start_date: string;
  end_date?: string | null;
}

export interface LogMedicationResponse {
  medication: UserMedication;
}

export interface LogAdherenceRequest {
  medicationId: string;
  scheduled_time: string;
  action: AdherenceStatus;
  taken_time?: string;
}

export interface LogAdherenceResponse {
  log: AdherenceLog;
  updatedMedication: UserMedication;
  refillAlertTriggered: boolean;
}

export interface GetAdherenceAnalyticsRequest {
  userId?: string;
  windowDays?: number;
}

export interface GetAdherenceAnalyticsResponse {
  analytics: AdherenceAnalytics;
}
