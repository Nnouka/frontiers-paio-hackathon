import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react';
import { StatCard } from '../../../components/shared/StatCard';

export const PharmacyAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
          <BarChart3 className="w-4 h-4" />
          <span>Real-time Analytics</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
          Pharmacy Sales & Reservation Conversion
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Monthly Revenue" value="$42,850" subtitle="+18% YoY Growth" icon={DollarSign} color="emerald" />
        <StatCard title="Hold Conversion %" value="94.2%" subtitle="60m holds converted to sale" icon={TrendingUp} color="teal" />
        <StatCard title="Top Searched Medication" value="Amoxicillin" subtitle="182 searches nearby" icon={Package} color="indigo" />
      </div>
    </div>
  );
};
