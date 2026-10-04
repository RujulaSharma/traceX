import React from 'react';
import { AttackStage } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';
import { Crosshair, KeyRound, ShieldAlert, Zap, Database, ArrowRight } from 'lucide-react';

interface AttackStagesProps {
  stages: AttackStage[];
}

export const AttackStages: React.FC<AttackStagesProps> = ({ stages }) => {
  const getStageIcon = (stageName: string) => {
    switch (stageName) {
      case 'Reconnaissance':
        return <Crosshair className="w-5 h-5 text-amber-400" />;
      case 'Credential Access':
        return <KeyRound className="w-5 h-5 text-orange-400" />;
      case 'Initial Access':
        return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case 'Privilege Escalation':
        return <Zap className="w-5 h-5 text-purple-400" />;
      case 'Data Access & Impact':
        return <Database className="w-5 h-5 text-rose-400" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-cyan-400" />;
    }
  };

  if (!stages || stages.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 rounded-xl bg-slate-900/50 border border-slate-800">
        No progressive attack stages correlated for this incident.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Kill Chain Progression ({stages.length} Stages Identified)
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stages.map((stage, idx) => (
          <div
            key={idx}
            className="relative flex flex-col justify-between p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 group-hover:border-cyan-500/50 transition">
                    {getStageIcon(stage.stage)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                      Stage {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-snug">{stage.title}</h4>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-2 line-clamp-2">{stage.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Findings:</span>
                <span className="font-bold text-slate-200">{stage.findings_count}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Events:</span>
                <span className="font-bold text-slate-200">{stage.event_count}</span>
              </div>

              <div className="flex items-center gap-1">
                {stage.severities.map((sev, sIdx) => (
                  <SeverityBadge key={sIdx} severity={sev} size="sm" />
                ))}
              </div>
            </div>

            {idx < stages.length - 1 && (
              <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-slate-950 border border-slate-800 text-slate-500">
                <ArrowRight className="w-3 h-3" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
