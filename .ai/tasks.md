# Tasks

**Current priorities:**
- 5-workstream build against userstories.md (see architecture.md section 6 for ownership map)

**In-flight work:**
- Epic 3 (AI Vision/OCR & Drug Safety Engine): `checkDDI` now reads real per-user active
  medications from Firestore, with demo-baseline fallback for anonymous/no-data callers. See
  decisions.md 2026-07-28 entry.
- Epic 2 (Geo-Spatial Engine & Pharmacy Portal), backend only: `searchPharmacies` and `createHold`
  are Firestore-backed (geohash radius search via `geofire-common`, transactional hold create with
  duplicate-hold/insufficient-stock checks), holds expire via a scheduled `expireHolds` Cloud
  Function (every 2 min) that restores reserved stock, and `firestore.rules` now scopes pharmacy
  writes to the owning `pharmacyId` claim. Verified live against the emulator (search, hold
  create/duplicate-reject/unauthenticated-reject, and expiry-restores-stock) plus 12 passing Vitest
  tests (`functions/src/services/pharmacyRepository.test.ts`,
  `functions/src/rules/pharmacyRules.test.ts`). Seed scripts:
  `npm --prefix functions run seed:pharmacies` / `seed:pharmacy-users`.
- Epic 2 pharmacy portal UI (login form, inventory CRUD) was deliberately dropped for now — user
  redirected focus to patient-side work instead. `src/services/pharmacyPortal.ts` (client
  auth/Firestore helpers) exists but is unused/unwired.

**Blocked / waiting:**
- `checkDDI`'s real-data path only activates once Workstream 5 (Data, Auth & Analytics) wires
  `logMedication`/`logAdherence` to actually persist to Firestore — currently all 8 callables
  except `checkDDI`'s new lookup are stateless stubs.
- Frontend `src/services/firebase.ts` still hardcodes project id `frontiers-paio-dev`, but
  `.firebaserc`/`firebase.json` were changed (by a concurrent session during this work) to
  `pharmaloop-224f3` — these are now out of sync and need reconciling before deploy.
