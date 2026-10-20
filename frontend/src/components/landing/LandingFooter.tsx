import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Github } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-[#383438] bg-[#08090A] py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Logo & description */}
          <div className="space-y-2 max-w-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border border-[#E7A1B5] bg-[#171719] flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-[#E7A1B5]" />
              </div>
              <span className="text-sm font-bold tracking-wider text-[#F4F2F3]">
                Trace<span className="text-[#E7A1B5]">X</span>
              </span>
            </div>
            <p className="text-xs text-[#A5A3A7] leading-relaxed">
              Autonomous cybersecurity investigation platform. Find the intruder. Reconstruct the story.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-[#A5A3A7]">
            <a href="#home" className="hover:text-[#F4F2F3] transition-colors">
              Home
            </a>
            <a href="#features" className="hover:text-[#F4F2F3] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#F4F2F3] transition-colors">
              How It Works
            </a>
            <button onClick={() => navigate('/detections')} className="hover:text-[#F4F2F3] transition-colors">
              Detections
            </button>
            <button onClick={() => navigate('/incidents')} className="hover:text-[#F4F2F3] transition-colors">
              Investigations
            </button>
            <a href="#dashboard-preview" className="hover:text-[#F4F2F3] transition-colors">
              Documentation
            </a>
            <a
              href="https://github.com/RujulaSharma/traceX"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#A5A3A7] hover:text-[#39FF6A] transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#383438]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#A5A3A7]">
          <div>© {new Date().getFullYear()} TraceX. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Built for security investigations</span>
            <span>•</span>
            <span>Open Source</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
