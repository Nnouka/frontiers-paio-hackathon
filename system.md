# System Architecture & Operational Blueprint: AI-Powered Pharmacy Locator & Medication Adherence Ecosystem

**Document Version:** 2.0.0
**Date:** July 2026
**Project Name:** Integrated Digital Health & Adherence Ecosystem
**Target Platform:** Mobile-First Responsive Web Application (React + TypeScript)
**Stack Constraint:** Google/Firebase services only (hackathon speed + prototyping fit)

---

## Executive Summary

The **Integrated Digital Health & Adherence Ecosystem** is an end-to-end AI platform designed to eliminate two critical failure points in outpatient healthcare:
1. **The Acquisition Gap:** The difficulty patients face in locating specific prescribed medications in real-time within nearby retail pharmacies.
2. **The Adherence Gap:** The high rate of non-adherence, improper dosage, and missed refills post-purchase.

By seamlessly bridging real-time geo-spatial inventory matching with an intelligent computer-vision prescription parser and automated adherence tracking, this system forms a closed-loop healthcare companion for patients and healthcare providers, delivered as a mobile-first responsive React + TypeScript web app, built entirely on Google's Firebase and Google Cloud platform for fast, low-ops hackathon delivery.

---

## 1. System Ecosystem Overview

                              +---------------------------------------+
                              |  PATIENT WEB APP (React + TypeScript) |
                              +-------------------+-------------------+
                                                  |
                                                  | Firebase SDKs / Callable Functions (HTTPS)
                                                  v
+---------------------------------------------------------------------------------------------------+
|                            FIREBASE / GOOGLE CLOUD BACKEND                                        |
|                                                                                                   |
|  +------------------------+  +--------------------------+  +-----------------------------------+  |
|  | Geo-Spatial Engine     |  | AI Vision & OCR Service  |  | Drug Safety Engine (DDI)          |  |
|  | (Firestore + geohash)  |  | (Gemini API, Google AI Studio)   |  | (Cloud Functions + Gemini)         |  |
|  +-----------+------------+  +------------+-------------+  +-----------------+-----------------+  |
|              |                            |                              |                        |
|              +----------------------------+------------------------------+                        |
|                                           |                                                       |
|                                           v                                                       |
|                              +--------------------------+                                         |
|                              | Schedule & Alert Service |                                         |
|                              | (Cloud Scheduler / Tasks |                                         |
|                              |  + FCM)                  |                                         |
|                              +------------+-------------+                                         |
+-------------------------------------------|-------------------------------------------------------+
|
+------------------+------------------+
|                                     |
v                                     v
+-------------------------------+     +-------------------------------+
|   PHARMACY PORTAL (React +    |     |   DATA & ANALYTICS STORAGE    |
|   TypeScript, Firebase        |     | (Firestore, Cloud Storage,    |
|   Hosting + Cloud Functions)  |     |  BigQuery export)             |
+-------------------------------+     +-------------------------------+


---

## 2. End-to-End Operational Workflow

### Phase 1: Geo-Spatial Search & Real-Time Stock Verification

1. **Patient Query Input:**
   * The user inputs a required medication name, active ingredient, or uploads a photo of a doctor's prescription slip.
   * GPS location coordinates are captured via the browser Geolocation API with user authorization.

2. **Geo-Fencing & Inventory Querying:**
   * The backend queries Cloud Firestore inventory documents using geohash range queries (via the `geofire-common` library) over a bounding radius (e.g., 5km, 10km, 25km).
   * The inventory query matches exact stock keeping units (SKUs), active chemical components, and generic alternatives available at participating pharmacies within the selected radius.

3. **Interactive Map & Decision Support:**
   * Results are rendered on an interactive map (Google Maps Platform via `@react-google-maps/api`) showing:
     * Distance and route navigation time (Directions API).
     * Price points per pharmacy.
     * Operating hours and contact details.
     * Real-time stock status (e.g., *In Stock*, *Low Stock (<5 items)*, *Out of Stock*).

4. **Preservation & Hold Request (Optional):**
   * The patient can place a 60-minute reservation request on the medication (a Firestore document with a TTL field, expired via a scheduled Cloud Function) to prevent stock-outs during travel.

---

### Phase 2: Purchase Onboarding & AI Optical Recognition (OCR)

1. **Medication Capture:**
   * Following purchase, the patient captures the pill box, bottle label, or official receipt using the device camera via the browser's `getUserMedia`/file-input capture API (works on mobile and desktop browsers, no native app install required).

2. **Multimodal AI Vision Extraction Pipeline:**
   * The image is uploaded to Cloud Storage for Firebase, then processed by a Cloud Function that calls the **Gemini API** (Google AI Studio, multimodal) for OCR and entity extraction.
   * **Extracted Entities:**
     * `drug_name`: Brand and generic name.
     * `dosage_strength`: e.g., 500 mg, 10 ml.
     * `form`: Tablet, capsule, syrup, injection.
     * `dosage_instruction`: e.g., "1 tablet twice daily after meals".
     * `duration_days`: e.g., 7 days, 30 days.
     * `total_quantity`: Total pill count or liquid volume.
     * `warnings`: e.g., "Do not take with alcohol", "Take on an empty stomach".

3. **Drug-Drug Interaction (DDI) & Safety Screening:**
   * A Cloud Function cross-references newly scanned drugs with the patient's existing active medication profile stored in Firestore, using Gemini-assisted reasoning plus a rules table.
   * **Alert Thresholds:**
     * **Severe Alert:** Potentially dangerous chemical interaction detected (requires explicit in-app confirmation and a physician consultation warning).
     * **Moderate Alert:** Overlapping active ingredients (e.g., taking two drugs containing Paracetamol).
     * **Dietary Alert:** Contraindications with food/beverage intake.

