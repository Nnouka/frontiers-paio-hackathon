# Health Track User Stories

Epics are grouped by the five parallel workstreams defined in [architecture.md](architecture.md)
section 6, so each teammate can build independently and we consolidate against agreed API
contracts at the end. System behavior detail is in [system.md](system.md).

## [x] Epic 0: Foundation and integration setup (shared, all owners)

- [x] As a team, we agree on Cloud Functions callable contracts for `searchPharmacies`, `createHold`, `extractFromScan`, `checkDDI`, `createSchedule`, `logMedication`, `logAdherence`, `getAdherenceAnalytics` before parallel work starts.
- [x] As a developer, I can bootstrap my workstream's service and run it against a shared Firebase project (dev environment) using the Firebase Emulator Suite.
- [x] As a developer, I can run local emulators/mocks for the services I depend on but don't own, so I can build without blocking on other workstreams.
- [x] As a maintainer, I can deploy Firebase Hosting preview channels per pull request so integration checkpoints are fast and safe.

## [ ] Epic 1: Web Frontend App (Workstream 1)

- [ ] As a patient, I can input a medication name, active ingredient, or upload a prescription photo to start a search, from a mobile-first responsive React + TypeScript web app.
- [ ] As a patient, I can grant browser location access (Geolocation API) so nearby results are relevant.
- [ ] As a patient, I can view search results on an interactive map (Google Maps Platform via `@react-google-maps/api`) showing distance, route time, price, hours, and stock status (In Stock / Low Stock / Out of Stock).
- [ ] As a patient, I can place a 60-minute hold on a medication to prevent stock-outs during travel.
- [ ] As a patient, I can capture a pill box, bottle label, or receipt with my device camera (browser `getUserMedia`/file input) after purchase.
- [ ] As a patient, I receive one-tap actions on Web Push reminders: Take Dose, Snooze 15 Min, Skip Dose.
- [ ] As a patient, I can view my adherence percentage and treatment progress.
- [ ] As a patient, I can access my last saved plan and reminders while offline, via in-browser Firestore offline persistence.
- [ ] As a patient, the app works fully in a mobile browser with no install required.

## [ ] Epic 2: Geo-Spatial Engine & Pharmacy Portal (Workstream 2)

- [ ] As a backend service, I can query pharmacies within a configurable radius (5/10/25km) using Firestore geohash range queries (`geofire-common`).
- [ ] As a backend service, I can match search queries against exact SKUs, active chemical components, and generic alternatives.
- [ ] As a backend service, I can accept and expire a 60-minute hold request against inventory (TTL document expired by a scheduled Cloud Function).
- [ ] As a pharmacy, I can log into the React + TypeScript pharmacy portal (role-gated routes, Firebase Hosting + Auth) to manage my inventory (medication name, generic name, price, stock quantity).
- [ ] As a pharmacy, I can mark my pharmacy inactive or update hours/contact details.
- [ ] As a system, I expose `searchPharmacies` and `createHold` Cloud Functions callables per the agreed contract for the mobile app to consume.

## [ ] Epic 3: AI Vision/OCR & Drug Safety Engine (Workstream 3)

- [ ] As a system, I can extract structured entities from a scanned pill box, label, or receipt via Vertex AI Gemini: drug_name, dosage_strength, form, dosage_instruction, duration_days, total_quantity, warnings.
- [ ] As a system, I can parse a photographed doctor's prescription into a structured medication query for search.
- [ ] As a system, I can cross-reference a newly scanned drug against a patient's active medication profile for interactions.
- [ ] As a system, I can classify an interaction as Severe (dangerous, requires explicit confirmation + physician warning), Moderate (overlapping active ingredients), or Dietary (food/beverage contraindication).
- [ ] As a patient, I must explicitly confirm before proceeding when a Severe alert is raised.
- [ ] As a system, I expose `extractFromScan` and `checkDDI` Cloud Functions callables per the agreed contract.

## [ ] Epic 4: Schedule & Alert Service (Workstream 4)

- [ ] As a system, I can translate natural-language dosage instructions (e.g., "twice daily after meals") into exact timestamp schedules based on the patient's lifestyle anchors (e.g., breakfast, dinner), using Gemini for NL parsing.
- [ ] As a patient, I receive push notifications via Firebase Cloud Messaging (FCM) as the sole reminder channel.
- [ ] As a patient who hasn't confirmed a push within 15 minutes, I see a persistent in-app fallback banner on next open (Firestore-backed pending-confirmation flag) — no third-party SMS/WhatsApp gateway.
- [ ] As a system, when remaining dosage drops below a 3-day threshold, I trigger an automated refill alert via a Firestore-triggered Cloud Function.
- [ ] As a system, a refill alert automatically kicks off a pharmacy stock search so the patient can re-order with one tap.
- [ ] As a system, I expose `createSchedule` as a Cloud Functions callable, with reminder firing driven by Cloud Scheduler + Cloud Tasks (no direct synchronous contract to the mobile app).

## [ ] Epic 5: Data, Auth & Analytics (Workstream 5)

- [ ] As a system, I authenticate users and pharmacy portal accounts via Firebase Authentication with custom claims for patient/pharmacy/clinician roles.
- [ ] As a system, I enforce access control across all backend services via Firestore Security Rules and Cloud Functions auth guards.
- [ ] As a system, I persist `users/{id}/medications/{id}` documents (dosage, frequency, total/remaining quantity, start/end date) per the schema in system.md.
- [ ] As a system, I persist `adherence_logs` subcollection documents (scheduled_time, taken_time, status: TAKEN/SNOOZED/SKIPPED/MISSED) when a dose action is logged, decrementing remaining_quantity.
- [ ] As a product lead, I can compute adherence percentage over a rolling 30-day window, optionally exported to BigQuery.
- [ ] As a patient, I can export a PDF adherence summary report (Cloud Function, stored in Cloud Storage) to share with my physician.
- [ ] As a system, I expose `logMedication`, `logAdherence`, and `getAdherenceAnalytics` Cloud Functions callables per the agreed contract.
- [ ] As a maintainer, I own CI/CD and the final end-to-end consolidation/integration pass across all five workstreams, using the Firebase Emulator Suite for integration testing.

## [ ] Epic 6: Demo storyline (shared)

- [ ] As a judge, I can follow one full patient journey: search for a medication nearby, place a hold, purchase, scan the label, see a DDI check clear, confirm a reminder schedule, log a dose, and see a predictive refill trigger.
- [ ] As a judge, I can observe the human-confirmation step for a Severe DDI alert live.
- [ ] As a judge, I can see the in-app fallback banner trigger when a push notification is unconfirmed.
- [ ] As a judge, I can see the adherence analytics dashboard and PDF export.
