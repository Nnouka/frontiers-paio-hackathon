import React from 'react';
import { Users } from 'lucide-react';
import { usePharmaLoopStore } from '../../../services/store';
import { StatusBadge } from '../../../components/shared/StatusBadge';

export const UserManagement: React.FC = () => {
  const { systemUsers } = usePharmaLoopStore();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
          <Users className="w-4 h-4 text-purple-700" />
          <span>User Directory</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
          Patient & User Account Directory
        </h1>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
              <th className="py-3 px-3">User ID</th>
              <th className="py-3 px-3">Full Name</th>
              <th className="py-3 px-3">Email Address</th>
              <th className="py-3 px-3">Role</th>
              <th className="py-3 px-3">Account Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {systemUsers.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-3 font-mono text-slate-500">{u.id}</td>
                <td className="py-3.5 px-3 font-semibold text-slate-900">{u.name}</td>
                <td className="py-3.5 px-3 text-slate-600 font-mono">{u.email}</td>
                <td className="py-3.5 px-3 font-mono font-bold text-slate-800">{u.role}</td>
                <td className="py-3.5 px-3"><StatusBadge status={u.status} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
