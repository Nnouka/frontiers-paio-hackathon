# Design: Geo-Spatial Engine & Pharmacy Portal (Epic 2)

**Date:** 2026-07-28
**Status:** Approved
**PRD:** [docs/prd/2026-07-28-geo-spatial-pharmacy-portal.md](../../prd/2026-07-28-geo-spatial-pharmacy-portal.md)

---

## Context

`searchPharmacies` and `createHold` (in `functions/src/index.ts`) currently run against an
in-memory `MOCK_PHARMACIES` array in `functions/src/services/mockData.ts`: distance is a raw
Euclidean approximation (not geohash), holds are never persisted or expired, there's no
duplicate-hold check, and `firestore.rules` lets *any* `pharmacy`-role account write to *any*
pharmacy's documents. The "Pharmacy Portal (WS2)" tab in `src/App.tsx` is a static placeholder
with no login, no data, no editing. `geofire-common` is already a dependency of both `functions`
and the root app.

## Architecture Overview

- **Data layer:** Firestore collections `pharmacies/{id}`, `pharmacies/{id}/inventory/{id}`, and
  top-level `holds/{id}` (the shape `firestore.rules` already anticipates), populated by a
  one-time seed script that computes each pharmacy's geohash via `geofire-common`.
- **`searchPharmacies`:** rewritten to a real Firestore geohash range query
  (`geofire-common`'s `geohashQueryBounds`) over `pharmacies`, filtered post-query by exact
  distance and `is_active`, fanning out to each matched pharmacy's `inventory` subcollection for
  name/generic-name matching and stock status.
- **`createHold`:** a Firestore transaction that rejects a duplicate ACTIVE hold for the same
  patient+inventoryId, checks available stock, decrements `stock_quantity`, and writes a
  `holds/{id}` doc (`status: ACTIVE`, `expiresAt`).
- **Hold expiry:** Firestore's native TTL only guarantees deletion within ~24h, too slow for a
  60-minute hold — so expiry is a scheduled Cloud Function (`onSchedule`, every 2 minutes) that
  finds `holds` where `status == ACTIVE AND expiresAt <= now`, sets `status: EXPIRED`, and
  restores `stock_quantity` in a transaction per hold. This matches the mechanism already
  described in `architecture.md`/`system.md`.
- **Pharmacy portal:** new React components under `src/components/pharmacy/`, wired into the
  existing Portal tab in `src/App.tsx` — an email/password login form, then an editable inventory
  table + pharmacy details form, reading/writing Firestore directly via the client SDK (no new
  callables needed; `firestore.rules` enforces ownership).
- **Auth:** demo pharmacy accounts get `role: 'pharmacy'` + `pharmacyId: 'pharm-001'` custom
  claims via a one-time admin seed script.

## Data Model

Additive to `system.md` — no breaking changes.

`pharmacies/{id}` and `pharmacies/{id}/inventory/{id}`: unchanged shape, now sourced from a real
seed script instead of `mockData.ts` (which is deleted once the seed script exists).

New top-level collection:
```
holds/{holdId}
  userId: string          // request.auth.uid
  pharmacyId: string
  inventoryId: string
  medicationName: string
  quantity: number
  status: "ACTIVE" | "EXPIRED" | "FULFILLED"
  createdAt: Timestamp
  expiresAt: Timestamp
```

- Duplicate-hold check queries `holds` where `userId == caller`, `inventoryId == target`,
  `status == "ACTIVE"` — requires a composite index (`userId`, `inventoryId`, `status`) added to
  `firestore.indexes.json`.
- `firestore.rules` pharmacy-write rule tightens from `hasRole('pharmacy')` to
  `hasRole('pharmacy') && request.auth.token.pharmacyId == pharmacyId`, on both
  `pharmacies/{pharmacyId}` and its `inventory` subcollection.

## Backend Functions

- `functions/src/scripts/seedPharmacies.ts` (script, not deployed): writes the demo pharmacies +
  inventory to Firestore, computing `geohash` via `geofire-common`'s `geohashForLocation`.
  Idempotent (upsert by fixed doc ID) so it's safe to re-run before a demo.
- `functions/src/scripts/seedPharmacyUsers.ts` (script): creates/updates the demo pharmacy Auth
  account(s) and sets `{ role: 'pharmacy', pharmacyId }` custom claims via
  `admin.auth().setCustomUserClaims`.
- `functions/src/services/pharmacyRepository.ts` (new, mirrors `medicationRepository.ts`):
  `queryNearbyPharmacies(lat, lng, radiusKm, query)`, `getInventoryItem(pharmacyId, inventoryId)`,
  `createHoldTransaction(...)`, `findActiveHold(userId, inventoryId)`, `expireDueHolds(now)`.
- `index.ts`: `searchPharmacies` and `createHold` bodies swap from `MOCK_PHARMACIES` to
  `pharmacyRepository`. `createHold` now requires `request.auth` (`unauthenticated` if missing) —
  a hold must be tied to a `userId` for the duplicate check.
- New exported function `expireHolds`: `onSchedule("every 2 minutes", ...)` (`firebase-functions/v2/scheduler`),
  calling `pharmacyRepository.expireDueHolds`.

### Error handling

- `createHold`: `unauthenticated` (no caller), `invalid-argument` (missing pharmacyId/inventoryId),
  `not-found` (inventory doesn't exist), `already-exists` (duplicate active hold),
  `failed-precondition` (insufficient stock).
- `expireHolds`: per-hold try/catch so one bad doc doesn't abort the batch; failures logged via
  `logger.error`.
- Portal client writes: Firestore write failures (permission-denied, network) surface as inline
  form errors.

## Pharmacy Portal UI

- `src/services/pharmacyPortal.ts` (new): `signInPharmacy(email, password)`,
  `subscribeToOwnInventory(pharmacyId)` (Firestore `onSnapshot`), `updateInventoryItem(...)`,
  `addInventoryItem(...)`, `deleteInventoryItem(...)`, `updatePharmacyDetails(...)`.
- `src/components/pharmacy/PharmacyLoginForm.tsx`: email/password sign-in, inline auth errors.
  Gates the rest of the Portal tab.
- `src/components/pharmacy/PharmacyPortal.tsx`: once signed in, reads `pharmacyId` from the ID
  token's custom claims (`getIdTokenResult`), subscribes to that pharmacy's doc + inventory
  subcollection, and renders:
  - A details card (name, address, phone, hours, active/inactive toggle), editable, saves on
    blur/submit.
  - An inventory table (medication name, generic name, price, stock qty), inline-editable cells,
    an "Add item" row, and per-row delete — using the existing `glass-card`/`btn` styling already
    present in `App.tsx`.
- `src/App.tsx`: Portal tab's placeholder block replaced with `<PharmacyPortal />` (which renders
  `<PharmacyLoginForm />` internally until authenticated).

Inventory writes go directly from the client to Firestore (no new callables) — the tightened
`firestore.rules` pharmacy-write rule is the actual enforcement of "own pharmacy only"; the UI
doesn't duplicate that authorization logic.

## Testing

- `functions`: Vitest unit tests for `pharmacyRepository`'s transaction logic (duplicate-hold
  rejection, insufficient-stock rejection, expiry restoring stock) against the Firestore emulator.
- `firestore.rules`: verify a pharmacy user without the matching `pharmacyId` claim gets
  `permission-denied` writing to another pharmacy's inventory, via `@firebase/rules-unit-testing`.
- Manual end-to-end pass via the Emulator Suite: search → hold → expire (fast-forward by adjusting
  `expiresAt` in the emulator) → portal edit reflected in a fresh search.

## Out of Scope

Everything listed under Non-Goals in the PRD: self-service pharmacy signup, real partner data,
payment/checkout, fuzzy search/relevance ranking, multi-language, multiple simultaneous holds per
patient+item, and portal analytics/reporting.
