import { useState, useEffect } from 'react';
import type { 
  Pharmacy, 
  InventoryItem,
  StockStatus,
  UserMedication, 
  MedicationHold, 
  ClinicianCase, 
  SystemUser, 
  AuditLogEntry,
  DrugInteraction,
  UserRole
} from '@shared/types/contracts';
import { 
  INITIAL_PHARMACIES, 
  INITIAL_PATIENT_MEDICATIONS, 
  INITIAL_HOLDS, 
  INITIAL_CLINICIAN_CASES, 
  INITIAL_SYSTEM_USERS, 
  INITIAL_AUDIT_LOGS,
  KNOWN_DRUG_INTERACTIONS
} from './mockData';

interface PharmaLoopStore {
  pharmacies: Pharmacy[];
  medications: UserMedication[];
  holds: MedicationHold[];
  clinicianCases: ClinicianCase[];
  systemUsers: SystemUser[];
  auditLogs: AuditLogEntry[];
  drugInteractions: DrugInteraction[];
  activePortalRole: UserRole;
}

// In-memory global store instance
let state: PharmaLoopStore = {
  pharmacies: INITIAL_PHARMACIES,
  medications: INITIAL_PATIENT_MEDICATIONS,
  holds: INITIAL_HOLDS,
  clinicianCases: INITIAL_CLINICIAN_CASES,
  systemUsers: INITIAL_SYSTEM_USERS,
  auditLogs: INITIAL_AUDIT_LOGS,
  drugInteractions: KNOWN_DRUG_INTERACTIONS,
  activePortalRole: 'PATIENT'
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(listener => listener());
}

