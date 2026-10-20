import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Activity, CheckCircle2 } from 'lucide-react';
import tracexApi from '../../services/api';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    events: 0,
    detections: 0,
    incidents: 0,
  });

  useEffect(() => {
    tracexApi
      .getDashboardStats()
      .then((data) => {
        setStats({
          events: data.total_events || 0,
          detections: data.total_detections || 0,
          incidents: data.total_incidents || 0,
        });
      })
      .catch(() => {
        // Fallback default capabilities if backend unreachable
      });
  }, []);

  return (
    <section id="home" className="relative pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column (Content) */}
        <div className="lg:col-span-7 space-y-6 z-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171719] border border-[#383438] text-[10px] sm:text-xs font-mono font-semibold tracking-wider text-[#E7A1B5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39FF6A] animate-pulse" />
            <span>[ AUTONOMOUS CYBERSECURITY INVESTIGATION PLATFORM ]</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.08] text-[#F4F2F3]">
            FIND THE <br />
            INTRUDER. <br />
            <span className="text-[#E7A1B5]">RECONSTRUCT</span> <br />
            <span className="text-[#E7A1B5]">THE STORY.</span>
          </h1>

          {/* Supporting paragraph */}
          <p className="text-sm sm:text-base text-[#A5A3A7] max-w-xl leading-relaxed">
            TraceX detects, correlates, and explains multi-stage cyber intrusions from authentication, network, and server logs using intelligent analysis.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => navigate('/soc')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#39FF6A] hover:bg-[#25E653] text-[#08090A] text-xs font-bold tracking-wide shadow-[0_0_20px_rgba(57,255,106,0.25)] transition-all active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('dashboard-preview');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#08090A] hover:bg-[#171719] border border-[#E7A1B5] text-[#F4F2F3] text-xs font-semibold tracking-wide transition-all"
            >
              <Play className="w-3.5 h-3.5 text-[#E7A1B5] fill-current" />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* 3 Metric Blocks */}
          <div className="grid grid-cols-3 gap-3 pt-6 max-w-lg border-t border-[#383438]/70">
            <div className="p-3 rounded-lg bg-[#171719]/80 border border-[#383438]">
              <div className="text-xl sm:text-2xl font-black text-[#F4F2F3] tracking-tight">
                {stats.events > 0 ? `${stats.events}+` : '3 Log Formats'}
              </div>
              <div className="text-[11px] text-[#A5A3A7] mt-0.5">
                {stats.events > 0 ? 'Events Ingested' : 'CSV, JSON, NDJSON'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#171719]/80 border border-[#383438]">
              <div className="text-xl sm:text-2xl font-black text-[#39FF6A] tracking-tight">
                {stats.detections > 0 ? `${stats.detections}+` : '5 Rules'}
              </div>
              <div className="text-[11px] text-[#A5A3A7] mt-0.5">
                {stats.detections > 0 ? 'Threat Findings' : 'MITRE ATT&CK'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#171719]/80 border border-[#383438]">
              <div className="text-xl sm:text-2xl font-black text-[#E7A1B5] tracking-tight">
                {stats.incidents > 0 ? `${stats.incidents} Active` : 'Graph Engine'}
              </div>
              <div className="text-[11px] text-[#A5A3A7] mt-0.5">
                {stats.incidents > 0 ? 'Correlated Incidents' : 'Multi-Stage Stories'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Cybernetic Character & Floating Information Panels) */}
        <div className="lg:col-span-5 relative flex justify-center items-center">
          {/* Character Container with Soft Dark Vignette */}
          <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] rounded-2xl overflow-hidden border border-[#383438] bg-gradient-to-b from-[#101113] via-[#171719] to-[#08090A] shadow-2xl flex items-center justify-center">
            {/* Background character portrait */}
            <img
              src="/hero-character.png"
              alt="TraceX Cybernetic Android Security Intelligence"
              className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
            />

            {/* Gradient Overlays for cinematic blending */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090A] via-transparent to-transparent opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#08090A]/60 via-transparent to-[#08090A]/40" />
            <div className="absolute inset-0 border border-[#E7A1B5]/20 rounded-2xl pointer-events-none" />

            {/* Floating Panel 1: Top Right - Threat Intelligence / Investigation Overview */}
            <div className="absolute top-4 right-4 p-3 rounded-xl bg-[#171719]/90 backdrop-blur-md border border-[#383438] shadow-lg max-w-[190px] space-y-2 z-20">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#E7A1B5] font-bold">
                  THREAT INTELLIGENCE
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#39FF6A] animate-ping" />
              </div>

              {/* World / Relationship Visual */}
              <div className="h-14 rounded-lg bg-[#08090A] border border-[#383438]/80 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#39FF6A_1px,transparent_1px)] [background-size:8px_8px] opacity-25" />
                <div className="relative flex items-center gap-2 text-[10px] font-mono text-[#39FF6A]">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>LIVE ANALYSIS</span>
                </div>
              </div>

              <div className="space-y-1 text-[10px] font-mono text-[#A5A3A7]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#39FF6A]" />
                  <span>Log Ingestion</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#39FF6A]" />
                  <span>Rule Detections</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#39FF6A]" />
                  <span>Incident Correlation</span>
                </div>
              </div>
            </div>

            {/* Floating Panel 2: Bottom Right - From Raw Logs to Full Attack Story */}
            <div className="absolute bottom-4 right-4 p-3 rounded-xl bg-[#171719]/90 backdrop-blur-md border border-[#383438] shadow-lg max-w-[190px] space-y-1.5 z-20">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#A5A3A7] font-semibold block">
                FROM RAW LOGS TO FULL ATTACK STORY
              </span>

              <div className="space-y-1 text-[11px] font-mono">
                <div className="flex items-center gap-2 text-[#F4F2F3]">
                  <ArrowRight className="w-3 h-3 text-[#39FF6A]" />
                  <span className="font-bold">DETECT</span>
                </div>
                <div className="flex items-center gap-2 text-[#F4F2F3]">
                  <ArrowRight className="w-3 h-3 text-[#39FF6A]" />
                  <span className="font-bold">CORRELATE</span>
                </div>
                <div className="flex items-center gap-2 text-[#F4F2F3]">
                  <ArrowRight className="w-3 h-3 text-[#39FF6A]" />
                  <span className="font-bold">RECONSTRUCT</span>
                </div>
                <div className="flex items-center gap-2 text-[#F4F2F3]">
                  <ArrowRight className="w-3 h-3 text-[#39FF6A]" />
                  <span className="font-bold">EXPLAIN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
