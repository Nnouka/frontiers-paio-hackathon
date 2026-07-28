import React from 'react';
import { Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { usePharmaLoopStore } from '../../../services/store';
import { StatusBadge } from '../../../components/shared/StatusBadge';

export const PharmacyManagement: React.FC = () => {
  const { pharmacies } = usePharmaLoopStore();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
          <Building2 className="w-4 h-4 text-purple-700" />
          <span>Provider Directory Governance</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
          Pharmacy Partner Registry & License Verification
        </h1>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
              <th className="py-3 px-3">Pharmacy Name</th>
              <th className="py-3 px-3">License No.</th>
              <th className="py-3 px-3">Address</th>
              <th className="py-3 px-3">SKU Count</th>
              <th className="py-3 px-3">Verification Status</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pharmacies.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-3 font-semibold text-slate-900">{p.name}</td>
                <td className="py-3.5 px-3 font-mono text-slate-600">{p.license_number || 'RW-PHARM-2024'}</td>
                <td className="py-3.5 px-3 text-slate-600">{p.address}</td>
                <td className="py-3.5 px-3 font-mono font-bold">{p.inventory?.length || 0} SKUs</td>
                <td className="py-3.5 px-3"><StatusBadge status={p.verification_status || 'VERIFIED'} size="sm" /></td>
                <td className="py-3.5 px-3 text-right">
                  <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-xs">
                    Inspect Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
