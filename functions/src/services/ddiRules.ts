/**
 * Deterministic DDI (Drug-Drug Interaction) Rule Matrix
 * Workstream 3: AI Vision/OCR & Drug Safety Engine
 */

import type { ActiveMedicationRef } from "./medicationRepository";

/**
 * Baseline active-medication profile used when a caller is anonymous, or is
 * authenticated but has no medications in Firestore yet (expected until
 * Workstream 5 ships persistence). Keeps the product demo path working.
 */
export const DEMO_FALLBACK_MEDICATIONS: ActiveMedicationRef[] = [
  { drug_name: "Warfarin 5mg", generic_name: "Warfarin" },
  { drug_name: "Methotrexate 10mg", generic_name: "Methotrexate" },
  { drug_name: "Simvastatin 20mg", generic_name: "Simvastatin" }
];

export interface KnownDDIRule {
  drugA: string;
  drugB: string;
  severity: 'SEVERE' | 'MODERATE' | 'DIETARY';
  description: string;
  recommendation: string;
  requiresConfirmation: boolean;
}

export const KNOWN_DDI_RULES: KnownDDIRule[] = [
  {
    drugA: "aspirin",
    drugB: "warfarin",
    severity: "SEVERE",
    description: "Concomitant use of Aspirin and Warfarin substantially increases the risk of severe gastrointestinal and systemic hemorrhage.",
    recommendation: "Immediate physician consultation required. Co-prescription requires strict international normalized ratio (INR) monitoring.",
    requiresConfirmation: true
  },
  {
    drugA: "sildenafil",
    drugB: "nitroglycerin",
    severity: "SEVERE",
    description: "Combining Sildenafil with Nitrates can precipitate life-threatening severe hypotension and cardiovascular collapse.",
    recommendation: "Absolute contraindication. Do not take together under any circumstances.",
    requiresConfirmation: true
  },
  {
    drugA: "amoxicillin",
    drugB: "methotrexate",
    severity: "MODERATE",
    description: "Amoxicillin reduces renal clearance of Methotrexate, potentially elevating methotrexate toxicity risks.",
    recommendation: "Monitor renal function and observe for mucosal ulceration or severe fatigue.",
    requiresConfirmation: false
  },
  {
    drugA: "paracetamol",
    drugB: "acetaminophen",
    severity: "MODERATE",
    description: "Duplicate active ingredient detected (Paracetamol / Acetaminophen). Taking multiple formulations risks cumulative liver toxicity.",
    recommendation: "Check combined daily dose; do not exceed 4,000mg total acetaminophen per 24 hours.",
    requiresConfirmation: false
  },
  {
    drugA: "simvastatin",
    drugB: "grapefruit",
    severity: "DIETARY",
    description: "Grapefruit juice inhibits CYP3A4 metabolism of Simvastatin, leading to elevated drug blood levels and increased risk of muscle damage (rhabdomyolysis).",
    recommendation: "Avoid consumption of grapefruit or grapefruit juice while taking Simvastatin.",
    requiresConfirmation: false
  },
  {
    drugA: "tetracycline",
    drugB: "dairy",
    severity: "DIETARY",
    description: "Calcium in dairy products binds to Tetracycline in the gastrointestinal tract, preventing proper absorption.",
    recommendation: "Take Tetracycline at least 2 hours before or 2 hours after consuming milk, cheese, or yogurt.",
    requiresConfirmation: false
  }
];

export function checkDeterministicDDI(drug1Name: string, drug2Name: string): KnownDDIRule | null {
  const d1 = drug1Name.toLowerCase();
  const d2 = drug2Name.toLowerCase();

  for (const rule of KNOWN_DDI_RULES) {
    if (
      (d1.includes(rule.drugA) && d2.includes(rule.drugB)) ||
      (d1.includes(rule.drugB) && d2.includes(rule.drugA))
    ) {
      return rule;
    }
  }

  return null;
}
