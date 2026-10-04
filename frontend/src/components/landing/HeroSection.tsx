import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Database,
  ShieldAlert,
  GitMerge,
  Layers,
  Search,
  CheckCircle2,
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-36 pb-20 px-6 lg:px-12 flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Top Tagline Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold mb-6 shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-pulse">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>NEXT-GEN CYBER INCIDENT RECONSTRUCTION ENGINE</span>
      </div>

      {/* Hero Title */}
      <div className="max-w-4xl space-y-4">
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-none font-sans">
          Trace<span className="text-emerald-400">X</span>
        </h1>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100">
          Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Intruder.</span>
        </h2>
        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed pt-2">
          Transform raw security telemetry into{' '}
          <span className="text-emerald-300 font-medium">explainable attack stories</span>.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-8 z-20">
        <Link
          to="/soc"
          className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-sm font-extrabold shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] transition-all transform hover:-translate-y-0.5 active:scale-95"
        >
          <span>Open SOC</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </Link>
        <a
          href="#how-it-works"
          className="px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-sm font-bold border border-emerald-500/30 hover:border-emerald-400/60 shadow-lg shadow-black/40 transition-all transform hover:-translate-y-0.5"
        >
          See How It Works
        </a>
      </div>

      {/* 5 Core Feature Chips */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-14 max-w-4xl text-xs text-slate-300 z-10">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Ingest Security Logs</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Detect Threats</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <GitMerge className="w-4 h-4 text-cyan-400" />
          <span>Correlate Events</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <Layers className="w-4 h-4 text-red-400" />
          <span>Reconstruct Attacks</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <Search className="w-4 h-4 text-teal-400" />
          <span>Investigate with Evidence</span>
        </div>
      </div>

      {/* Trust Quote Banner */}
      <div className="mt-10 flex items-center gap-3 text-xs text-slate-400 font-mono">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>Deterministic Rule Engine • Zero Hallucinations • Sub-Second Causal Analysis</span>
      </div>
    </section>
  );
};
