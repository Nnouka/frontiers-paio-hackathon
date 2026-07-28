import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, GeoPoint } from "firebase-admin/firestore";
import { geohashForLocation } from "geofire-common";

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || "pharmaloop-224f3";

if (getApps().length === 0) {
  initializeApp({ projectId });
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
    address: "KG 7 Ave, Kigali City Center",
    phone: "+250 788 019 283",
    hours: "Mon-Sat 8am-9pm, Sun 9am-6pm",
    latitude: -1.9536,
    longitude: 30.0605,
    is_active: true,
    inventory: [
      { id: "inv-101", medication_name: "Amoxicillin 500mg", generic_name: "Amoxicillin", unit_price: 14.5, stock_quantity: 42 },
      { id: "inv-102", medication_name: "Atorvastatin 20mg", generic_name: "Atorvastatin", unit_price: 28.0, stock_quantity: 12 },
      { id: "inv-103", medication_name: "Metformin 850mg", generic_name: "Metformin Hydrochloride", unit_price: 9.99, stock_quantity: 85 },
      { id: "inv-104", medication_name: "Paracetamol 500mg", generic_name: "Acetaminophen", unit_price: 4.25, stock_quantity: 110 },
      { id: "inv-105", medication_name: "Amlodipine 5mg", generic_name: "Amlodipine", unit_price: 8.5, stock_quantity: 36 },
    ],
  },
  {
    id: "pharm-002",
    name: "Apex Community Chemist",
    address: "KN 5 Rd, Kiyovu",
    phone: "+250 788 018 994",
    hours: "Daily 7am-11pm",
    latitude: -1.9449,
    longitude: 30.0928,
    is_active: true,
    inventory: [
      { id: "inv-201", medication_name: "Amoxicillin 500mg", generic_name: "Amoxicillin", unit_price: 12.99, stock_quantity: 3 },
      { id: "inv-202", medication_name: "Warfarin 5mg", generic_name: "Warfarin Sodium", unit_price: 18.2, stock_quantity: 15 },
      { id: "inv-203", medication_name: "Ceftriaxone 1g", generic_name: "Ceftriaxone", unit_price: 22.0, stock_quantity: 18 },
      { id: "inv-204", medication_name: "Omeprazole 20mg", generic_name: "Omeprazole", unit_price: 6.75, stock_quantity: 47 },
      { id: "inv-205", medication_name: "Ibuprofen 400mg", generic_name: "Ibuprofen", unit_price: 5.2, stock_quantity: 64 },
    ],
  },
  {
    id: "pharm-003",
    name: "Kimironko Health Pharmacy",
    address: "KG 11 Ave, Kimironko",
    phone: "+250 788 117 300",
    hours: "Daily 8am-10pm",
    latitude: -1.9431,
    longitude: 30.1211,
    is_active: true,
    inventory: [
      { id: "inv-301", medication_name: "Metformin 500mg", generic_name: "Metformin", unit_price: 7.9, stock_quantity: 52 },
      { id: "inv-302", medication_name: "Insulin Glargine Pen", generic_name: "Insulin Glargine", unit_price: 34.5, stock_quantity: 14 },
      { id: "inv-303", medication_name: "Losartan 50mg", generic_name: "Losartan", unit_price: 9.1, stock_quantity: 39 },
      { id: "inv-304", medication_name: "Salbutamol Inhaler", generic_name: "Albuterol", unit_price: 16.8, stock_quantity: 9 },
      { id: "inv-305", medication_name: "Azithromycin 500mg", generic_name: "Azithromycin", unit_price: 13.4, stock_quantity: 26 },
    ],
  },
  {
    id: "pharm-004",
    name: "Remera Community Pharmacy",
    address: "KG 610 St, Remera",
    phone: "+250 788 117 400",
    hours: "Mon-Sun 7am-9pm",
    latitude: -1.9538,
    longitude: 30.1046,
    is_active: true,
    inventory: [
      { id: "inv-401", medication_name: "Warfarin 5mg", generic_name: "Warfarin Sodium", unit_price: 17.8, stock_quantity: 8 },
      { id: "inv-402", medication_name: "Aspirin 81mg", generic_name: "Acetylsalicylic Acid", unit_price: 4.8, stock_quantity: 78 },
      { id: "inv-403", medication_name: "Ciprofloxacin 500mg", generic_name: "Ciprofloxacin", unit_price: 11.2, stock_quantity: 22 },
      { id: "inv-404", medication_name: "Amoxicillin 250mg Syrup", generic_name: "Amoxicillin", unit_price: 9.6, stock_quantity: 17 },
      { id: "inv-405", medication_name: "ORS Sachet", generic_name: "Oral Rehydration Salts", unit_price: 0.9, stock_quantity: 140 },
    ],
  },
  {
    id: "pharm-005",
    name: "Kacyiru Family Pharmacy",
    address: "KN 14 Ave, Kacyiru",
    phone: "+250 788 117 500",
    hours: "Daily 8am-11pm",
    latitude: -1.9343,
    longitude: 30.0826,
    is_active: true,
    inventory: [
      { id: "inv-501", medication_name: "Amlodipine 10mg", generic_name: "Amlodipine", unit_price: 10.4, stock_quantity: 31 },
      { id: "inv-502", medication_name: "Hydrochlorothiazide 25mg", generic_name: "Hydrochlorothiazide", unit_price: 5.6, stock_quantity: 41 },
      { id: "inv-503", medication_name: "Amoxicillin 500mg", generic_name: "Amoxicillin", unit_price: 13.8, stock_quantity: 0 },
      { id: "inv-504", medication_name: "Cetirizine 10mg", generic_name: "Cetirizine", unit_price: 3.7, stock_quantity: 67 },
      { id: "inv-505", medication_name: "Prednisolone 5mg", generic_name: "Prednisolone", unit_price: 6.9, stock_quantity: 24 },
    ],
  },
  {
    id: "pharm-006",
    name: "Nyamirambo Care Chemist",
    address: "KN 2 Ave, Nyamirambo",
    phone: "+250 788 117 600",
    hours: "Mon-Sat 7:30am-10pm, Sun 9am-8pm",
    latitude: -1.9822,
    longitude: 30.0444,
    is_active: true,
    inventory: [
      { id: "inv-601", medication_name: "Coartem 20/120mg", generic_name: "Artemether/Lumefantrine", unit_price: 7.5, stock_quantity: 58 },
      { id: "inv-602", medication_name: "Artesunate 50mg", generic_name: "Artesunate", unit_price: 4.4, stock_quantity: 33 },
      { id: "inv-603", medication_name: "Zinc Sulfate 20mg", generic_name: "Zinc Sulfate", unit_price: 2.1, stock_quantity: 96 },
      { id: "inv-604", medication_name: "Amoxicillin 500mg", generic_name: "Amoxicillin", unit_price: 13.2, stock_quantity: 19 },
      { id: "inv-605", medication_name: "Metronidazole 400mg", generic_name: "Metronidazole", unit_price: 5.9, stock_quantity: 49 },
    ],
  },
];

function stockStatus(qty: number): "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" {
  if (qty <= 0) return "OUT_OF_STOCK";
  if (qty <= 5) return "LOW_STOCK";
  return "IN_STOCK";
}

async function seed() {
  console.log(`Seeding pharmacies into project: ${projectId}`);
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

    // Remove stale inventory rows so repeated seeds stay deterministic.
    const existingInventory = await pharmacyRef.collection("inventory").listDocuments();
    await Promise.all(existingInventory.map((docRef) => docRef.delete()));

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
