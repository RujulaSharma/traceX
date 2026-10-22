import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Terminal } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const FinalCallToAction: React.FC = () => {
  const navigate = useNavigate();
  const ctaRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      gsap.from('.cta-inner-card', {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        y: 30,
        scale: 0.98,
        duration: 0.8,
        ease: 'power3.out',
      });
    },
    { scope: ctaRef }
  );

  return (
    <section ref={ctaRef} className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#3A3F46]/60">
      <div className="cta-inner-card p-[1px] rounded-3xl bg-gradient-to-b from-[#8D949D] via-[#3A3F46] to-[#101113] shadow-2xl max-w-5xl mx-auto overflow-hidden">
        <div className="relative rounded-[23px] bg-gradient-to-b from-[#17191C] to-[#08090A] p-10 sm:p-16 text-center space-y-8 overflow-hidden">
          {/* Subtle liquid mercury specular highlight across top edge */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-32 bg-gradient-to-b from-[#C6CBD1]/15 via-transparent to-transparent blur-3xl pointer-events-none" />

          {/* Precision Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#101113] border border-[#3A3F46] text-xs font-mono text-[#C6CBD1]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39FF6A]" />
            <span>AUTONOMOUS CYBERSECURITY INVESTIGATION PLATFORM</span>
          </div>

          {/* Typography */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F4F5F6] leading-[1.08]">
              READY TO CONNECT <br />
              <span className="text-liquid-silver">THE FULL INTRUSION STORY?</span>
            </h2>

            <p className="text-sm sm:text-base text-[#A4AAB2] max-w-xl mx-auto leading-relaxed">
              Launch the TraceX Security Operations Console to ingest logs, execute the detection engine, and reconstruct attack timelines with complete forensic evidence.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/soc')}
              className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#39FF6A] hover:bg-[#25E653] text-[#08090A] text-sm font-bold tracking-wide shadow-[0_0_24px_rgba(57,255,106,0.32)] transition-all active:scale-95 cursor-pointer"
            >
              <span>Launch Live SOC Console</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={() => navigate('/events')}
              className="flex items-center gap-2 px-6 py-4 rounded-xl bg-[#101113] hover:bg-[#17191C] border border-[#3A3F46] hover:border-[#C6CBD1] text-[#F4F5F6] text-sm font-mono transition-all cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-[#C6CBD1]" />
              <span>Browse Ingested Logs</span>
            </button>
          </div>

          {/* Footnote indicators */}
          <div className="pt-6 border-t border-[#3A3F46]/50 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#727982]">
            <span>Deterministic Rule Engine</span>
            <span>•</span>
            <span>Zero Opaque Probabilities</span>
            <span>•</span>
            <span>Complete Audit Chain of Custody</span>
          </div>
        </div>
      </div>
    </section>
  );
};
