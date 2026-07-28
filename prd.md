# Product Requirements Document (PRD)

## 1) Product Summary

### Product name
PharmaLoop

### Product vision
PharmaLoop closes the loop between finding a prescribed medication and finishing the course:
patients locate real-time stock at nearby pharmacies, scan what they bought, get an automatic
drug-safety check, and follow a reminder-driven adherence plan through to completion — with
pharmacists and clinicians in control of high-risk decisions.

### Problem statement
Outpatient care fails in two places. First, the **acquisition gap**: patients struggle to find a
specific prescribed medication in stock nearby, often visiting multiple pharmacies or giving up.
Second, the **adherence gap**: even after a successful purchase, patients miss doses, take the
wrong amount, or stop early once symptoms improve, undermining the treatment they just went to the
trouble of acquiring. Solving search without adherence (or adherence without a safety check on
what was actually purchased) leaves the loop open.

### Why now
- Real-time pharmacy inventory and geolocation are now practical to query cheaply (Firestore + geohash)
- Multimodal GenAI (Gemini API via Google AI Studio) makes reliable OCR + entity extraction from a phone photo feasible in a 12-hour build
- Firebase's managed stack (Auth, Firestore, Functions, FCM, Hosting) lets a 5-person team ship a full closed loop without standing up separate infrastructure
- Clear hackathon constraints favor one focused, demoable workflow over broad feature breadth

## 2) Users and Personas

### Primary users
- Patients searching for a specific prescribed medication and needing help completing treatment
- Family caregivers managing a dependent's medication schedule

### Secondary users
- Pharmacies managing and publishing their own inventory via the portal
- Clinicians reviewing adherence exports and severe drug-interaction escalations

### Key user contexts
- Mobile-first: most usage happens on a phone browser, often on the way to or from a pharmacy
- Intermittent connectivity: search results and reminders must degrade gracefully offline
- Real-world stock volatility: inventory changes fast; stale "in stock" data breaks trust

## 3) Goals and Non-goals

### Product goals
- Let a patient find a prescribed medication in stock at a nearby pharmacy in real time
- Let a patient reserve a match for 60 minutes so travel time doesn't cost them the sale
- Extract a structured medication plan from a scanned label/receipt without manual entry
- Catch dangerous drug interactions before they become a safety incident, with mandatory human confirmation on severe findings
- Turn the extracted plan into a reminder schedule that adapts to the patient's real routine
- Predict refill needs before the patient runs out, and route straight back into search
- Provide measurable impact (adherence %, time-to-find) in a live demo setting

### Non-goals
- Autonomous diagnosis or prescription-writing
- Autonomous substitution decisions (any substitution suggestion requires pharmacist/clinician confirmation)
- Full pharmacy point-of-sale or billing system
- National-scale provider directory or insurance integration

## 4) Scope

### In scope (MVP)
- Medication search by name/active ingredient or prescription photo, with GPS-based radius filtering
- Interactive map of matching pharmacies: distance, route time, price, hours, stock status
- 60-minute hold/reservation on a matched medication
- Post-purchase scan of pill box, label, or receipt with structured entity extraction (drug name, dosage, form, instructions, duration, quantity, warnings)
- Drug-drug interaction (DDI) screening against the patient's active medication profile, with Severe / Moderate / Dietary alert levels
- Explicit patient confirmation + physician-consultation warning required before proceeding past a Severe alert
- Natural-language dosage instructions converted into a timestamped reminder schedule
- One-tap dose logging: Take / Snooze 15 Min / Skip
- Adherence percentage and treatment-progress tracking
- Predictive refill alert under a 3-day-remaining threshold, routing back into search
- PDF adherence summary export for a physician
- Pharmacy-side inventory management portal (same web app, role-gated)

### Stretch scope (if time allows)
- Adherence analytics dashboard exported to BigQuery for richer demo visuals
- Multi-pharmacy price comparison sorting/filtering
- Caregiver view: monitor and log doses on behalf of a dependent

### Out of scope (MVP)
- Full clinical decision support or EHR integration
- Pharmacy billing, insurance, or point-of-sale workflows
- National-scale provider directory
- Native mobile app / app-store distribution (see [constitution.md](constitution.md) — mobile-first responsive web only)

## 5) Product Requirements

