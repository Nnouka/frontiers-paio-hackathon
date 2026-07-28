import { db } from "../admin";
import { geohashQueryBounds, distanceBetween } from "geofire-common";
import * as logger from "firebase-functions/logger";

export interface InventoryItemDoc {
  id: string;
  pharmacyId: string;
  medication_name: string;
  generic_name: string;
  unit_price: number;
  stock_quantity: number;
  stock_status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  last_updated: string;
}

export interface PharmacySearchResult {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours?: string;
  location: { latitude: number; longitude: number };
  geohash: string;
  is_active: boolean;
  distanceKm: number;
  matchingInventory: InventoryItemDoc[];
}

interface PharmacyLocationOverride {
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
}

const LEGACY_LOCATION_OVERRIDES: Record<string, PharmacyLocationOverride> = {
  "pharm-001": {
    latitude: -1.9536,
    longitude: 30.0605,
    address: "KG 7 Ave, Kigali City Center",
    phone: "+250 788 019 283",
  },
  "pharm-002": {
    latitude: -1.9449,
    longitude: 30.0928,
    address: "KN 5 Rd, Kiyovu",
    phone: "+250 788 018 994",
  },
};

function getNormalizedLocation(
  pharmacyId: string,
  rawLocation: { latitude: number; longitude: number }
): { latitude: number; longitude: number } {
  const override = LEGACY_LOCATION_OVERRIDES[pharmacyId];
  if (!override) return rawLocation;

  // Auto-correct old SF seed values for known demo IDs.
  if (rawLocation.latitude > 20 || rawLocation.longitude < -20) {
    return { latitude: override.latitude, longitude: override.longitude };
  }

  return rawLocation;
}

function getNormalizedAddress(pharmacyId: string, rawAddress: string): string {
  const override = LEGACY_LOCATION_OVERRIDES[pharmacyId];
  if (!override) return rawAddress;
  if (rawAddress.includes("City Center") || rawAddress.includes("Metro Station Road")) {
    return override.address;
  }
  return rawAddress;
}

function getNormalizedPhone(pharmacyId: string, rawPhone: string): string {
  const override = LEGACY_LOCATION_OVERRIDES[pharmacyId];
  if (!override) return rawPhone;
  if (rawPhone.startsWith("+1")) {
    return override.phone;
  }
  return rawPhone;
}

export async function queryNearbyPharmacies(
  latitude: number,
  longitude: number,
  radiusKm: number,
  query: string
): Promise<PharmacySearchResult[]> {
  const center: [number, number] = [latitude, longitude];
  const radiusM = radiusKm * 1000;
  const bounds = geohashQueryBounds(center, radiusM);

  const boundSnapshots = await Promise.all(
    bounds.map(([start, end]) =>
      db.collection("pharmacies").orderBy("geohash").startAt(start).endAt(end).get()
    )
  );

  const candidateDocs = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
  for (const snap of boundSnapshots) {
    for (const doc of snap.docs) {
      candidateDocs.set(doc.id, doc);
    }
  }

  const searchLower = query.toLowerCase();
  const results: PharmacySearchResult[] = [];

  for (const doc of candidateDocs.values()) {
    const data = doc.data();
    if (!data.is_active) continue;

    const normalizedLocation = getNormalizedLocation(doc.id, {
      latitude: data.location.latitude,
      longitude: data.location.longitude,
    });

    const normalizedAddress = getNormalizedAddress(doc.id, data.address);
    const normalizedPhone = getNormalizedPhone(doc.id, data.phone);

    const distanceKm = distanceBetween([normalizedLocation.latitude, normalizedLocation.longitude], center);
    if (distanceKm > radiusKm) continue;

    const inventorySnap = await db.collection("pharmacies").doc(doc.id).collection("inventory").get();
    const matchingInventory: InventoryItemDoc[] = inventorySnap.docs
      .map((invDoc) => ({ id: invDoc.id, pharmacyId: doc.id, ...invDoc.data() } as InventoryItemDoc))
      .filter(
        (inv) =>
          !searchLower ||
          inv.medication_name.toLowerCase().includes(searchLower) ||
          inv.generic_name.toLowerCase().includes(searchLower)
      );

    if (matchingInventory.length === 0) continue;

    results.push({
      id: doc.id,
      name: data.name,
      address: normalizedAddress,
      phone: normalizedPhone,
      hours: data.hours,
      location: { latitude: normalizedLocation.latitude, longitude: normalizedLocation.longitude },
      geohash: data.geohash,
      is_active: data.is_active,
      distanceKm: Math.round(distanceKm * 10) / 10,
      matchingInventory,
    });
  }

  // If strict geospatial filtering returns nothing, fall back to global
  // active pharmacies with matching inventory so search is still useful.
  if (results.length === 0) {
    const allActivePharmacies = await db.collection("pharmacies").where("is_active", "==", true).get();

    for (const doc of allActivePharmacies.docs) {
      const data = doc.data();
      const normalizedLocation = getNormalizedLocation(doc.id, {
        latitude: data.location.latitude,
        longitude: data.location.longitude,
      });
      const normalizedAddress = getNormalizedAddress(doc.id, data.address);
      const normalizedPhone = getNormalizedPhone(doc.id, data.phone);
      const inventorySnap = await db.collection("pharmacies").doc(doc.id).collection("inventory").get();
      const matchingInventory: InventoryItemDoc[] = inventorySnap.docs
        .map((invDoc) => ({ id: invDoc.id, pharmacyId: doc.id, ...invDoc.data() } as InventoryItemDoc))
        .filter(
          (inv) =>
            !searchLower ||
            inv.medication_name.toLowerCase().includes(searchLower) ||
            inv.generic_name.toLowerCase().includes(searchLower)
        );

      if (matchingInventory.length === 0) continue;

      const distanceKm = distanceBetween([normalizedLocation.latitude, normalizedLocation.longitude], center);
      results.push({
        id: doc.id,
        name: data.name,
        address: normalizedAddress,
        phone: normalizedPhone,
        hours: data.hours,
        location: { latitude: normalizedLocation.latitude, longitude: normalizedLocation.longitude },
        geohash: data.geohash,
        is_active: data.is_active,
        distanceKm: Math.round(distanceKm * 10) / 10,
        matchingInventory,
      });
    }
  }

  return results.sort((a, b) => a.distanceKm - b.distanceKm);
}

