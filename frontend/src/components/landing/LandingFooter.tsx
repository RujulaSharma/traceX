import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Github, ArrowUp } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#3A3F46]/80 bg-[#08090A] py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Logo & description */}
          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg p-[1px] bg-gradient-to-br from-[#F1F3F5] via-[#8D949D] to-[#22252A] shadow-sm">
                <div className="w-full h-full rounded-[7px] bg-[#101113] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#F1F3F5]" />
                </div>
              </div>
              <span className="text-base font-black tracking-wider text-[#F4F5F6]">
                TRACE<span className="text-liquid-silver">X</span>
              </span>
            </div>
            <p className="text-xs text-[#A4AAB2] leading-relaxed">
              Autonomous cybersecurity investigation and attack reconstruction platform. Turning disparate security event logs into an explainable, evidence-backed narrative of intrusion.
            </p>
          </div>

          {/* Clean Navigation Links */}
          <div className="flex flex-wrap items-center gap-6 font-mono text-xs text-[#A4AAB2]">
            <a href="#home" className="hover:text-[#F1F3F5] transition-colors">
              Home
            </a>
            <a href="#workspace" className="hover:text-[#F1F3F5] transition-colors">
              Workspace
            </a>
            <a href="#storyline" className="hover:text-[#F1F3F5] transition-colors">
              Storyline
            </a>
            <a href="#attack-graph" className="hover:text-[#F1F3F5] transition-colors">
              Attack Graph
            </a>
            <a href="#capabilities" className="hover:text-[#F1F3F5] transition-colors">
              Capabilities
            </a>
            <button
              onClick={() => navigate('/detections')}
              className="hover:text-[#F1F3F5] transition-colors cursor-pointer"
            >
              Detections
            </button>
            <button
              onClick={() => navigate('/incidents')}
              className="hover:text-[#F1F3F5] transition-colors cursor-pointer"
            >
              Investigations
            </button>
            <a
              href="https://github.com/RujulaSharma/traceX"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#A4AAB2] hover:text-[#39FF6A] transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#3A3F46]/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#727982]">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} TraceX Platform.</span>
            <span>All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Deterministic Rule Intelligence</span>
            <span>•</span>
            <span>MITRE ATT&CK Aligned</span>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-[#A4AAB2] hover:text-[#39FF6A] transition-colors cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