export const store = {
  getState: () => state,

  setPortalRole: (role: UserRole) => {
    state = { ...state, activePortalRole: role };
    notify();
  },

  createHold: (pharmacyId: string, inventoryId: string, medicationName: string, quantity: number = 1, patientName = "Amina Mugisha") => {
    const newHold: MedicationHold = {
      holdId: `hold-${Date.now().toString().slice(-4)}`,
      pharmacyId,
      inventoryId,
      medicationName,
      quantity,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 60-minute hold
      status: 'ACTIVE',
      patientName,
      patientPhone: "+250 788 123 456",
      createdAt: new Date().toISOString()
    };

    // Update stock quantity in pharmacy
    const updatedPharmacies: Pharmacy[] = state.pharmacies.map(pharm => {
      if (pharm.id === pharmacyId && pharm.inventory) {
        return {
          ...pharm,
          inventory: pharm.inventory.map((item): InventoryItem => {
            if (item.id === inventoryId) {
              const newQty = Math.max(0, item.stock_quantity - quantity);
              const status: StockStatus = newQty === 0 ? 'OUT_OF_STOCK' : newQty < 15 ? 'LOW_STOCK' : 'IN_STOCK';
              return {
                ...item,
                stock_quantity: newQty,
                stock_status: status
              };
            }
            return item;
          })
        };
      }
      return pharm;
    });

    const newAuditLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: patientName,
      actorRole: 'PATIENT',
      action: 'RESERVATION_HOLD_CREATED',
      details: `Created 60-minute hold #${newHold.holdId} for ${medicationName} at ${pharmacyId}`
    };

    state = {
      ...state,
      holds: [newHold, ...state.holds],
      pharmacies: updatedPharmacies,
      auditLogs: [newAuditLog, ...state.auditLogs]
    };

    notify();
    return newHold;
  },

  updateInventoryItem: (pharmacyId: string, inventoryId: string, newQty: number, newPrice?: number) => {
    const updatedPharmacies: Pharmacy[] = state.pharmacies.map(pharm => {
      if (pharm.id === pharmacyId && pharm.inventory) {
        return {
          ...pharm,
          inventory: pharm.inventory.map((item): InventoryItem => {
            if (item.id === inventoryId) {
              const status: StockStatus = newQty === 0 ? 'OUT_OF_STOCK' : newQty < 15 ? 'LOW_STOCK' : 'IN_STOCK';
              return {
                ...item,
                stock_quantity: newQty,
                unit_price: newPrice ?? item.unit_price,
                stock_status: status,
                last_updated: new Date().toISOString()
              };
            }
            return item;
          })
        };
      }
      return pharm;
    });

    state = { ...state, pharmacies: updatedPharmacies };
    notify();
  },

  addInventoryItem: (pharmacyId: string, itemData: Omit<InventoryItem, 'id' | 'pharmacyId' | 'last_updated'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now().toString().slice(-4)}`,
      pharmacyId,
      last_updated: new Date().toISOString()
    };

    const updatedPharmacies: Pharmacy[] = state.pharmacies.map(pharm => {
      if (pharm.id === pharmacyId) {
        return {
          ...pharm,
          inventory: [...(pharm.inventory || []), newItem]
        };
      }
      return pharm;
    });

    state = { ...state, pharmacies: updatedPharmacies };
    notify();
    return newItem;
  },

  submitDDICase: (patientName: string, prescribedDrug: string, severity: 'SEVERE' | 'MODERATE' | 'DIETARY', summary: string) => {
    const newCase: ClinicianCase = {
      id: `case-${Date.now().toString().slice(-4)}`,
      patientId: 'pat-101',
      patientName,
      patientAge: 48,
      patientGender: 'Female',
      prescribedDrug,
      existingRegimen: ['Warfarin 5mg Tablets (Daily)'],
      severity,
      interactionSummary: summary,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      extractedEntity: {
        drug_name: prescribedDrug,
        generic_name: prescribedDrug.split(' ')[0],
        dosage_strength: '500mg',
        form: 'Capsule',
        dosage_instruction: '1 capsule 3 times daily for 7 days',
        duration_days: 7,
        total_quantity: 21,
        warnings: ['Severe DDI risk detected with Warfarin'],
        rawTextConfidence: 0.97
      },
      ddiDetails: {
        existingDrugName: 'Warfarin 5mg',
        newDrugName: prescribedDrug,
        severity,
        description: summary,
        recommendation: 'Hold prescription or adjust dosage under clinician supervision.',
        requiresConfirmation: true
      }
    };

    const auditLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: patientName,
      actorRole: 'PATIENT',
      action: 'SAFETY_CHECK_PENDING_REVIEW',
      details: `Submitted Case #${newCase.id} for severe interaction check between ${prescribedDrug} and Warfarin.`
    };

    state = {
      ...state,
      clinicianCases: [newCase, ...state.clinicianCases],
      auditLogs: [auditLog, ...state.auditLogs]
    };

    notify();
    return newCase;
  },

  reviewClinicianCase: (caseId: string, decision: 'APPROVED' | 'REJECTED' | 'MODIFIED', notes: string, clinicianName = "Dr. Patrick Ntaganda, MD") => {
    let reviewedCaseName = "";
    const updatedCases = state.clinicianCases.map(c => {
      if (c.id === caseId) {
        reviewedCaseName = c.prescribedDrug;
        return {
          ...c,
          status: decision,
          reviewedAt: new Date().toISOString(),
          reviewerNotes: notes,
          assignedClinician: clinicianName
        };
      }
      return c;
    });

    const auditLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: clinicianName,
      actorRole: 'CLINICIAN',
      action: `CLINICIAN_CASE_${decision}`,
      details: `Case #${caseId} for ${reviewedCaseName} was marked ${decision}. Notes: ${notes}`
    };

    state = {
      ...state,
      clinicianCases: updatedCases,
      auditLogs: [auditLog, ...state.auditLogs]
    };

    notify();
  },

  logDoseTaken: (medicationId: string, scheduledTime: string) => {
    const updatedMeds = state.medications.map(med => {
      if (med.id === medicationId && med.schedule) {
        return {
          ...med,
          remaining_quantity: Math.max(0, med.remaining_quantity - 1),
          schedule: med.schedule.map(d => {
            if (d.scheduledTime === scheduledTime) {
              return { ...d, status: 'TAKEN' as const };
            }
            return d;
          })
        };
      }
      return med;
    });

    state = { ...state, medications: updatedMeds };
    notify();
  }
};

export function usePharmaLoopStore() {
  const [storeState, setStoreState] = useState(store.getState());

  useEffect(() => {
    const handleChange = () => setStoreState(store.getState());
    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  return storeState;
}
