# System Architecture & Operational Blueprint: AI-Powered Pharmacy Locator & Medication Adherence Ecosystem

**Document Version:** 1.0.0  
**Date:** July 2026  
**Project Name:** Integrated Digital Health & Adherence Ecosystem  
**Target Platform:** Cross-Platform Mobile Application (iOS/Android) & Web Platform  

---

## Executive Summary

The **Integrated Digital Health & Adherence Ecosystem** is an end-to-end AI platform designed to eliminate two critical failure points in outpatient healthcare:
1. **The Acquisition Gap:** The difficulty patients face in locating specific prescribed medications in real-time within nearby retail pharmacies.
2. **The Adherence Gap:** The high rate of non-adherence, improper dosage, and missed refills post-purchase.

By seamlessly bridging real-time geo-spatial inventory matching with an intelligent computer-vision prescription parser and automated multi-channel adherence tracking, this system forms a closed-loop healthcare companion for patients and healthcare providers.

---

## 1. System Ecosystem Overview

                              +---------------------------------------+
                              |         PATIENT MOBILE APP            |
                              +-------------------+-------------------+
                                                  |
                                                  | APIs (HTTPS / WebSockets)
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                      BACKEND CORE SERVICES                                        |
|                                                                                                   |
|  +------------------------+  +--------------------------+  +-----------------------------------+  |
|  | Geo-Spatial Engine     |  | AI Vision & OCR Service  |  | Drug Safety Engine (DDI)          |  |
|  | (PostGIS Location Sync)|  | (LLM / Multimodal Vision)|  | (Interaction & Contraindication)  |  |
|  +-----------+------------+  +------------+-------------+  +-----------------+-----------------+  |
|              |                            |                              |                        |
|              +----------------------------+------------------------------+                        |
|                                           |                                                       |
|                                           v                                                       |
|                              +--------------------------+                                         |
|                              | Schedule & Alert Service |                                         |
|                              | (Cron / Twilio / FCM)    |                                         |
|                              +------------+-------------+                                         |
+-------------------------------------------|-------------------------------------------------------+
|
+------------------+------------------+
|                                     |
v                                     v
+-------------------------------+     +-------------------------------+
|     PHARMACY PORTAL / API     |     |   DATA & ANALYTICS STORAGE    |
| (Inventory Management System) |     | (PostgreSQL, Redis, Encrypted)|
+-------------------------------+     +-------------------------------+


---

## 2. End-to-End Operational Workflow

### Phase 1: Geo-Spatial Search & Real-Time Stock Verification

1. **Patient Query Input:**
   * The user inputs a required medication name, active ingredient, or uploads a photo of a doctor's prescription slip.
   * GPS location coordinates are captured via the mobile app with user authorization.

2. **Geo-Fencing & Inventory Querying:**
   * The backend queries a spatial database (PostgreSQL with PostGIS) using a bounding radius (e.g., 5km, 10km, 25km).
   * The inventory query matches the exact stock keeping units (SKUs), active chemical components, and generic alternatives available at participating pharmacies within the selected radius.

3. **Interactive Map & Decision Support:**
   * Results are rendered on an interactive map showing:
     * Distance and route navigation time.
     * Price points per pharmacy.
     * Operating hours and contact details.
     * Real-time stock status (e.g., *In Stock*, *Low Stock (<5 items)*, *Out of Stock*).

4. **Preservation & Hold Request (Optional):**
   * The patient can place a 60-minute reservation request on the medication to prevent stock-outs during travel.

---

### Phase 2: Purchase Onboarding & AI Optical Recognition (OCR)

1. **Medication Capture:**
   * Following purchase, the patient scans the pill box, bottle label, or official receipt using the device camera.