---

### Phase 3: Intelligent Schedule Generation & Automated Alerts

1. **Schedule Optimization:**
   * A Cloud Function translates natural language instructions (e.g., "twice daily after meals") into exact timestamp schedules based on patient lifestyle preferences (e.g., Breakfast: 08:00, Dinner: 20:00), using Gemini for NL parsing.

2. **Notification Dispatch (Google-native only):**
   * **Push Notifications:** Primary and sole delivery channel via **Firebase Cloud Messaging (FCM)**.
   * **In-app fallback:** If a push notification is not confirmed within 15 minutes, the app surfaces a persistent in-app banner/badge on next open (via a Firestore-backed pending-confirmation flag) instead of a third-party SMS gateway, keeping the stack Google-only.
   * **Scheduling engine:** Reminder firing is driven by **Cloud Scheduler** (cron) triggering **Cloud Tasks**, which invoke Cloud Functions to send the FCM payload — replacing a self-hosted Redis/BullMQ queue with managed Google Cloud services.

---

### Phase 4: Adherence Logging, Analytics & Predictive Refills

1. **One-Tap Patient Confirmation:**
   * Notifications offer quick action buttons: `Take Dose`, `Snooze 15 Min`, `Skip Dose`.
   * Logging a dose writes an `adherence_logs` document and decrements the remaining pill counter on the `user_medications` document in Firestore.

2. **Predictive Refill Loop:**
   * When remaining dosage drops below a 3-day threshold (e.g., 6 pills remaining for a twice-daily regimen), a Firestore-triggered Cloud Function fires an automated **Refill Alert**.
   * The app automatically executes a local pharmacy stock search (Phase 1 flow) for the medication, allowing the patient to re-order with a single tap.

3. **Analytics & Healthcare Provider Export:**
   * Adherence percentages (e.g., 92% compliance over 30 days) are computed by a Cloud Function and optionally streamed to **BigQuery** for dashboarding.
   * Patients can export a PDF Adherence Summary report (generated in a Cloud Function, stored in Cloud Storage) to share with their primary care physician.

---

## 3. Technology Architecture & Stack (Google/Firebase only)

| Layer | Technical Components | Key Functions |
| :--- | :--- | :--- |
| **Frontend / Web App** | React + TypeScript (Vite), mobile-first responsive design | Single responsive web app (patient + pharmacy portal), offline-first caching (Firestore offline persistence), browser camera capture, Web Push background alerts. No native app install required. |
| **Pharmacy Portal** | Same React + TypeScript codebase, role-gated routes | Pharmacy-side inventory management UI, served from the same web app via Firebase Hosting. |
| **Backend / API** | Firebase Cloud Functions (Node.js/TypeScript, 2nd gen) | Callable/HTTPS functions, Firestore/Storage triggers, user authentication guard, business logic. |
| **AI / Machine Learning Engine** | Gemini API (Google AI Studio, multimodal) | Vision OCR entity extraction, drug-drug interaction reasoning, natural language schedule parsing. |
| **Database Layer** | Cloud Firestore | Document storage for users, pharmacies, inventory (with geohash field), prescriptions, medications, adherence logs. |
| **Geospatial Indexing** | Firestore + geohash (`geofire-common`) | Radius-bounded pharmacy/inventory queries without a separate spatial database. |
| **File Storage** | Cloud Storage for Firebase | Uploaded prescription photos, pill/label scans, generated PDF reports. |
| **Scheduling & Queueing** | Cloud Scheduler + Cloud Tasks | Reminder cron triggers, background job dispatch (replaces self-hosted Redis/BullMQ). |
| **Notification Pipeline** | Firebase Cloud Messaging (FCM) for Web (Web Push) | Push notifications via the browser; sole delivery channel, no third-party SMS gateway. |
| **Auth** | Firebase Authentication | JWT-based auth, custom claims for patient/pharmacy/clinician roles. |
| **Analytics** | Firebase Analytics + BigQuery export | Adherence metrics, demo impact dashboards. |
| **Maps** | Google Maps Platform (`@react-google-maps/api`, Directions API) | Interactive map, distance/route rendering. |

---

## 4. Core Database Schema Overview (Cloud Firestore collections)

Firestore is a document database — the schema below is expressed as collections/documents rather
than SQL tables, but preserves the same fields and relationships as the original design.

```
pharmacies/{pharmacyId}
  name: string
  address: string
  location: GeoPoint
  geohash: string              // for range-query bucketing
  phone: string
  is_active: boolean
  created_at: Timestamp

pharmacies/{pharmacyId}/inventory/{inventoryId}
  medication_name: string
  generic_name: string
  unit_price: number
  stock_quantity: number
  last_updated: Timestamp

users/{userId}/medications/{medicationId}   // "user_medications"
  medication_name: string
  dosage: string
  frequency_per_day: number
  total_quantity: number
  remaining_quantity: number
  start_date: Timestamp
  end_date: Timestamp | null
  created_at: Timestamp

users/{userId}/medications/{medicationId}/adherence_logs/{logId}
  scheduled_time: Timestamp
  taken_time: Timestamp | null
  status: "TAKEN" | "SNOOZED" | "SKIPPED" | "MISSED"
  created_at: Timestamp
```

Notes:
- `inventory` is a subcollection of `pharmacies` so geo-filtered pharmacy results can fan out to
  their stock in a single follow-up query per matched pharmacy.
- `adherence_logs` is a subcollection of the medication document to keep per-medication history
  reads cheap; a Cloud Function mirrors aggregate counters up to the medication document for fast
  adherence-percentage reads.
- Security rules restrict `pharmacies/*` writes to authenticated pharmacy-role accounts and
  `users/{userId}/*` writes to that user (or a clinician role with explicit share access).
