import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Stethoscope, 
  ArrowLeft, 
  FileText, 
  AlertTriangle,
  Sparkles,
  Pill,
  Check
} from 'lucide-react';
import { usePharmaLoopStore, store } from '../../../services/store';
import { GeminiGlassCard } from '../../../components/shared/GeminiGlassCard';
import { StatusBadge } from '../../../components/shared/StatusBadge';

export const CaseDetailReview: React.FC = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { clinicianCases } = usePharmaLoopStore();

  const caseData = clinicianCases.find(c => c.id === caseId) || clinicianCases[0];

  const [decision, setDecision] = useState<'APPROVED' | 'MODIFIED' | 'REJECTED'>('APPROVED');
  const [notes, setNotes] = useState(
    "Approved with monitoring instruction. Spacing doses 2 hours apart from iron supplements and advising INR check in 48 hours."
  );

  const handleSubmitDecision = (e: React.FormEvent) => {
    e.preventDefault();
    store.reviewClinicianCase(caseData.id, decision, notes, "Dr. Patrick Ntaganda, MD");
    alert(`✅ Case #${caseData.id} marked ${decision}! Patient notified in app.`);
    navigate('/clinician/resolved');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/clinician')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Review Queue</span>
      </button>

      {/* Case Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            <Stethoscope className="w-4 h-4 text-[#00685f]" />
            <span>Escalation Case Detail</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
            Clinical Safety Review: Case #{caseData.id}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Patient: <span className="font-bold text-slate-800">{caseData.patientName}</span> ({caseData.patientAge}y, {caseData.patientGender}) • ID: {caseData.patientId}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={caseData.severity} />
          <StatusBadge status={caseData.status} />
        </div>
      </div>

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Gemini OCR Extraction vs Active Regimen */}
        <div className="space-y-6">
          <GeminiGlassCard
            title="Extracted Prescription Entity (Gemini OCR)"
            subtitle="Scanned from purchased pill bottle label"
            confidence={caseData.extractedEntity?.rawTextConfidence || 0.98}
          >
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-indigo-100">
                <span className="text-slate-400 font-mono">Prescribed Drug</span>
                <div className="font-heading font-bold text-base text-indigo-950 mt-0.5">
                  {caseData.prescribedDrug}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <span className="text-slate-400 font-mono">Dosage Instruction</span>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {caseData.extractedEntity?.dosage_instruction || "1 capsule 3x daily for 7 days"}
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <span className="text-slate-400 font-mono">Quantity / Duration</span>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {caseData.extractedEntity?.total_quantity || 21} Qty ({caseData.extractedEntity?.duration_days || 7} Days)
                  </div>
                </div>
              </div>
            </div>
          </GeminiGlassCard>

          {/* Active Patient Regimen */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-heading font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
              Patient Active Medication Regimen
            </h3>

            <div className="space-y-2 text-xs">
              {caseData.existingRegimen.map((med, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-teal-700" />
                    <span className="font-bold text-slate-900">{med}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pharmacological Interaction & Clinician Form */}
        <div className="space-y-6">
          <div className="bg-red-50 border-2 border-red-300 p-6 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-red-900 font-heading font-bold text-base">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <span>Pharmacological Mechanism & DDI Assessment</span>
            </div>

            <p className="text-xs text-red-800">
              {caseData.ddiDetails?.description || caseData.interactionSummary}
            </p>

            <div className="bg-white/80 p-3 rounded-xl border border-red-200 text-xs space-y-1">
              <span className="font-mono font-bold text-red-900 uppercase">Clinical Evidence & Recommendation:</span>
              <p className="text-slate-800 font-medium">
                {caseData.ddiDetails?.recommendation || "Assess bleeding history, verify INR levels, or consider alternative antimicrobial."}
              </p>
            </div>
          </div>

          {/* Clinician Decision Form */}
          <form onSubmit={handleSubmitDecision} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
              Submit Physician Review Decision
            </h3>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-slate-500 uppercase">Select Clinical Outcome:</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDecision('APPROVED')}
                  className={`p-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    decision === 'APPROVED' ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('MODIFIED')}
                  className={`p-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    decision === 'MODIFIED' ? 'bg-amber-600 text-white border-amber-700 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" /> Modify Dose
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('REJECTED')}
                  className={`p-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    decision === 'REJECTED' ? 'bg-rose-600 text-white border-rose-700 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block font-mono font-bold text-slate-500 uppercase">Doctor's Clinical Notes & Patient Instructions:</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#00685f]/30"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#00685f] hover:bg-[#005049] text-white font-heading font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Submit Review Decision</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
