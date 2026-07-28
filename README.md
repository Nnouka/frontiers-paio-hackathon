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
- **AI/ML:** Vertex AI Gemini API (multimodal OCR, entity extraction, DDI reasoning).
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
│   └── src/services/        # Seed datasets & DDI mock rules
├── shared/types/            # Shared TypeScript contracts & domain models
├── src/                     # React + TypeScript Vite Web App
│   ├── services/apiClient.ts# Typed contract wrapper with Emulator/Mock fallback
│   ├── services/firebase.ts # Firebase SDK & auto-emulator connector
│   ├── App.tsx              # Main shell (Patient App, Pharmacy Portal, Contracts Console)
│   └── index.css            # Glassmorphism design system & CSS tokens
├── firebase.json            # Firebase Hosting, Functions, & Emulators config
├── firestore.rules          # Firestore least-privilege security rules
├── storage.rules            # Cloud Storage security rules
├── system.md                # System Architecture & Operational Blueprint (Source of Truth)
├── architecture.md          # Team Ownership & Module Breakdown
├── userstories.md           # Workstream Epics & Acceptance Criteria
└── README.md                # Developer onboarding & continuation guide
```

---

## 🎯 Next Steps: How to Continue

Each teammate can now claim and execute their workstream epic from `userstories.md`:

- **Workstream 1 (Web Frontend):** Build Epic 1 patient UI components (Search Bar, Google Map view with stock markers, Camera OCR trigger, Push Notification banner, Adherence log buttons) in `src/components/patient/`.
- **Workstream 2 (Geo & Portal):** Implement `geofire-common` range queries in `functions/src/` and build the Pharmacy Portal inventory management view in `src/components/portal/`.
- **Workstream 3 (AI & Safety):** Wire Vertex AI Gemini API in `functions/src/` for real image OCR parsing and DDI safety rules evaluation.
- **Workstream 4 (Schedule & Alert):** Integrate Cloud Scheduler + Cloud Tasks + FCM Web Push dispatch for time-anchored notifications.
- **Workstream 5 (Data & Analytics):** Implement Firestore transaction logic for `adherence_logs`, 3-day refill trigger triggers, and PDF report generation.

### Verification Before Merge
Before submitting a PR, verify your changes by running:
```bash
# Verify Functions TypeScript build
npm --prefix functions run build

# Verify Web App TypeScript & Vite build
npm run build
```
