import { db } from "../admin";
import { geohashQueryBounds, distanceBetween } from "geofire-common";

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

    const distanceKm = distanceBetween([data.location.latitude, data.location.longitude], center);
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
      address: data.address,
      phone: data.phone,
      hours: data.hours,
      location: { latitude: data.location.latitude, longitude: data.location.longitude },
      geohash: data.geohash,
      is_active: data.is_active,
      distanceKm: Math.round(distanceKm * 10) / 10,
      matchingInventory,
    });
  }

  return results.sort((a, b) => a.distanceKm - b.distanceKm);
}
