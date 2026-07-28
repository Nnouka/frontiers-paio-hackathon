import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Pill, 
  User, 
  Building2, 
  Stethoscope, 
  ShieldCheck, 
  Activity,
  Layers
} from 'lucide-react';
import { usePharmaLoopStore, store } from '../../services/store';
import type { UserRole } from '@shared/types/contracts';

export const HeaderNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activePortalRole } = usePharmaLoopStore();

  const handlePortalSwitch = (role: UserRole, path: string) => {
    store.setPortalRole(role);
    navigate(path);
  };

  const portalButtons: { role: UserRole; label: string; icon: any; path: string; color: string }[] = [
    { role: 'PATIENT', label: 'Patient Companion', icon: User, path: '/patient', color: 'text-teal-700 bg-teal-50 border-teal-200' },
    { role: 'PHARMACY', label: 'Pharmacy Portal', icon: Building2, path: '/pharmacy', color: 'text-amber-800 bg-amber-50 border-amber-200' },
    { role: 'CLINICIAN', label: 'Clinician Queue', icon: Stethoscope, path: '/clinician', color: 'text-slate-800 bg-slate-100 border-slate-300' },
    { role: 'ADMIN', label: 'System Admin', icon: ShieldCheck, path: '/admin', color: 'text-purple-800 bg-purple-50 border-purple-200' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/patient')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00685f] to-[#0d9488] flex items-center justify-center text-white shadow-md shadow-teal-700/20">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-lg text-slate-900 tracking-tight">PharmaLoop</h1>
              <span className="bg-teal-100 text-[#00685f] font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200">
                CLOSED-LOOP AI
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Rx Stock Search • Gemini OCR • Safety Oversight • Adherence</p>
          </div>
        </div>

        {/* Live Demo Fast Portal Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
          <div className="px-2 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden lg:block">
            Portal Switcher:
          </div>
          {portalButtons.map((p) => {
            const Icon = p.icon;
            const isActive = location.pathname.startsWith(p.path);

            return (
              <button
                key={p.role}
                onClick={() => handlePortalSwitch(p.role, p.path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive 
                    ? `${p.color} border shadow-xs font-bold` 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
