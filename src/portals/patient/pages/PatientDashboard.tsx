import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Scan, 
  Clock, 
  ShieldAlert, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Pill,
  Sparkles
} from 'lucide-react';
import { usePharmaLoopStore, store } from '../../../services/store';
import { StageRing } from '../../../components/shared/StageRing';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { GeminiGlassCard } from '../../../components/shared/GeminiGlassCard';

export const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { medications, holds, clinicianCases } = usePharmaLoopStore();

  const activeHold = holds.find(h => h.status === 'ACTIVE');
  const pendingCase = clinicianCases.find(c => c.status === 'PENDING');

  // Calculate adherence compliance %
  const totalDoses = medications.reduce((acc, m) => acc + (m.schedule?.length || 0), 0);
  const takenDoses = medications.reduce((acc, m) => acc + (m.schedule?.filter(s => s.status === 'TAKEN').length || 0), 0);
  const compliance = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 85;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stage Ring */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00685f]">
              Welcome Back, Amina
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
            Medication Adherence Companion
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time pharmacy stock lookup, Gemini AI OCR label scanning, and clinician safety oversight.
          </p>
        </div>

        {/* 5-Segment Stage Ring */}
        <StageRing currentStage={activeHold ? 2 : pendingCase ? 3 : 4} size="md" />
      </div>

      {/* Pending Safety Check Alert Banner if DDI Review active */}
      {pendingCase && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-sm text-amber-950">Safety Check Escalated to Clinician</h3>
                <StatusBadge status="SEVERE_ALERT" label="Pending Dr. Review" size="sm" />
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Potential interaction detected between <span className="font-semibold">{pendingCase.prescribedDrug}</span> and your regimen ({pendingCase.existingRegimen.join(', ')}). Dr. Patrick is reviewing your file.
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/patient/scan/outcome')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>View Safety Status</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Action 1: Stock Search */}
        <div 
          onClick={() => navigate('/patient/locate')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00685f] group-hover:bg-[#00685f] group-hover:text-white flex items-center justify-center transition-all mb-3">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-[#00685f] transition-all">
            Locate & Reserve Stock
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Search real-time pharmacy inventory nearby and lock a 60-minute reservation hold.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-[#00685f] gap-1">
            <span>Find Medication Nearby</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Action 2: Gemini OCR Scan */}
        <div 
          onClick={() => navigate('/patient/scan')}
          className="bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 p-5 rounded-2xl border border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-300 mb-3">
            <Scan className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-indigo-700 transition-all">
              Scan & Verify Label
            </h3>
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Use Gemini Multimodal Vision AI to read bottle labels and automatically verify drug-drug interaction safety.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-indigo-700 gap-1">
            <span>Start Multimodal Scan</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Action 3: Adherence Schedule */}
        <div 
          onClick={() => navigate('/patient/schedule')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-slate-700 transition-all">
              Schedule & Reminders
            </h3>
            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              {compliance}% Adherence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track daily doses, log taken medications, and set adaptive routine reminders.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-slate-700 gap-1">
            <span>View Full Schedule</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Active Reservation Hold Card (if any) */}
      {activeHold && (
        <div className="bg-white p-5 rounded-2xl border border-teal-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#00685f] flex items-center justify-center shrink-0 border border-teal-100">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-teal-800 uppercase tracking-wider">
                  Active Reservation Hold (#{activeHold.holdId})
                </span>
                <StatusBadge status="RESERVED" />
              </div>
              <h4 className="font-heading font-bold text-base text-slate-900 mt-0.5">
                {activeHold.medicationName} (Qty: {activeHold.quantity})
              </h4>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                Central Care Pharmacy • Hold Expires in ~45 mins
              </p>
            </div>
          </div>

          <button 
            onClick={() => navigate(`/patient/pharmacy/${activeHold.pharmacyId}`)}
            className="px-4 py-2 bg-[#00685f] hover:bg-[#005049] text-white font-semibold text-xs rounded-xl shadow-xs transition-all w-full sm:w-auto"
          >
            Show Hold QR & Pickup Code
          </button>
        </div>
      )}

      {/* Today's Schedule & Medications */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900">Today's Medication Doses</h3>
            <p className="text-xs text-slate-500">Tap to confirm dose intake and update remaining count</p>
          </div>
          <button 
            onClick={() => navigate('/patient/schedule')}
            className="text-xs font-semibold text-[#00685f] hover:underline"
          >
            Manage Regimen →
          </button>
        </div>

        <div className="space-y-3">
          {medications.map((med) => (
            <div key={med.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4 hover:border-slate-300 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-teal-700 shadow-xs">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-slate-900">{med.medication_name}</h4>
                  <p className="text-xs text-slate-500">{med.dosage}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-mono text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded-md">
                      {med.remaining_quantity} remaining
                    </span>
                    {med.remaining_quantity <= 5 && (
                      <span className="text-[11px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        Low Refill Warning
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (med.schedule && med.schedule[0]) {
                    store.logDoseTaken(med.id, med.schedule[0].scheduledTime);
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  med.schedule && med.schedule[0]?.status === 'TAKEN'
                    ? 'bg-emerald-100 text-emerald-800 cursor-default'
                    : 'bg-[#00685f] hover:bg-[#005049] text-white shadow-xs'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{med.schedule && med.schedule[0]?.status === 'TAKEN' ? 'Dose Taken' : 'Mark Taken'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
