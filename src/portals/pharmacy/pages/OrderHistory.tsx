import React from 'react';
import { History, CheckCircle2, FileText } from 'lucide-react';
import { StatusBadge } from '../../../components/shared/StatusBadge';

export const OrderHistory: React.FC = () => {
  const sampleOrders = [
    { id: "ORD-9901", date: "2026-07-28 10:15", patient: "Jean Claude N.", item: "Amoxicillin 500mg", qty: 1, total: 12.50, status: "FULFILLED" },
    { id: "ORD-9892", date: "2026-07-27 16:40", patient: "Amina Mugisha", item: "Metformin 850mg", qty: 2, total: 36.00, status: "FULFILLED" },
    { id: "ORD-9850", date: "2026-07-26 14:10", patient: "Patrick K.", item: "Atorvastatin 20mg", qty: 1, total: 24.00, status: "FULFILLED" }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
          <History className="w-4 h-4" />
          <span>Fulfillment Audit Trail</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
          Pharmacy Order & Pickup History
        </h1>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
              <th className="py-3 px-3">Order ID</th>
              <th className="py-3 px-3">Date & Time</th>
              <th className="py-3 px-3">Patient</th>
              <th className="py-3 px-3">Item Fulfilled</th>
              <th className="py-3 px-3">Qty</th>
              <th className="py-3 px-3">Total Amount</th>
              <th className="py-3 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sampleOrders.map(o => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{o.id}</td>
                <td className="py-3.5 px-3 text-slate-500 font-mono">{o.date}</td>
                <td className="py-3.5 px-3 font-semibold text-slate-900">{o.patient}</td>
                <td className="py-3.5 px-3 text-slate-800">{o.item}</td>
                <td className="py-3.5 px-3 font-mono">{o.qty}</td>
                <td className="py-3.5 px-3 font-mono font-bold text-slate-900">${o.total.toFixed(2)}</td>
                <td className="py-3.5 px-3"><StatusBadge status={o.status} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
