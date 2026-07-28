# Decisions

<!-- ADR log — use the adr skill to append entries -->
<!-- Format: ## YYYY-MM-DD — [Title] | Status | Context | Decision | Options | Consequences -->

## 2026-07-28 — checkDDI reads real per-user active medications | Accepted
**Context:** Epic 3's story "cross-reference a newly scanned drug against a patient's active
medication profile" wasn't actually met — `checkDDI` looped over a hardcoded array for every
caller. This is also the first real Firestore read anywhere in `functions/src` (Admin SDK was a
dependency but never initialized).
**Decision:** Added `functions/src/admin.ts` (single Admin SDK init) and
`functions/src/services/medicationRepository.ts` (`getActiveMedicationsForUser`, plain
subcollection `.get()` + in-code active filter). `checkDDI` now uses `request.auth?.uid` to read
real data, falling back to a `DEMO_FALLBACK_MEDICATIONS` baseline (moved into `ddiRules.ts`) when
anonymous or when the user has no medications yet.
**Options considered:** Server-side range query on `end_date` (rejected — excludes docs with the
field absent); wiring `CheckDDIRequest.patientId` for clinician lookups now (rejected — needs a
role-check design that doesn't exist yet, out of scope).
**Consequences:** No `CheckDDIRequest`/`CheckDDIResponse` contract change. No `firestore.rules`/
`firestore.indexes.json` changes needed (no new collection/schema, no compound query, Admin SDK
bypasses rules anyway). The lookup will mostly hit the fallback until Workstream 5 ships
`logMedication`/`logAdherence` persistence — expected and acceptable.
