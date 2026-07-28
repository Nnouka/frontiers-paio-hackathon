# Architecture

We are building on the **health track**: an AI-powered pharmacy locator and medication adherence
ecosystem, delivered as a mobile-first responsive web app. Full architecture detail lives in
[architecture.md](../architecture.md); system design in [system.md](../system.md).

**System design:**
Patient web app (React + TypeScript, mobile-first) -> backend core services (Geo-Spatial Engine,
AI Vision/OCR, Drug Safety/DDI Engine) -> Schedule & Alert Service -> Pharmacy Portal (same web
app, role-gated routes) / API + Data & Analytics Storage.

**Key modules / packages:**
See architecture.md section 2 (Web app, API Gateway, Geo-Spatial Engine, AI Vision/OCR Service,
Drug Safety Engine, Schedule & Alert Service, Pharmacy Portal, Data & Analytics Storage).

**Data flow:**
Four phases: (1) geo-spatial search & stock verification, (2) purchase onboarding & OCR, (3)
schedule generation & alerts, (4) adherence logging & predictive refills. See architecture.md
section 3.

**External dependencies / integrations:**
Firestore + geohash, Cloud Scheduler + Cloud Tasks, Firebase Cloud Messaging (Web Push), the
Gemini API (Google AI Studio), Google Maps Platform. Google/Firebase services only — no PostGIS,
Redis/BullMQ, or Twilio. See architecture.md section 5.

**Team ownership:**
5 parallel workstreams mapped in architecture.md section 6, each owning a Cloud Functions callable
contract for end-of-build consolidation.
