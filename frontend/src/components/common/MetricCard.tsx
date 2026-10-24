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
      border: 'border-purple-200 hover:border-purple-400',
      iconBg: 'bg-purple-100 text-purple-700',
      glow: 'hover:shadow-[0_8px_25px_rgba(139,92,246,0.15)]',
    },
    red: {
      border: 'border-red-200 hover:border-red-400',
      iconBg: 'bg-red-50 text-red-600',
      glow: 'hover:shadow-[0_8px_25px_rgba(239,68,68,0.12)]',
    },
    amber: {
      border: 'border-amber-200 hover:border-amber-400',
      iconBg: 'bg-amber-50 text-amber-600',
      glow: 'hover:shadow-[0_8px_25px_rgba(245,158,11,0.12)]',
    },
    emerald: {
      border: 'border-emerald-200 hover:border-emerald-400',
      iconBg: 'bg-emerald-50 text-emerald-600',
      glow: 'hover:shadow-[0_8px_25px_rgba(16,185,129,0.12)]',
    },
    indigo: {
      border: 'border-indigo-200 hover:border-indigo-400',
      iconBg: 'bg-indigo-50 text-indigo-600',
      glow: 'hover:shadow-[0_8px_25px_rgba(99,102,241,0.12)]',
    },
  };

  const scheme = schemeMap[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl bg-white shadow-sm p-5 border transition-all duration-200 ${
        scheme.border
      } ${scheme.glow} ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-lg ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trendPositive ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};
