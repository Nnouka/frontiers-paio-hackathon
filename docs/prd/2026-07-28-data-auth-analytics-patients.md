# PRD: Data, Auth & Analytics — Patients Only (Epic 5)

**Date:** 2026-07-28
**Status:** Draft
**Author:** Workstream 5 (via prd skill)

---

## Problem Statement

`logMedication`, `logAdherence`, and `getAdherenceAnalytics` currently return fabricated data on
every call — nothing persists to Firestore, so a patient's medication list, dose history, and
adherence percentage don't survive between sessions and can't feed the refill-alert or
DDI-screening logic that depends on real active-medication data. There's also no patient sign-in,
so there's no per-patient data isolation to persist against. This epic wires patient auth and real
Firestore persistence so the adherence loop (add medication → log doses → see real analytics →
export a PDF) actually works end-to-end for the hackathon demo.

## User Personas

**Primary:** Patient — using the mobile-first web app, signs in with a Google account (one-tap, no
password to manage), expects their medication list and dose history to persist across
devices/sessions tied to that Google identity.

**Secondary:** none for this epic's patients-only scope (pharmacy/clinician auth is explicitly
excluded).

## Goals & Success Criteria

- A patient can sign in with Google, and every subsequent action (add medication, log dose, view
  analytics) is scoped to their `uid` via Firestore rules and callable auth guards.
- `logMedication` persists a real `users/{uid}/medications/{id}` document instead of returning
  fabricated data.
- `logAdherence` persists a real `adherence_logs` subcollection document, decrements
  `remaining_quantity` on the parent medication, and correctly triggers the existing refill-alert
  threshold logic.
- `getAdherenceAnalytics` computes a real rolling 30-day compliance percentage from the patient's
  actual `adherence_logs`, not a hardcoded 94.2%.
- A patient can export a real generated PDF adherence summary (medication list, dose history,
  compliance %) to Cloud Storage and get back a working download URL.
- The full loop (sign in → add medication → log doses → see real analytics → export PDF) is
  demoable end-to-end via the Emulator Suite.

## Non-Goals

- No pharmacy or clinician account provisioning, custom claims, or role-gated portal routes —
  patient auth only.
- No CI/CD or cross-workstream integration ownership (that's the separate "maintainer" story in
  Epic 5, not in this patients-only scope).
- No email/password or other auth providers — Google Sign-In only for this epic.
- No BigQuery export — analytics are computed and served directly from Firestore reads; BigQuery
  is explicitly "optional" per the existing story and out of scope here.
- No editing/deleting past adherence log entries — logging is append-only (Take/Snooze/Skip),
  matching the existing `logAdherence` action semantics.
- No changes to `checkDDI`'s existing Firestore read of `users/{uid}/medications` (Epic 3) — this
  epic makes that data real, but doesn't touch the DDI logic itself.

## Acceptance Criteria

- [ ] Given a patient on the sign-in screen, when they click "Sign in with Google," then they're
      authenticated via Firebase Auth (`GoogleAuthProvider`) and the app has their `uid` for all
      subsequent calls.
- [ ] Given an authenticated patient, when they call `logMedication` with valid medication
      details, then a `users/{uid}/medications/{id}` document is created in Firestore with the
      fields specified in `system.md` (dosage, frequency, total/remaining quantity, start/end
      date).
- [ ] Given an unauthenticated caller, when they call `logMedication` or `logAdherence`, then the
      call is rejected with `unauthenticated` instead of returning fabricated data.
- [ ] Given an authenticated patient with an existing medication, when they call `logAdherence`
      with `action: "TAKEN"`, then an `adherence_logs` document is created under that medication
      and `remaining_quantity` on the medication document is decremented by one.
- [ ] Given a medication whose `remaining_quantity` drops to or below the existing 3-day threshold
      after a `logAdherence` call, then the response's `refillAlertTriggered` is `true` (matching
      current threshold logic, now driven by real data).
- [ ] Given a patient with real `adherence_logs` spanning the last 30 days, when they call
      `getAdherenceAnalytics`, then `compliancePercentage` and the daily `history` array are
      computed from those actual logs, not hardcoded values.
- [ ] Given a patient with at least one medication and some logged doses, when they request a PDF
      export, then a Cloud Function generates a real PDF (medication list, dose history,
      compliance %), stores it in Cloud Storage, and returns a working download URL.
- [ ] Given Firestore Security Rules, when a patient attempts to read or write another patient's
      `users/{otherUid}/medications` or `adherence_logs`, then the operation is denied.

## Open Questions

- None outstanding.
