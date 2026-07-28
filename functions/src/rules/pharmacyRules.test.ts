import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "frontiers-paio-dev",
    firestore: {
      rules: fs.readFileSync(path.resolve(__dirname, "../../../firestore.rules"), "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

const inventoryDoc = {
  medication_name: "Amoxicillin 500mg",
  generic_name: "Amoxicillin",
  unit_price: 15,
  stock_quantity: 40,
  stock_status: "IN_STOCK",
  last_updated: new Date().toISOString(),
};

describe("firestore.rules: pharmacy inventory writes", () => {
  it("denies a pharmacy user writing to a pharmacy that isn't theirs", async () => {
    const otherPharmacyUser = testEnv.authenticatedContext("staff-002", {
      role: "pharmacy",
      pharmacyId: "pharm-002",
    });
    const db = otherPharmacyUser.firestore();

    await assertFails(
      db.collection("pharmacies").doc("pharm-001").collection("inventory").doc("inv-101").set(inventoryDoc)
    );
  });

  it("allows a pharmacy user writing to their own pharmacy's inventory", async () => {
    const ownPharmacyUser = testEnv.authenticatedContext("staff-001", {
      role: "pharmacy",
      pharmacyId: "pharm-001",
    });
    const db = ownPharmacyUser.firestore();

    await assertSucceeds(
      db.collection("pharmacies").doc("pharm-001").collection("inventory").doc("inv-101").set(inventoryDoc)
    );
  });
});