2. **Multimodal AI Vision Extraction Pipeline:**
   * The image is processed via an optimized OCR and Large Vision Language Model pipeline.
   * **Extracted Entities:**
     * `drug_name`: Brand and generic name.
     * `dosage_strength`: e.g., 500 mg, 10 ml.
     * `form`: Tablet, capsule, syrup, injection.
     * `dosage_instruction`: e.g., "1 tablet twice daily after meals".
     * `duration_days`: e.g., 7 days, 30 days.
     * `total_quantity`: Total pill count or liquid volume.
     * `warnings`: e.g., "Do not take with alcohol", "Take on an empty stomach".

3. **Drug-Drug Interaction (DDI) & Safety Screening:**
   * The system cross-references newly scanned drugs with the patient's existing active medication profile in the database.
   * **Alert Thresholds:**
     * **Severe Alert:** Potentially dangerous chemical interaction detected (requires explicit confirmation and physician consultation warning).
     * **Moderate Alert:** Overlapping active ingredients (e.g., taking two drugs containing Paracetamol).
     * **Dietary Alert:** Contraindications with food/beverage intake.

---

### Phase 3: Intelligent Schedule Generation & Automated Alerts

1. **Schedule Optimization:**
   * The engine translates natural language instructions (e.g., "twice daily after meals") into exact timestamp schedules based on patient lifestyle preferences (e.g., Breakfast: 08:00, Dinner: 20:00).

2. **Multi-Channel Notification Dispatch:**
   * **Push Notifications:** Primary delivery via Firebase Cloud Messaging (FCM).
   * **Fallback System (SMS / WhatsApp):** If the patient lacks an active internet connection or does not confirm the push notification within 15 minutes, an SMS/USSD alert is triggered via Twilio or local telecom gateways.

---

### Phase 4: Adherence Logging, Analytics & Predictive Refills

1. **One-Tap Patient Confirmation:**
   * Notifications offer quick action buttons: `Take Dose`, `Snooze 15 Min`, `Skip Dose`.
   * Logging a dose decrements the total remaining pill counter stored in the database.

2. **Predictive Refill Loop:**
   * When remaining dosage drops below a 3-day threshold (e.g., 6 pills remaining for a twice-daily regimen), the system triggers an automated **Refill Alert**.
   * The app automatically executes a local pharmacy stock search for the medication, allowing the patient to re-order with a single tap.

3. **Analytics & Healthcare Provider Export:**
   * Adherence percentages (e.g., 92% compliance over 30 days) are computed and visualized.
   * Patients can export a PDF Adherence Summary report to share with their primary care physician.

---

## 3. Technology Architecture & Stack

| Layer | Technical Components | Key Functions |
| :--- | :--- | :--- |
| **Frontend / Mobile** | Flutter / React Native | Cross-platform mobile development, offline-first caching, camera integration, native background alerts. |
| **Backend API Gateway** | Node.js (TypeScript) / Express | API management, routing, user authentication (JWT + OAuth2), rate limiting. |
| **AI / Machine Learning Engine** | Python (FastAPI), Vision-LLM APIs | Vision OCR entity extraction, drug-drug interaction check algorithms, natural language schedule parsing. |
| **Database Layer** | PostgreSQL + PostGIS | Relational storage for user profiles, prescriptions, geospatial indexing for pharmacy locations. |
| **Caching & Queue Layer** | Redis + BullMQ | Session state management, notification queueing, background job processing. |
| **Notification Pipeline** | FCM (Firebase), Twilio API | Push notifications, SMS fallback, WhatsApp Business messaging integration. |

---

## 4. Core Database Schema Overview

```sql
-- Pharmacy Table with Spatial Location
CREATE TABLE pharmacies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Table
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    unit_price NUMERIC(10, 2) NOT NULL,
    stock_quantity INT NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Active Medications
CREATE TABLE user_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency_per_day INT NOT NULL,
    total_quantity INT NOT NULL,
    remaining_quantity INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adherence Logs
CREATE TABLE adherence_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_medication_id UUID REFERENCES user_medications(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    taken_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) CHECK (status IN ('TAKEN', 'SNOOZED', 'SKIPPED', 'MISSED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);