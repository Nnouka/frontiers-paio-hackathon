import React from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { usePharmaLoopStore } from '../../../services/store';
import { StatusBadge } from '../../../components/shared/StatusBadge';

export const ResolvedCases: React.FC = () => {
  const { clinicianCases } = usePharmaLoopStore();
  const resolved = clinicianCases.filter(c => c.status !== 'PENDING');

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Completed Clinical Interventions</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
          Resolved Safety Review Log
        </h1>
      </div>

      <div className="space-y-4">
        {resolved.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-base text-slate-900">Case #{c.id}</h3>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Patient: {c.patientName} • Reviewed by {c.assignedClinician || 'Dr. Patrick Ntaganda, MD'} at {c.reviewedAt ? new Date(c.reviewedAt).toLocaleTimeString() : 'Recently'}
                </p>
              </div>
            </div>

            <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl">
              <span className="font-mono font-bold text-slate-700">Prescribed Drug: {c.prescribedDrug}</span>
              <p className="text-slate-600 italic">"{c.reviewerNotes || 'Approved with monitoring instructions.'}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
