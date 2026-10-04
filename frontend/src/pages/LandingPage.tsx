import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LivingNetworkCanvas } from '../components/landing/LivingNetworkCanvas';
import { HeroSection } from '../components/landing/HeroSection';
import { HowItWorksNetwork } from '../components/landing/HowItWorksNetwork';
import { OperationalPanels } from '../components/landing/OperationalPanels';
import { AttackStoryShowcase } from '../components/landing/AttackStoryShowcase';
import { DetectionRulesShowcase } from '../components/landing/DetectionRulesShowcase';
import { SocPreviewSection } from '../components/landing/SocPreviewSection';
import { LandingFooter } from '../components/landing/LandingFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#05080d] text-slate-100 font-sans selection:bg-emerald-500 selection:text-black relative overflow-x-hidden">
      {/* Background Interactive Living Network (Sticky / full background for top half) */}
      <div className="fixed inset-0 pointer-events-auto z-0 opacity-80">
        <LivingNetworkCanvas />
      </div>

      {/* Top Navbar */}
      <LandingNavbar />

      {/* Main Content Flow */}
      <main className="relative z-10">
        <HeroSection />
        <HowItWorksNetwork />
        <OperationalPanels />
        <AttackStoryShowcase />
        <DetectionRulesShowcase />
        <SocPreviewSection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
