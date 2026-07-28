# Tasks

**Current priorities:**
- 5-workstream build against userstories.md (see architecture.md section 6 for ownership map)

**In-flight work:**
- Epic 3 (AI Vision/OCR & Drug Safety Engine): `checkDDI` now reads real per-user active
  medications from Firestore, with demo-baseline fallback for anonymous/no-data callers. See
  decisions.md 2026-07-28 entry.

**Blocked / waiting:**
- `checkDDI`'s real-data path only activates once Workstream 5 (Data, Auth & Analytics) wires
  `logMedication`/`logAdherence` to actually persist to Firestore — currently all 8 callables
  except `checkDDI`'s new lookup are stateless stubs.
