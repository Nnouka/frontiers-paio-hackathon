import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight, 
  Cpu, 
  FileText,
  AlertTriangle,
  Pill
} from 'lucide-react';
import { GeminiGlassCard } from '../../../components/shared/GeminiGlassCard';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { store } from '../../../services/store';

export const ScanReview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sampleType = searchParams.get('sample') || 'severe';

  const isSevere = sampleType === 'severe';

  const extractedData = isSevere ? {
    drug_name: "Amoxicillin 500mg Capsules",
    generic_name: "Amoxicillin",
    dosage_strength: "500mg",
    form: "Capsule",
    dosage_instruction: "Take 1 capsule 3 times daily after meals",
    duration_days: 7,
    total_quantity: 21,
    warnings: ["Complete full 7-day course", "Severe interaction with anticoagulant therapy"],
    confidence: 0.98
  } : {
    drug_name: "Atorvastatin 20mg Tablets",
    generic_name: "Atorvastatin",
    dosage_strength: "20mg",
    form: "Tablet",
    dosage_instruction: "Take 1 tablet once daily at bedtime",
    duration_days: 30,
    total_quantity: 30,
    warnings: ["Avoid large quantities of grapefruit juice"],
    confidence: 0.96
  };

  const handleEscalateToClinician = () => {
    store.submitDDICase(
      "Amina Mugisha",
      extractedData.drug_name,
      "SEVERE",
      "Concurrent administration of Amoxicillin and Warfarin increases bleeding risk due to gut flora alteration affecting Vitamin K synthesis."
    );
    navigate('/patient/scan/outcome?status=pending');
  };

  const handleApproveAndAddSchedule = () => {
    navigate('/patient/schedule');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-indigo-700">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Gemini OCR Entity Review</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
              Structured Prescription Extraction & DDI Check
            </h1>
          </div>

          <StatusBadge 
            status={isSevere ? 'SEVERE_ALERT' : 'APPROVED'} 
            label={isSevere ? 'Severe DDI Detected' : 'Safety Check Passed'} 
          />
        </div>
      </div>

      {/* Structured OCR Gemini Glass Card */}
      <GeminiGlassCard 
        title="Multimodal Vision OCR Output"
        subtitle="Parsed structured entity from pill bottle scan"
        confidence={extractedData.confidence}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Extracted Fields */}
          <div className="space-y-2 text-xs">
            <div className="bg-white/80 p-3 rounded-xl border border-indigo-100">
              <span className="text-slate-500 font-mono">Drug Name</span>
              <div className="font-heading font-bold text-sm text-slate-900 mt-0.5">{extractedData.drug_name}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/80 p-3 rounded-xl border border-indigo-100">
                <span className="text-slate-500 font-mono">Dosage & Form</span>
                <div className="font-semibold text-slate-800 mt-0.5">{extractedData.dosage_strength} ({extractedData.form})</div>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-indigo-100">
                <span className="text-slate-500 font-mono">Duration / Qty</span>
                <div className="font-semibold text-slate-800 mt-0.5">{extractedData.duration_days} days ({extractedData.total_quantity} Qty)</div>
              </div>
            </div>
          </div>

          {/* Instructions & Warnings */}
          <div className="space-y-2 text-xs">
            <div className="bg-white/80 p-3 rounded-xl border border-indigo-100">
              <span className="text-slate-500 font-mono">Dosage Instruction</span>
              <div className="font-semibold text-slate-800 mt-0.5">{extractedData.dosage_instruction}</div>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-indigo-100">
              <span className="text-slate-500 font-mono">Label Warnings</span>
              <ul className="list-disc list-inside text-slate-700 mt-0.5 space-y-0.5">
                {extractedData.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </GeminiGlassCard>

      {/* Drug-Drug Interaction Safety Evaluation */}
      {isSevere ? (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg text-red-950">Severe Drug Interaction Detected</h3>
                <span className="bg-red-200 text-red-900 font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  MANDATORY CLINICIAN GATE
                </span>
              </div>
              <p className="text-xs text-red-800 mt-1">
                Gemini DDI engine matched <span className="font-bold">{extractedData.drug_name}</span> against your active medication <span className="font-bold">Warfarin 5mg Tablets</span>.
              </p>
              <p className="text-xs text-red-700 mt-2 bg-red-100/80 p-3 rounded-xl border border-red-200 font-mono">
                "Amoxicillin alters intestinal flora synthesizing Vitamin K, increasing Warfarin bioavailability and leading to elevated INR bleeding risk."
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              onClick={handleEscalateToClinician}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-heading font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Escalate to Clinician (Dr. Patrick Review Queue)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-emerald-950">Safety Check Cleared</h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                No adverse drug-drug interactions detected between <span className="font-bold">{extractedData.drug_name}</span> and your existing regimen.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={handleApproveAndAddSchedule}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>Add to Active Schedule & Set Reminders</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
