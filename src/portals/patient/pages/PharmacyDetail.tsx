import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft,
  Pill
} from 'lucide-react';
import { usePharmaLoopStore } from '../../../services/store';
import { StatusBadge } from '../../../components/shared/StatusBadge';

export const PharmacyDetail: React.FC = () => {
  const { pharmacyId } = useParams();
  const navigate = useNavigate();
  const { pharmacies, holds } = usePharmaLoopStore();

  const pharmacy = pharmacies.find(p => p.id === pharmacyId) || pharmacies[0];
  const activeHold = holds.find(h => h.pharmacyId === pharmacy.id && h.status === 'ACTIVE') || holds[0];

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(3300); // 55 minutes left

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/patient/locate')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Stock Search</span>
      </button>

      {/* Pharmacy Overview Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900">{pharmacy.name}</h1>
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          </div>
          <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4 text-slate-400" />
            {pharmacy.address}
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            {pharmacy.phone} • Open Today 08:00 - 22:00
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <a
            href={`tel:${pharmacy.phone}`}
            className="flex-1 md:flex-none text-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-all"
          >
            Call Pharmacy
          </a>
          <button className="flex-1 md:flex-none px-4 py-2.5 bg-[#00685f] hover:bg-[#005049] text-white font-semibold text-xs rounded-xl shadow-xs transition-all">
            Get Directions
          </button>
        </div>
      </div>

      {/* Active Reservation Ticket Card */}
      {activeHold && (
        <div className="bg-gradient-to-br from-[#00685f] to-[#0d9488] rounded-2xl p-6 text-white shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-teal-500/50 pb-4">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-teal-200">
                Guaranteed Hold Ticket
              </span>
              <h2 className="font-heading font-bold text-xl mt-0.5">Reservation #{activeHold.holdId}</h2>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-right">
              <div className="text-[10px] uppercase font-mono text-teal-200">Timer Remaining</div>
              <div className="font-mono font-bold text-lg text-amber-300">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2 space-y-2">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15">
                <div className="text-xs text-teal-200 font-mono">Reserved Medication</div>
                <div className="font-heading font-bold text-lg mt-0.5">{activeHold.medicationName}</div>
                <div className="text-xs text-teal-100 mt-1">
                  Quantity: {activeHold.quantity} Unit(s) • Reserved for {activeHold.patientName || 'Amina Mugisha'}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-teal-100 bg-white/5 p-3 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Show this QR code or 4-digit pickup PIN to the pharmacist upon arrival.</span>
              </div>
            </div>

            {/* QR Code Graphic */}
            <div className="bg-white p-4 rounded-xl text-slate-900 flex flex-col items-center justify-center text-center shadow-lg">
              <QrCode className="w-24 h-24 text-slate-900" />
              <span className="font-mono font-bold text-sm text-slate-800 mt-2">PIN: 8841</span>
              <span className="text-[10px] text-slate-500 font-mono">SCAN AT POS TERMINAL</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
