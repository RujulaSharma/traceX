import React, { useState } from 'react';
import {
  Database,
  Search,
  GitMerge,
  AlertOctagon,
  FileText,
  Network,
  User,
  Server,
  Cpu,
  Sparkles,
} from 'lucide-react';

export const HowItWorksNetwork: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(4); // Default to Central Incident

  return (
    <section id="how-it-works" className="relative py-24 px-6 lg:px-12 max-w-7xl mx-auto z-10">
      {/* Section Header */}
      <div className="text-center space-y-3 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[11px] font-mono uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>HOW TRACEX THINKS</span>
        </div>
        <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white font-sans">
          From Noise to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">the Intruder</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
          TraceX connects the dots across massive security telemetry to reveal the complete attack story.
        </p>
      </div>

      {/* Spider-Web / Integrated Living Architecture Graphic */}
      <div className="relative rounded-3xl bg-[#06090e]/95 border border-emerald-900/30 p-6 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Subtle Cyber Grid Background & Glow Rings */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-emerald-600/10 via-red-600/10 to-cyan-600/10 blur-3xl pointer-events-none" />

        {/* 5 Integrated Stage Nodes (Horizontal on large, staggered on small) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-4 items-stretch">
          {/* STAGE 1: RAW TELEMETRY */}
          <div
            onMouseEnter={() => setActiveStage(1)}
            className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
              activeStage === 1
                ? 'bg-slate-900/90 border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
                : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800/60 text-emerald-400">
                  1 RAW TELEMETRY
                </span>
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                Security Logs
              </h3>
              <p className="text-xs text-slate-400 mt-1">Ingest logs from multiple sources</p>

              {/* Multi-source Badges */}
              <div className="mt-4 space-y-1.5 text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Firewall Logs</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Authentication Logs</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>System Logs</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span>Endpoint & Cloud Logs</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span>IDS / IPS Logs</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-emerald-400">
              <span>CSV • JSON • NDJSON</span>
              <span className="text-slate-500">100% Parsed</span>
            </div>
          </div>

          {/* STAGE 2: DETECTION */}
          <div
            onMouseEnter={() => setActiveStage(2)}
            className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
              activeStage === 2
                ? 'bg-slate-900/90 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
                : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-800/60 text-amber-400">
                  2 DETECTION
                </span>
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-400" />
                Find Threat Signals
              </h3>
              <p className="text-xs text-slate-400 mt-1">Identify suspicious activity using rule-based detection</p>

              {/* Floating Rules Pills */}
              <div className="mt-4 space-y-2">
                <div className="px-2.5 py-1 rounded-lg bg-red-950/70 border border-red-800/60 text-red-300 text-[11px] font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                  <span>Brute Force</span>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-amber-950/70 border border-amber-800/60 text-amber-300 text-[11px] font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Port Scan</span>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-orange-950/70 border border-orange-800/60 text-orange-300 text-[11px] font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400" />
                  <span>Suspicious Login</span>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-rose-950/70 border border-rose-800/60 text-rose-300 text-[11px] font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>Privilege Escalation</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-amber-400">
              <span>Deterministic</span>
              <span>MITRE ATT&CK</span>
            </div>
          </div>

          {/* STAGE 3: CORRELATION */}
          <div
            onMouseEnter={() => setActiveStage(3)}
            className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
              activeStage === 3
                ? 'bg-slate-900/90 border-cyan-500/60 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
                : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/60 text-cyan-400">
                  3 CORRELATION
                </span>
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-cyan-400" />
                Connect Events
              </h3>
              <p className="text-xs text-slate-400 mt-1">Cluster entities and build attack patterns</p>

              {/* Relational Tags */}
              <div className="mt-4 space-y-2">
                <div className="p-2 rounded-lg bg-slate-950/80 border border-cyan-800/40 text-[11px] font-mono text-cyan-300">
                  <span className="text-slate-500 block text-[9px] uppercase">Entity Pivot</span>
                  Shared IPs & Identities
                </div>
                <div className="p-2 rounded-lg bg-slate-950/80 border border-cyan-800/40 text-[11px] font-mono text-cyan-300">
                  <span className="text-slate-500 block text-[9px] uppercase">Temporal Window</span>
                  User Activity Clustering
                </div>
                <div className="p-2 rounded-lg bg-slate-950/80 border border-cyan-800/40 text-[11px] font-mono text-cyan-300">
                  <span className="text-slate-500 block text-[9px] uppercase">Causal Flow</span>
                  MITRE Kill Chain Linking
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-cyan-400">
              <span>Graph Clustering</span>
              <span>Sliding Window</span>
            </div>
          </div>

          {/* STAGE 4: CENTRAL INCIDENT (Pulsing Centerpiece from Collage) */}
          <div
            onMouseEnter={() => setActiveStage(4)}
            className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
              activeStage === 4
                ? 'bg-red-950/40 border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.35)] ring-1 ring-red-500/50'
                : 'bg-slate-950/90 border-red-900/60 hover:border-red-600'
            }`}
          >
            {/* Glowing red energy ring behind */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-red-600/20 blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950 border border-red-700 text-red-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  4 INCIDENT
                </span>
                <span className="text-[10px] font-mono font-extrabold text-red-400 bg-red-950/90 px-1.5 py-0.5 rounded border border-red-800">
                  CRITICAL
                </span>
              </div>

              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                Reconstruct Attack
              </h3>
              <p className="text-xs text-slate-300 mt-1">Complete incident with risk scoring</p>

              {/* Central Glowing Incident Core Card */}
              <div className="mt-4 p-3 rounded-xl bg-slate-950/90 border border-red-500/40 text-center space-y-1 shadow-lg">
                <div className="text-[10px] uppercase font-bold tracking-widest text-red-400">
                  INCIDENT CORE
                </div>
                <div className="text-3xl font-black text-white font-mono tracking-tight">
                  <span className="text-red-400">85</span>
                  <span className="text-slate-500 text-xl font-normal">/100</span>
                </div>
                <div className="text-[11px] font-mono text-slate-300">
                  4 Detections • 19 Events
                </div>
                <div className="text-[10px] text-red-300/80 font-mono">
                  MITRE T1110, T1190, T1068
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-red-900/40 flex items-center justify-between text-[10px] font-mono text-red-400 font-bold">
              <span>Risk Weighted</span>
              <span className="flex items-center gap-1">Converged</span>
            </div>
          </div>

          {/* STAGE 5: ATTACK STORY */}
          <div
            onMouseEnter={() => setActiveStage(5)}
            className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
              activeStage === 5
                ? 'bg-slate-900/90 border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
                : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800/60 text-emerald-400">
                  5 ATTACK STORY
                </span>
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Explain with Evidence
              </h3>
              <p className="text-xs text-slate-400 mt-1">Generate timeline, graph & actionable insights</p>

              {/* Reconstructed Entities */}
              <div className="mt-4 space-y-1.5 text-[11px] font-mono">
                <div className="p-1.5 rounded-lg bg-red-950/40 border border-red-800/40 flex items-center gap-2 text-red-300">
                  <Network className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="truncate">Attacker: 185.23.91.44</span>
                </div>
                <div className="p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 flex items-center gap-2 text-cyan-300">
                  <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">Compromised: admin</span>
                </div>
                <div className="p-1.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 flex items-center gap-2 text-indigo-300">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">Rules: Brute Force + Sudo</span>
                </div>
                <div className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-2 text-emerald-300">
                  <Server className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Target: 192.168.1.10</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-emerald-400">
              <span>Timeline</span>
              <span>Attack Graph</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
