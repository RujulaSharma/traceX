import React from 'react';

interface SeverityBadgeProps {
  severity: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '', size = 'md' }) => {
  const norm = (severity || 'info').toLowerCase();

  const colors: Record<string, string> = {
    critical: 'bg-red-950/80 text-red-400 border-red-700/60 shadow-[0_0_12px_rgba(239,68,68,0.25)]',
    high: 'bg-orange-950/80 text-orange-400 border-orange-700/60',
    medium: 'bg-amber-950/80 text-amber-400 border-amber-700/60',
    low: 'bg-blue-950/80 text-blue-400 border-blue-700/60',
    info: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
  };

  const sizeClasses: Record<string, string> = {
    sm: 'text-[10px] px-1.5 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-bold',
  };

  const colorClass = colors[norm] || colors.info;
  const sizeClass = sizeClasses[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border uppercase tracking-wider ${colorClass} ${sizeClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {norm}
    </span>
  );
};
