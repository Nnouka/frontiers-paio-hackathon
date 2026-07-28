import React from 'react';
import { BarChart3, Activity, ShieldCheck, Users } from 'lucide-react';
import { StatCard } from '../../../components/shared/StatCard';

export const PlatformAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-purple-700">
          <BarChart3 className="w-4 h-4" />
          <span>System Insights</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
          Platform-Wide Ecosystem Analytics
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Scans Processed" value="1,248" subtitle="Gemini Multimodal Vision OCR" icon={Activity} color="indigo" />
        <StatCard title="Safety Interventions" value="42 Cases" subtitle="Clinician gate approvals" icon={ShieldCheck} color="rose" />
        <StatCard title="Avg Adherence Improvement" value="+34%" subtitle="Across active patients" icon={Users} color="emerald" />
      </div>
    </div>
  );
};
