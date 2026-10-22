import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Terminal } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface LandingNavbarProps {
  activeSection?: string;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = () => {
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      gsap.from(navRef.current, {
        y: -16,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
    },
    { scope: navRef }
  );

  const navLinks = [
    { label: 'Workspace', href: '#workspace' },
    { label: 'Storyline', href: '#storyline' },
    { label: 'Attack Graph', href: '#attack-graph' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Detections', href: '/detections', isRoute: true },
    { label: 'Investigations', href: '/incidents', isRoute: true },
  ];

  return (
    <header
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 bg-[#08090A]/92 backdrop-blur-md border-b border-[#3A3F46]/80 h-14"
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Brand */}
        <a href="#home" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg p-[1px] bg-gradient-to-br from-[#F1F3F5] via-[#8D949D] to-[#22252A] shadow-sm group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[7px] bg-[#101113] flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#F1F3F5]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black tracking-wider text-[#F4F5F6]">
              TRACE<span className="text-liquid-silver">X</span>
            </span>
            <span className="text-[10px] font-mono text-[#39FF6A] font-medium hidden sm:inline">
              [AUTONOMOUS SOC]
            </span>
          </div>
        </a>

        {/* Navigation items */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            if (link.isRoute) {
              return (
                <button
                  key={link.label}
                  onClick={() => navigate(link.href)}
                  className="text-xs font-mono font-medium text-[#A4AAB2] hover:text-[#F1F3F5] transition-colors"
                >
                  {link.label}
                </button>
              );
            }
            return (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-mono font-medium text-[#A4AAB2] hover:text-[#F1F3F5] transition-colors"
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Right Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/events')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#3A3F46] bg-[#101113] hover:bg-[#17191C] text-[#A4AAB2] hover:text-[#F1F3F5] text-xs font-mono transition-all"
            title="Browse raw ingested events"
          >
            <Terminal className="w-3.5 h-3.5 text-[#C6CBD1]" />
            <span>Raw Logs</span>
          </button>

          <button
            onClick={() => navigate('/soc')}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#39FF6A] hover:bg-[#25E653] text-[#08090A] text-xs font-bold tracking-wide shadow-[0_0_16px_rgba(57,255,106,0.25)] transition-all active:scale-95"
          >
            <span>Launch Console</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </header>
  );
};
