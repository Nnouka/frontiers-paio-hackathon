# Health Track User Stories

## [ ] Epic 1: Foundation and setup

- [ ] As a developer, I can bootstrap the app and serverless functions quickly so we can start feature work in under 30 minutes.
- [ ] As a developer, I can run local emulators for auth, database, and functions so I can test workflows end to end.
- [ ] As a maintainer, I can deploy preview builds per pull request so team review is fast and safe.

## [ ] Epic 2: Onboarding and context capture

- [ ] As a patient, I can select my preferred language so explanations are understandable.
- [ ] As a patient, I can choose a reading mode (simple or standard) so content matches my literacy level.
- [ ] As a caregiver, I can enter relationship and patient context so recommendations are tailored.

## [ ] Epic 3: Input ingestion and translation intake

- [ ] As a user, I can paste text from a diagnosis or discharge summary so the system can explain it.
- [ ] As a user, I can upload a photo or PDF of a prescription or instructions so the system can parse it.
- [ ] As a user, I can speak a question using voice input so I can use the app with low typing effort.

## [ ] Epic 4: Plain-language explanation

- [ ] As a patient, I can receive a plain-language summary of what my condition means.
- [ ] As a patient, I can receive a clear list of what to do today, this week, and when to seek help.
- [ ] As a caregiver, I can receive a medication schedule formatted by time of day.

## [ ] Epic 5: Medication plan extraction

- [ ] As a user, I can get extracted medicine details (name, dose, frequency, duration) from uploaded notes.
- [ ] As a user, I can edit extracted medicine details before saving them.
- [ ] As a user, I can confirm my routine windows so reminders match my real life.

## [ ] Epic 6: Smart reminders and recovery

- [ ] As a user, I can receive reminders aligned to meals, work, prayer, or sleep schedule.
- [ ] As a user, when I miss a dose, I get a safe recovery recommendation instead of only a missed alert.
- [ ] As a caregiver, I can receive backup alerts after repeated misses.

## [ ] Epic 7: Motivation and continuation

- [ ] As a user, I receive brief motivation nudges when I start dropping adherence.
- [ ] As a user, I can see my treatment completion progress and remaining duration.
- [ ] As a user, I can understand why finishing treatment matters even when symptoms improve.

## [ ] Epic 8: Safety, side effects, and escalation

- [ ] As a user, I can see confidence and uncertainty labels on each recommendation.
- [ ] As a user, I can distinguish expected side effects from emergency danger signs.
- [ ] As a user, I can see clear danger signs that require immediate clinic or emergency escalation.
- [ ] As a clinician reviewer, I can approve or reject high-risk generated guidance before sharing.

## [ ] Epic 9: Localization, visuals, and accessibility

- [ ] As a user, I can switch language at any step without losing my current session.
- [ ] As a user, I can listen to output using text-to-speech if reading is difficult.
- [ ] As a user, I can view simple visual cards that explain condition, medicine use, and warnings.
- [ ] As a user with poor connectivity, I can still access my last saved plan offline.

## [ ] Epic 10: History, follow-up, and prevention

- [ ] As a user, I can view past explanations and action plans.
- [ ] As a caregiver, I can mark actions as completed and track follow-up reminders.
- [ ] As a user, I can provide feedback when guidance is unclear so the system improves.
- [ ] As a user, after treatment ends I receive prevention tips to reduce relapse risk.

## [ ] Epic 11: Analytics and demo metrics

- [ ] As a product lead, I can see average explanation clarity score from user feedback.
- [ ] As a team member, I can see dose completion and missed-dose recovery rates.
- [ ] As a presenter, I can show measurable impact metrics in the final demo.

## [ ] Epic 12: Ethics and compliance guardrails

- [ ] As a user, I always see that the tool does not replace clinician judgment.
- [ ] As a team member, I can audit which source text segments informed each output.
- [ ] As a maintainer, I can enforce role-based access for sensitive operations.

## [ ] Epic 13: Demo storyline

- [ ] As a judge, I can follow one full patient journey from confusing discharge note to extracted plan and completed doses.
- [ ] As a judge, I can observe the human approval step for high-risk advice.
- [ ] As a judge, I can see multilingual output, reminders, and low-bandwidth behavior in real time.

## [ ] Stretch Epic: Pharmacy scan and substitution verification (if time allows)

- [ ] As a user, I can scan or snapshot bought medication packaging and keep it in medication history.
- [ ] As a user, I can compare purchased medication with what was prescribed.
- [ ] As a user, I can see exact match, possible substitution, or mismatch outcomes.
- [ ] As a user, I can see that possible substitutions require pharmacist or clinician confirmation.
- [ ] As a caregiver, I can review medication history by date and treatment episode.
