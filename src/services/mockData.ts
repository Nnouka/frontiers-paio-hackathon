import type { 
  Pharmacy, 
  UserMedication, 
  ClinicianCase, 
  SystemUser, 
  AuditLogEntry, 
  DrugInteraction,
  MedicationHold 
} from "@shared/types/contracts";

export const INITIAL_PHARMACIES: Pharmacy[] = [
  {
    id: "pharm-001",
    name: "Central Care Pharmacy",
    address: "124 Healthcare Boulevard, City Center",
    phone: "+250 788 123 456",
    location: { latitude: -1.9441, longitude: 30.0619 },
    geohash: "9q8yy",
    is_active: true,
    license_number: "RW-PHARM-2024-001",
    verification_status: "VERIFIED",
    rating: 4.9,
    inventory: [
      {
        id: "inv-101",
        pharmacyId: "pharm-001",
        medication_name: "Amoxicillin 500mg Capsules",
        generic_name: "Amoxicillin",
        unit_price: 12.50,
        stock_quantity: 85,
        stock_status: "IN_STOCK",
        category: "Antibiotics",
        last_updated: new Date().toISOString()
      },
      {
        id: "inv-102",
        pharmacyId: "pharm-001",
        medication_name: "Metformin 850mg Tablets",
        generic_name: "Metformin HCl",
        unit_price: 18.00,
        stock_quantity: 14,
        stock_status: "LOW_STOCK",
        category: "Diabetes",
        last_updated: new Date().toISOString()
      },
      {
        id: "inv-103",
        pharmacyId: "pharm-001",
        medication_name: "Atorvastatin 20mg Tablets",
        generic_name: "Atorvastatin",
        unit_price: 24.00,
        stock_quantity: 60,
        stock_status: "IN_STOCK",
        category: "Cardiovascular",
        last_updated: new Date().toISOString()
      },
      {
        id: "inv-104",
        pharmacyId: "pharm-001",
        medication_name: "Lisinopril 10mg Tablets",
        generic_name: "Lisinopril",
        unit_price: 9.50,
        stock_quantity: 0,
        stock_status: "OUT_OF_STOCK",
        category: "Hypertension",
        last_updated: new Date().toISOString()
      }
    ]
  },
  {
    id: "pharm-002",
    name: "Kigali Heights Pharmacy & Wellness",
    address: "KG 7 Ave, Boulevard Plaza",
    phone: "+250 788 987 654",
    location: { latitude: -1.9536, longitude: 30.0924 },
    geohash: "9q8yz",
    is_active: true,
    license_number: "RW-PHARM-2024-002",
    verification_status: "VERIFIED",
    rating: 4.8,
    inventory: [
      {
        id: "inv-201",
        pharmacyId: "pharm-002",
        medication_name: "Amoxicillin 500mg Capsules",
        generic_name: "Amoxicillin",
        unit_price: 13.00,
        stock_quantity: 40,
        stock_status: "IN_STOCK",
        category: "Antibiotics",
        last_updated: new Date().toISOString()
      },
      {
        id: "inv-202",
        pharmacyId: "pharm-002",
        medication_name: "Warfarin 5mg Tablets",
        generic_name: "Warfarin Sodium",
        unit_price: 22.50,
        stock_quantity: 30,
        stock_status: "IN_STOCK",
        category: "Anticoagulants",
        last_updated: new Date().toISOString()
      },
      {
        id: "inv-203",
        pharmacyId: "pharm-002",
        medication_name: "Omeprazole 20mg Capsules",
        generic_name: "Omeprazole",
        unit_price: 11.00,
        stock_quantity: 8,
        stock_status: "LOW_STOCK",
        category: "Gastrointestinal",
        last_updated: new Date().toISOString()
      }
    ]
  },
  {
    id: "pharm-003",
    name: "Norrsken Express Meds",
    address: "1 KN 78 St, Nyarugenge",
    phone: "+250 788 555 123",
    location: { latitude: -1.9472, longitude: 30.0588 },
    geohash: "9q8yx",
    is_active: true,
    license_number: "RW-PHARM-2024-003",
    verification_status: "VERIFIED",
    rating: 4.7,
    inventory: [
      {
        id: "inv-301",
        pharmacyId: "pharm-003",
        medication_name: "Paracetamol 500mg Extra",
        generic_name: "Acetaminophen",
        unit_price: 4.50,
        stock_quantity: 200,
        stock_status: "IN_STOCK",
        category: "Analgesics",
        last_updated: new Date().toISOString()
      },
      {
        id: "inv-302",
        pharmacyId: "pharm-003",
        medication_name: "Ibuprofen 400mg Tablets",
        generic_name: "Ibuprofen",
        unit_price: 6.00,
        stock_quantity: 120,
        stock_status: "IN_STOCK",
        category: "Analgesics / NSAID",
        last_updated: new Date().toISOString()
      }
    ]
  }
];

