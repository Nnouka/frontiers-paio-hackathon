import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Stethoscope, 
  ArrowRight, 
  ArrowLeft,
  FileText,
  AlertCircle
} from 'lucide-react';
import { usePharmaLoopStore } from '../../../services/store';
import { StatusBadge } from '../../../components/shared/StatusBadge';

export const SafetyCheckOutcome: React.FC = () => {
  const navigate = useNavigate();
  const { clinicianCases } = usePharmaLoopStore();

  const currentCase = clinicianCases[0] || {
    id: "case-301",
    prescribedDrug: "Amoxicillin 500mg Capsules",
    existingRegimen: ["Warfarin 5mg Tablets"],
    severity: "SEVERE",
    status: "PENDING",
    submittedAt: "Just now",
    assignedClinician: "Dr. Patrick Ntaganda, MD"
  };

  const isApproved = currentCase.status === 'APPROVED' || currentCase.status === 'MODIFIED';
  const isRejected = currentCase.status === 'REJECTED';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/patient')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home Dashboard</span>
      </button>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              <Stethoscope className="w-4 h-4 text-[#00685f]" />
              <span>Clinician Safety Oversight Status</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
              Case #{currentCase.id} Review Outcome
            </h1>
          </div>

          <StatusBadge status={currentCase.status} />
        </div>

        {/* Status Body */}
        {currentCase.status === 'PENDING' ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-amber-950">
                  Case Escalated to Clinician Queue
                </h3>
                <p className="text-xs text-amber-800 mt-1">
                  High-risk interaction between <span className="font-bold">{currentCase.prescribedDrug}</span> and <span className="font-bold">{currentCase.existingRegimen.join(', ')}</span> requires human clinician review.
                </p>
              </div>
            </div>

            <div className="bg-white/80 p-4 rounded-xl border border-amber-200 text-xs space-y-2 text-amber-900">
              <div className="flex justify-between">
                <span className="font-mono text-slate-500">Assigned Clinician:</span>
                <span className="font-bold text-slate-900">{currentCase.assignedClinician || "Dr. Patrick Ntaganda, MD"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-slate-500">Submitted At:</span>
                <span className="font-semibold text-slate-800">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-slate-500">Target SLA:</span>
                <span className="font-mono font-bold text-amber-800">&lt; 15 minutes</span>
              </div>
            </div>

            <div className="bg-amber-100/60 p-3 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>You will receive an automated notification as soon as Dr. Patrick submits the review decision.</span>
            </div>
          </div>
        ) : isApproved ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-emerald-950">
                  Clinician Review Approved with Instructions
                </h3>
                <p className="text-xs text-emerald-800 mt-1">
                  Reviewed by <span className="font-bold">{currentCase.assignedClinician}</span> at {currentCase.reviewedAt ? new Date(currentCase.reviewedAt).toLocaleTimeString() : 'Recently'}.
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-800 uppercase">Doctor's Clinical Notes:</span>
              <p className="text-xs text-slate-700 font-medium italic">
                "{currentCase.reviewerNotes || "Approved with monitoring. Take Amoxicillin with meals and space doses 2 hours apart from iron supplements. Monitor for minor bleeding signs."}"
              </p>
            </div>

            <button
              onClick={() => navigate('/patient/schedule')}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Add to Active Schedule & Set Dose Alarms</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-rose-950">
                  Prescription Rejected by Clinician
                </h3>
                <p className="text-xs text-rose-800 mt-1">
                  {currentCase.assignedClinician} has deemed this medication unsafe alongside your current Warfarin therapy.
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-rose-200 text-xs text-slate-800 space-y-1">
              <span className="font-mono font-bold text-rose-800 uppercase">Reason:</span>
              <p>{currentCase.reviewerNotes || "Severe bleeding risk. Contact prescribing physician for alternative antimicrobial treatment."}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
