# PRD: Geo-Spatial Engine & Pharmacy Portal (Epic 2)

**Date:** 2026-07-28
**Status:** Draft
**Author:** Workstream 2 (via prd skill)

---

## Problem Statement

Patients searching for a specific medication have no way to know, before traveling, which nearby
pharmacy actually has it in stock, at what price, and whether it will still be there by the time
they arrive — leading to wasted trips and stock-out frustration. Pharmacies, meanwhile, have no
lightweight way to expose their live inventory to this search or to update it themselves. Epic 2
builds the geo-spatial matching engine (radius search, SKU/generic matching, time-boxed holds) and
the pharmacy-facing portal that keeps that inventory data fresh, closing the loop between "patient
searches" and "pharmacy has stock."

## User Personas

**Primary:** Patient — searching from the mobile-first web app (Epic 1) for a medication by name,
active ingredient, or generic name, with GPS location granted. Non-technical, expects instant
results; today's workaround is calling pharmacies one by one or guessing.

**Secondary:** Pharmacy staff — logs into the role-gated portal to keep medication name, generic
name, price, and stock quantity current, and to mark the pharmacy inactive or update hours/contact
info. For this demo, accounts are pre-provisioned with a `pharmacy` custom claim rather than
self-registered.

## Goals & Success Criteria

- A patient can search by medication name/ingredient/generic and get ranked, radius-bounded
  results (5/10/25km) with distance, price, hours, and stock status within a couple seconds, using
  Firestore geohash range queries — no separate spatial database.
- A patient can place a 60-minute hold on an item at a specific pharmacy, and inventory correctly
  reflects that reservation (no oversell) until it's fulfilled or expires via the scheduled
  TTL-expiry Cloud Function.
- A pharmacy user can log into the portal and see their inventory changes reflected in search
  results in near-real-time, without needing help from another workstream.
- `searchPharmacies` and `createHold` are exposed as stable Cloud Functions callables matching the
  Epic 0-agreed contract, so Workstream 1 (Web Frontend) can integrate against them without
  renegotiation.

## Non-Goals

- No self-service pharmacy signup/onboarding flow — accounts are pre-provisioned/seeded for the
  demo.
- No real pharmacy partner data or live inventory feeds — pharmacies/inventory are
  synthetic/seeded data for the Epic 6 demo storyline.
- No payment processing, checkout, or purchase confirmation — holds only reserve stock, they don't
  complete a transaction.
- No fuzzy/typo-tolerant search, ranking by relevance beyond distance/price/stock, or
  multi-language support.
- No support for multiple simultaneous holds on the same medication by the same patient — one
  active hold per patient+item, enforced server-side.
- Pharmacy portal analytics/reporting (sales trends, etc.) is out of scope — that's Epic 5 (Data,
  Auth & Analytics) territory.

## Acceptance Criteria

- [ ] Given a patient with GPS coordinates and a search radius (5/10/25km), when they search by
      medication name, active ingredient, or generic name, then `searchPharmacies` returns only
      pharmacies within that radius whose inventory matches, each annotated with distance, price,
      stock status (In Stock / Low Stock / Out of Stock), and hours.
- [ ] Given a matched pharmacy with available stock, when a patient calls `createHold` for that
      item, then a Firestore hold document is created with a 60-minute TTL and the pharmacy's
      available stock count is decremented so it can't be oversold.
- [ ] Given a patient with an already-active hold on a specific medication at a specific pharmacy,
      when they call `createHold` again for the same patient+medication+pharmacy, then the call is
      rejected with a clear error instead of creating a duplicate hold.
- [ ] Given a hold that has sat unfulfilled for 60 minutes, when the scheduled expiry Cloud
      Function runs, then the hold document is expired/removed and the reserved stock is released
      back to available inventory.
- [ ] Given a pre-provisioned pharmacy-role account, when that user logs into the portal, then
      they can view and edit only their own pharmacy's inventory (medication name, generic name,
      price, stock quantity) — role-gated by Firebase Auth custom claims.
- [ ] Given a pharmacy user updates a stock quantity or price in the portal, when a patient
      subsequently runs `searchPharmacies`, then the updated value is reflected (no stale cache
      beyond normal Firestore read consistency).
- [ ] Given a pharmacy user marks their pharmacy inactive or updates hours/contact details, when a
      patient searches, then that pharmacy is excluded from results (if inactive) or shows the
      updated hours/contact info.
- [ ] Given the agreed Epic 0 contract, when Workstream 1 calls `searchPharmacies` or `createHold`
      against the deployed/emulated functions, then request/response shapes match the documented
      contract with no undocumented breaking fields.
- [ ] Given Firestore Security Rules, when an authenticated pharmacy user attempts to write to
      another pharmacy's `pharmacies/{id}` or `inventory` documents, then the write is denied by
      rules, not just app-level checks.

## Open Questions

- None outstanding.
