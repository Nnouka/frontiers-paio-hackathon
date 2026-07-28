# AGENTS.md

Instructions for AI coding agents working in this repository.

## Project

This repo is a hackathon submission for **Frontiers PAIO**. We are building on the **health
track**: an AI-powered pharmacy locator and medication adherence ecosystem, delivered as a
mobile-first responsive web app. Full context:

- [system.md](system.md) — system architecture and operational blueprint (source of truth for design)
- [architecture.md](architecture.md) — module breakdown and 5-person team ownership map
- [constitution.md](constitution.md) — mission, engineering standards, non-negotiables
- [prd.md](prd.md) — product requirements, personas, scope, success metrics
- [userstories.md](userstories.md) — epics and stories, organized by workstream
- [apis-and-datasets.md](apis-and-datasets.md) — recommended APIs/datasets for the build

`archived-agriculture/` holds an earlier, retired track exploration. Do not build against it
unless explicitly asked.

## Stack constraint: Google/Firebase services only

Chosen for hackathon speed and prototyping fit. Do not introduce non-Google backend services.

- **Frontend:** React + TypeScript (Vite), **mobile-first responsive web app** — one codebase
  serves both the patient app and the pharmacy portal (role-gated routes), no native app, no
  app-store distribution. Runs in any modern mobile or desktop browser.
- **Backend:** Firebase Cloud Functions (Node.js/TypeScript, 2nd gen)
- **Database:** Cloud Firestore (see system.md section 4 for the collection layout)
- **File storage:** Cloud Storage for Firebase
- **AI/ML:** Gemini API (Google AI Studio, multimodal OCR, entity extraction, NL reasoning)
- **Notifications:** Firebase Cloud Messaging (FCM) Web Push — sole channel, no Twilio/SMS gateway
- **Scheduling/queueing:** Cloud Scheduler + Cloud Tasks — no Redis/BullMQ
- **Auth:** Firebase Authentication with custom claims (patient/pharmacy/clinician roles)
- **Maps:** Google Maps Platform (`@react-google-maps/api`, Directions API)
- **Camera/location:** Browser `getUserMedia`/file-input capture and the Geolocation API — no native device APIs
- **Analytics:** Firebase Analytics + optional BigQuery export

If a task seems to require a non-Google service, or a native mobile app, stop and flag it rather
than substituting one in.

## Team structure: 5 parallel workstreams

We are a team of 5 building independently and consolidating at the end. See
[architecture.md](architecture.md) section 6 for the full ownership map and Cloud Functions
callable contracts each workstream exposes:

1. Web Frontend App (React + TypeScript, mobile-first)
2. Geo-Spatial Engine & Pharmacy Portal
3. AI Vision/OCR & Drug Safety Engine
4. Schedule & Alert Service
5. Data, Auth & Analytics

When working on one workstream, do not silently change another workstream's callable function
signature — agreed contracts are how we integrate without renegotiating. Flag contract changes for
team sync instead.

## Engineering standards

Follow [constitution.md](constitution.md) in full. Key points an agent must not skip:

- Brainstorm and produce a written spec/plan before implementation on non-trivial work; get
  explicit approval before coding.
- **Datastore Rule & Index Synchronization (Mandatory):** Whenever code updates touch Cloud Firestore or Cloud Storage (e.g. new collections, modified schemas, compound queries, range filters, or subcollections), you MUST immediately update [`firestore.rules`](firestore.rules), [`storage.rules`](storage.rules), and [`firestore.indexes.json`](firestore.indexes.json) to reflect the new access patterns and query index requirements. Never leave security rules or index files out of date.
- Every feature needs acceptance criteria, a demo path, and empty/loading/error states.
- Severe drug-interaction (DDI) findings always require explicit patient confirmation and a
  physician-consultation warning — never resolve them silently.
- No autonomous diagnosis or prescription-substitution decisions.
- Design and verify mobile breakpoints first, then scale up to desktop.
- Use the Firebase Emulator Suite for integration testing rather than touching prod data.

## Verification

Before marking work done:
1. Run against the Firebase Emulator Suite where possible.
2. Check the flow at mobile viewport widths first.
3. Confirm [`firestore.rules`](firestore.rules), [`storage.rules`](storage.rules), and [`firestore.indexes.json`](firestore.indexes.json) cover any new access patterns, collections, or compound queries introduced by code changes.
4. Confirm the feature's callable-function contract with other workstreams is unchanged (or the change was communicated).
