# Product Requirements Document (PRD)

## 1) Product Summary

### Product name
CareBridge AI

### Product vision
CareBridge AI helps patients and caregivers turn diagnosis and discharge content into daily actions they can follow: understand, remember, complete treatment, and prevent relapse, while keeping clinicians in control of high-risk decisions.

### Problem statement
In many African contexts, care quality drops after discharge: patients often stop medication once they feel better, forget doses, or abandon plans when side effects appear. Translation alone is not enough. The core pain point is treatment completion and follow-through under real constraints.

### Why now
- High pressure on frontline capacity
- Strong need for multilingual communication support
- Availability of practical multimodal GenAI tooling
- Clear hackathon constraints favoring focused workflow tools

## 2) Users and Personas

### Primary users
- Patients receiving diagnosis or discharge instructions
- Family caregivers responsible for follow-up care

### Secondary users
- Clinicians and nurses who want faster patient understanding
- Community health workers supporting adherence and escalation

### Key user contexts
- Low-end Android devices
- Unstable or costly internet
- Mixed literacy levels
- Multiple local languages

## 3) Goals and Non-goals

### Product goals
- Convert complex clinical text into simple, actionable guidance
- Extract medication plans from uploaded discharge or diagnosis text
- Improve treatment completion through adaptive reminders and motivation nudges
- Reduce avoidable drop-off caused by side-effect confusion
- Preserve safety through human-in-the-loop review for high-risk outputs
- Provide measurable impact in a live demo setting

### Non-goals
- Autonomous diagnosis
- Autonomous treatment planning
- Prescription changes without clinician approval
- Full hospital system replacement

## 4) Scope

### In scope (MVP)
- Input of diagnosis or discharge text (paste, typed, or uploaded)
- Plain-language summary in preferred language
- Extracted medication plan (medicine, dose, frequency, duration)
- Action checklist for patient and caregiver
- Personalized reminder schedule
- Missed-dose recovery guidance
- Motivation nudges for continuity
- Side-effect support (expected effects vs danger signs)
- Post-treatment prevention tips
- Danger sign escalation section
- Confidence and uncertainty indicators
- Human review flag for high-risk outputs
- Session history and user feedback capture

### Stretch scope (if time allows)
- Medication package scan after pharmacy purchase
- Prescription-vs-purchase comparison (name, strength, form, frequency, duration)
- Match status classification: exact match, possible substitution, mismatch
- Safety-first substitution guidance requiring pharmacist/clinician confirmation

### Out of scope (MVP)
- Full clinical decision support
- Longitudinal EHR management
- National-scale provider directory integration
- Complex billing and insurance workflows

## 5) Product Requirements

### Functional requirements
1. User can submit health instruction text through a mobile app UI (React Native).
2. System generates plain-language explanation with structured sections:
   - what this means
   - what to do now
   - what to monitor
   - when to seek urgent care
3. System extracts medication plan from uploaded text into structured fields (dose, timing, duration).
4. User can switch language before output generation.
5. System provides a simple-reading mode for low literacy.
6. System creates adaptive reminders based on user routine and missed-dose behavior.
7. System provides motivation prompts when adherence risk increases.
8. System marks output confidence and uncertainty.
9. System requires clinician/human review indicator for high-risk outputs.
10. User can view past explanation sessions and adherence history.
11. User can submit clarity/usefulness feedback.
12. (Stretch) User can scan purchased medication packaging and extract key fields.
13. (Stretch) System compares purchased medicine to prescribed plan and classifies result.
14. (Stretch) System blocks autonomous equivalence claims and requires human confirmation for substitutions.

### Non-functional requirements
- Response generation target latency: acceptable for live demo flow
- Mobile-native UX optimized for low-end Android devices (with iOS compatibility)
- Robust handling of no-network and weak-network states
- Basic auditability of generated outputs and source input snippets
- Role-aware access for reviewer actions

### Safety requirements
- Prominent disclaimer: tool supports communication and does not replace clinician judgment
- Escalation cues for high-risk symptom descriptions
- Prevent unsafe overconfident wording
- Block unsupported high-risk advice patterns

## 6) Success Metrics

### Primary metrics
- Explanation clarity score (user feedback)
- Dose completion rate
- Missed-dose recovery rate within 24 hours
- Share of outputs requiring reviewer escalation

### Stretch metrics (if implemented)
- Medication match-classification accuracy on test cases
- Number of risky mismatches detected before medication use

### Secondary metrics
- Average time to understandable plan
- Repeat usage rate
- Language-switch usage rate
- 7-day reminder retention
- Self-reported motivation lift

