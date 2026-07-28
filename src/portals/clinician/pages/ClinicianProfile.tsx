import React from 'react';
import { UserCheck, Stethoscope, ShieldCheck } from 'lucide-react';

export const ClinicianProfile: React.FC = () => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-heading font-extrabold text-2xl flex items-center justify-center shadow-md">
          PN
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-xl text-slate-900">Dr. Patrick Ntaganda, MD</h1>
          <p className="text-xs text-slate-500 font-mono">License #RW-MED-88412 • Clinical Pharmacology Lead</p>
          <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            Verified Safety Gate Officer
          </span>
        </div>
      </div>
    </div>
  );
};
