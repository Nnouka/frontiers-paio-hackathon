# PharmaPulse AI — Frontiers PAIO Health Ecosystem

> **AI-Powered Pharmacy Locator & Medication Adherence Companion**  
> A mobile-first responsive web application delivering real-time geo-spatial inventory matching, computer vision prescription parsing, drug safety screening, and predictive refill scheduling.

---

## 📌 Project Overview

This repository is built for the **Frontiers PAIO Hackathon (Health Track)**. It addresses two critical failure points in outpatient healthcare:
1. **The Acquisition Gap:** Locating specific prescribed medications in real-time at nearby pharmacies.
2. **The Adherence Gap:** Preventing missed doses, improper usage, and missed refills post-purchase.

---

## 🛠️ Technology Stack (Google / Firebase Only)

- **Frontend:** React 19 + TypeScript (Vite), mobile-first responsive design (serves both Patient Web App and Pharmacy Portal).
- **Backend:** Firebase Cloud Functions (Node.js 22 / TypeScript, 2nd gen).
- **Database:** Cloud Firestore (`pharmacies`, `inventory`, `users/{id}/medications`, `adherence_logs`).
- **File Storage:** Cloud Storage for Firebase (prescription photos, label scans, generated PDF reports).
- **AI/ML:** Gemini API (Google AI Studio, multimodal OCR, entity extraction, DDI reasoning).
- **Notifications:** Firebase Cloud Messaging (FCM) Web Push + persistent in-app fallback banner.
- **Scheduling:** Cloud Scheduler + Cloud Tasks.
- **Auth:** Firebase Authentication (custom claims for `patient`, `pharmacy`, `clinician` roles).
- **Maps:** Google Maps Platform (`@react-google-maps/api`, Directions API).

---

## 🚀 Quickstart: Running Locally

### Prerequisites
- **Node.js:** v22+
- **NPM:** v10+
- **Firebase CLI:** v15+ (`npm i -g firebase-tools`)

### 1. Install Dependencies
```bash
# Install root web app dependencies
npm install

# Install functions dependencies
npm --prefix functions install
```

### 2. Start Firebase Emulator Suite
In a dedicated terminal tab, start the local Firebase Emulators (Auth, Firestore, Storage, Functions, Hosting):
```bash
npm run emulators
# UI dashboard available at http://127.0.0.1:4000
# Functions running at http://127.0.0.1:5001
```

### 3. Start Vite Dev Server
In another terminal tab, start the mobile-first frontend server:
```bash
npm run dev
# App running at http://localhost:3000
```

---

## 🔀 Running Modes & Local Mocks

The application supports two operating modes out of the box:

1. **Firebase Emulator Mode (Default):** Connects to the local Firebase Emulator Suite on `127.0.0.1`.
2. **Local Typed Mock Mode:** Runs completely client-side in the browser using pre-built mock data so workstreams can develop without waiting on backend implementations.

You can toggle between modes in the UI top header or programmatically via `setApiClientConfig({ useMockFallback: true })` in `src/services/apiClient.ts`.

---

## 🧪 Testing Cloud Functions

### Type-check / build
```bash
# Functions only (must pass before every commit touching functions/)
npm --prefix functions run build   # tsc, emits to functions/lib
npm --prefix functions run lint    # tsc --noEmit, same checks without emitting

# Web app
npm run lint    # tsc --noEmit
npm run build   # tsc && vite build
```

### Exercise callables against the Emulator Suite
```bash
firebase emulators:start --only functions,firestore,auth
# UI dashboard: http://127.0.0.1:4000 — Functions: http://127.0.0.1:5001, Firestore: http://127.0.0.1:8080, Auth: http://127.0.0.1:9099
```

Call any callable directly with `curl` (no client SDK needed) — the emulator HTTP endpoint accepts
the same envelope the Callable SDK sends, `{"data": {...}}`:
```bash
curl -X POST http://127.0.0.1:5001/demo-pharmaloop/us-central1/checkDDI \
  -H "Content-Type: application/json" \
  -d '{"data":{"newMedication":{"drug_name":"Aspirin 500mg"}}}'
```

