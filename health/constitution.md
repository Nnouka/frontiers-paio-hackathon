# Team Constitution

## 1) Mission

### What we are building
We are building a patient-first AI recovery companion for Africa that starts from uploaded diagnosis or discharge summaries, translates and simplifies them, then turns them into daily adherence, motivation, and prevention support without replacing clinicians.

### Why it matters
Health outcomes often fail after discharge: people miss doses, stop treatment once they feel better, fear side effects, or lose follow-up momentum. Better understanding plus behavior support can reduce preventable harm, avoid treatment drop-off, and improve trust.

### Who we are building for
- Primary users: patients and caregivers
- Secondary users: frontline clinicians, nurses, and community health workers
- Priority environments: low-end Android devices, unstable internet, multilingual communities, mixed literacy levels

### Product principle
AI must support clinical communication, not clinical authority. High-risk outputs require human review.

### Outcome principle
Translation is the entry point, adherence is the core value.

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
- All user-facing flows include empty/loading/error states
- High-risk guidance includes confidence and escalation messaging

### Safety and ethics
- No autonomous diagnosis or treatment decisions
- Mandatory disclaimer for educational communication outputs
- Human approval path for ambiguous or high-risk guidance
- Data minimization and least-privilege access controls

### Team workflow
- Trunk-based collaboration with short-lived branches
- Pull requests require one reviewer and green checks
- Daily sync on blockers, decisions, and next demo milestone

## 3) Scope References

- Implementation backlog, epics, and user stories are maintained in health/userstories.md.
- Product design specifications are maintained in health/prd.md.

## 4) Definition of Done

A feature is done when:
- Acceptance criteria pass
- Mobile and desktop views are verified
- Safety and failure states are implemented
- Telemetry for usage and comprehension is tracked
- One teammate validates in preview

## 5) Non-negotiables

- Patient safety over feature breadth
- Local language clarity over technical wording
- Human-in-the-loop for high-risk outputs
- Ethical safeguards are mandatory, not optional
- We do not ship a translation-only experience without adherence and follow-up support
