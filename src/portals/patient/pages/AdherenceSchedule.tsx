import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Pill, 
  Calendar, 
  AlertCircle, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { usePharmaLoopStore, store } from '../../../services/store';
import { StatCard } from '../../../components/shared/StatCard';

export const AdherenceSchedule: React.FC = () => {
  const { medications } = usePharmaLoopStore();

  const totalScheduled = medications.reduce((acc, m) => acc + (m.schedule?.length || 0), 0);
  const totalTaken = medications.reduce((acc, m) => acc + (m.schedule?.filter(s => s.status === 'TAKEN').length || 0), 0);
  const compliance = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 88;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#00685f]">
            <Clock className="w-4 h-4" />
            <span>Adaptive Schedule & Alarms</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
            Daily Medication Schedule
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Adaptive dose reminders aligned to your personal routine (Breakfast 08:00, Dinner 20:00).
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center min-w-[160px]">
          <div className="text-xs font-mono font-bold text-emerald-800 uppercase">Adherence Score</div>
          <div className="font-heading font-extrabold text-3xl text-emerald-700 mt-0.5">{compliance}%</div>
          <div className="text-[10px] text-emerald-600 font-medium">Target: &gt;80%</div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard 
          title="Active Medications"
          value={medications.length}
          subtitle="Current prescribed courses"
          icon={Pill}
          color="teal"
        />
        <StatCard 
          title="Doses Taken Today"
          value={`${totalTaken} / ${totalScheduled}`}
          subtitle="Intake logs confirmed"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard 
          title="Refill Needed In"
          value="4 Days"
          subtitle="Warfarin 5mg Tablets"
          icon={Calendar}
          color="amber"
        />
      </div>

      {/* Daily Routine Anchors Timeline */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <h3 className="font-heading font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
          Today's Timeline (July 28, 2026)
        </h3>

        <div className="space-y-4">
          {/* Morning Anchor */}
          <div className="relative pl-6 border-l-2 border-teal-500 space-y-3">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#00685f] border-2 border-white" />
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#00685f] uppercase tracking-wider">
                Morning Anchor • 08:00 AM (Breakfast)
              </span>
            </div>

            {medications.filter(m => m.dosage.toLowerCase().includes('twice') || m.dosage.toLowerCase().includes('morning')).map(med => (
              <div key={med.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-sm text-slate-900">{med.medication_name}</h4>
                  <p className="text-xs text-slate-500">{med.dosage}</p>
                </div>

                <button
                  onClick={() => store.logDoseTaken(med.id, med.schedule?.[0]?.scheduledTime || "")}
                  className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Dose Taken</span>
                </button>
              </div>
            ))}
          </div>

          {/* Evening Anchor */}
          <div className="relative pl-6 border-l-2 border-slate-300 space-y-3 pt-4">
            <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-slate-400 border-2 border-white" />
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-600 uppercase tracking-wider">
                Evening Anchor • 20:00 PM (Dinner)
              </span>
            </div>

            {medications.map(med => (
              <div key={med.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-sm text-slate-900">{med.medication_name}</h4>
                  <p className="text-xs text-slate-500">{med.dosage}</p>
                  <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                    {med.remaining_quantity} remaining
                  </span>
                </div>

                <button
                  onClick={() => store.logDoseTaken(med.id, med.schedule?.[0]?.scheduledTime || "")}
                  className="px-4 py-2 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Intake</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
