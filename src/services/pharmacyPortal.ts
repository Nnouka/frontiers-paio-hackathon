import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "./firebase";
import type { InventoryItem, Pharmacy } from "@shared/types/contracts";

export async function signInPharmacy(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signOutPharmacy(): Promise<void> {
  await signOut(auth);
}

export function onPharmacyAuthStateChanged(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function getPharmacyIdClaim(user: User): Promise<string | null> {
  const tokenResult = await user.getIdTokenResult();
  const pharmacyId = tokenResult.claims.pharmacyId;
  return typeof pharmacyId === "string" ? pharmacyId : null;
}

export function subscribeToPharmacyDetails(
  pharmacyId: string,
  callback: (pharmacy: Pharmacy | null) => void
): () => void {
  return onSnapshot(doc(db, "pharmacies", pharmacyId), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const data = snap.data();
    callback({
      id: snap.id,
      name: data.name,
      address: data.address,
      phone: data.phone,
      hours: data.hours,
      location: { latitude: data.location.latitude, longitude: data.location.longitude },
      geohash: data.geohash,
      is_active: data.is_active,
    });
  });
}

export function subscribeToOwnInventory(
  pharmacyId: string,
  callback: (items: InventoryItem[]) => void
): () => void {
  return onSnapshot(collection(db, "pharmacies", pharmacyId, "inventory"), (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, pharmacyId, ...d.data() } as InventoryItem));
    callback(items);
  });
}

export async function updatePharmacyDetails(
  pharmacyId: string,
  updates: Partial<Pick<Pharmacy, "name" | "address" | "phone" | "hours" | "is_active">>
): Promise<void> {
  await updateDoc(doc(db, "pharmacies", pharmacyId), updates);
}

export async function addInventoryItem(
  pharmacyId: string,
  item: Omit<InventoryItem, "id" | "pharmacyId" | "last_updated">
): Promise<void> {
  const inventoryRef = doc(collection(db, "pharmacies", pharmacyId, "inventory"));
  await setDoc(inventoryRef, { ...item, last_updated: new Date().toISOString() });
}

export async function updateInventoryItem(
  pharmacyId: string,
  inventoryId: string,
  updates: Partial<
    Pick<InventoryItem, "medication_name" | "generic_name" | "unit_price" | "stock_quantity" | "stock_status">
  >
): Promise<void> {
  await updateDoc(doc(db, "pharmacies", pharmacyId, "inventory", inventoryId), {
    ...updates,
    last_updated: new Date().toISOString(),
  });
}

export async function deleteInventoryItem(pharmacyId: string, inventoryId: string): Promise<void> {
  await deleteDoc(doc(db, "pharmacies", pharmacyId, "inventory", inventoryId));
}
