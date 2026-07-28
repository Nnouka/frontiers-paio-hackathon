/**
 * Shared API Contracts & Domain Entities
 * Frontiers PAIO - Health Track Ecosystem (PharmaLoop)
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
  dosage?: string;
  category?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  location: GeoLocation;
  geohash: string;
  phone: string;
  is_active: boolean;
  license_number?: string;
  verification_status?: 'VERIFIED' | 'PENDING' | 'REJECTED';
  rating?: number;
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
  patientName?: string;
  patientPhone?: string;
  createdAt: string;
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
  scanned_image_url?: string;
}

export type InteractionSeverity = 'SEVERE' | 'MODERATE' | 'DIETARY';

export interface DrugInteraction {
  id?: string;
  existingDrugName: string;
  newDrugName: string;
  severity: InteractionSeverity;
  description: string;
  recommendation: string;
  requiresConfirmation: boolean;
  mechanism?: string;
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

// Clinician Case Detail & Review Queue
export interface ClinicianCase {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  prescribedDrug: string;
  existingRegimen: string[];
  severity: InteractionSeverity;
  interactionSummary: string;
  status: 'PENDING' | 'APPROVED' | 'MODIFIED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  assignedClinician?: string;
  extractedEntity?: ExtractedPrescriptionEntity;
  ddiDetails?: DrugInteraction;
}

// System Admin Data
export type UserRole = 'PATIENT' | 'PHARMACY' | 'CLINICIAN' | 'ADMIN';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  createdAt: string;
  lastLogin?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  details: string;
  ipAddress?: string;
}

// --- Cloud Functions Callable Contracts ---

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
  patientName?: string;
  patientPhone?: string;
}

export interface CreateHoldResponse {
  hold: MedicationHold;
}

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

export interface LifestyleAnchors {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  bedtime?: string;
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
