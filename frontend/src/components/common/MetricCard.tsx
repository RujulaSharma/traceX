import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  colorScheme?: 'cyan' | 'red' | 'amber' | 'emerald' | 'indigo';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  colorScheme = 'cyan',
  onClick,
}) => {
  const schemeMap = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/50',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      glow: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    },
    red: {
      border: 'border-red-500/20 hover:border-red-500/50',
      iconBg: 'bg-red-500/10 text-red-400',
      glow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/50',
      iconBg: 'bg-amber-500/10 text-amber-400',
      glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    },
    indigo: {
      border: 'border-indigo-500/20 hover:border-indigo-500/50',
      iconBg: 'bg-indigo-500/10 text-indigo-400',
      glow: 'hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]',
    },
  };

  const scheme = schemeMap[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl bg-slate-900/80 backdrop-blur-md p-5 border transition-all duration-200 ${
        scheme.border
      } ${scheme.glow} ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-lg ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trendPositive ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};
