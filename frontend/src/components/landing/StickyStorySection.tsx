import React, { useState, useEffect, useRef } from 'react';
import { NeonGalaxyNetworkCanvas } from './NeonGalaxyNetworkCanvas';
import {
  Database,
  Search,
  GitMerge,
  AlertOctagon,
  FileText,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StickyStorySection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [currentStage, setCurrentStage] = useState<number>(1);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalScrollable = container.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) return;

      // Distance from top of container to top of viewport
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));

      setScrollProgress(progress);

      // Determine stage (1 to 5)
      if (progress < 0.2) setCurrentStage(1);
      else if (progress < 0.4) setCurrentStage(2);
      else if (progress < 0.6) setCurrentStage(3);
      else if (progress < 0.8) setCurrentStage(4);
      else setCurrentStage(5);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToStage = (stageNum: number) => {
    const container = containerRef.current;
    if (!container) return;
    const targetProgress = (stageNum - 1) * 0.22;
    const totalScrollable = container.offsetHeight - window.innerHeight;
    const targetY = container.offsetTop + targetProgress * totalScrollable;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  const stageData = [
    {
      num: 1,
      badge: '01 RAW TELEMETRY',
      title: 'Millions of noisy events.',
      subtitle: 'Almost none are meaningful alone.',
      description:
        'Security devices produce millions of disconnected events: firewall drops, authentication failures, DNS queries, and system calls. Without correlation, critical signals drown in noise.',
      icon: Database,
      tagColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60',
    },
    {
      num: 2,
      badge: '02 DETECTION',
      title: 'Find threat signals in the noise.',
      subtitle: 'Deterministic rule execution.',
      description:
        'TraceX runs 5 deterministic rules across normalized telemetry: Brute Force authentication, Port Scans, and Suspicious Privilege Escalation flags emerge with MITRE ATT&CK taxonomy.',
      icon: Search,
      tagColor: 'text-amber-400 bg-amber-950/80 border-amber-800/60',
    },
    {
      num: 3,
      badge: '03 CORRELATION',
      title: 'Separate alerts become one story.',
      subtitle: 'Entity linking across space and time.',
      description:
        'Sliding temporal windows link disparate signals by shared entities: IP address 185.23.91.44, compromised account admin, and lateral movement vectors converge into an attack web.',
      icon: GitMerge,
      tagColor: 'text-cyan-400 bg-cyan-950/80 border-cyan-800/60',
    },
    {
      num: 4,
      badge: '04 INCIDENT CONVERGENCE',
      title: 'Reconstruct the unified attack.',
      subtitle: 'Weighted kill-chain risk scoring.',
      description:
        'Background noise recedes as correlated events converge into a unified incident core. Risk scoring (85/100 Critical) evaluates kill-chain progression and high-value asset exposure.',
      icon: AlertOctagon,
      tagColor: 'text-red-400 bg-red-950/80 border-red-800/60',
    },
    {
      num: 5,
      badge: '05 ATTACK STORY',
      title: 'From noise to the intruder.',
      subtitle: 'Complete causal attack topology.',
      description:
        'The incident expands into an explainable causal graph: Attacker IP 185.23.91.44 → Compromised User admin → Sudo Escalation → Target Database 10.0.0.50. Complete with timeline and forensic proof.',
      icon: FileText,
      tagColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60',
    },
  ];

  const current = stageData[currentStage - 1];
  const CurrentIcon = current.icon;

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative min-h-[500vh] bg-[#030706]"
    >
      {/* Sticky Viewport pinned for the entire 500vh scroll track */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* Layer 1: Living Interactive Network Canvas */}
        <NeonGalaxyNetworkCanvas
          progress={scrollProgress}
          stage={currentStage}
        />

        {/* Layer 2: Top Floating HUD Progress Bar */}
        <div className="relative z-20 px-6 sm:px-12 pt-24 max-w-7xl mx-auto w-full flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              TRACEX RECONSTRUCTION ENGINE • LIVE PIPELINE
            </span>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            <span className="text-xs font-mono text-emerald-400 hidden sm:inline">
              STAGE 0{currentStage} / 05
            </span>
            <div className="w-28 sm:w-40 h-1.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-150"
                style={{ width: `${Math.round(scrollProgress * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Layer 3: Central / Bottom Narrative Story Card (Driven by Scroll) */}
        <div className="relative z-20 px-6 sm:px-12 pb-12 max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-end justify-between gap-8 pointer-events-none">
          {/* Active Stage Narrative Card */}
          <div className="max-w-xl pointer-events-auto p-6 sm:p-8 rounded-2xl bg-[#040807]/90 border border-emerald-950/80 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl border ${current.tagColor}`}>
                <CurrentIcon className="w-4 h-4" />
              </div>
              <span className={`text-[11px] font-mono font-extrabold px-2.5 py-1 rounded-lg border ${current.tagColor}`}>
                {current.badge}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans">
              {current.title}
            </h3>
            <div className="text-xs font-mono text-emerald-400 font-semibold mt-1">
              {current.subtitle}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-3 font-light">
              {current.description}
            </p>

            {currentStage === 5 && (
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-3">
                <Link
                  to="/soc"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-[0_0_20px_rgba(16,185,129,0.4)] transition"
                >
                  <span>Investigate in Working SOC</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </Link>
              </div>
            )}
          </div>

          {/* Right: Vertical Stage Scrubber (Clickable) */}
          <div className="pointer-events-auto flex md:flex-col items-center gap-2 sm:gap-3 bg-[#040807]/80 p-2 sm:p-3 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
            {stageData.map((s) => {
              const isSelected = s.num === currentStage;
              return (
                <button
                  key={s.num}
                  onClick={() => scrollToStage(s.num)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all text-left w-full ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/60'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'
                    }`}
                  />
                  <span className="hidden sm:inline">0{s.num}</span>
                  <span className="hidden lg:inline text-[10px] text-slate-400 font-normal">
                    {s.badge.split(' ')[1]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scroll Prompt at Bottom */}
        <div className="relative z-20 pb-4 text-center pointer-events-none">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono text-slate-500 animate-bounce">
            <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>SCROLL TO WATCH THE NETWORK REORGANIZE</span>
          </div>
        </div>
      </div>
    </section>
  );
};