### Demo metrics
- End-to-end completion time for one patient journey
- Number of safety checks demonstrated live
- Judge-visible before/after comprehension improvement

## 7) User Journey (MVP)

1. User opens app and selects language/readability mode.
2. User enters diagnosis or discharge text.
3. System generates structured plain-language care guidance and extracts medication plan.
4. User confirms daily routine and reminder windows.
5. System starts adherence loop with reminders and motivational nudges.
6. User reviews danger signs and side-effect guidance.
7. If flagged high-risk, user sees mandatory review guidance.
8. User saves session and provides quick feedback.

## 8) Design Specs

### Design direction
Calm, clear, and trustworthy. The product must feel clinically respectful but accessible to non-technical users.

### Experience principles
- Clarity first: short, plain, actionable instructions
- Mobile-first: large tap targets, predictable layout
- Low-bandwidth-first: optimized assets and resilient states
- Explainability: confidence labels and source-aware summaries
- Behavior-first: every output should help users complete treatment, not just understand text

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
- Bottom nav on mobile: Home, Explain, History, Profile
- Top utilities: language switch, connectivity status, help
- Persistent CTA on home: Start explanation

### Motion and interaction
- Fast transitions (150-220ms)
- Staggered reveal for action items
- No decorative animation in high-risk guidance screens

### Core screens
- Home dashboard: quick start, today doses, motivation status, and reminders
- Upload and explain flow: input capture, language settings, extracted plan review
- Action plan screen: plain summary, medicine schedule, risk flags, review action
- Adherence screen: dose tracking, missed-dose recovery, streaks, and prevention tips
- History screen: previous outputs, follow-up actions, and feedback

### Accessibility and inclusion
- WCAG AA contrast minimum
- Scalable font sizes and large touch targets
- Voice playback and simplified reading mode
- Multilingual support with fallback language strategy

## 9) Architecture and Delivery Plan

### Core architecture
- Frontend: React Native + TypeScript (Expo), Android-first with iOS support
- Backend: Firebase Cloud Functions (TypeScript) with optional Python path for NLP-heavy processing
- Data: Firestore for sessions and feedback, Firebase Storage for uploaded artifacts
- GenAI: Gemini-based generation and transformation workflows
- Mobile services: Firebase Auth, Firebase Cloud Messaging (FCM), and secure local cache for offline continuity

### Interoperability options (if enabled)
- Cloud Healthcare API FHIR stores
- Cloud Healthcare API HL7v2 stores
- Cloud Healthcare API DICOM stores

### Deployment
- Expo EAS Build/Submit for APK/TestFlight distribution
- Cloud Functions for API runtime
- Firebase Auth for user and reviewer roles
- GitHub Actions for CI and preview deployments

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
- App shell, auth optional baseline, input flow, generation endpoint

### Phase 2 (hours 5-8)
- Structured output, medication extraction, multilingual support, safety labels

### Phase 3 (hours 9-12)
- Reminder logic, motivation loop, missed-dose recovery, metrics, and presentation rehearsal
- If ahead of schedule: implement medication scan + prescription-vs-purchase verification flow

## 11) Risks and Mitigations

### Risk: Unsafe or misleading health guidance
Mitigation: strict scope boundaries, uncertainty labels, human review path, explicit disclaimers

### Risk: Model or API availability constraints
Mitigation: fallback to core Gemini workflow and synthetic test fixtures

### Risk: Low trust by users
Mitigation: transparent wording, source-aware explanations, conservative output style

### Risk: Time overrun in 12-hour build
Mitigation: narrow MVP scope to one communication workflow and one persona narrative

### Risk: High false confidence in medication extraction
Mitigation: require user confirmation/edit step before reminders activate

### Risk: Incorrect substitution advice
Mitigation: classify as "possible substitution" only and require pharmacist/clinician confirmation before use

## 12) Open Questions

- Which local languages are mandatory for the first demo?
- Will clinician reviewers be available for live validation?
- Are healthcare interoperability APIs enabled in the hackathon project?
- What minimum evidence is needed by judges for impact claims?

## 13) Acceptance Criteria

- A user can submit clinical text and receive a clear, structured explanation.
- Output includes explicit next steps, extracted medication plan, and danger signs.
- A user can activate personalized reminders from extracted plan data.
- The app handles at least one missed-dose scenario with recovery guidance.
- High-risk outputs are visibly flagged for human review.
- Session history and feedback are captured.
- A complete end-to-end demo can be presented within the judging window.
- If stretch scope is included, mismatch and substitution outcomes are clearly differentiated with human-review guidance.
