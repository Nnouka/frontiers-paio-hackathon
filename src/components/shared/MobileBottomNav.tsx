import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Scan, 
  Clock, 
  User 
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const navItems = [
    { label: 'Home', path: '/patient', icon: Home, end: true },
    { label: 'Locate Stock', path: '/patient/locate', icon: Search },
    { label: 'Scan & Verify', path: '/patient/scan', icon: Scan },
    { label: 'Schedule', path: '/patient/schedule', icon: Clock },
    { label: 'Profile', path: '/patient/profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3 flex items-center justify-around md:hidden shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[11px] font-medium transition-all ${
                isActive ? 'text-[#00685f] font-bold' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <div className="p-1 rounded-full">
              <Icon className="w-5 h-5" />
            </div>
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