To test an **authenticated** call, mint a test user + ID token from the Auth emulator's REST API,
then pass it as a Bearer token:
```bash
curl -X POST "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","returnSecureToken":true}'
# -> returns { localId, idToken, ... }

curl -X POST http://127.0.0.1:5001/demo-pharmaloop/us-central1/checkDDI \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <idToken>" \
  -d '{"data":{"newMedication":{"drug_name":"Aspirin 500mg"}}}'
```

To seed Firestore data for a test (e.g. a `users/{uid}/medications` doc so `checkDDI` reads real
data instead of its demo fallback), write to the Firestore emulator's REST API with the same
Bearer token so Security Rules evaluate the caller as that user:
```bash
curl -X PATCH "http://127.0.0.1:8080/v1/projects/demo-pharmaloop/databases/(default)/documents/users/<uid>/medications/med1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <idToken>" \
  -d '{"fields": {
    "medication_name": {"stringValue": "Simvastatin 20mg"},
    "generic_name": {"stringValue": "Simvastatin"},
    "end_date": {"nullValue": null}
  }}'
```

Or drive the same flow through the UI: run `npm run dev`, switch the header toggle to **"Firebase
Emulator Connected"** mode (default is local mock mode), and exercise the real component tree
(e.g. `CameraScanner`'s "Test Severe DDI Alert" button) against the running emulators.

### Before opening a PR
Run both build commands above, then re-verify the specific flow you changed end-to-end against
the emulator (not just a type-check) — see [verify skill](.claude) guidance and
[constitution.md](constitution.md)'s Definition of Done.

---

## 🚀 Deploying Cloud Functions

Deploys go to the real Firebase project, not the emulator — confirm with the team before running
these against a shared project.

```bash
firebase login                       # once per machine
firebase use <project-id>            # select the target Firebase project
```

### Configuring the Gemini API key
This project uses the **Gemini Developer API via Google AI Studio** (API-key auth), not Vertex AI
(service-account/ADC auth) — get a key at [aistudio.google.com](https://aistudio.google.com).
`functions/src/services/geminiService.ts` reads `process.env.GEMINI_API_KEY`. For local emulator
runs, put it in `functions/.env` (gitignored):
```
GEMINI_API_KEY=your-key-here
```
For a deployed environment, either keep using `functions/.env` (2nd-gen Functions load `.env`
files automatically at deploy time — fine for a hackathon, but the key ends up in build config) or
use Secret Manager for anything longer-lived:
```bash
firebase functions:secrets:set GEMINI_API_KEY
# then reference it via defineSecret(...) in the function definition if you migrate to secrets
```
If no key is configured, `extractMedicationFromImage` degrades gracefully to a fixed fallback
payload (`getFallbackExtraction`) rather than failing — safe default, but confirm you actually want
live Gemini calls in the target environment before deploying.

### Deploy
```bash
# All functions (runs the predeploy build hook in firebase.json automatically)
firebase deploy --only functions

# A single function, faster for iterating on one callable
firebase deploy --only functions:checkDDI

# Functions + Firestore rules/indexes + Storage rules together
firebase deploy --only functions,firestore:rules,firestore:indexes,storage
```

### After deploying
```bash
firebase functions:logs                    # tail recent logs
firebase functions:logs --only checkDDI    # scoped to one function
```
Smoke-test the deployed callable the same way as the emulator (swap the base URL for the real
Cloud Functions region URL shown in the deploy output, or call it from the deployed Hosting site
once `npm run build && firebase deploy --only hosting` has run).

---

## 🗺️ Shared API Contracts (Epic 0)

All 5 workstreams integrate against 8 typed Cloud Functions callable contracts defined in [`shared/types/contracts.ts`](shared/types/contracts.ts):

| Callables Signature | Workstream | Primary Function |
| :--- | :--- | :--- |
| `searchPharmacies` | WS2 (Geo) | Radius query over Firestore geohashes for stock availability |
| `createHold` | WS2 (Geo) | 60-minute inventory reservation (TTL document) |
| `extractFromScan` | WS3 (AI Vision) | Gemini multimodal prescription & label OCR extraction |
| `checkDDI` | WS3 (Safety) | Drug interaction check & severe alert thresholds |
| `createSchedule` | WS4 (Schedule) | Gemini natural language instruction parsing -> timestamp doses |
| `logMedication` | WS5 (Data) | Save user medication profile (`users/{id}/medications`) |
| `logAdherence` | WS5 (Data) | Record dose action (`TAKEN`/`SNOOZED`/`SKIPPED`), trigger refill alert |
| `getAdherenceAnalytics` | WS5 (Data) | Compute compliance percentage & generate clinician PDF report |

---

## 📂 Repository Structure

```
├── .github/workflows/       # CI/CD: Firebase Hosting PR preview deployments
├── functions/               # Firebase Cloud Functions 2nd Gen (Node 22, TS)
│   ├── src/index.ts         # 8 callable Cloud Functions handlers
│   ├── src/admin.ts         # Firebase Admin SDK init (single entry point)
│   └── src/services/        # Seed datasets, DDI rules, Gemini OCR, medication repository
├── shared/types/            # Shared TypeScript contracts & domain models
├── src/                     # React + TypeScript Vite Web App
│   ├── services/apiClient.ts# Typed contract wrapper with Emulator/Mock fallback
│   ├── services/firebase.ts # Firebase SDK & auto-emulator connector
│   ├── App.tsx              # Main shell (Patient App, Pharmacy Portal, Contracts Console)
│   └── index.css            # Glassmorphism design system & CSS tokens
├── firebase.json            # Firebase Hosting, Functions, Firestore & Emulators config
├── firestore.rules          # Firestore least-privilege security rules
├── firestore.indexes.json   # Firestore composite index declarations (kept in sync with queries)
├── storage.rules            # Cloud Storage security rules
├── system.md                # System Architecture & Operational Blueprint (Source of Truth)
├── architecture.md          # Team Ownership & Module Breakdown
├── userstories.md           # Workstream Epics & Acceptance Criteria
└── README.md                # Developer onboarding & continuation guide
```

---

## 🔒 Datastore Rules & Indexes Synchronization

> [!IMPORTANT]
> Whenever code updates add, modify, or query Cloud Firestore collections or Cloud Storage paths (e.g. compound range queries, subcollections, or access pattern changes), developers and AI agents **MUST** immediately update:
> - [`firestore.rules`](firestore.rules)
> - [`storage.rules`](storage.rules)
> - [`firestore.indexes.json`](firestore.indexes.json)

---

## 🎯 Next Steps: How to Continue

Each teammate can now claim and execute their workstream epic from `userstories.md`:

- **Workstream 1 (Web Frontend):** Build Epic 1 patient UI components (Search Bar, Google Map view with stock markers, Camera OCR trigger, Push Notification banner, Adherence log buttons) in `src/components/patient/`.
- **Workstream 2 (Geo & Portal):** Implement `geofire-common` range queries in `functions/src/` and build the Pharmacy Portal inventory management view in `src/components/portal/`.
- **Workstream 3 (AI & Safety):** Wire Gemini API (Google AI Studio) in `functions/src/` for real image OCR parsing and DDI safety rules evaluation.
- **Workstream 4 (Schedule & Alert):** Integrate Cloud Scheduler + Cloud Tasks + FCM Web Push dispatch for time-anchored notifications.
- **Workstream 5 (Data & Analytics):** Implement Firestore transaction logic for `adherence_logs`, 3-day refill trigger triggers, and PDF report generation.

### Verification Before Merge
See [Testing Cloud Functions](#-testing-cloud-functions) above — build both packages and exercise
your changed flow against the Emulator Suite before opening a PR.