export const INITIAL_PATIENT_MEDICATIONS: UserMedication[] = [
  {
    id: "med-001",
    userId: "pat-101",
    medication_name: "Warfarin 5mg Tablets",
    generic_name: "Warfarin Sodium",
    dosage: "5mg once daily at 20:00",
    frequency_per_day: 1,
    total_quantity: 30,
    remaining_quantity: 18,
    start_date: "2026-07-10",
    end_date: "2026-08-10",
    created_at: "2026-07-10T08:00:00Z",
    schedule: [
      { scheduledTime: "2026-07-28T20:00:00Z", doseQuantity: 1, status: "PENDING" }
    ]
  },
  {
    id: "med-002",
    userId: "pat-101",
    medication_name: "Metformin 850mg Tablets",
    generic_name: "Metformin HCl",
    dosage: "850mg twice daily (Breakfast & Dinner)",
    frequency_per_day: 2,
    total_quantity: 60,
    remaining_quantity: 42,
    start_date: "2026-07-01",
    end_date: null,
    created_at: "2026-07-01T08:00:00Z",
    schedule: [
      { scheduledTime: "2026-07-28T08:00:00Z", doseQuantity: 1, status: "TAKEN" },
      { scheduledTime: "2026-07-28T20:00:00Z", doseQuantity: 1, status: "PENDING" }
    ]
  }
];

export const INITIAL_HOLDS: MedicationHold[] = [
  {
    holdId: "hold-881",
    pharmacyId: "pharm-001",
    inventoryId: "inv-101",
    medicationName: "Amoxicillin 500mg Capsules",
    quantity: 1,
    expiresAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    status: "ACTIVE",
    patientName: "Jean Claude N.",
    patientPhone: "+250 788 112 233",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  }
];

export const INITIAL_CLINICIAN_CASES: ClinicianCase[] = [
  {
    id: "case-301",
    patientId: "pat-101",
    patientName: "Amina Mugisha",
    patientAge: 48,
    patientGender: "Female",
    prescribedDrug: "Amoxicillin 500mg Capsules",
    existingRegimen: ["Warfarin 5mg Tablets (Daily)"],
    severity: "SEVERE",
    interactionSummary: "Concurrent administration of Amoxicillin and Warfarin increases bleeding risk significantly due to gut flora alteration affecting Vitamin K synthesis.",
    status: "PENDING",
    submittedAt: "2026-07-28T11:20:00Z",
    extractedEntity: {
      drug_name: "Amoxicillin 500mg Capsules",
      generic_name: "Amoxicillin",
      dosage_strength: "500mg",
      form: "Capsule",
      dosage_instruction: "1 capsule 3 times daily for 7 days",
      duration_days: 7,
      total_quantity: 21,
      warnings: ["Take with full glass of water", "Severe DDI risk with oral anticoagulants"],
      rawTextConfidence: 0.98
    },
    ddiDetails: {
      existingDrugName: "Warfarin 5mg",
      newDrugName: "Amoxicillin 500mg",
      severity: "SEVERE",
      description: "Amoxicillin alters intestinal bacterial flora that synthesize Vitamin K, potentiating the anticoagulant effect of Warfarin and elevating INR to toxic levels.",
      recommendation: "Hold prescription until INR test or switch to alternative narrow-spectrum agent with INR monitoring.",
      requiresConfirmation: true,
      mechanism: "Intestinal bacterial flora depletion reducing endogenous Vitamin K production."
    }
  },
  {
    id: "case-302",
    patientId: "pat-204",
    patientName: "Emmanuel Habimana",
    patientAge: 62,
    patientGender: "Male",
    prescribedDrug: "Ibuprofen 400mg",
    existingRegimen: ["Lisinopril 10mg"],
    severity: "MODERATE",
    interactionSummary: "NSAID (Ibuprofen) may blunt anti-hypertensive efficacy of ACE inhibitor (Lisinopril) and increase renal toxicity risk.",
    status: "PENDING",
    submittedAt: "2026-07-28T09:45:00Z",
    extractedEntity: {
      drug_name: "Ibuprofen 400mg",
      generic_name: "Ibuprofen",
      dosage_strength: "400mg",
      form: "Tablet",
      dosage_instruction: "1 tablet twice daily as needed for pain",
      duration_days: 5,
      total_quantity: 10,
      warnings: ["Take after food", "Monitor blood pressure"],
      rawTextConfidence: 0.94
    },
    ddiDetails: {
      existingDrugName: "Lisinopril 10mg",
      newDrugName: "Ibuprofen 400mg",
      severity: "MODERATE",
      description: "Nonsteroidal anti-inflammatory drugs decrease renal prostaglandin synthesis leading to fluid retention.",
      recommendation: "Consider Acetaminophen as first-line analgesic alternative.",
      requiresConfirmation: true,
      mechanism: "Inhibition of renal vasodilatory prostaglandins."
    }
  },
  {
    id: "case-299",
    patientId: "pat-188",
    patientName: "Grace Uwase",
    patientAge: 34,
    patientGender: "Female",
    prescribedDrug: "Ciprofloxacin 500mg",
    existingRegimen: ["Multivitamin with Iron"],
    severity: "DIETARY",
    interactionSummary: "Divalent and trivalent cations in iron supplements chelate Ciprofloxacin, significantly reducing absorption.",
    status: "APPROVED",
    submittedAt: "2026-07-27T16:10:00Z",
    reviewedAt: "2026-07-27T17:05:00Z",
    reviewerNotes: "Approved with counseling instruction to space iron supplement at least 2 hours before or 6 hours after Ciprofloxacin dose.",
    assignedClinician: "Dr. Patrick Ntaganda, MD"
  }
];

