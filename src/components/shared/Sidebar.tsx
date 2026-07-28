import React from 'react';
import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

export interface SidebarNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string | number;
}

interface SidebarProps {
  title: string;
  subtitle: string;
  items: SidebarNavItem[];
  accentColor?: 'teal' | 'navy' | 'indigo' | 'purple';
}

export const Sidebar: React.FC<SidebarProps> = ({
  title,
  subtitle,
  items,
  accentColor = 'navy'
}) => {
  const accentClasses = {
    teal: 'bg-teal-50 border-teal-200 text-[#00685f]',
    navy: 'bg-slate-100 border-slate-300 text-slate-900',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900'
  }[accentColor];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between hidden md:flex">
      <div>
        <div className={`p-3 rounded-xl border mb-6 ${accentClasses}`}>
          <h2 className="font-heading font-bold text-sm tracking-tight">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#00685f] text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="font-mono text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-200 text-xs text-slate-400">
        <p className="font-mono">PharmaLoop v1.0.0</p>
        <p className="text-[10px]">Connected to Mock Data Engine</p>
      </div>
    </aside>
  );
};
