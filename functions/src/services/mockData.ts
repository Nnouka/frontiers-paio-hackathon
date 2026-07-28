/**
 * Shared Mock Seed Data for Functions Emulation
 */

export interface MockPharmacyData {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  geohash: string;
  is_active: boolean;
  inventory: {
    id: string;
    medication_name: string;
    generic_name: string;
    unit_price: number;
    stock_quantity: number;
    stock_status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    last_updated: string;
  }[];
}

export const MOCK_PHARMACIES: MockPharmacyData[] = [
  {
    id: "pharm-001",
    name: "Central Care Pharmacy",
    address: "124 Healthcare Boulevard, City Center",
    phone: "+1 (555) 019-2831",
    latitude: 37.7749,
    longitude: -122.4194,
    geohash: "9q8yy",
    is_active: true,
    inventory: [
      {
        id: "inv-101",
        medication_name: "Amoxicillin 500mg",
        generic_name: "Amoxicillin",
        unit_price: 14.50,
        stock_quantity: 42,
        stock_status: "IN_STOCK",
        last_updated: new Date().toISOString()
      },
      {
        id: "inv-102",
        medication_name: "Lipitor 20mg",
        generic_name: "Atorvastatin",
        unit_price: 28.00,
        stock_quantity: 4,
        stock_status: "LOW_STOCK",
        last_updated: new Date().toISOString()
      },
      {
        id: "inv-103",
        medication_name: "Metformin 850mg",
        generic_name: "Metformin Hydrochloride",
        unit_price: 9.99,
        stock_quantity: 85,
        stock_status: "IN_STOCK",
        last_updated: new Date().toISOString()
      }
    ]
  },
  {
    id: "pharm-002",
    name: "Apex Community Chemist",
    address: "89 Metro Station Road, Westside",
    phone: "+1 (555) 018-9944",
    latitude: 37.7833,
    longitude: -122.4167,
    geohash: "9q8yz",
    is_active: true,
    inventory: [
      {
        id: "inv-201",
        medication_name: "Amoxicillin 500mg",
        generic_name: "Amoxicillin",
        unit_price: 12.99,
        stock_quantity: 3,
        stock_status: "LOW_STOCK",
        last_updated: new Date().toISOString()
      },
      {
        id: "inv-202",
        medication_name: "Warfarin 5mg",
        generic_name: "Warfarin Sodium",
        unit_price: 18.20,
        stock_quantity: 15,
        stock_status: "IN_STOCK",
        last_updated: new Date().toISOString()
      }
    ]
  }
];

export const MOCK_DDI_RULES: Record<string, { existing: string; severity: 'SEVERE' | 'MODERATE' | 'DIETARY'; description: string; recommendation: string }> = {
  "aspirin_warfarin": {
    existing: "Warfarin 5mg",
    severity: "SEVERE",
    description: "Combining Aspirin with Warfarin significantly increases the risk of severe gastrointestinal and internal bleeding.",
    recommendation: "Immediate physician consultation required. Do not initiate without explicit medical supervision."
  },
  "amoxicillin_methotrexate": {
    existing: "Methotrexate 10mg",
    severity: "MODERATE",
    description: "Amoxicillin can decrease renal clearance of Methotrexate, elevating serum levels.",
    recommendation: "Monitor renal function and watch for symptoms of methotrexate toxicity."
  }
};
