import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, ArrowRight } from 'lucide-react';

interface LandingNavbarProps {
  activeSection?: string;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ activeSection = 'home' }) => {
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Home', href: '#home', id: 'home' },
    { label: 'Features', href: '#features', id: 'features' },
    { label: 'How It Works', href: '#how-it-works', id: 'how-it-works' },
    { label: 'Detections', href: '/detections', isRoute: true },
    { label: 'Investigations', href: '/incidents', isRoute: true },
    { label: 'Documentation', href: '#dashboard-preview', id: 'dashboard-preview' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#08090A]/90 backdrop-blur-md border-b border-[#383438] h-14">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#home" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg border border-[#E7A1B5] bg-[#171719] flex items-center justify-center transition-transform group-hover:scale-105">
            <Shield className="w-4 h-4 text-[#E7A1B5]" />
          </div>
          <span className="text-base font-bold tracking-wider text-[#F4F2F3] flex items-center gap-0.5">
            Trace<span className="text-[#E7A1B5]">X</span>
          </span>
        </a>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            if (link.isRoute) {
              return (
                <button
                  key={link.label}
                  onClick={() => navigate(link.href)}
                  className="text-xs font-medium text-[#A5A3A7] hover:text-[#F4F2F3] transition-colors"
                >
                  {link.label}
                </button>
              );
            }
            return (
              <a
                key={link.label}
                href={link.href}
                className={`text-xs font-medium transition-all relative py-1 ${
                  isActive
                    ? 'text-[#39FF6A]'
                    : 'text-[#A5A3A7] hover:text-[#F4F2F3]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#39FF6A] rounded-full" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/events')}
            className="w-8 h-8 rounded-lg border border-[#383438] bg-[#171719] flex items-center justify-center text-[#A5A3A7] hover:text-[#F4F2F3] hover:border-[#E7A1B5]/50 transition-colors"
            title="Search logs & events"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => navigate('/soc')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#39FF6A] hover:bg-[#25E653] text-[#08090A] text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(57,255,106,0.25)] transition-all active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </header>
  );
};
