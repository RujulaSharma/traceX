import React from 'react';

interface RiskGaugeProps {
  score: number;
  size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, size = 120 }) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return '#ef4444'; // Red (Critical)
    if (s >= 60) return '#f97316'; // Orange (High)
    if (s >= 40) return '#f59e0b'; // Amber (Medium)
    if (s >= 20) return '#06b6d4'; // Cyan (Low)
    return '#10b981'; // Green (Minimal)
  };

  const color = getColor(score);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-black tracking-tight" style={{ color }}>
          {score}
        </span>
        <span className="text-[10px] uppercase font-semibold text-slate-400">Risk</span>
      </div>
    </div>
  );
};
