import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, GeoPoint } from "firebase-admin/firestore";
import { geohashForLocation } from "geofire-common";

if (getApps().length === 0) {
  initializeApp({ projectId: "frontiers-paio-dev" });
}
const db = getFirestore();

interface SeedInventoryItem {
  id: string;
  medication_name: string;
  generic_name: string;
  unit_price: number;
  stock_quantity: number;
}

interface SeedPharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  inventory: SeedInventoryItem[];
}

const SEED_PHARMACIES: SeedPharmacy[] = [
  {
    id: "pharm-001",
    name: "Central Care Pharmacy",
    address: "124 Healthcare Boulevard, City Center",
    phone: "+1 (555) 019-2831",
    hours: "Mon-Sat 8am-9pm, Sun 9am-6pm",
    latitude: 37.7749,
    longitude: -122.4194,
    is_active: true,
    inventory: [
      { id: "inv-101", medication_name: "Amoxicillin 500mg", generic_name: "Amoxicillin", unit_price: 14.5, stock_quantity: 42 },
      { id: "inv-102", medication_name: "Lipitor 20mg", generic_name: "Atorvastatin", unit_price: 28.0, stock_quantity: 4 },
      { id: "inv-103", medication_name: "Metformin 850mg", generic_name: "Metformin Hydrochloride", unit_price: 9.99, stock_quantity: 85 },
    ],
  },
  {
    id: "pharm-002",
    name: "Apex Community Chemist",
    address: "89 Metro Station Road, Westside",
    phone: "+1 (555) 018-9944",
    hours: "Daily 7am-11pm",
    latitude: 37.7833,
    longitude: -122.4167,
    is_active: true,
    inventory: [
      { id: "inv-201", medication_name: "Amoxicillin 500mg", generic_name: "Amoxicillin", unit_price: 12.99, stock_quantity: 3 },
      { id: "inv-202", medication_name: "Warfarin 5mg", generic_name: "Warfarin Sodium", unit_price: 18.2, stock_quantity: 15 },
    ],
  },
];

function stockStatus(qty: number): "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" {
  if (qty <= 0) return "OUT_OF_STOCK";
  if (qty <= 5) return "LOW_STOCK";
  return "IN_STOCK";
}

async function seed() {
  const nowIso = new Date().toISOString();

  for (const pharmacy of SEED_PHARMACIES) {
    const geohash = geohashForLocation([pharmacy.latitude, pharmacy.longitude]);
    const pharmacyRef = db.collection("pharmacies").doc(pharmacy.id);

    await pharmacyRef.set({
      name: pharmacy.name,
      address: pharmacy.address,
      phone: pharmacy.phone,
      hours: pharmacy.hours,
      location: new GeoPoint(pharmacy.latitude, pharmacy.longitude),
      geohash,
      is_active: pharmacy.is_active,
      created_at: nowIso,
    });

    for (const item of pharmacy.inventory) {
      await pharmacyRef.collection("inventory").doc(item.id).set({
        medication_name: item.medication_name,
        generic_name: item.generic_name,
        unit_price: item.unit_price,
        stock_quantity: item.stock_quantity,
        stock_status: stockStatus(item.stock_quantity),
        last_updated: nowIso,
      });
    }

    console.log(`Seeded ${pharmacy.name} (${pharmacy.id}) with geohash ${geohash}`);
  }

  console.log("Pharmacy seed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Pharmacy seed failed:", err);
    process.exit(1);
  });
