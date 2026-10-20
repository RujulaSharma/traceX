import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { FiveFeatureCards } from '../components/landing/FiveFeatureCards';
import { DashboardShowcase } from '../components/landing/DashboardShowcase';
import { HowTraceXWorks } from '../components/landing/HowTraceXWorks';
import { AttackReconstructionSection } from '../components/landing/AttackReconstructionSection';
import { InvestigationBenefits } from '../components/landing/InvestigationBenefits';
import { BuiltForSecurityTeams } from '../components/landing/BuiltForSecurityTeams';
import { ProductStrip } from '../components/landing/ProductStrip';
import { FinalCallToAction } from '../components/landing/FinalCallToAction';
import { LandingFooter } from '../components/landing/LandingFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#08090A] text-[#F4F2F3] font-sans selection:bg-[#39FF6A] selection:text-[#08090A] overflow-x-hidden">
      {/* SECTION A: Slim Fixed Top Navigation */}
      <LandingNavbar activeSection="home" />

      <main className="space-y-0">
        {/* SECTION B: Hero Section with Cybernetic Character & Dual Information Panels */}
        <HeroSection />

        {/* SECTION C: Five Feature Cards with Pink Line Icons */}
        <FiveFeatureCards />

        {/* SECTION D: Product Dashboard Showcase (Live Workspace Preview) */}
        <DashboardShowcase />

        {/* SECTION E: How TraceX Works (01-05 Numbered Flow with Green Arrows) */}
        <HowTraceXWorks />

        {/* SECTION F: Attack Reconstruction Visualization (5-Node Connected Incident Chain) */}
        <AttackReconstructionSection />

        {/* SECTION G: Investigation Benefits (Contextual Editorial Layout) */}
        <InvestigationBenefits />

        {/* SECTION H: Built for Security Teams (4 Working SOC Tools) */}
        <BuiltForSecurityTeams />

        {/* SECTION I: Visual Testimonial / Product Statement Strip */}
        <ProductStrip />

        {/* SECTION J: Final Call To Action */}
        <FinalCallToAction />
      </main>

      {/* SECTION K: Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
