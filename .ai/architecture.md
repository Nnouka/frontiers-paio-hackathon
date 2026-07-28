# Architecture

We are building on the **health track**: an AI-powered pharmacy locator and medication adherence
ecosystem. Full architecture detail lives in [health/architecture.md](../health/architecture.md);
system design in [health/system.md](../health/system.md).

**System design:**
Patient mobile app -> backend core services (Geo-Spatial Engine, AI Vision/OCR, Drug Safety/DDI
Engine) -> Schedule & Alert Service -> Pharmacy Portal / API + Data & Analytics Storage.

**Key modules / packages:**
See health/architecture.md section 2 (Mobile app, API Gateway, Geo-Spatial Engine, AI Vision/OCR
Service, Drug Safety Engine, Schedule & Alert Service, Pharmacy Portal, Data & Analytics Storage).

**Data flow:**
Four phases: (1) geo-spatial search & stock verification, (2) purchase onboarding & OCR, (3)
schedule generation & multi-channel alerts, (4) adherence logging & predictive refills. See
health/architecture.md section 3.

**External dependencies / integrations:**
PostGIS, Redis + BullMQ, Firebase Cloud Messaging, Twilio, Vision-LLM provider. See
health/architecture.md section 5.

**Team ownership:**
5 parallel workstreams mapped in health/architecture.md section 6, each owning an API contract for
end-of-build consolidation.
