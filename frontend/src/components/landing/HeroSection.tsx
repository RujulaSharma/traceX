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
      {/* Floating Technical Telemetry Badges in 3D Space */}
      <div className="absolute top-28 left-8 sm:left-24 px-2.5 py-1 rounded-md bg-[#003D2B]/40 border border-[#00FF9C]/30 text-[#00FF9C] text-[10px] font-mono tracking-widest hidden md:block pointer-events-none animate-pulse">
        ● RAW TELEMETRY
      </div>
      <div className="absolute top-44 right-10 sm:right-28 px-2.5 py-1 rounded-md bg-[#3d2000]/40 border border-[#FF8A24]/30 text-[#FF8A24] text-[10px] font-mono tracking-widest hidden md:block pointer-events-none">
        ▲ THREAT SIGNAL
      </div>
      <div className="absolute bottom-32 left-10 sm:left-20 px-2.5 py-1 rounded-md bg-[#002b3d]/40 border border-[#00D9FF]/30 text-[#00D9FF] text-[10px] font-mono tracking-widest hidden md:block pointer-events-none">
        ◆ CORRELATION
      </div>
      <div className="absolute bottom-40 right-12 sm:right-32 px-2.5 py-1 rounded-md bg-[#3d0006]/40 border border-[#FF3B45]/40 text-[#FF3B45] text-[10px] font-mono tracking-widest hidden md:block pointer-events-none">
        ★ INCIDENT CORE
      </div>
      <div className="absolute top-1/2 left-4 px-2 py-0.5 rounded border border-[#00FF9C]/20 text-[#00FF9C]/70 text-[9px] font-mono tracking-wider hidden lg:block pointer-events-none">
        ENTITY LINKING
      </div>
      <div className="absolute top-1/2 right-4 px-2 py-0.5 rounded border border-[#00D9FF]/20 text-[#00D9FF]/70 text-[9px] font-mono tracking-wider hidden lg:block pointer-events-none">
        ATTACK GRAPH
      </div>

      {/* Top Tagline Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#003D2B]/60 border border-[#00FF9C]/40 text-[#00FF9C] text-xs font-mono font-semibold mb-6 shadow-[0_0_15px_rgba(0,255,156,0.2)]">
        <span className="w-2 h-2 rounded-full bg-[#00FF9C] animate-ping" />
        <span>NEXT-GEN CYBER INCIDENT RECONSTRUCTION ENGINE</span>
      </div>

      {/* Hero Title */}
      <div className="max-w-4xl space-y-4">
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-none font-sans">
          Trace<span className="text-[#00FF9C]">X</span>
        </h1>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100">
          Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF9C] via-[#00E887] to-[#00D9FF]">Intruder.</span>
        </h2>
        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed pt-2">
          Transform raw security telemetry into{' '}
          <span className="text-[#00FF9C] font-medium">explainable attack stories</span>.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-8 z-20">
        <Link
          to="/soc"
          className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-[#00FF9C] to-[#00E887] hover:from-[#00E887] hover:to-[#00C878] text-slate-950 text-sm font-extrabold shadow-[0_0_30px_rgba(0,255,156,0.5)] hover:shadow-[0_0_45px_rgba(0,255,156,0.7)] transition-all transform hover:-translate-y-0.5 active:scale-95"
        >
          <span>Open SOC</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </Link>
        <a
          href="#how-it-works"
          className="px-8 py-4 rounded-xl bg-[#030807]/90 hover:bg-[#062A20] text-slate-200 text-sm font-bold border border-[#00FF9C]/40 hover:border-[#00FF9C]/70 shadow-lg shadow-black/60 transition-all transform hover:-translate-y-0.5"
        >
          See How It Works
        </a>
      </div>

      {/* 5 Core Feature Chips */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-14 max-w-4xl text-xs text-slate-300 z-10">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#030807]/80 border border-[#003D2B] backdrop-blur-md">
          <Database className="w-4 h-4 text-[#00FF9C]" />
          <span>Ingest Security Logs</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#030807]/80 border border-[#003D2B] backdrop-blur-md">
          <ShieldAlert className="w-4 h-4 text-[#FF8A24]" />
          <span>Detect Threats</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#030807]/80 border border-[#003D2B] backdrop-blur-md">
          <GitMerge className="w-4 h-4 text-[#00D9FF]" />
          <span>Correlate Events</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#030807]/80 border border-[#003D2B] backdrop-blur-md">
          <Layers className="w-4 h-4 text-[#FF3B45]" />
          <span>Reconstruct Attacks</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#030807]/80 border border-[#003D2B] backdrop-blur-md">
          <Search className="w-4 h-4 text-[#00E887]" />
          <span>Investigate with Evidence</span>
        </div>
      </div>

      {/* Trust Quote Banner */}
      <div className="mt-10 flex items-center gap-3 text-xs text-slate-400 font-mono">
        <CheckCircle2 className="w-4 h-4 text-[#00FF9C]" />
        <span>Deterministic Rule Engine • Zero Hallucinations • Sub-Second Causal Analysis</span>
      </div>
    </section>
  );
};

export default HeroSection;
