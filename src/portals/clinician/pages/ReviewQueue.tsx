import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Clock, 
  User, 
  Stethoscope, 
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { usePharmaLoopStore } from '../../../services/store';
import { StatusBadge } from '../../../components/shared/StatusBadge';

export const ReviewQueue: React.FC = () => {
  const navigate = useNavigate();
  const { clinicianCases } = usePharmaLoopStore();
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'SEVERE' | 'MODERATE'>('ALL');

  const pendingCases = clinicianCases.filter(c => {
    if (c.status !== 'PENDING') return false;
    if (severityFilter === 'ALL') return true;
    return c.severity === severityFilter;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            <Stethoscope className="w-4 h-4 text-[#00685f]" />
            <span>High-Risk DDI Escalation Queue</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
            Clinician Oversight Review Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated Gemini DDI flags requiring mandatory human physician review before prescription approval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSeverityFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${severityFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            All Pending ({clinicianCases.filter(c => c.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setSeverityFilter('SEVERE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${severityFilter === 'SEVERE' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800'}`}
          >
            Severe Only
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {pendingCases.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-heading font-bold text-lg text-slate-900">Review Queue Cleared</h3>
            <p className="text-xs text-slate-500">All escalated drug interaction cases have been reviewed.</p>
          </div>
        ) : (
          pendingCases.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-bold text-base text-slate-900">Case #{c.id}</h3>
                      <StatusBadge status={c.severity} />
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Submitted at {new Date(c.submittedAt).toLocaleTimeString()} • Target SLA &lt;15 mins
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/clinician/case/${c.id}`)}
                  className="px-4 py-2 bg-[#00685f] hover:bg-[#005049] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>Review Case Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="text-slate-500 font-mono">Patient</span>
                  <div className="font-heading font-bold text-sm text-slate-900 mt-0.5">
                    {c.patientName} ({c.patientAge}y, {c.patientGender})
                  </div>
                  <div className="text-slate-500 mt-0.5">ID: {c.patientId}</div>
                </div>

                <div>
                  <span className="text-slate-500 font-mono">New Prescribed Drug</span>
                  <div className="font-heading font-bold text-sm text-rose-700 mt-0.5">{c.prescribedDrug}</div>
                </div>

                <div>
                  <span className="text-slate-500 font-mono">Existing Regimen</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{c.existingRegimen.join(', ')}</div>
                </div>
              </div>

              <p className="text-xs text-slate-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                <span className="font-bold text-amber-900">DDI Flag Summary:</span> {c.interactionSummary}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
