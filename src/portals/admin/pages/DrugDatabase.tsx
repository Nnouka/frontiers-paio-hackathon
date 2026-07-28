
import React, { useState } from 'react';
import { Database, Plus, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { usePharmaLoopStore } from '../../../services/store';
import { StatusBadge } from '../../../components/shared/StatusBadge';

export const DrugDatabase: React.FC = () => {
  const { drugInteractions } = usePharmaLoopStore();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-purple-700">
            <Database className="w-4 h-4" />
            <span>Drug Knowledgebase</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
            Drug Database & Interaction Rules (DDI Engine)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Active interaction rules evaluated by Gemini Multimodal Vision AI during label scanning.
          </p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs"
        >
          + Add New DDI Rule
        </button>
      </div>

      <div className="space-y-4">
        {drugInteractions.map(rule => (
          <div key={rule.id || rule.existingDrugName} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
                  DDI
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-base text-slate-900">
                      {rule.existingDrugName} + {rule.newDrugName}
                    </h3>
                    <StatusBadge status={rule.severity} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Requires Clinician Escalation: {rule.requiresConfirmation ? 'Mandatory Gate' : 'Warning Alert'}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900">Mechanism & Description:</span> {rule.description}
            </p>

            <div className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 font-medium">
              <span className="font-bold">System Recommendation:</span> {rule.recommendation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