### Functional requirements
1. User can search for a medication by name, active ingredient, or an uploaded prescription photo, through a mobile-first responsive web UI (React + TypeScript).
2. System returns nearby pharmacies within a selectable radius (5/10/25km) with distance, route time, price, hours, and stock status (In Stock / Low Stock / Out of Stock).
3. User can place a 60-minute hold on a specific pharmacy's stock.
4. User can capture a pill box, bottle label, or receipt via device camera (browser capture), and the system extracts drug_name, dosage_strength, form, dosage_instruction, duration_days, total_quantity, and warnings.
5. System screens a newly scanned medication against the user's active medication profile and classifies any interaction as Severe, Moderate, or Dietary.
6. System blocks silent progression past a Severe alert — the user must explicitly confirm and sees a physician-consultation warning.
7. System converts natural-language dosage instructions into a timestamped reminder schedule aligned to the user's routine (e.g., meal times).
8. User receives reminders via Web Push (FCM) with one-tap Take / Snooze / Skip actions.
9. System decrements remaining medication quantity on each logged dose and computes rolling adherence percentage.
10. System raises an automated refill alert when remaining quantity drops below a 3-day threshold, and offers a one-tap re-search.
11. User can export a PDF adherence summary for a physician.
12. Pharmacy user can log into the portal (role-gated) and manage their own inventory (name, generic name, price, stock quantity, active status).

### Non-functional requirements
- Response generation target latency: acceptable for live demo flow
- Mobile-first responsive web UX, usable on low-end Android browsers, scaling up cleanly to desktop
- Robust handling of no-network and weak-network states via Firestore offline persistence
- Basic auditability of DDI/extraction outputs (what source scan produced which result)
- Role-aware access for patient / pharmacy / clinician actions (Firebase Auth custom claims)

### Safety requirements
- Prominent disclaimer: the tool supports search and logistics, not clinical judgment
- Severe DDI alerts always require explicit confirmation and a physician-consultation warning
- Prevent unsafe overconfident wording on any AI-generated extraction or interaction result
- Any substitution-adjacent suggestion requires pharmacist/clinician confirmation before use

## 6) Success Metrics

### Primary metrics
- Median time from search to a confirmed in-stock match
- Hold-to-purchase conversion rate
- Dose completion (adherence) rate over 30 days
- Share of scans that trigger a DDI alert, and confirmation rate on Severe alerts

### Secondary metrics
- Refill-alert-to-reorder conversion rate
- Repeat usage rate (searches per returning user)
- 7-day reminder retention
- Pharmacy portal inventory-update frequency

### Demo metrics
- End-to-end completion time for one full patient journey (search -> hold -> scan -> DDI -> schedule -> log -> refill)
- Number of safety checks demonstrated live
- Judge-visible adherence dashboard numbers

## 7) User Journey (MVP)

1. User searches for a medication by name or prescription photo and grants location access.
2. User reviews map results and places a 60-minute hold at the chosen pharmacy.
3. After purchase, user scans the pill box/label/receipt.
4. System extracts the medication plan and screens it against the user's active medications for interactions.
5. If a Severe alert is raised, user must explicitly confirm before continuing; a physician-consultation warning is shown.
6. User confirms daily routine anchors; system generates a reminder schedule.
7. User receives Web Push reminders and logs doses (Take/Snooze/Skip) as treatment progresses.
8. When remaining quantity drops below the refill threshold, user gets a refill alert and re-enters search with one tap.
9. User views adherence percentage and can export a PDF summary for their physician.

## 8) Design Specs

### Design direction
Calm, clear, and trustworthy — a logistics tool that feels safety-conscious, not clinical-authority-claiming.

### Experience principles
- Clarity first: search results and safety alerts are scannable in seconds
- Mobile-first: large tap targets, thumb-reachable primary actions, works one-handed
- Trust through transparency: stock status, hold expiry, and DDI severity are always visible, never hidden behind a tap
- Behavior-first: every screen nudges toward completing the loop (search -> purchase -> adherence), not just informing

### Typography
- Headings: Manrope
- Body: Source Sans 3
- Numeric and schedule data: IBM Plex Mono

### Iconography
- No emojis in the product UI, documentation mockups, or production text labels.
- Use real icon components from Lucide React or Material UI Icons for status, actions, and navigation.
- Keep icon semantics consistent across warning, success, info, and error states.

### Color system
- Primary: #0D47A1 (trust blue)
- Secondary: #00695C (care teal)
- Accent: #F57C00 (attention)
- Neutral dark: #1F2937
- Neutral light: #F7FAFC
- Success: #2E7D32
- Warning: #ED6C02
- Error: #C62828

### Navigation
- Bottom nav on mobile: Search, Scan, Schedule, History
- Top utilities: location status, connectivity status, help
- Persistent CTA on home: Find my medication

### Motion and interaction
- Fast transitions (150-220ms)
- Staggered reveal for pharmacy result cards
- No decorative animation on Severe DDI alert screens

### Core screens
- Search & map screen: query input, radius filter, map with pharmacy pins, distance/price/stock per pin
- Hold confirmation screen: expiry countdown, pharmacy details, directions CTA
- Scan & extract screen: camera capture, extracted fields for review/edit, DDI result with severity banner
- Schedule screen: routine-anchor confirmation, generated reminder timeline
- Adherence screen: today's doses with Take/Snooze/Skip, adherence percentage, streak, refill status
- Pharmacy portal screen (role-gated): inventory list, stock/price editing, active/inactive toggle
- History screen: past scans, adherence log, PDF export action

