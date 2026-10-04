import React from 'react';
import { IncidentExplanation, RiskFactor } from '../../types';
import { HelpCircle, AlertOctagon, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface NarrativeExplanationProps {
  explanation: IncidentExplanation;
  riskFactors: RiskFactor[];
}

export const NarrativeExplanation: React.FC<NarrativeExplanationProps> = ({
  explanation,
  riskFactors,
}) => {
  if (!explanation) return null;

  return (
    <div className="space-y-6">
      {/* 5-Step Explainable Narrative */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Deterministic Threat Narrative (Zero Hallucinations)
          </h3>
        </div>

        <div className="space-y-4 text-xs leading-relaxed">
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> 1. Initial Intrusion & What Happened
            </h4>
            <p className="text-slate-300 font-sans">{explanation.what_happened}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> 2. Why This Pattern Is Suspicious
            </h4>
            <p className="text-slate-300 font-sans">{explanation.why_suspicious}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-red-400 mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> 3. Subsequent Kill-Chain Progression
            </h4>
            <p className="text-slate-300 font-sans">{explanation.what_happened_next}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> 4. Direct Evidence Corroboration
            </h4>
            <p className="text-slate-300 font-sans">{explanation.evidence_summary}</p>
          </div>

          <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/40">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 5. Immediate Containment & Remediation Actions
            </h4>
            <p className="text-emerald-200 font-medium font-sans">{explanation.recommended_action}</p>
          </div>
        </div>
      </div>

      {/* Risk Factors Breakdown */}
      {riskFactors && riskFactors.length > 0 && (
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <AlertOctagon className="w-5 h-5 text-red-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Mathematical Risk Score Factor Breakdown
            </h3>
          </div>

          <div className="space-y-2">
            {riskFactors.map((rf, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{rf.factor}</span>
                  </div>
                  <p className="text-slate-400 pl-5">{rf.reason}</p>
                </div>
                <div className="px-2.5 py-1 rounded bg-red-950/80 border border-red-800 text-red-300 font-mono font-bold shrink-0 ml-3">
                  +{rf.score} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
