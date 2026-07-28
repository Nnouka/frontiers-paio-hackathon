import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/shared/Sidebar';
import { 
  Stethoscope, 
  ShieldAlert, 
  CheckCircle2, 
  UserCheck 
} from 'lucide-react';
import { usePharmaLoopStore } from '../../services/store';

export const ClinicianLayout: React.FC = () => {
  const { clinicianCases } = usePharmaLoopStore();
  const pendingCount = clinicianCases.filter(c => c.status === 'PENDING').length;

  const sidebarItems = [
    { label: 'Review Queue', path: '/clinician', icon: ShieldAlert, badge: pendingCount },
    { label: 'Case Detail Review', path: '/clinician/case/case-301', icon: Stethoscope },
    { label: 'Resolved Cases', path: '/clinician/resolved', icon: CheckCircle2 },
    { label: 'Credentials & Profile', path: '/clinician/profile', icon: UserCheck }
  ];

  return (
    <div className="flex min-h-[calc(100vh-65px)] bg-[#f8f9fa]">
      <Sidebar
        title="Clinician Safety Gate"
        subtitle="Dr. Patrick Ntaganda, MD"
        items={sidebarItems}
        accentColor="teal"
      />
      <main className="flex-1 p-6 max-w-7xl mx-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};
