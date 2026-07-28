import { db } from "../admin";
import * as logger from "firebase-functions/logger";

export interface ActiveMedicationRef {
  drug_name: string;
  generic_name?: string;
}

/**
 * Fetches the caller's active medications from Firestore for DDI screening.
 * "Active" = end_date is null OR end_date is today-or-later, filtered in code
 * rather than as a Firestore range query since the field may be absent.
 */
export async function getActiveMedicationsForUser(userId: string): Promise<ActiveMedicationRef[]> {
  try {
    const snapshot = await db.collection("users").doc(userId).collection("medications").get();
    const today = new Date().toISOString().slice(0, 10);

    return snapshot.docs
      .map((doc) => doc.data())
      .filter((med) => !med.end_date || med.end_date >= today)
      .map((med) => ({ drug_name: med.medication_name, generic_name: med.generic_name }));
  } catch (err) {
    logger.error("getActiveMedicationsForUser failed, falling back to empty list", { userId, err });
    return [];
  }
}
