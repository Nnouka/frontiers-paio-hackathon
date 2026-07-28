import React from 'react';
import { FileText, Shield } from 'lucide-react';
import { usePharmaLoopStore } from '../../../services/store';

export const AuditLogs: React.FC = () => {
  const { auditLogs } = usePharmaLoopStore();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#00685f]">
          <FileText className="w-4 h-4" />
          <span>Security Audit Trail</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
          System Audit Logs
        </h1>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
              <th className="py-3 px-3">Log ID</th>
              <th className="py-3 px-3">Timestamp</th>
              <th className="py-3 px-3">Actor</th>
              <th className="py-3 px-3">Role</th>
              <th className="py-3 px-3">Event Action</th>
              <th className="py-3 px-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-3 font-mono text-slate-400">{log.id}</td>
                <td className="py-3.5 px-3 font-mono text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</td>
                <td className="py-3.5 px-3 font-semibold text-slate-900">{log.actor}</td>
                <td className="py-3.5 px-3 font-mono font-bold text-slate-700">{log.actorRole}</td>
                <td className="py-3.5 px-3 font-mono font-bold text-purple-800">{log.action}</td>
                <td className="py-3.5 px-3 text-slate-600">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
