import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/shared/Sidebar';
import { 
  Building2, 
  Package, 
  Clock, 
  History, 
  BarChart3 
} from 'lucide-react';
import { usePharmaLoopStore } from '../../services/store';

export const PharmacyLayout: React.FC = () => {
  const { holds } = usePharmaLoopStore();
  const activeHoldCount = holds.filter(h => h.status === 'ACTIVE').length;

  const sidebarItems = [
    { label: 'Pharmacy Dashboard', path: '/pharmacy', icon: Building2 },
    { label: 'Inventory List', path: '/pharmacy/inventory', icon: Package },
    { label: 'Holds & Reservations', path: '/pharmacy/holds', icon: Clock, badge: activeHoldCount },
    { label: 'Order History', path: '/pharmacy/orders', icon: History },
    { label: 'Analytics & Sales', path: '/pharmacy/analytics', icon: BarChart3 }
  ];

  return (
    <div className="flex min-h-[calc(100vh-65px)] bg-[#f8f9fa]">
      <Sidebar
        title="Central Care Pharmacy"
        subtitle="Portal License #RW-PHARM-2024-001"
        items={sidebarItems}
        accentColor="navy"
      />
      <main className="flex-1 p-6 max-w-7xl mx-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};
