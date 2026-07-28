import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "../admin";
import { GeoPoint } from "firebase-admin/firestore";
import { geohashForLocation } from "geofire-common";
import {
  queryNearbyPharmacies,
  createHoldTransaction,
  findActiveHold,
  DuplicateHoldError,
  InsufficientStockError,
  InventoryNotFoundError,
} from "./pharmacyRepository";

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

const HOLD_PHARMACY_ID = "test-pharm-hold";
const HOLD_INVENTORY_ID = "test-inv-hold";
const HOLD_USER_ID = "test-user-hold";

async function seedHoldInventory(stockQuantity: number) {
  await db.collection("pharmacies").doc(HOLD_PHARMACY_ID).collection("inventory").doc(HOLD_INVENTORY_ID).set({
    medication_name: "Test Med 500mg",
    generic_name: "Test Med",
    unit_price: 10,
    stock_quantity: stockQuantity,
    stock_status: "IN_STOCK",
    last_updated: new Date().toISOString(),
  });
}

async function clearHolds() {
  const holds = await db.collection("holds").where("pharmacyId", "==", HOLD_PHARMACY_ID).get();
  await Promise.all(holds.docs.map((d) => d.ref.delete()));
  await db.collection("pharmacies").doc(HOLD_PHARMACY_ID).collection("inventory").doc(HOLD_INVENTORY_ID).delete();
}

describe("createHoldTransaction", () => {
  beforeEach(async () => {
    await clearHolds();
    await seedHoldInventory(10);
  });

  afterEach(clearHolds);

  it("creates a hold and decrements stock", async () => {
    const hold = await createHoldTransaction({
      userId: HOLD_USER_ID,
      pharmacyId: HOLD_PHARMACY_ID,
      inventoryId: HOLD_INVENTORY_ID,
      quantity: 2,
    });

    expect(hold.status).toBe("ACTIVE");

    const invSnap = await db
      .collection("pharmacies")
      .doc(HOLD_PHARMACY_ID)
      .collection("inventory")
      .doc(HOLD_INVENTORY_ID)
      .get();
    expect(invSnap.data()?.stock_quantity).toBe(8);
  });

  it("rejects a duplicate active hold for the same user+item", async () => {
    await createHoldTransaction({
      userId: HOLD_USER_ID,
      pharmacyId: HOLD_PHARMACY_ID,
      inventoryId: HOLD_INVENTORY_ID,
      quantity: 1,
    });

    await expect(
      createHoldTransaction({
        userId: HOLD_USER_ID,
        pharmacyId: HOLD_PHARMACY_ID,
        inventoryId: HOLD_INVENTORY_ID,
        quantity: 1,
      })
    ).rejects.toBeInstanceOf(DuplicateHoldError);
  });

  it("rejects a hold when requested quantity exceeds stock", async () => {
    await expect(
      createHoldTransaction({
        userId: HOLD_USER_ID,
        pharmacyId: HOLD_PHARMACY_ID,
        inventoryId: HOLD_INVENTORY_ID,
        quantity: 999,
      })
    ).rejects.toBeInstanceOf(InsufficientStockError);
  });

  it("rejects a hold on a nonexistent inventory item", async () => {
    await expect(
      createHoldTransaction({
        userId: HOLD_USER_ID,
        pharmacyId: HOLD_PHARMACY_ID,
        inventoryId: "missing-inv",
        quantity: 1,
      })
    ).rejects.toBeInstanceOf(InventoryNotFoundError);
  });

  it("findActiveHold returns null when there is no active hold", async () => {
    const found = await findActiveHold(HOLD_USER_ID, HOLD_INVENTORY_ID);
    expect(found).toBeNull();
  });
});
