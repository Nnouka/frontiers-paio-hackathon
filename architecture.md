# Architecture: AI-Powered Pharmacy Locator & Medication Adherence Ecosystem

Source of truth for system design is [system.md](system.md). This document restates it as the
team's working architecture reference and maps components to ownership for parallel development.

**Stack constraint: Google/Firebase services only.** Chosen for hackathon speed and prototyping
fit — one console, one auth model, one set of SDKs, minimal ops. No third-party backend services
(no Node/Express server, no standalone Postgres, no Redis, no Twilio).

**Frontend: mobile-first responsive web, not a native app.** A single React + TypeScript codebase
(Vite), responsive from mobile up, serves both the patient experience and the pharmacy portal
(role-gated routes) via Firebase Hosting. This avoids app-store distribution entirely for the
hackathon window.

## 1) System Design

Patient web app (React + TypeScript, mobile-first responsive) talks to Firebase directly via
SDKs/callable functions. Cloud Functions host the three domain services (Geo-Spatial Engine, AI
Vision & OCR, Drug Safety/DDI Engine) that feed a Cloud Scheduler/Tasks-driven Schedule & Alert
Service. The backend integrates outward to the same Firebase-Hosting web app (pharmacy portal
routes) and Firestore/BigQuery for data & analytics.

```
PATIENT WEB APP (React + TypeScript, mobile-first)
       |
       v  Firebase SDKs / Callable Functions
FIREBASE / GOOGLE CLOUD BACKEND
  - Geo-Spatial Engine (Firestore + geohash)
  - AI Vision & OCR Service (Gemini API, Google AI Studio)
  - Drug Safety Engine / DDI (Cloud Functions + Gemini)
       -> Schedule & Alert Service (Cloud Scheduler / Cloud Tasks + FCM)
       |
       +--> Pharmacy Portal (same React app, role-gated routes, Firebase Hosting)
       +--> Data & Analytics Storage (Firestore, Cloud Storage, BigQuery)
```

## 2) Key Modules / Packages

| Module | Responsibility | Primary tech |
| :--- | :--- | :--- |
| Patient Web App | Search UI, map, camera capture, reminders UI, adherence logging UI, offline cache | React + TypeScript (Vite), mobile-first responsive |
| Pharmacy Portal | Pharmacy-side inventory management UI | Same React + TypeScript app, role-gated routes, Firebase Hosting |
| Backend / API | Auth guard, routing, business logic | Firebase Cloud Functions (Node.js/TypeScript, 2nd gen) |
| Geo-Spatial Engine | Radius search, SKU/generic matching, hold requests | Firestore + geohash (`geofire-common`) |
| AI Vision & OCR Service | Prescription/label/receipt parsing into structured entities | Gemini API (Google AI Studio, multimodal) |
| Drug Safety Engine (DDI) | Cross-reference active medication profile, severity thresholds | Cloud Functions + Gemini reasoning |
| Schedule & Alert Service | NL instruction -> timestamp schedule, notification dispatch | Cloud Scheduler + Cloud Tasks + FCM (Web Push) |
| Data & Analytics Storage | Persistence, adherence analytics, PDF export | Firestore, Cloud Storage, BigQuery |
| Auth | Patient/pharmacy/clinician roles | Firebase Authentication (custom claims) |
| Maps | Interactive map, distance/route rendering | Google Maps Platform (`@react-google-maps/api`, Directions API) |

## 3) Data Flow (four phases, see system.md for full detail)

