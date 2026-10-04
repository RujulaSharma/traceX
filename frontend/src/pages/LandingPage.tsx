import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { NeonGalaxyNetworkCanvas } from '../components/landing/NeonGalaxyNetworkCanvas';
import { HeroSection } from '../components/landing/HeroSection';
import { StickyStorySection } from '../components/landing/StickyStorySection';
import { OperationalPanels } from '../components/landing/OperationalPanels';
import { AttackStoryShowcase } from '../components/landing/AttackStoryShowcase';
import { DetectionRulesShowcase } from '../components/landing/DetectionRulesShowcase';
import { SocPreviewSection } from '../components/landing/SocPreviewSection';
import { LandingFooter } from '../components/landing/LandingFooter';
import { ShieldAlert, ArrowDown } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020605] text-slate-100 font-sans selection:bg-[#00FF9C] selection:text-black relative overflow-x-hidden">
      {/* Top Fixed Navbar */}
      <LandingNavbar />

      {/* Hero Section with Dense Living Network Background */}
      <div className="relative min-h-screen flex flex-col justify-between overflow-hidden">
        <NeonGalaxyNetworkCanvas
          className="z-0 opacity-85"
          progress={0.08}
          stage={1}
          showHorizon={true}
        />
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <HeroSection />
        </div>

        {/* Transition Bridge to Sticky Network Story */}
        <div className="relative z-10 py-12 px-6 text-center border-t border-emerald-950/40 bg-gradient-to-b from-transparent to-[#030706]">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>THE PROBLEM WITH LEGACY SIEM</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white mt-3 max-w-3xl mx-auto tracking-tight">
            Security teams don&apos;t need more alerts.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              They need to understand how events connect.
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-2">
            Scroll down to watch the TraceX engine filter noise, cluster entity relationships, converge on the incident, and reconstruct the attack.
          </p>
          <div className="mt-4 flex justify-center">
            <ArrowDown className="w-4 h-4 text-emerald-400 animate-bounce" />
          </div>
        </div>
      </div>

      {/* CORE EXPERIENCE: Sticky Pinned Attack Network Scroll Experience */}
      <StickyStorySection />

      {/* Operational Visual Panels from Collage (Sonar, Kill Chain, Threat Intel) */}
      <div className="relative z-10 bg-[#030706] border-t border-emerald-950/60">
        <OperationalPanels />
      </div>

      {/* 5 Deterministic Detection Rules */}
      <div className="relative z-10 bg-[#040807]">
        <DetectionRulesShowcase />
      </div>

      {/* Attack Story Showcase: Graph, Timeline, Evidence, Narrative */}
      <div className="relative z-10 bg-[#030706]">
        <AttackStoryShowcase />
      </div>

      {/* Working SOC Console Interactive Preview (Bottom of Collage) */}
      <div className="relative z-10 bg-[#040807] border-t border-emerald-950/60">
        <SocPreviewSection />
      </div>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
