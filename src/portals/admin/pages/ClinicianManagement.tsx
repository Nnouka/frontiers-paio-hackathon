import React from 'react';
import { Stethoscope, UserCheck, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../../../components/shared/StatusBadge';

export const ClinicianManagement: React.FC = () => {
  const clinicians = [
    { id: "cli-01", name: "Dr. Patrick Ntaganda, MD", email: "dr.patrick@kigalihealth.org", license: "RW-MED-88412", specialty: "Clinical Pharmacology", status: "VERIFIED" },
    { id: "cli-02", name: "Dr. Aline Uwimana, PharmD", email: "dr.aline@kigalihealth.org", license: "RW-MED-99104", specialty: "Hospital Pharmacy", status: "VERIFIED" }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
          <Stethoscope className="w-4 h-4 text-[#00685f]" />
          <span>Physician & Pharmacist Credentials</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
          Clinician Gatekeepers & Credentialing
        </h1>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
              <th className="py-3 px-3">Clinician Name</th>
              <th className="py-3 px-3">License No.</th>
              <th className="py-3 px-3">Specialty</th>
              <th className="py-3 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clinicians.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-3 font-semibold text-slate-900">{c.name}</td>
                <td className="py-3.5 px-3 font-mono text-slate-600">{c.license}</td>
                <td className="py-3.5 px-3 text-slate-700">{c.specialty}</td>
                <td className="py-3.5 px-3"><StatusBadge status={c.status} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