export interface HoldDoc {
  id: string;
  userId: string;
  pharmacyId: string;
  inventoryId: string;
  medicationName: string;
  quantity: number;
  status: "ACTIVE" | "EXPIRED" | "FULFILLED";
  createdAt: string;
  expiresAt: string;
}

export class DuplicateHoldError extends Error {}
export class InsufficientStockError extends Error {}
export class InventoryNotFoundError extends Error {}

export interface CreateHoldParams {
  userId: string;
  pharmacyId: string;
  inventoryId: string;
  quantity: number;
}

export async function findActiveHold(userId: string, inventoryId: string): Promise<HoldDoc | null> {
  const snap = await db
    .collection("holds")
    .where("userId", "==", userId)
    .where("inventoryId", "==", inventoryId)
    .where("status", "==", "ACTIVE")
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as HoldDoc;
}

export async function createHoldTransaction(params: CreateHoldParams): Promise<HoldDoc> {
  const { userId, pharmacyId, inventoryId, quantity } = params;

  const existing = await findActiveHold(userId, inventoryId);
  if (existing) {
    throw new DuplicateHoldError(`User ${userId} already has an active hold on ${inventoryId}`);
  }

  const inventoryRef = db.collection("pharmacies").doc(pharmacyId).collection("inventory").doc(inventoryId);
  const holdRef = db.collection("holds").doc();
  const nowIso = new Date().toISOString();
  const expiresAtIso = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  return db.runTransaction(async (tx) => {
    const invSnap = await tx.get(inventoryRef);
    if (!invSnap.exists) {
      throw new InventoryNotFoundError(`Inventory ${inventoryId} not found at pharmacy ${pharmacyId}`);
    }

    const invData = invSnap.data()!;
    if (invData.stock_quantity < quantity) {
      throw new InsufficientStockError(`Only ${invData.stock_quantity} units available`);
    }

    tx.update(inventoryRef, { stock_quantity: invData.stock_quantity - quantity, last_updated: nowIso });

    const holdDoc: Omit<HoldDoc, "id"> = {
      userId,
      pharmacyId,
      inventoryId,
      medicationName: invData.medication_name,
      quantity,
      status: "ACTIVE",
      createdAt: nowIso,
      expiresAt: expiresAtIso,
    };
    tx.set(holdRef, holdDoc);

    return { id: holdRef.id, ...holdDoc };
  });
}

export async function expireDueHolds(now: Date = new Date()): Promise<number> {
  const nowIso = now.toISOString();
  const snap = await db
    .collection("holds")
    .where("status", "==", "ACTIVE")
    .where("expiresAt", "<=", nowIso)
    .get();

  let expiredCount = 0;

  for (const holdDoc of snap.docs) {
    try {
      await db.runTransaction(async (tx) => {
        const holdSnap = await tx.get(holdDoc.ref);
        const holdData = holdSnap.data();
        if (!holdData || holdData.status !== "ACTIVE") return;

        const inventoryRef = db
          .collection("pharmacies")
          .doc(holdData.pharmacyId)
          .collection("inventory")
          .doc(holdData.inventoryId);
        const invSnap = await tx.get(inventoryRef);

        if (invSnap.exists) {
          const invData = invSnap.data()!;
          tx.update(inventoryRef, {
            stock_quantity: invData.stock_quantity + holdData.quantity,
            last_updated: new Date().toISOString(),
          });
        }

        tx.update(holdDoc.ref, { status: "EXPIRED" });
      });
      expiredCount += 1;
    } catch (err) {
      logger.error("Failed to expire hold", { holdId: holdDoc.id, err });
    }
  }

  return expiredCount;
}
