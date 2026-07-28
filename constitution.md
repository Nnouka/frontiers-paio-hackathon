# Team Constitution

## 1) Mission

### What we are building
We are building an **AI-powered pharmacy locator and medication adherence ecosystem**: patients
find prescribed medication in real time at nearby pharmacies, then get automated, safety-checked
support to take it correctly and finish the course. Delivered as a mobile-first responsive web app
(React + TypeScript) — no native app install required. Full system design lives in
[system.md](system.md); architecture ownership lives in [architecture.md](architecture.md).

### Why it matters
Outpatient care fails in two places: patients can't reliably find the exact medication they need
in stock nearby (**the acquisition gap**), and even after purchase, non-adherence, wrong dosage,
and missed refills undermine treatment (**the adherence gap**). Closing both gaps in one loop
turns a one-time purchase into a completed treatment.

### Who we are building for
- Primary users: patients searching for and taking medication
- Secondary users: pharmacies managing inventory, healthcare providers reviewing adherence
- Priority environments: mobile-first, intermittent connectivity, real-world pharmacy stock volatility

### Product principle
AI must support search, extraction, and adherence logistics, not clinical authority. Severe
drug-interaction and safety findings require explicit patient confirmation and a physician
consultation warning, never a silent decision.

### Outcome principle
Finding the medication is the entry point; completing the treatment is the value we're measured on.

## 2) Engineering Standards

### Agent workflow protocol
- [ ] Agents brainstorm solution options before coding.
- [ ] Agents ask the user clarifying questions whenever requirements, constraints, or priorities are unclear.
- [ ] Agents produce a written spec before implementation starts.
- [ ] Agents produce an implementation plan with milestones and risks.
- [ ] Agents begin coding only after explicit user approval of the spec and plan.
- [ ] If scope changes during implementation, agents pause and request re-approval.

### Quality bar
- Every feature includes acceptance criteria and a demo path
- All user-facing flows include empty/loading/error states, including "no stock nearby" and "OCR extraction failed"
- Severe/moderate/dietary DDI alerts always show their threshold level and required next action
- **Datastore Security & Index Synchronization:** Firestore security rules (`firestore.rules`), storage rules (`storage.rules`), and composite indexes (`firestore.indexes.json`) must be updated and kept in 100% sync whenever code changes modify database collections, security patterns, or compound queries.

### Safety and ethics
- No autonomous diagnosis or prescription-substitution decisions
- Severe DDI alerts require explicit confirmation and a physician-consultation warning
- Mandatory disclaimer that the tool supports logistics/communication, not clinical judgment
- Data minimization and least-privilege access controls for health data (prescriptions, adherence logs)

### Team workflow
- 5 people, 5 parallel workstreams (see [architecture.md](architecture.md) section 6): Web Frontend,
  Geo-Spatial & Pharmacy Portal, AI Vision/OCR & Drug Safety, Schedule & Alert Service, Data/Auth/Analytics.
- Agree on API contracts between workstreams on day 1, before parallel work starts, so integration
  at the end is wiring, not renegotiation.
- Trunk-based collaboration with short-lived, workstream-scoped branches
- Pull requests require one reviewer and green checks
- Daily sync on blockers, API contract changes, and next consolidation checkpoint
- Mid-build integration checkpoint against a shared Firebase project (dev environment) using the
  Firebase Emulator Suite and mocked OCR/DDI responses, before the final end-to-end consolidation pass

## 3) Scope References

- System architecture and data flow are maintained in [system.md](system.md) and [architecture.md](architecture.md).
- Implementation backlog, epics, and user stories are maintained in [userstories.md](userstories.md).
- Product design specifications are maintained in [prd.md](prd.md).

## 4) Definition of Done

A feature is done when:
- Acceptance criteria pass
- The target flow (search, scan, schedule, or adherence log) is verified at mobile breakpoints first, then desktop
- Safety and failure states are implemented (no stock, extraction failure, severe DDI alert, offline)
- `firestore.rules`, `storage.rules`, and `firestore.indexes.json` are updated and cover all query/data access patterns
- The feature's API contract with other workstreams is unchanged or the change was communicated
- One teammate validates in preview

## 5) Non-negotiables

- Patient safety over feature breadth
- Severe drug interactions always require human confirmation, never silent handling
- Ethical safeguards are mandatory, not optional
- We do not ship a search-only experience without the adherence loop (reminders + logging)
- We do not ship an adherence loop without the DDI safety check on newly scanned medication
- **Google/Firebase services only.** Frontend is a mobile-first responsive web app (React +
  TypeScript, no native app); backend is Firebase Cloud Functions, Firestore, Cloud Storage, FCM
  (Web Push), Cloud Scheduler/Tasks, and Gemini API (Google AI Studio). No third-party backend services (no
  Express server, no standalone Postgres/Redis, no Twilio/SMS gateway) — chosen for one-console
  setup speed and prototyping fit within the hackathon window.
