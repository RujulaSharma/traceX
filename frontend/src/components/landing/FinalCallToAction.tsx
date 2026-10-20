import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

export const FinalCallToAction: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#383438]/50">
      <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-[#101113] to-[#08090A] border border-[#383438] text-center space-y-6 max-w-4xl mx-auto relative overflow-hidden shadow-2xl">
        {/* Subtle pink glow behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#E7A1B5]/10 blur-3xl pointer-events-none" />

        <div className="relative space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#F4F2F3]">
            READY TO SEE THE <br />
            <span className="text-[#E7A1B5]">FULL PICTURE?</span>
          </h2>

          <p className="text-sm sm:text-base text-[#A5A3A7] max-w-md mx-auto">
            Start investigating smarter with TraceX.
          </p>
        </div>

        <div className="relative flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => navigate('/soc')}
            className="flex items-center gap-2 px-7 py-3 rounded-lg bg-[#39FF6A] hover:bg-[#25E653] text-[#08090A] text-xs font-bold tracking-wide shadow-[0_0_20px_rgba(57,255,106,0.25)] transition-all active:scale-95"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('dashboard-preview');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#08090A] hover:bg-[#171719] border border-[#E7A1B5] text-[#F4F2F3] text-xs font-semibold tracking-wide transition-all"
          >
            <Play className="w-3.5 h-3.5 text-[#E7A1B5] fill-current" />
            <span>Watch Demo</span>
          </button>
        </div>
      </div>
    </section>
  );
};
