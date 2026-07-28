import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Building2, 
  Stethoscope, 
  Users, 
  Database, 
  FileText,
  Activity,
  ArrowRight
} from 'lucide-react';
import { usePharmaLoopStore } from '../../../services/store';
import { StatCard } from '../../../components/shared/StatCard';
import { StatusBadge } from '../../../components/shared/StatusBadge';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { pharmacies, clinicianCases, systemUsers, auditLogs, drugInteractions } = usePharmaLoopStore();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-purple-700">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Platform Governance & Compliance</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
            PharmaLoop Central Admin Console
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global monitoring of verified pharmacy inventory webhooks, clinician credential verification, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-600" /> All Services Operational
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Registered Users" value={systemUsers.length} subtitle="Patients & Providers" icon={Users} color="indigo" />
        <StatCard title="Verified Pharmacies" value={pharmacies.length} subtitle="Live Geohash Search" icon={Building2} color="teal" />
        <StatCard title="Escalated DDI Cases" value={clinicianCases.length} subtitle="Handled by Clinicians" icon={Stethoscope} color="amber" />
        <StatCard title="Active DDI Rules" value={drugInteractions.length} subtitle="Gemini Vision Safety Rules" icon={Database} color="emerald" />
      </div>

      {/* Real-time System Audit Stream */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900">Live System Audit Trail Stream</h3>
            <p className="text-xs text-slate-500">Immutable log of security, hold reservations, and clinical intervention events</p>
          </div>
          <button 
            onClick={() => navigate('/admin/audit')}
            className="text-xs font-semibold text-purple-700 hover:underline"
          >
            View Full Audit Log →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Event Action</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{log.actor}</td>
                  <td className="py-3 px-3 font-mono text-[11px] font-bold text-slate-700">{log.actorRole}</td>
                  <td className="py-3 px-3 font-mono text-purple-900 font-bold">{log.action}</td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
