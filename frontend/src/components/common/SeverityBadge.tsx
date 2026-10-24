import React from 'react';

interface SeverityBadgeProps {
  severity: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '', size = 'md' }) => {
  const norm = (severity || 'info').toLowerCase();

  const colors: Record<string, string> = {
    critical: 'bg-red-50 text-red-700 border-red-200 shadow-sm',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-blue-50 text-blue-700 border-blue-200',
    info: 'bg-purple-50 text-purple-700 border-purple-200',
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
