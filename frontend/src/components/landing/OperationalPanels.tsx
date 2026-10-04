import React, { useState, useEffect } from 'react';
import {
  Crosshair,
  ShieldAlert,
  KeyRound,
  Zap,
  Database,
  Globe,
  Radio,
  CheckCircle2,
} from 'lucide-react';

export const OperationalPanels: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(2); // 0 to 4

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 5);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const processingSteps = [
    { title: 'Ingesting logs...', detail: 'Validating CSV, JSON, NDJSON payloads' },
    { title: 'Running detection rules...', detail: 'Evaluating brute force & port scan' },
    { title: 'Correlating events...', detail: 'Clustering shared IPs & accounts' },
    { title: 'Reconstructing incidents...', detail: 'Calculating multi-factor risk score' },
    { title: 'Generating evidence...', detail: 'Building timeline & attack graph' },
  ];

  return (
    <section className="relative py-12 px-6 lg:px-12 max-w-7xl mx-auto z-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PANEL 1: LIVE PROCESSING */}
        <div className="rounded-2xl bg-[#06090e]/90 border border-emerald-900/40 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-white">
                  Live Processing
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                PIPELINE ACTIVE
              </span>
            </div>

            <div className="flex items-center gap-5">
              {/* Radar Sonar Visual */}
              <div className="relative w-24 h-24 rounded-full border border-emerald-500/40 flex items-center justify-center shrink-0">
                <div className="absolute inset-2 rounded-full border border-dashed border-emerald-500/30 animate-spin [animation-duration:12s]" />
                <div className="absolute inset-5 rounded-full border border-emerald-500/20" />
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <div className="absolute w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
                {/* Rotating scanner beam */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/20 via-transparent to-transparent animate-spin [animation-duration:3s]" />
              </div>

              {/* Stepped Process List */}
              <div className="space-y-1.5 flex-1 font-mono text-[11px]">
                {processingSteps.map((step, idx) => {
                  const isActive = idx === currentStep;
                  const isDone = idx < currentStep;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 transition-all ${
                        isActive
                          ? 'text-emerald-300 font-bold translate-x-1'
                          : isDone
                          ? 'text-emerald-500/70'
                          : 'text-slate-600'
                      }`}
                    >
                      {isActive ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      ) : isDone ? (
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-800 shrink-0" />
                      )}
                      <span className="truncate">{step.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Deterministic engine</span>
            <span className="text-emerald-500/80">Conceptual Public View</span>
          </div>
        </div>

        {/* PANEL 2: ATTACK KILL CHAIN */}
        <div className="rounded-2xl bg-[#06090e]/90 border border-emerald-900/40 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-white">
                  Attack Kill Chain
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                5 STAGES
              </span>
            </div>

            {/* Horizontal Flowing Timeline Line */}
            <div className="relative pt-4 pb-2">
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 -translate-y-1/2" />

              <div className="relative flex items-center justify-between">
                {/* Stage 1: Reconnaissance */}
                <div className="flex flex-col items-center group">
                  <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)] z-10">
                    <Crosshair className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 mt-2 font-mono">Recon</span>
                  <span className="text-[9px] font-mono text-emerald-400">T1595</span>
                </div>

                {/* Stage 2: Initial Access */}
                <div className="flex flex-col items-center group">
                  <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-orange-400 flex items-center justify-center text-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.4)] z-10">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 mt-2 font-mono">Initial</span>
                  <span className="text-[9px] font-mono text-orange-400">T1110</span>
                </div>

                {/* Stage 3: Credential Access */}
                <div className="flex flex-col items-center group">
                  <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)] z-10">
                    <KeyRound className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 mt-2 font-mono">Creds</span>
                  <span className="text-[9px] font-mono text-amber-400">T1078</span>
                </div>

                {/* Stage 4: Privilege Escalation */}
                <div className="flex flex-col items-center group">
                  <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-red-500 flex items-center justify-center text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)] z-10">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 mt-2 font-mono">PrivEsc</span>
                  <span className="text-[9px] font-mono text-red-400">T1068</span>
                </div>

                {/* Stage 5: Data Access */}
                <div className="flex flex-col items-center group">
                  <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)] z-10">
                    <Database className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 mt-2 font-mono">Exfil</span>
                  <span className="text-[9px] font-mono text-rose-400">T1041</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Aligned with MITRE ATT&CK</span>
            <span className="text-cyan-400">End-to-End Progression</span>
          </div>
        </div>

        {/* PANEL 3: THREAT INTELLIGENCE */}
        <div className="rounded-2xl bg-[#06090e]/90 border border-emerald-900/40 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-white">
                  Threat Intelligence
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                INDICATORS
              </span>
            </div>

            {/* IP Table */}
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-900">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-slate-200">185.23.91.44</span>
                </div>
                <span className="text-[10px] font-bold text-red-400">Critical</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-900">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span className="text-slate-200">103.21.56.77</span>
                </div>
                <span className="text-[10px] font-bold text-orange-400">High</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-900">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-slate-200">45.188.32.10</span>
                </div>
                <span className="text-[10px] font-bold text-amber-400">Medium</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-900">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span className="text-slate-200">91.134.22.18</span>
                </div>
                <span className="text-[10px] font-bold text-orange-400">High</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-900">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-slate-200">172.16.5.44</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400">Low</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Entity correlation feed</span>
            <span className="text-slate-500">Demo Reference</span>
          </div>
        </div>
      </div>
    </section>
  );
};
