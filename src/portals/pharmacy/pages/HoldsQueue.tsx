import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  User, 
  Phone 
} from 'lucide-react';
import { usePharmaLoopStore } from '../../../services/store';
import { StatusBadge } from '../../../components/shared/StatusBadge';

export const HoldsQueue: React.FC = () => {
  const { holds } = usePharmaLoopStore();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-700">
          <Clock className="w-4 h-4" />
          <span>Patient Reservation System</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
          Holds & 60-Minute Reservations Queue
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Patients who place a hold have stock guaranteed for 60 minutes. Confirm QR code or 4-digit PIN upon arrival.
        </p>
      </div>

      <div className="space-y-4">
        {holds.map((hold) => (
          <div key={hold.holdId} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-base text-slate-900">Hold Ticket #{hold.holdId}</h3>
                    <StatusBadge status={hold.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Created at {new Date(hold.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 font-mono text-xs text-amber-800 font-bold">
                Expiration: {new Date(hold.expiresAt).toLocaleTimeString()}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl">
              <div>
                <span className="text-slate-500 font-mono">Reserved Item</span>
                <div className="font-heading font-bold text-sm text-slate-900 mt-0.5">{hold.medicationName}</div>
                <div className="text-slate-600">Quantity: {hold.quantity} Package(s)</div>
              </div>

              <div>
                <span className="text-slate-500 font-mono">Patient Details</span>
                <div className="font-semibold text-slate-900 mt-0.5">{hold.patientName || 'Amina Mugisha'}</div>
                <div className="text-slate-600">{hold.patientPhone || '+250 788 123 456'}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button 
                onClick={() => alert(`Hold #${hold.holdId} cancelled.`)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Cancel Hold
              </button>
              <button 
                onClick={() => alert(`✅ Hold #${hold.holdId} Fulfilled! Invoice generated.`)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Fulfill Pickup</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
