# Geo-Spatial Engine & Pharmacy Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the in-memory `searchPharmacies`/`createHold` stubs with real Firestore-backed geo search and time-boxed holds, tighten pharmacy ownership in `firestore.rules`, and build a working pharmacy portal (login + editable inventory/details) in the existing React app.

**Architecture:** Cloud Functions read/write `pharmacies`/`inventory`/`holds` Firestore collections via a new `pharmacyRepository` service, using `geofire-common` for geohash range queries and Firestore transactions for hold create/expire. A scheduled function expires holds every 2 minutes. The pharmacy portal is a new set of React components under `src/components/pharmacy/` that write directly to Firestore via the client SDK, relying on `firestore.rules` for authorization.

**Tech Stack:** Firebase Cloud Functions (Node 22, TypeScript, 2nd gen), Cloud Firestore, `geofire-common`, Firebase Auth custom claims, React + TypeScript (Vite), Vitest + `@firebase/rules-unit-testing` against the Firestore Emulator.

## Global Constraints

- Stack is Google/Firebase only — no third-party backend services (per `architecture.md`).
- `functions/tsconfig.json`: `strict: true`, `noUnusedLocals: true`, `target: ES2022`, `module: commonjs` — all new code must satisfy this.
- Testing: Vitest preferred (per user's global stack default), run against the Firestore Emulator via `firebase emulators:exec`.
- No self-service pharmacy signup, no real partner data, no payment/checkout, no multiple simultaneous holds per patient+item (per the PRD's Non-Goals).
- Follow existing code patterns: services in `functions/src/services/*.ts` mirror `medicationRepository.ts`; frontend inline styles + `glass-card`/`btn`/`badge` CSS utility classes as used throughout `src/App.tsx`.

---

### Task 1: Add `hours` field to the shared `Pharmacy` contract type

**Files:**
- Modify: `shared/types/contracts.ts:28-37`

**Interfaces:**
- Produces: `Pharmacy.hours?: string` — consumed by Task 4 (search results), Task 7 (seed script), Task 11 (portal UI).

- [ ] **Step 1: Add the field**

In `shared/types/contracts.ts`, update the `Pharmacy` interface:

```ts
export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  location: GeoLocation;
  geohash: string;
  phone: string;
  hours?: string;
  is_active: boolean;
  inventory?: InventoryItem[];
}
```

(Optional, not required, so existing mock data in `src/services/apiClient.ts` that builds `Pharmacy`-shaped objects without `hours` keeps compiling.)

- [ ] **Step 2: Verify the project still typechecks**

Run: `npm run lint` (root) and `npm --prefix functions run lint`
Expected: both exit 0, no new type errors.

- [ ] **Step 3: Commit**

```bash
git add shared/types/contracts.ts
git commit -m "Add optional hours field to Pharmacy contract type"
```

---

### Task 2: Add the `holds` composite Firestore index

**Files:**
- Modify: `firestore.indexes.json`

**Interfaces:**
- Produces: the `(status ASC, expiresAt ASC)` composite index that Task 6's `expireDueHolds` query requires. (The duplicate-hold lookup in Task 5 uses only equality filters — `userId`, `inventoryId`, `status` — which Firestore serves from automatic single-field indexes, no composite index needed.)

- [ ] **Step 1: Add the index definition**

Replace the contents of `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "holds",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "expiresAt", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

- [ ] **Step 2: Validate the JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('firestore.indexes.json','utf8'))"`
Expected: no output (no parse error).

- [ ] **Step 3: Commit**

```bash
git add firestore.indexes.json
git commit -m "Add composite index for holds expiry query"
```

---

### Task 3: Test harness + tightened pharmacy-ownership rule

**Files:**
- Modify: `functions/package.json`
- Create: `functions/vitest.config.ts`
- Modify: `firestore.rules`
- Test: `functions/src/rules/pharmacyRules.test.ts`

**Interfaces:**
- Produces: the Vitest + `@firebase/rules-unit-testing` harness (`npm --prefix functions test`) that Tasks 4-6 also use.
- Produces: `firestore.rules`'s `ownsPharmacy(pharmacyId)` helper — no code depends on it directly (rules only), but it's the mechanism the PRD's last acceptance criterion requires.

- [ ] **Step 1: Add test dependencies and script to `functions/package.json`**

Add to `devDependencies`:

```json
"@firebase/rules-unit-testing": "^3.0.4",
"vitest": "^1.6.0"
```

Add to `scripts`:

```json
"test": "firebase emulators:exec --project frontiers-paio-dev --config ../firebase.json --only firestore,auth \"vitest run\""
```

- [ ] **Step 2: Install**

Run: `npm --prefix functions install`
Expected: exits 0.

- [ ] **Step 3: Add `functions/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
```

- [ ] **Step 4: Write the failing rules test**

Create `functions/src/rules/pharmacyRules.test.ts`:

```ts
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
```

- [ ] **Step 5: Run the tests to verify the first one fails**

Run: `npm --prefix functions test`
Expected: `denies a pharmacy user writing to a pharmacy that isn't theirs` FAILS (the current rule `hasRole('pharmacy') || hasRole('admin')` lets any pharmacy-role account write to any pharmacy), `allows...their own...` PASSES.

- [ ] **Step 6: Tighten `firestore.rules`**

In `firestore.rules`, add a helper next to the existing `hasRole` function and use it for the `pharmacies` write rules:

```
    function hasRole(role) {
      return isAuthenticated() && request.auth.token.role == role;
    }

    function ownsPharmacy(pharmacyId) {
      return hasRole('pharmacy') && request.auth.token.pharmacyId == pharmacyId;
    }

    // Public / Geo search: anyone authenticated or guest can read pharmacies & inventory
    match /pharmacies/{pharmacyId} {
      allow read: if true;
      allow write: if ownsPharmacy(pharmacyId) || hasRole('admin');

      match /inventory/{inventoryId} {
        allow read: if true;
        allow write: if ownsPharmacy(pharmacyId) || hasRole('admin');
      }
    }
```

- [ ] **Step 7: Run the tests to verify both pass**

Run: `npm --prefix functions test`
Expected: both tests PASS.

- [ ] **Step 8: Commit**

```bash
git add functions/package.json functions/package-lock.json functions/vitest.config.ts functions/src/rules/pharmacyRules.test.ts firestore.rules
git commit -m "Tighten pharmacy write rules to owner-only, add rules test harness"
```

---

### Task 4: `pharmacyRepository.queryNearbyPharmacies`

**Files:**
- Create: `functions/src/services/pharmacyRepository.ts`
- Test: `functions/src/services/pharmacyRepository.test.ts`

**Interfaces:**
- Consumes: `db` from `functions/src/admin.ts` (`import { db } from "../admin"`).
- Produces:
  ```ts
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
  ): Promise<PharmacySearchResult[]>
  ```
  — consumed by Task 8 (`index.ts`'s `searchPharmacies`).

- [ ] **Step 1: Write the failing test**

Create `functions/src/services/pharmacyRepository.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
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

  afterEach(async () => {
    await cleanup(NEAR_ID);
    await cleanup(FAR_ID);
  });
});
```

Add the missing `afterEach` import: change the first line to
`import { describe, it, expect, beforeEach, afterEach } from "vitest";`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix functions test`
Expected: FAIL — `Cannot find module './pharmacyRepository'`.

- [ ] **Step 3: Implement `queryNearbyPharmacies`**

Create `functions/src/services/pharmacyRepository.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm --prefix functions test`
Expected: all `queryNearbyPharmacies` tests PASS.

- [ ] **Step 5: Commit**

```bash
git add functions/src/services/pharmacyRepository.ts functions/src/services/pharmacyRepository.test.ts
git commit -m "Add Firestore geohash-backed queryNearbyPharmacies"
```

---

### Task 5: `pharmacyRepository.createHoldTransaction` + `findActiveHold`

**Files:**
- Modify: `functions/src/services/pharmacyRepository.ts`
- Modify: `functions/src/services/pharmacyRepository.test.ts`

**Interfaces:**
- Produces:
  ```ts
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

  export async function findActiveHold(userId: string, inventoryId: string): Promise<HoldDoc | null>
  export async function createHoldTransaction(params: {
    userId: string;
    pharmacyId: string;
    inventoryId: string;
    quantity: number;
  }): Promise<HoldDoc>
  ```
  — consumed by Task 8 (`index.ts`'s `createHold`) and Task 6 (`expireDueHolds` tests use the same seeded data shape).

- [ ] **Step 1: Write the failing tests**

Append to `functions/src/services/pharmacyRepository.test.ts`:

```ts
import {
  createHoldTransaction,
  findActiveHold,
  DuplicateHoldError,
  InsufficientStockError,
  InventoryNotFoundError,
} from "./pharmacyRepository";

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm --prefix functions test`
Expected: FAIL — `createHoldTransaction`/`findActiveHold`/error classes not exported.

- [ ] **Step 3: Implement in `pharmacyRepository.ts`**

Append to `functions/src/services/pharmacyRepository.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm --prefix functions test`
Expected: all `createHoldTransaction`/`findActiveHold` tests PASS.

- [ ] **Step 5: Commit**

```bash
git add functions/src/services/pharmacyRepository.ts functions/src/services/pharmacyRepository.test.ts
git commit -m "Add createHoldTransaction with duplicate-hold and stock checks"
```

---

### Task 6: `pharmacyRepository.expireDueHolds`

**Files:**
- Modify: `functions/src/services/pharmacyRepository.ts`
- Modify: `functions/src/services/pharmacyRepository.test.ts`

**Interfaces:**
- Consumes: `HoldDoc`, `createHoldTransaction`, `findActiveHold` from Task 5.
- Produces: `export async function expireDueHolds(now: Date = new Date()): Promise<number>` — consumed by Task 8's scheduled `expireHolds` function.

- [ ] **Step 1: Write the failing test**

Append to `functions/src/services/pharmacyRepository.test.ts` (reusing the `HOLD_*` constants and `seedHoldInventory`/`clearHolds` helpers from Task 5):

```ts
import { expireDueHolds } from "./pharmacyRepository";

describe("expireDueHolds", () => {
  beforeEach(async () => {
    await clearHolds();
    await seedHoldInventory(10);
  });

  afterEach(clearHolds);

  it("restores stock and marks the hold EXPIRED once past expiresAt", async () => {
    const hold = await createHoldTransaction({
      userId: HOLD_USER_ID,
      pharmacyId: HOLD_PHARMACY_ID,
      inventoryId: HOLD_INVENTORY_ID,
      quantity: 3,
    });

    const oneHourLater = new Date(Date.now() + 61 * 60 * 1000);
    const expiredCount = await expireDueHolds(oneHourLater);
    expect(expiredCount).toBe(1);

    const invSnap = await db
      .collection("pharmacies")
      .doc(HOLD_PHARMACY_ID)
      .collection("inventory")
      .doc(HOLD_INVENTORY_ID)
      .get();
    expect(invSnap.data()?.stock_quantity).toBe(10);

    const holdSnap = await db.collection("holds").doc(hold.id).get();
    expect(holdSnap.data()?.status).toBe("EXPIRED");

    const active = await findActiveHold(HOLD_USER_ID, HOLD_INVENTORY_ID);
    expect(active).toBeNull();
  });

  it("does not touch holds that haven't expired yet", async () => {
    await createHoldTransaction({
      userId: HOLD_USER_ID,
      pharmacyId: HOLD_PHARMACY_ID,
      inventoryId: HOLD_INVENTORY_ID,
      quantity: 3,
    });

    const expiredCount = await expireDueHolds(new Date());
    expect(expiredCount).toBe(0);

    const active = await findActiveHold(HOLD_USER_ID, HOLD_INVENTORY_ID);
    expect(active).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `npm --prefix functions test`
Expected: FAIL — `expireDueHolds` is not exported.

- [ ] **Step 3: Implement `expireDueHolds`**

Append to `functions/src/services/pharmacyRepository.ts`:

```ts
import * as logger from "firebase-functions/logger";

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
```

Move the `import * as logger from "firebase-functions/logger";` line to the top of the file alongside the other imports (TypeScript allows it either place, but keep imports grouped at the top per existing file conventions).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm --prefix functions test`
Expected: all tests in `pharmacyRepository.test.ts` PASS.

- [ ] **Step 5: Commit**

```bash
git add functions/src/services/pharmacyRepository.ts functions/src/services/pharmacyRepository.test.ts
git commit -m "Add expireDueHolds to release stock on hold expiry"
```

---

### Task 7: Seed scripts for pharmacies and pharmacy users

**Files:**
- Create: `functions/src/scripts/seedPharmacies.ts`
- Create: `functions/src/scripts/seedPharmacyUsers.ts`
- Modify: `functions/package.json`

**Interfaces:**
- Consumes: `firebase-admin/app`, `firebase-admin/firestore`, `firebase-admin/auth`, `geofire-common`'s `geohashForLocation`.
- Produces: two idempotent CLI scripts, run manually via `npm --prefix functions run seed:pharmacies` / `seed:pharmacy-users`, used in Task 12's manual verification.

- [ ] **Step 1: Add `ts-node` and seed scripts to `functions/package.json`**

Add to `devDependencies`: `"ts-node": "^10.9.2"`.

Add to `scripts`:

```json
"seed:pharmacies": "ts-node src/scripts/seedPharmacies.ts",
"seed:pharmacy-users": "ts-node src/scripts/seedPharmacyUsers.ts"
```

Run: `npm --prefix functions install`

- [ ] **Step 2: Write `seedPharmacies.ts`**

Create `functions/src/scripts/seedPharmacies.ts`:

```ts
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
```

- [ ] **Step 3: Write `seedPharmacyUsers.ts`**

Create `functions/src/scripts/seedPharmacyUsers.ts`:

```ts
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (getApps().length === 0) {
  initializeApp({ projectId: "frontiers-paio-dev" });
}
const auth = getAuth();

interface SeedPharmacyUser {
  email: string;
  password: string;
  pharmacyId: string;
}

const SEED_PHARMACY_USERS: SeedPharmacyUser[] = [
  { email: "pharmacy1@demo.pharmaloop.app", password: "Demo1234!", pharmacyId: "pharm-001" },
  { email: "pharmacy2@demo.pharmaloop.app", password: "Demo1234!", pharmacyId: "pharm-002" },
];

async function seedUsers() {
  for (const seedUser of SEED_PHARMACY_USERS) {
    let user;
    try {
      user = await auth.getUserByEmail(seedUser.email);
    } catch {
      user = await auth.createUser({
        email: seedUser.email,
        password: seedUser.password,
        emailVerified: true,
      });
    }

    await auth.setCustomUserClaims(user.uid, { role: "pharmacy", pharmacyId: seedUser.pharmacyId });
    console.log(`Seeded pharmacy user ${seedUser.email} -> pharmacyId=${seedUser.pharmacyId}`);
  }

  console.log("Pharmacy user seed complete.");
}

seedUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Pharmacy user seed failed:", err);
    process.exit(1);
  });
```

- [ ] **Step 4: Verify both scripts run cleanly against the emulator**

Run (from repo root, in one terminal): `firebase emulators:start --only firestore,auth`
Run (in a second terminal):

```bash
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 npm --prefix functions run seed:pharmacies
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 npm --prefix functions run seed:pharmacy-users
```

Expected: both scripts print `... seed complete.` and exit 0. In the Emulator UI (`http://127.0.0.1:4000`), `pharmacies/pharm-001` and `pharmacies/pharm-002` exist with `inventory` subcollections, and the Auth tab shows both demo pharmacy users.

- [ ] **Step 5: Commit**

```bash
git add functions/package.json functions/package-lock.json functions/src/scripts/seedPharmacies.ts functions/src/scripts/seedPharmacyUsers.ts
git commit -m "Add idempotent seed scripts for demo pharmacies and pharmacy users"
```

---

### Task 8: Rewire `index.ts` to the repository, add `expireHolds`, delete the mock stub

**Files:**
- Modify: `functions/src/index.ts:1-82`
- Delete: `functions/src/services/mockData.ts`

**Interfaces:**
- Consumes: `queryNearbyPharmacies`, `createHoldTransaction`, `expireDueHolds`, `DuplicateHoldError`, `InsufficientStockError`, `InventoryNotFoundError` from `./services/pharmacyRepository` (Tasks 4-6).
- Produces: real `searchPharmacies`/`createHold` callables matching the existing `SearchPharmaciesRequest`/`SearchPharmaciesResponse`/`CreateHoldRequest`/`CreateHoldResponse` shapes in `shared/types/contracts.ts`, plus a new exported `expireHolds` scheduled function — consumed by Task 12's manual verification.

- [ ] **Step 1: Confirm `mockData.ts` has no other consumers**

Run: `grep -rn "mockData" functions/src src`
Expected: only `functions/src/index.ts` (the two imports being replaced in this task).

- [ ] **Step 2: Replace the `searchPharmacies` and `createHold` handlers**

In `functions/src/index.ts`, replace the top import block:

```ts
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import {
  queryNearbyPharmacies,
  createHoldTransaction,
  expireDueHolds,
  DuplicateHoldError,
  InsufficientStockError,
  InventoryNotFoundError,
} from "./services/pharmacyRepository";
import { extractMedicationFromImage } from "./services/geminiService";
import { checkDeterministicDDI, DEMO_FALLBACK_MEDICATIONS } from "./services/ddiRules";
import { getActiveMedicationsForUser, type ActiveMedicationRef } from "./services/medicationRepository";
```

Replace the `searchPharmacies` export (lines 11-47 of the original file) with:

```ts
export const searchPharmacies = onCall({ cors: true }, async (request) => {
  const { query, latitude, longitude, radiusKm = 10 } = request.data || {};

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new HttpsError("invalid-argument", "latitude and longitude are required numbers.");
  }

  logger.info("searchPharmacies call received", { query, latitude, longitude, radiusKm });

  const pharmacies = await queryNearbyPharmacies(latitude, longitude, radiusKm, query || "");

  return {
    pharmacies,
    searchRadiusKm: radiusKm,
    totalFound: pharmacies.length,
  };
});
```

Replace the `createHold` export (lines 52-82 of the original file) with:

```ts
export const createHold = onCall({ cors: true }, async (request) => {
  const { pharmacyId, inventoryId, quantity = 1 } = request.data || {};

  if (!pharmacyId || !inventoryId) {
    throw new HttpsError("invalid-argument", "pharmacyId and inventoryId are required.");
  }

  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError("unauthenticated", "You must be signed in to place a hold.");
  }

  try {
    const hold = await createHoldTransaction({ userId, pharmacyId, inventoryId, quantity });
    logger.info("createHold reservation created", { holdId: hold.id, pharmacyId, inventoryId, userId });

    return {
      hold: {
        holdId: hold.id,
        pharmacyId: hold.pharmacyId,
        inventoryId: hold.inventoryId,
        medicationName: hold.medicationName,
        quantity: hold.quantity,
        expiresAt: hold.expiresAt,
        status: hold.status,
      },
    };
  } catch (err) {
    if (err instanceof DuplicateHoldError) {
      throw new HttpsError("already-exists", err.message);
    }
    if (err instanceof InsufficientStockError) {
      throw new HttpsError("failed-precondition", err.message);
    }
    if (err instanceof InventoryNotFoundError) {
      throw new HttpsError("not-found", err.message);
    }
    throw err;
  }
});
```

- [ ] **Step 3: Add the scheduled `expireHolds` function**

Add near the bottom of `functions/src/index.ts`, after the other exports:

```ts
/**
 * 9. expireHolds (Workstream 2) - releases stock from holds past their 60-minute window
 */
export const expireHolds = onSchedule("every 2 minutes", async () => {
  const expiredCount = await expireDueHolds();
  logger.info("expireHolds run complete", { expiredCount });
});
```

- [ ] **Step 4: Delete the mock data file**

```bash
rm functions/src/services/mockData.ts
```

- [ ] **Step 5: Build and typecheck**

Run: `npm --prefix functions run lint`
Expected: exits 0, no references to the deleted `mockData.ts` remain.

- [ ] **Step 6: Manual smoke test against the emulator**

With the emulator running and pharmacies seeded (Task 7), start the functions shell:

Run: `npm --prefix functions run shell`

In the shell:
```
searchPharmacies({latitude: 37.7749, longitude: -122.4194, query: "Amoxicillin", radiusKm: 10})
```
Expected: returns `pharmacies` including `pharm-001` and `pharm-002` with `matchingInventory`, sorted by `distanceKm`.

- [ ] **Step 7: Commit**

```bash
git add functions/src/index.ts
git rm functions/src/services/mockData.ts
git commit -m "Rewire searchPharmacies/createHold to Firestore, add expireHolds schedule"
```

---

### Task 9: `src/services/pharmacyPortal.ts` client service

**Files:**
- Create: `src/services/pharmacyPortal.ts`

**Interfaces:**
- Consumes: `auth`, `db` from `src/services/firebase.ts`; `InventoryItem`, `Pharmacy` from `@shared/types/contracts` (Task 1's `hours?: string` addition).
- Produces:
  ```ts
  export async function signInPharmacy(email: string, password: string): Promise<User>
  export async function signOutPharmacy(): Promise<void>
  export function onPharmacyAuthStateChanged(callback: (user: User | null) => void): () => void
  export async function getPharmacyIdClaim(user: User): Promise<string | null>
  export function subscribeToPharmacyDetails(pharmacyId: string, callback: (pharmacy: Pharmacy | null) => void): () => void
  export function subscribeToOwnInventory(pharmacyId: string, callback: (items: InventoryItem[]) => void): () => void
  export async function updatePharmacyDetails(pharmacyId: string, updates: Partial<Pick<Pharmacy, "name" | "address" | "phone" | "hours" | "is_active">>): Promise<void>
  export async function addInventoryItem(pharmacyId: string, item: Omit<InventoryItem, "id" | "pharmacyId" | "last_updated">): Promise<void>
  export async function updateInventoryItem(pharmacyId: string, inventoryId: string, updates: Partial<Pick<InventoryItem, "medication_name" | "generic_name" | "unit_price" | "stock_quantity" | "stock_status">>): Promise<void>
  export async function deleteInventoryItem(pharmacyId: string, inventoryId: string): Promise<void>
  ```
  — consumed by Tasks 10-11.

- [ ] **Step 1: Write the file**

Create `src/services/pharmacyPortal.ts`:

```ts
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run lint`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/services/pharmacyPortal.ts
git commit -m "Add pharmacyPortal client service for portal auth and Firestore access"
```

---

### Task 10: `PharmacyLoginForm.tsx`

**Files:**
- Create: `src/components/pharmacy/PharmacyLoginForm.tsx`

**Interfaces:**
- Consumes: `signInPharmacy` from `src/services/pharmacyPortal.ts` (Task 9).
- Produces: `export const PharmacyLoginForm: React.FC<{ onSignedIn: () => void }>` — consumed by Task 11.

- [ ] **Step 1: Write the file**

Create `src/components/pharmacy/PharmacyLoginForm.tsx`:

```tsx
import React, { useState } from "react";
import { LogIn } from "lucide-react";
import { signInPharmacy } from "../../services/pharmacyPortal";

interface PharmacyLoginFormProps {
  onSignedIn: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid var(--border-subtle)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--text-main)",
  fontSize: "0.9rem",
};

export const PharmacyLoginForm: React.FC<PharmacyLoginFormProps> = ({ onSignedIn }) => {
  const [email, setEmail] = useState("pharmacy1@demo.pharmaloop.app");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signInPharmacy(email, password);
      onSignedIn();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign-in failed. Check your email and password.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px", maxWidth: "360px" }}>
      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
          Pharmacy Email
        </label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
      </div>
      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          required
        />
      </div>
      {error && (
        <div className="badge badge-danger" style={{ width: "fit-content" }}>
          {error}
        </div>
      )}
      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        <LogIn size={16} />
        {isSubmitting ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
};
```

- [ ] **Step 2: Typecheck**

Run: `npm run lint`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/pharmacy/PharmacyLoginForm.tsx
git commit -m "Add pharmacy portal login form"
```

---

### Task 11: `PharmacyPortal.tsx` + wire into `App.tsx`

**Files:**
- Create: `src/components/pharmacy/PharmacyPortal.tsx`
- Modify: `src/App.tsx:201-218`

**Interfaces:**
- Consumes: everything from Task 9's `pharmacyPortal.ts`, `PharmacyLoginForm` from Task 10.
- Produces: `export const PharmacyPortal: React.FC` — consumed by `App.tsx`'s Portal tab.

- [ ] **Step 1: Write `PharmacyPortal.tsx`**

Create `src/components/pharmacy/PharmacyPortal.tsx`:

```tsx
import React, { useEffect, useState } from "react";
import { Building2, Trash2, Plus, LogOut } from "lucide-react";
import type { User } from "firebase/auth";
import type { InventoryItem, Pharmacy } from "@shared/types/contracts";
import { PharmacyLoginForm } from "./PharmacyLoginForm";
import {
  onPharmacyAuthStateChanged,
  getPharmacyIdClaim,
  subscribeToPharmacyDetails,
  subscribeToOwnInventory,
  updatePharmacyDetails,
  updateInventoryItem,
  addInventoryItem,
  deleteInventoryItem,
  signOutPharmacy,
} from "../../services/pharmacyPortal";

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: "8px",
  border: "1px solid var(--border-subtle)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--text-main)",
  fontSize: "0.85rem",
  width: "100%",
};

function stockStatus(qty: number): InventoryItem["stock_status"] {
  if (qty <= 0) return "OUT_OF_STOCK";
  if (qty <= 5) return "LOW_STOCK";
  return "IN_STOCK";
}

export const PharmacyPortal: React.FC = () => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [newItem, setNewItem] = useState({
    medication_name: "",
    generic_name: "",
    unit_price: "",
    stock_quantity: "",
  });

  useEffect(() => onPharmacyAuthStateChanged(setAuthUser), []);

  useEffect(() => {
    if (!authUser) {
      setPharmacyId(null);
      return;
    }
    getPharmacyIdClaim(authUser).then((id) => {
      if (!id) {
        setClaimError("This account has no pharmacyId claim. Ask an admin to re-seed your account.");
        return;
      }
      setClaimError(null);
      setPharmacyId(id);
    });
  }, [authUser]);

  useEffect(() => {
    if (!pharmacyId) return;
    const unsubDetails = subscribeToPharmacyDetails(pharmacyId, setPharmacy);
    const unsubInventory = subscribeToOwnInventory(pharmacyId, setInventory);
    return () => {
      unsubDetails();
      unsubInventory();
    };
  }, [pharmacyId]);

  if (!authUser) {
    return (
      <div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px" }}>
          Sign in with your pharmacy account to manage inventory, hours, and active status.
        </p>
        <PharmacyLoginForm onSignedIn={() => {}} />
      </div>
    );
  }

  if (claimError) {
    return <div className="badge badge-danger">{claimError}</div>;
  }

  if (!pharmacyId || !pharmacy) {
    return <p style={{ color: "var(--text-muted)" }}>Loading your pharmacy...</p>;
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const stockQuantity = Number(newItem.stock_quantity) || 0;
    await addInventoryItem(pharmacyId, {
      medication_name: newItem.medication_name,
      generic_name: newItem.generic_name,
      unit_price: Number(newItem.unit_price) || 0,
      stock_quantity: stockQuantity,
      stock_status: stockStatus(stockQuantity),
    });
    setNewItem({ medication_name: "", generic_name: "", unit_price: "", stock_quantity: "" });
  };

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Building2 size={20} color="#2DD4BF" />
          <h3 style={{ fontSize: "1.05rem" }}>{pharmacy.name}</h3>
          <span className={`badge ${pharmacy.is_active ? "badge-success" : "badge-danger"}`}>
            {pharmacy.is_active ? "Active" : "Inactive"}
          </span>
        </div>
        <button className="btn btn-secondary" onClick={() => signOutPharmacy()}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Address</label>
          <input
            style={inputStyle}
            defaultValue={pharmacy.address}
            onBlur={(e) => updatePharmacyDetails(pharmacyId, { address: e.target.value })}
          />
        </div>
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Phone</label>
          <input
            style={inputStyle}
            defaultValue={pharmacy.phone}
            onBlur={(e) => updatePharmacyDetails(pharmacyId, { phone: e.target.value })}
          />
        </div>
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Hours</label>
          <input
            style={inputStyle}
            defaultValue={pharmacy.hours || ""}
            onBlur={(e) => updatePharmacyDetails(pharmacyId, { hours: e.target.value })}
          />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            className="btn btn-secondary"
            onClick={() => updatePharmacyDetails(pharmacyId, { is_active: !pharmacy.is_active })}
          >
            Mark {pharmacy.is_active ? "Inactive" : "Active"}
          </button>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--text-muted)" }}>
              <th style={{ padding: "8px" }}>Medication</th>
              <th style={{ padding: "8px" }}>Generic</th>
              <th style={{ padding: "8px" }}>Price</th>
              <th style={{ padding: "8px" }}>Stock</th>
              <th style={{ padding: "8px" }} />
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "8px" }}>
                  <input
                    style={inputStyle}
                    defaultValue={item.medication_name}
                    onBlur={(e) => updateInventoryItem(pharmacyId, item.id, { medication_name: e.target.value })}
                  />
                </td>
                <td style={{ padding: "8px" }}>
                  <input
                    style={inputStyle}
                    defaultValue={item.generic_name}
                    onBlur={(e) => updateInventoryItem(pharmacyId, item.id, { generic_name: e.target.value })}
                  />
                </td>
                <td style={{ padding: "8px" }}>
                  <input
                    style={inputStyle}
                    type="number"
                    step="0.01"
                    defaultValue={item.unit_price}
                    onBlur={(e) =>
                      updateInventoryItem(pharmacyId, item.id, { unit_price: Number(e.target.value) || 0 })
                    }
                  />
                </td>
                <td style={{ padding: "8px" }}>
                  <input
                    style={inputStyle}
                    type="number"
                    defaultValue={item.stock_quantity}
                    onBlur={(e) => {
                      const qty = Number(e.target.value) || 0;
                      updateInventoryItem(pharmacyId, item.id, {
                        stock_quantity: qty,
                        stock_status: stockStatus(qty),
                      });
                    }}
                  />
                </td>
                <td style={{ padding: "8px" }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: "6px 8px" }}
                    onClick={() => deleteInventoryItem(pharmacyId, item.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleAddItem} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}>
        <input
          style={{ ...inputStyle, width: "160px" }}
          placeholder="Medication name"
          value={newItem.medication_name}
          onChange={(e) => setNewItem({ ...newItem, medication_name: e.target.value })}
          required
        />
        <input
          style={{ ...inputStyle, width: "140px" }}
          placeholder="Generic name"
          value={newItem.generic_name}
          onChange={(e) => setNewItem({ ...newItem, generic_name: e.target.value })}
          required
        />
        <input
          style={{ ...inputStyle, width: "100px" }}
          placeholder="Price"
          type="number"
          step="0.01"
          value={newItem.unit_price}
          onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })}
          required
        />
        <input
          style={{ ...inputStyle, width: "100px" }}
          placeholder="Stock qty"
          type="number"
          value={newItem.stock_quantity}
          onChange={(e) => setNewItem({ ...newItem, stock_quantity: e.target.value })}
          required
        />
        <button type="submit" className="btn btn-primary">
          <Plus size={14} /> Add Item
        </button>
      </form>
    </div>
  );
};
```

- [ ] **Step 2: Wire it into `App.tsx`**

In `src/App.tsx`, add the import near the other component import:

```ts
import { CameraScanner } from './components/patient/CameraScanner';
import { PharmacyPortal } from './components/pharmacy/PharmacyPortal';
```

Replace the Portal tab's placeholder block (the `{activeTab === 'portal' && (...)}` section, originally lines 201-218) with:

```tsx
{activeTab === 'portal' && (
  <div className="glass-card" style={{ padding: '24px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Pharmacy Management Portal</h2>
      <span className="badge badge-info">Workstream 2 Ready</span>
    </div>
    <PharmacyPortal />
  </div>
)}
```

- [ ] **Step 3: Typecheck**

Run: `npm run lint`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/pharmacy/PharmacyPortal.tsx src/App.tsx
git commit -m "Wire pharmacy portal UI into the Portal tab"
```

---

### Task 12: End-to-end emulator verification

**Files:** none (verification only)

**Interfaces:** exercises the full flow from Tasks 4-11.

- [ ] **Step 1: Start the full emulator suite and the app**

Run (terminal 1, from repo root): `firebase emulators:start`
Run (terminal 2, from repo root): `npm run dev`

- [ ] **Step 2: Seed demo data**

Run (terminal 3):
```bash
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 npm --prefix functions run seed:pharmacies
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 npm --prefix functions run seed:pharmacy-users
```

- [ ] **Step 3: Verify search in the browser**

Open the Vite dev URL, go to the "API Console" tab (already wired to call `searchPharmacies`/`createHold`), click `1. searchPharmacies (WS2)`.
Expected: JSON output includes both `pharm-001` and `pharm-002` (search is unauthenticated by default so `createHold` next will need a signed-in test — the console currently calls it with `useMock` toggled off against the emulator; if `createHold` errors with `unauthenticated`, that confirms Task 8's Step 3 behavior is live — expected for an anonymous caller).

- [ ] **Step 4: Verify the portal login + inventory edit reflects in search**

Go to the "Pharmacy Portal (WS2)" tab, sign in with `pharmacy1@demo.pharmaloop.app` / `Demo1234!`. Edit `Amoxicillin 500mg`'s stock quantity to `1` (blur the field). Switch to "API Console", run `searchPharmacies` again with `query: "Amoxicillin"`.
Expected: `pharm-001`'s matching inventory item now shows `stock_quantity: 1` and `stock_status: "LOW_STOCK"`.

- [ ] **Step 5: Verify rules enforcement**

While still signed in as `pharmacy1@demo.pharmaloop.app`, open the Emulator UI Firestore tab and attempt to manually edit a `pharm-002` inventory document as that user (or run the Task 3 rules test again: `npm --prefix functions test`).
Expected: denied / test passes.

- [ ] **Step 6: Verify hold expiry**

In the Emulator UI, manually edit a test hold's `expiresAt` to a past timestamp (create one first via the API Console's `createHold` button while signed in, or via Firestore UI directly), then wait up to 2 minutes (or trigger the scheduled function manually via `firebase emulators:start` logs / the Functions shell: `expireHolds()`).
Expected: the hold's `status` becomes `EXPIRED` and the inventory's `stock_quantity` is restored.

- [ ] **Step 7: Record results in `.ai/tasks.md`**

Per this repo's global instructions, update `.ai/tasks.md` to mark Epic 2's backend/portal work complete and note anything deferred.

- [ ] **Step 8: Final commit**

```bash
git add .ai/tasks.md
git commit -m "Mark Epic 2 geo-spatial engine and pharmacy portal complete"
```
