import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HeaderNav } from './components/shared/HeaderNav';

// Patient Portal Pages
import { PatientLayout } from './portals/patient/PatientLayout';
import { PatientDashboard } from './portals/patient/pages/PatientDashboard';
import { LocateReserve } from './portals/patient/pages/LocateReserve';
import { PharmacyDetail } from './portals/patient/pages/PharmacyDetail';
import { ScanCapture } from './portals/patient/pages/ScanCapture';
import { ScanReview } from './portals/patient/pages/ScanReview';
import { SafetyCheckOutcome } from './portals/patient/pages/SafetyCheckOutcome';
import { AdherenceSchedule } from './portals/patient/pages/AdherenceSchedule';
import { PatientProfile } from './portals/patient/pages/PatientProfile';

// Pharmacy Portal Pages
import { PharmacyLayout } from './portals/pharmacy/PharmacyLayout';
import { PharmacyDashboard } from './portals/pharmacy/pages/PharmacyDashboard';
import { InventoryManagement } from './portals/pharmacy/pages/InventoryManagement';
import { HoldsQueue } from './portals/pharmacy/pages/HoldsQueue';
import { OrderHistory } from './portals/pharmacy/pages/OrderHistory';
import { PharmacyAnalytics } from './portals/pharmacy/pages/PharmacyAnalytics';

// Clinician Portal Pages
import { ClinicianLayout } from './portals/clinician/ClinicianLayout';
import { ReviewQueue } from './portals/clinician/pages/ReviewQueue';
import { CaseDetailReview } from './portals/clinician/pages/CaseDetailReview';
import { ResolvedCases } from './portals/clinician/pages/ResolvedCases';
import { ClinicianProfile } from './portals/clinician/pages/ClinicianProfile';

// Admin Portal Pages
import { AdminLayout } from './portals/admin/AdminLayout';
import { AdminDashboard } from './portals/admin/pages/AdminDashboard';
import { PharmacyManagement } from './portals/admin/pages/PharmacyManagement';
import { ClinicianManagement } from './portals/admin/pages/ClinicianManagement';
import { UserManagement } from './portals/admin/pages/UserManagement';
import { DrugDatabase } from './portals/admin/pages/DrugDatabase';
import { PlatformAnalytics } from './portals/admin/pages/PlatformAnalytics';
import { AuditLogs } from './portals/admin/pages/AuditLogs';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f8f9fa] text-slate-900 flex flex-col antialiased">
        <HeaderNav />

        <div className="flex-1">
          <Routes>
            {/* Root Redirect to Patient Portal */}
            <Route path="/" element={<Navigate to="/patient" replace />} />

            {/* Patient Portal Routes */}
            <Route path="/patient" element={<PatientLayout />}>
              <Route index element={<PatientDashboard />} />
              <Route path="locate" element={<LocateReserve />} />
              <Route path="pharmacy/:pharmacyId" element={<PharmacyDetail />} />
              <Route path="scan" element={<ScanCapture />} />
              <Route path="scan/review" element={<ScanReview />} />
              <Route path="scan/outcome" element={<SafetyCheckOutcome />} />
              <Route path="schedule" element={<AdherenceSchedule />} />
              <Route path="profile" element={<PatientProfile />} />
            </Route>

            {/* Pharmacy Portal Routes */}
            <Route path="/pharmacy" element={<PharmacyLayout />}>
              <Route index element={<PharmacyDashboard />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="holds" element={<HoldsQueue />} />
              <Route path="orders" element={<OrderHistory />} />
              <Route path="analytics" element={<PharmacyAnalytics />} />
            </Route>

            {/* Clinician Portal Routes */}
            <Route path="/clinician" element={<ClinicianLayout />}>
              <Route index element={<ReviewQueue />} />
              <Route path="case/:caseId" element={<CaseDetailReview />} />
              <Route path="resolved" element={<ResolvedCases />} />
              <Route path="profile" element={<ClinicianProfile />} />
            </Route>

            {/* Admin Portal Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="pharmacies" element={<PharmacyManagement />} />
              <Route path="clinicians" element={<ClinicianManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="drugs" element={<DrugDatabase />} />
              <Route path="analytics" element={<PlatformAnalytics />} />
              <Route path="audit" element={<AuditLogs />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/patient" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};