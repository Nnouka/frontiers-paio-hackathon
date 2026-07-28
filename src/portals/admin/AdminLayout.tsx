import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/shared/Sidebar';
import { 
  ShieldCheck, 
  Building2, 
  Stethoscope, 
  Users, 
  Database, 
  BarChart3, 
  FileText 
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const sidebarItems = [
    { label: 'Admin Console', path: '/admin', icon: ShieldCheck },
    { label: 'Pharmacies', path: '/admin/pharmacies', icon: Building2 },
    { label: 'Clinicians', path: '/admin/clinicians', icon: Stethoscope },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Drug Database (DDI Rules)', path: '/admin/drugs', icon: Database },
    { label: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Audit Logs', path: '/admin/audit', icon: FileText }
  ];

  return (
    <div className="flex min-h-[calc(100vh-65px)] bg-[#f8f9fa]">
      <Sidebar
        title="PharmaLoop Admin Console"
        subtitle="System Control & Audit"
        items={sidebarItems}
        accentColor="purple"
      />
      <main className="flex-1 p-6 max-w-7xl mx-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};
