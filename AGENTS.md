# AGENTS.md

Instructions for AI coding agents working in this repository.

## Project

This repo is a hackathon submission for **Frontiers PAIO**. We are building on the **health
track**: an AI-powered pharmacy locator and medication adherence ecosystem. Full context:

- [health/system.md](health/system.md) — system architecture and operational blueprint (source of truth for design)
- [health/architecture.md](health/architecture.md) — module breakdown and 5-person team ownership map
- [health/constitution.md](health/constitution.md) — mission, engineering standards, non-negotiables
- [health/prd.md](health/prd.md) — product requirements, personas, scope, success metrics
- [health/userstories.md](health/userstories.md) — epics and stories, organized by workstream
- [health/apis-and-datasets.md](health/apis-and-datasets.md) — recommended APIs/datasets for the build

The `agriculture/` directory holds an earlier, now-inactive track exploration. Do not build
against it unless explicitly asked.

## Stack constraint: Google/Firebase services only

Chosen for hackathon speed and prototyping fit. Do not introduce non-Google backend services.

- **Frontend:** Flutter (Dart) — mobile (iOS/Android) and Flutter Web for the pharmacy portal
- **Backend:** Firebase Cloud Functions (Node.js/TypeScript, 2nd gen)
- **Database:** Cloud Firestore (see system.md section 4 for the collection layout)
- **File storage:** Cloud Storage for Firebase
- **AI/ML:** Vertex AI Gemini API (multimodal OCR, entity extraction, NL reasoning)
- **Notifications:** Firebase Cloud Messaging (FCM) — sole channel, no Twilio/SMS gateway
- **Scheduling/queueing:** Cloud Scheduler + Cloud Tasks — no Redis/BullMQ
- **Auth:** Firebase Authentication with custom claims (patient/pharmacy/clinician roles)
- **Maps:** Google Maps Platform (`google_maps_flutter`, Directions API)
- **Analytics:** Firebase Analytics + optional BigQuery export

If a task seems to require a non-Google service, stop and flag it rather than substituting one in.

## Team structure: 5 parallel workstreams

We are a team of 5 building independently and consolidating at the end. See
[health/architecture.md](health/architecture.md) section 6 for the full ownership map and Cloud
Functions callable contracts each workstream exposes:

1. Mobile/Frontend App (Flutter patient app)
2. Geo-Spatial Engine & Pharmacy Portal
3. AI Vision/OCR & Drug Safety Engine
4. Schedule & Alert Service
5. Data, Auth & Analytics

When working on one workstream, do not silently change another workstream's callable function
signature — agreed contracts are how we integrate without renegotiating. Flag contract changes for
team sync instead.

## Engineering standards

Follow [health/constitution.md](health/constitution.md) in full. Key points an agent must not skip:

- Brainstorm and produce a written spec/plan before implementation on non-trivial work; get
  explicit approval before coding.
- Every feature needs acceptance criteria, a demo path, and empty/loading/error states.
- Severe drug-interaction (DDI) findings always require explicit patient confirmation and a
  physician-consultation warning — never resolve them silently.
- No autonomous diagnosis or prescription-substitution decisions.
- Use the Firebase Emulator Suite for integration testing rather than touching prod data.

## Verification

Before marking work done: run against the Firebase Emulator Suite where possible, check
Firestore Security Rules cover the new access pattern, and confirm the feature's callable-function
contract with other workstreams is unchanged (or the change was communicated).
