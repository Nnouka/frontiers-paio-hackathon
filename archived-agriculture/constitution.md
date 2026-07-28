# Team Constitution

## 1) Mission

### What we are building
We are building a farmer-first AI companion for Africa that helps users make better decisions about crop health, farm timing, and market actions using multilingual, low-bandwidth, mobile-first experiences.

### Why it matters
Smallholder farmers make high-stakes decisions with limited access to reliable, localized support. Better information at the right time can reduce losses, improve income stability, and increase food security.

### Who we are building for
- Primary users: smallholder farmers and cooperatives
- Secondary users: extension officers, agronomists, and produce buyers
- Priority environments: low-end Android devices, unstable internet, mixed literacy levels, local language preference

### Product principle
AI must support people, not replace judgment. High-risk recommendations require a human review step.

## 2) Tech Stack and Delivery

### Frontend
- React + TypeScript
- Styling with a lightweight design system and reusable component primitives
- PWA support for installability and offline-first behavior

### Backend
- Firebase Cloud Functions (2nd gen) for serverless APIs
- TypeScript functions for orchestration, auth-aware endpoints, and validation
- Python serverless function path for ML-heavy or data-processing workloads

### Data and storage
- Firestore for user profiles, farm contexts, recommendation history, and feedback
- Firebase Storage for image uploads and generated media assets

### AI and model services
- Google GenAI services for multimodal inference and content generation
- Gemini for image and text reasoning, translation, and response generation
- Optional video generation for short educational explainers when enabled

### Deployment and operations
- Firebase Hosting for web app deployment
- Cloud Functions for API runtime
- Firebase Auth for sign-in and role boundaries
- CI/CD via GitHub Actions with branch preview deployments

### How this helps us move fast
- Unified platform for auth, hosting, serverless APIs, database, and storage
- Minimal infrastructure overhead
- Clear separation: frontend experience, API orchestration, and AI calls

## 3) Engineering Standards

### Quality bar
- Every feature includes acceptance criteria and a demo path
- All user-facing logic has validation and error states
- Sensitive actions must have guardrails and confidence messaging

### Safety and ethics
- No medical or high-risk prescriptive output without disclaimers and review step
- Unsafe or uncertain outputs are blocked or downgraded to guidance mode
- User data is minimized and protected by least-privilege access rules

### Team workflow
- Trunk-based collaboration with short-lived branches
- Pull requests require one reviewer and passing checks
- Daily sync: blockers, decisions, and next milestone

## 4) Roadmap (Epics and User Stories)

### Epic 1: Foundation and setup
Goal: establish a reliable baseline environment for shipping quickly.

User stories
- As a developer, I can run frontend and functions locally with one command so I can iterate fast.
- As a developer, I can deploy preview environments for pull requests so teammates can test changes early.
- As a maintainer, I have environment templates and secrets handling so deployments are safe.

### Epic 2: Farmer onboarding and context
Goal: capture enough local context to personalize recommendations.

User stories
- As a farmer, I can set language, location, crop type, and budget constraints so advice is relevant.
- As a farmer, I can choose voice or text interaction so I can use the app comfortably.
- As an extension officer, I can see basic context history so I can validate recommendations quickly.

### Epic 3: Crop issue assistant (core value)
Goal: deliver useful decision support from image and text inputs.

User stories
- As a farmer, I can upload a crop photo and get likely issue categories with confidence bands.
- As a farmer, I can receive clear next steps grouped by low-cost, medium-cost, and urgent actions.
- As a user, I can read responses in simple local language so I can act immediately.

### Epic 4: Trust, safety, and human approval
Goal: prevent harmful overconfidence and improve reliability.

User stories
- As a user, I can see when the model is uncertain so I do not over-trust recommendations.
- As a user, I can trigger a human approval workflow before high-risk actions.
- As the team, we can log safety events and failed cases for rapid improvement.

### Epic 5: Insights and measurable impact
Goal: prove value and improve continuously.

User stories
- As a team member, I can view usage and outcome metrics so we can evaluate impact.
- As a product lead, I can see which recommendations are most accepted and most useful.
- As a researcher, I can export anonymized feedback to improve prompts and rules.

### Epic 6: Demo readiness and storytelling
Goal: deliver a polished narrative and robust demo.

User stories
- As a judge, I can follow one clear persona journey from problem to measurable result.
- As a judge, I can see ethics-by-design features in the live flow.
- As a presenter, I can show fallback behavior for low connectivity and uncertain model output.

## 5) Design Specs

### Design direction
Confident, warm, and practical. The interface should feel trustworthy and field-ready, not corporate or overly technical.

### Experience principles
- Clarity first: plain language, short actionable guidance
- Mobile-first: thumb-friendly controls and quick response states
- Low-bandwidth-first: optimized images, skeleton loading, offline caching
- Explainability: confidence band + why this suggestion appears

### Typography
- Headings: Manrope (strong and modern)
- Body: Source Sans 3 (high readability on low-end devices)
- Numeric data: IBM Plex Mono for metric cards and confidence values

### Iconography
- No emojis in the product UI, documentation mockups, or production text labels.
- Use real icon components from Lucide React or Material UI Icons for all status, actions, and navigation cues.
- Keep icon usage semantically consistent (for example, warning, success, and error should always map to the same icon set patterns).

### Color system
- Primary: #1B5E20 (agri green, trust)
- Secondary: #0D47A1 (information blue)
- Accent: #F57F17 (attention and warnings)
- Neutral dark: #1F2937
- Neutral light: #F7FAFC
- Success: #2E7D32
- Warning: #ED6C02
- Error: #C62828

### Navigation
- Bottom navigation on mobile: Home, Diagnose, History, Profile
- Top utility actions: language switch, connectivity status, help
- Core CTA always visible on home: Start diagnosis

### Motion and interaction
- Fast transitions (150-220ms) to maintain responsiveness
- Staggered reveal for result cards to improve scanability
- No decorative animation during high-risk result displays

### Core screens
- Home dashboard: quick start, recent diagnoses, reminders
- Diagnose flow: upload/photo capture, context input, review results
- Result screen: likely issues, confidence, next steps, safety note, review action
- History screen: previous analyses, actions taken, feedback capture

### Accessibility and inclusion
- Minimum contrast WCAG AA
- Large tap targets and scalable font sizes
- Voice playback option for guidance text
- Translation support and simple-reading mode

## 6) Definition of Done

A feature is done when:
- Acceptance criteria pass
- Mobile and desktop views are verified
- Safety and failure states are implemented
- Telemetry event for usage is tracked
- One teammate validates the feature in preview

## 7) Non-negotiables

- User trust over flashy output
- Local relevance over generic responses
- Working product over unnecessary complexity
- Ethical safeguards are mandatory, not optional