import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "../admin";
import { GeoPoint } from "firebase-admin/firestore";
import { geohashForLocation } from "geofire-common";
import { queryNearbyPharmacies } from "./pharmacyRepository";

const NEAR_ID = "test-pharm-near";
const FAR_ID = "test-pharm-far";
const CENTER: [number, number] = [37.7749, -122.4194];
const NEAR_COORDS: [number, number] = [37.7755, -122.4189]; // ~0.1km away
const FAR_COORDS: [number, number] = [40.7128, -74.006]; // New York, far away

async function seedPharmacy(id: string, coords: [number, number], isActive: boolean) {
  await db.collection("pharmacies").doc(id).set({
    name: `Pharmacy ${id}`,
    address: "1 Test St",
    phone: "555-0000",
    location: new GeoPoint(coords[0], coords[1]),
    geohash: geohashForLocation(coords),
    is_active: isActive,
  });
  await db.collection("pharmacies").doc(id).collection("inventory").doc("inv-1").set({
    medication_name: "Amoxicillin 500mg",
    generic_name: "Amoxicillin",
    unit_price: 10,
    stock_quantity: 20,
    stock_status: "IN_STOCK",
    last_updated: new Date().toISOString(),
  });
}

async function cleanup(id: string) {
  await db.collection("pharmacies").doc(id).collection("inventory").doc("inv-1").delete();
  await db.collection("pharmacies").doc(id).delete();
}

describe("queryNearbyPharmacies", () => {
  beforeEach(async () => {
    await seedPharmacy(NEAR_ID, NEAR_COORDS, true);
    await seedPharmacy(FAR_ID, FAR_COORDS, true);
  });

  afterEach(async () => {
    await cleanup(NEAR_ID);
    await cleanup(FAR_ID);
  });

  it("returns only pharmacies within the radius that match the query", async () => {
    const results = await queryNearbyPharmacies(CENTER[0], CENTER[1], 5, "Amoxicillin");

    const ids = results.map((r) => r.id);
    expect(ids).toContain(NEAR_ID);
    expect(ids).not.toContain(FAR_ID);
  });

  it("excludes pharmacies whose inventory doesn't match the query", async () => {
    const results = await queryNearbyPharmacies(CENTER[0], CENTER[1], 5, "Ibuprofen");
    expect(results.map((r) => r.id)).not.toContain(NEAR_ID);
  });

  it("excludes inactive pharmacies", async () => {
    await cleanup(NEAR_ID);
    await seedPharmacy(NEAR_ID, NEAR_COORDS, false);

    const results = await queryNearbyPharmacies(CENTER[0], CENTER[1], 5, "Amoxicillin");
    expect(results.map((r) => r.id)).not.toContain(NEAR_ID);
  });
});
