import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Activity, Database, GitMerge, Terminal } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import tracexApi from '../../services/api';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const [stats, setStats] = useState({
    events: 138,
    detections: 58,
    incidents: 4,
  });

  useEffect(() => {
    tracexApi
      .getDashboardStats()
      .then((data) => {
        setStats({
          events: data.total_events || 138,
          detections: data.total_detections || 58,
          incidents: data.total_incidents || 4,
        });
      })
      .catch(() => {});
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-badge', {
        opacity: 0,
        y: -12,
        duration: 0.5,
      })
        .from(
          '.hero-title-line',
          {
            opacity: 0,
            y: 28,
            stagger: 0.12,
            duration: 0.7,
          },
          '-=0.2'
        )
        .from(
          '.hero-copy',
          {
            opacity: 0,
            y: 16,
            duration: 0.6,
          },
          '-=0.3'
        )
        .from(
          '.hero-cta-group',
          {
            opacity: 0,
            y: 14,
            duration: 0.5,
          },
          '-=0.3'
        )
        .from(
          '.hero-visual-frame',
          {
            opacity: 0,
            scale: 0.95,
            x: 20,
            duration: 0.8,
          },
          '-=0.6'
        )
        .from(
          '.hero-metrics-bar',
          {
            opacity: 0,
            y: 18,
            duration: 0.6,
          },
          '-=0.3'
        );
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
    >
      {/* Subtle atmospheric ambient glow */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#C6CBD1]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-10 w-80 h-80 bg-[#39FF6A]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Asymmetrical Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[580px]">
        {/* Left 7 Columns: Dramatic Typographic Statement */}
        <div className="lg:col-span-7 space-y-6 z-10">
          {/* Status Badge */}
          <div className="hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101113] border border-[#3A3F46] text-xs font-mono text-[#C6CBD1]">
            <span className="w-2 h-2 rounded-full bg-[#39FF6A] animate-pulse" />
            <span className="text-[#39FF6A] font-bold">AUTONOMOUS INVESTIGATION</span>
            <span className="text-[#727982]">|</span>
            <span className="text-[#A4AAB2]">TRACE-RECON ENGINE ONLINE</span>
          </div>

          {/* Large Typographic Composition */}
          <div className="space-y-1">
            <h1 className="hero-title-line text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-[#F4F5F6]">
              FIND THE <span className="text-[#F1F3F5]">INTRUDER.</span>
            </h1>
            <h1 className="hero-title-line text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
              <span className="text-liquid-silver">RECONSTRUCT</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F1F3F5] via-[#C6CBD1] to-[#8D949D]">
                THE STORY.
              </span>
            </h1>
          </div>

          {/* Descriptive Copy */}
          <p className="hero-copy text-base sm:text-lg text-[#A4AAB2] max-w-xl leading-relaxed font-sans">
            TraceX ingests raw authentication, network, and server logs, discovers threat signals with deterministic detection rules, and automatically stitches fragmented events into an unbroken attack reconstruction.
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta-group flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => navigate('/soc')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#39FF6A] hover:bg-[#25E653] text-[#08090A] text-sm font-bold tracking-wide shadow-[0_0_24px_rgba(57,255,106,0.3)] transition-all active:scale-95 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('workspace');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#101113] hover:bg-[#17191C] border border-[#3A3F46] hover:border-[#C6CBD1] text-[#F4F5F6] text-sm font-semibold tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-[#C6CBD1]" />
              <span>Explore Investigation Workspace</span>
            </button>
          </div>

          {/* Quick trust / verification pill */}
          <div className="hero-copy flex items-center gap-4 text-xs font-mono text-[#727982] pt-2">
            <span className="flex items-center gap-1.5 text-[#A4AAB2]">
              <ShieldCheck className="w-4 h-4 text-[#39FF6A]" />
              Deterministic Rule Correlation
            </span>
            <span>•</span>
            <span className="text-[#A4AAB2]">Full Raw Log Auditability</span>
            <span>•</span>
            <span className="text-[#A4AAB2]">Zero Black-Box Guessing</span>
          </div>
        </div>

        {/* Right 5 Columns: Single Integrated Visual Focal Point */}
        <div className="lg:col-span-5 relative">
          <div className="hero-visual-frame relative rounded-2xl p-[1px] bg-gradient-to-b from-[#8D949D]/80 via-[#3A3F46] to-[#17191C] shadow-2xl overflow-hidden">
            <div className="relative rounded-[15px] bg-[#101113] overflow-hidden aspect-[4/5] sm:aspect-[3/4] flex items-center justify-center">
              {/* Character visual with high-contrast metallic treatment */}
              <img
                src="/hero-character.png"
                alt="TraceX Cybernetic Security Investigator"
                className="w-full h-full object-cover object-center filter contrast-110 brightness-95"
              />

              {/* Matte black gradient overlay at bottom for seamless integration */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#101113] via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#101113]/50 via-transparent to-transparent pointer-events-none" />

              {/* High-tech precision crosshair watermark */}
              <div className="absolute top-4 right-4 font-mono text-[9px] text-[#C6CBD1]/80 px-2.5 py-1 rounded bg-[#08090A]/80 border border-[#3A3F46] backdrop-blur-sm">
                SYSTEM: ARMED // SECTOR-07
              </div>

              {/* Precision HUD Telemetry Overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-[#08090A]/90 border border-[#3A3F46] backdrop-blur-md font-mono text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-[#C6CBD1]">
                  <span className="text-[10px] uppercase tracking-wider text-[#727982]">INTRUSION RECONSTRUCTION</span>
                  <span className="text-[#39FF6A] font-bold">100% CORRELATED</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#F4F5F6]">
                  <span>TARGET: 10.0.0.50 (PostgreSQL)</span>
                  <span className="text-[#FF6464] font-semibold">ATTACKER: 185.220.101.5</span>
                </div>
                <div className="w-full bg-[#17191C] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#39FF6A] to-[#C6CBD1] h-full w-[85%] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Consolidated Metrics & Capability Strip */}
      <div className="hero-metrics-bar mt-12 p-[1px] rounded-2xl bg-gradient-to-r from-[#3A3F46] via-[#8D949D]/60 to-[#3A3F46] shadow-xl">
        <div className="rounded-[15px] bg-[#101113] p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-6 items-center divide-y md:divide-y-0 md:divide-x divide-[#3A3F46]/60">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#08090A] border border-[#3A3F46] flex items-center justify-center text-[#39FF6A]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#F4F5F6] font-mono">{stats.events}</div>
              <div className="text-[11px] font-mono text-[#A4AAB2] uppercase tracking-wider">Events Ingested</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pt-4 md:pt-0 md:pl-6">
            <div className="w-10 h-10 rounded-xl bg-[#08090A] border border-[#3A3F46] flex items-center justify-center text-[#FFD84D]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#FFD84D] font-mono">{stats.detections}</div>
              <div className="text-[11px] font-mono text-[#A4AAB2] uppercase tracking-wider">Threat Signals</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pt-4 md:pt-0 md:pl-6">
            <div className="w-10 h-10 rounded-xl bg-[#08090A] border border-[#3A3F46] flex items-center justify-center text-[#C6CBD1]">
              <GitMerge className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-liquid-silver font-mono">{stats.incidents}</div>
              <div className="text-[11px] font-mono text-[#A4AAB2] uppercase tracking-wider">Attack Incidents</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pt-4 md:pt-0 md:pl-6">
            <div className="w-10 h-10 rounded-xl bg-[#08090A] border border-[#3A3F46] flex items-center justify-center text-[#39FF6A]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#39FF6A] font-mono">5 STAGES</div>
              <div className="text-[11px] font-mono text-[#A4AAB2] uppercase tracking-wider">End-to-End Story</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