1. **Search & stock verification** — query text/photo + GPS -> Firestore geohash range query -> map results with distance/price/stock -> optional 60-min hold (TTL document, expired by scheduled Cloud Function).
2. **Purchase onboarding & OCR** — scan pill box/label/receipt -> Cloud Storage upload -> Gemini API (Google AI Studio) extraction (drug_name, dosage_strength, form, dosage_instruction, duration_days, total_quantity, warnings) -> DDI screening against active medication profile (severe / moderate / dietary alerts).
3. **Schedule generation & alerts** — NL instructions -> Gemini-parsed timestamped schedule against lifestyle anchors -> Cloud Scheduler/Tasks fire FCM push; unconfirmed after 15 min -> in-app fallback flag (no third-party SMS gateway).
4. **Adherence logging & predictive refills** — one-tap Take/Snooze/Skip writes an `adherence_logs` doc and decrements remaining count -> Firestore-triggered Cloud Function raises refill alert under 3-day threshold, kicking off a pharmacy search -> adherence analytics (BigQuery) + PDF export (Cloud Function, stored in Cloud Storage) for clinicians.

## 4) Core Data Model

See [system.md](system.md) section 4 for the authoritative Firestore collection layout:
`pharmacies/{id}`, `pharmacies/{id}/inventory/{id}`, `users/{id}/medications/{id}`,
`users/{id}/medications/{id}/adherence_logs/{id}`. Any schema changes must be reflected there
first, then here.

## 5) External Dependencies / Integrations (Google-only)

- **Cloud Firestore** — primary database, real-time sync, offline persistence
- **Cloud Storage for Firebase** — prescription photos, scans, generated PDFs
- **Gemini API (Google AI Studio)** — multimodal OCR + entity extraction + NL reasoning (DDI, scheduling)
- **Firebase Cloud Messaging (FCM)** — sole notification channel
- **Cloud Scheduler + Cloud Tasks** — cron-driven and queued background jobs
- **Firebase Authentication** — patient/pharmacy/clinician roles via custom claims
- **Google Maps Platform** — map rendering, distance/route
- **BigQuery** (optional, via Firebase Extensions export) — adherence analytics dashboards

No third-party services (Twilio, Redis, self-hosted Postgres, Express) are part of this stack.

## 6) Team Ownership Map (5 workstreams)

To let five people build independently and consolidate at the end, own by vertical slice, not by
layer. Each workstream owns its Cloud Functions API contract so integration is a matter of wiring,
not renegotiating.

| # | Workstream | Owns | Consolidation contract |
| :--- | :--- | :--- | :--- |
| 1 | **Web Frontend App** | React + TypeScript patient web app: search, map, camera capture, reminder UI, adherence logging UI, offline cache | Consumes callable functions below via a typed TypeScript client; mocked responses until integration |
| 2 | **Geo-Spatial & Pharmacy Portal** | Firestore geohash search, `pharmacies`/`inventory` collections, hold requests, React + TypeScript pharmacy portal routes | `searchPharmacies` callable, `createHold` callable |
| 3 | **AI Vision/OCR & Drug Safety** | Gemini API (Google AI Studio) extraction pipeline, DDI/contraindication logic, alert thresholds | `extractFromScan` callable, `checkDDI` callable |
| 4 | **Schedule & Alert Service** | NL-to-schedule parsing (Gemini), Cloud Scheduler/Tasks + FCM dispatch, snooze/escalation logic | `createSchedule` callable; scheduler-triggered function (no direct contract) |
| 5 | **Data, Auth & Analytics** | Firebase Auth/custom claims, `users/{id}/medications` + `adherence_logs` persistence, BigQuery export, PDF export, CI/consolidation | `logMedication` callable, `logAdherence` callable, `getAdherenceAnalytics` callable |

Integration checkpoints: agree on Cloud Functions callable signatures (above) on day 1 before
parallel work starts; integrate against a shared Firebase project (dev environment/emulator suite)
mid-build; full end-to-end wiring in the final consolidation pass using the Firebase Emulator
Suite to avoid touching prod data during integration testing.

## 7) Non-functional Constraints

- Mobile-first responsive layout: designed and tested at mobile breakpoints first, then scaled up
- Offline-first caching in-browser via Firestore's built-in offline persistence (IndexedDB)
- No dependency on any non-Google network path for notifications (FCM Web Push only)
- Firestore Security Rules enforce least-privilege access; Cloud Storage rules restrict
  read/write to the owning user or an explicitly shared clinician
- No native app install required; runs in any modern mobile or desktop browser
