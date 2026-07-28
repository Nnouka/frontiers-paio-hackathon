import React from 'react';
import { Outlet } from 'react-router-dom';
import { MobileBottomNav } from '../../components/shared/MobileBottomNav';

export const PatientLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20 md:pb-8">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  );
};
