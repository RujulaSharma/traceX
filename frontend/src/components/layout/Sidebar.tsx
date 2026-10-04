import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  ListFilter,
  AlertTriangle,
  GitMerge,
  HelpCircle,
} from 'lucide-react';

const navigation = [
  { name: 'SOC Overview', href: '/soc', icon: LayoutDashboard },
  { name: 'Log Ingestion', href: '/ingestion', icon: UploadCloud },
  { name: 'Event Explorer', href: '/events', icon: ListFilter },
  { name: 'Detections', href: '/detections', icon: AlertTriangle },
  { name: 'Incidents & Graph', href: '/incidents', icon: GitMerge },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/50 backdrop-blur-md flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Investigation Console
        </div>

        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 m-3 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Hackathon Demo Guide</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          1. Upload sample log scenario<br />
          2. Run rule detections<br />
          3. Reconstruct multi-stage attack incident graph
        </p>
      </div>
    </aside>
  );
};