export const INITIAL_SYSTEM_USERS: SystemUser[] = [
  { id: "usr-01", name: "Amina Mugisha", email: "amina@health.rw", role: "PATIENT", status: "ACTIVE", createdAt: "2026-06-01" },
  { id: "usr-02", name: "Central Care Pharmacy", email: "info@centralcare.rw", role: "PHARMACY", status: "ACTIVE", createdAt: "2026-05-15" },
  { id: "usr-03", name: "Dr. Patrick Ntaganda", email: "dr.patrick@kigalihealth.org", role: "CLINICIAN", status: "ACTIVE", createdAt: "2026-05-10" },
  { id: "usr-04", name: "System Admin", email: "admin@pharmaloop.io", role: "ADMIN", status: "ACTIVE", createdAt: "2026-01-01" }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log-1001",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    actor: "Amina Mugisha",
    actorRole: "PATIENT",
    action: "MEDICATION_HOLD_CREATED",
    details: "Created 60-minute hold for Amoxicillin 500mg at Central Care Pharmacy (Hold #hold-881)"
  },
  {
    id: "log-1002",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    actor: "Gemini Vision OCR Engine",
    actorRole: "PATIENT",
    action: "GEMINI_OCR_EXTRACTION",
    details: "Extracted prescription entity with 98% confidence confidence score from scanned label image"
  },
  {
    id: "log-1003",
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    actor: "Dr. Patrick Ntaganda",
    actorRole: "CLINICIAN",
    action: "SAFETY_CASE_REVIEWED",
    details: "Approved Case #case-299 with patient counseling note on chelation spacing"
  }
];

export const KNOWN_DRUG_INTERACTIONS: DrugInteraction[] = [
  {
    id: "ddi-01",
    existingDrugName: "Warfarin",
    newDrugName: "Amoxicillin",
    severity: "SEVERE",
    description: "Amoxicillin alters intestinal microflora, enhancing the anticoagulant action of Warfarin and creating severe hemorrhage risk.",
    recommendation: "Avoid co-administration or mandate daily INR monitoring with clinical review.",
    requiresConfirmation: true
  },
  {
    id: "ddi-02",
    existingDrugName: "Lisinopril",
    newDrugName: "Ibuprofen",
    severity: "MODERATE",
    description: "NSAIDs reduce vasodilatory renal prostaglandins, attenuating anti-hypertensive response.",
    recommendation: "Switch analgesic to Acetaminophen or monitor renal function.",
    requiresConfirmation: true
  },
  {
    id: "ddi-03",
    existingDrugName: "Metformin",
    newDrugName: "Iodinated Contrast",
    severity: "SEVERE",
    description: "Risk of contrast-induced acute kidney injury leading to severe lactic acidosis.",
    recommendation: "Withhold Metformin 48h prior to and following radiocontrast exposure.",
    requiresConfirmation: true
  }
];