### Accessibility and inclusion
- WCAG AA contrast minimum
- Scalable font sizes and large touch targets
- Clear, plain-language labeling on all safety alerts

## 9) Architecture and Delivery Plan

**Stack constraint: Google/Firebase services only** (hackathon speed + prototyping fit — no
third-party backend services). Full detail in [system.md](system.md) and
[architecture.md](architecture.md).

### Core architecture
- Frontend: React + TypeScript (Vite), mobile-first responsive web app — no native app, works in any modern mobile or desktop browser
- Backend: Firebase Cloud Functions (Node.js/TypeScript, 2nd gen)
- Data: Firestore for pharmacies, inventory, medications, and adherence logs; Cloud Storage for uploaded scans and generated PDFs
- GenAI: Gemini API (Google AI Studio) for OCR extraction, DDI reasoning, and NL schedule parsing
- Web services: Firebase Auth, Firebase Cloud Messaging (FCM Web Push) as the sole notification channel, and Firestore offline persistence (IndexedDB) for offline continuity

### Interoperability options (if enabled)
- Cloud Healthcare API FHIR stores
- Cloud Healthcare API HL7v2 stores
- Cloud Healthcare API DICOM stores

### Deployment
- Firebase Hosting for web app deployment (patient app + pharmacy portal)
- Cloud Functions for API runtime
- Firebase Auth for user and reviewer roles
- GitHub Actions for CI and Firebase Hosting preview channels for preview deployments

## 10) Release Plan (Hackathon)

### Delivery governance (agent mode)
1. Brainstorm candidate solution directions and trade-offs.
2. Ask clarifying user questions where requirements or priorities are ambiguous.
3. Write a concise implementation spec.
4. Produce a stepwise implementation plan with risks and fallback options.
5. Wait for explicit user approval.
6. Implement only after approval.
7. If requirements change, pause implementation and request re-approval.

### Phase 1 (hours 1-4)
- Firebase project setup, auth, app shell, geo-spatial search + map, hold requests (Workstreams 1 & 2)

### Phase 2 (hours 5-8)
- Scan/extract pipeline, DDI screening and Severe-alert confirmation flow (Workstream 3); pharmacy portal inventory CRUD (Workstream 2)

### Phase 3 (hours 9-12)
- Schedule generation, Web Push reminders, adherence logging, predictive refill loop, analytics/PDF export, and final consolidation across all five workstreams (Workstreams 4 & 5), plus presentation rehearsal

## 11) Risks and Mitigations

### Risk: Stale or incorrect pharmacy stock data
Mitigation: show a "last updated" timestamp on every result; treat hold expiry as the trust mechanism, not a stock-accuracy guarantee

### Risk: Unsafe or misleading DDI guidance
Mitigation: strict Severe/Moderate/Dietary thresholds, mandatory human confirmation on Severe, explicit physician-consultation disclaimer

### Risk: Model or API availability constraints (Gemini API via Google AI Studio)
Mitigation: fallback to synthetic test fixtures for scan/extract and DDI demo paths

### Risk: High false confidence in medication extraction
Mitigation: require user confirmation/edit step before a schedule activates from extracted data

### Risk: Time overrun in a 12-hour build across 5 parallel workstreams
Mitigation: lock Cloud Functions callable contracts on day 1; integrate against the Firebase Emulator Suite mid-build so late slippage in one workstream doesn't block others

### Risk: Low trust in an unfamiliar app for a purchase-adjacent decision
Mitigation: transparent stock/price/hold-expiry display, conservative DDI wording, visible disclaimers

## 12) Open Questions

- What pharmacy inventory data source seeds the demo (synthetic fixtures vs. a small real dataset)?
- Will a pharmacist/clinician reviewer be available for a live Severe-alert confirmation walkthrough?
- Are Cloud Healthcare interoperability APIs enabled in the hackathon project, or out of scope for this build?
- What minimum evidence (metrics, screens) do judges need to see to validate the acquisition-gap and adherence-gap impact claims?

## 13) Acceptance Criteria

- A user can search for a medication and see nearby pharmacies with distance, price, hours, and stock status.
- A user can place and see the countdown on a 60-minute hold.
- A user can scan a label/receipt and receive an extracted, editable medication plan.
- A Severe DDI alert cannot be bypassed without explicit user confirmation and a visible physician-consultation warning.
- A user can activate a reminder schedule from the confirmed plan and log a dose via Take/Snooze/Skip.
- The app demonstrates at least one predictive refill alert triggering a re-search.
- A pharmacy user can log into the portal and update inventory.
- Session/adherence history and a PDF export are available.
- A complete end-to-end demo (search through refill) can be presented within the judging window.
