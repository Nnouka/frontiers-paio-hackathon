import React from 'react';
import { User, Bell, Shield, MapPin, Phone, Mail } from 'lucide-react';

export const PatientProfile: React.FC = () => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#00685f] text-white font-heading font-extrabold text-2xl flex items-center justify-center shadow-md">
          AM
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-xl text-slate-900">Amina Mugisha</h1>
          <p className="text-xs text-slate-500 font-mono">Patient ID: #PAT-101 • Kigali, Rwanda</p>
          <span className="inline-block mt-1 bg-teal-100 text-[#00685f] font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            Active Regimen Companion
          </span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          Personal Information & Medical Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-mono">Email Address</span>
            <div className="font-semibold text-slate-800 mt-0.5">amina@health.rw</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-mono">Phone Number</span>
            <div className="font-semibold text-slate-800 mt-0.5">+250 788 123 456</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-mono">Primary Pharmacy</span>
            <div className="font-semibold text-slate-800 mt-0.5">Central Care Pharmacy (City Center)</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-mono">Assigned Clinician</span>
            <div className="font-semibold text-slate-800 mt-0.5">Dr. Patrick Ntaganda, MD</div>
          </div>
        </div>
      </div>
    </div>
  );
};
