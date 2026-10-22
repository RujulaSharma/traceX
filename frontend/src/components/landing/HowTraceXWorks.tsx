import React, { useRef } from 'react';
import { Database, Search, GitMerge, Layers, FileCheck, ArrowRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const HowTraceXWorks: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      // Header entrance
      gsap.from('.how-header', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
      });

      // 5 Process cards staggered entrance
      gsap.from('.process-card', {
        scrollTrigger: {
          trigger: '.process-cards-grid',
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        y: 24,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power2.out',
      });

      // Connecting arrows staggered entrance
      gsap.from('.process-arrow', {
        scrollTrigger: {
          trigger: '.process-cards-grid',
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        scale: 0.5,
        stagger: 0.1,
        duration: 0.4,
        delay: 0.35,
        ease: 'back.out(1.5)',
      });
    },
    { scope: containerRef }
  );

  const steps = [
    {
      number: '01',
      title: 'INGEST LOGS',
      description: 'Import authentication, network, and server logs.',
      icon: Database,
    },
    {
      number: '02',
      title: 'DETECT',
      description: 'Find suspicious events using configured detection rules.',
      icon: Search,
    },
    {
      number: '03',
      title: 'CORRELATE',
      description: 'Link related findings across sources.',
      icon: GitMerge,
    },
    {
      number: '04',
      title: 'RECONSTRUCT',
      description: 'Build the suspected attack sequence and incident timeline.',
      icon: Layers,
    },
    {
      number: '05',
      title: 'EXPLAIN',
      description: 'Review evidence and understand the likely attack progression.',
      icon: FileCheck,
    },
  ];

  return (
    <section ref={containerRef} id="how-it-works" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#3A3F46]/50">
      <div className="how-header space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#17191C] border border-[#3A3F46] text-[10px] sm:text-xs font-mono font-semibold tracking-wider text-[#C6CBD1]">
          <span>[ HOW TRACEX WORKS ]</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#F4F5F6]">
            FROM NOISE <br />
            TO <span className="text-liquid-silver">NARRATIVE</span>
          </h2>
          <p className="text-sm text-[#A4AAB2] max-w-md">
            Turn scattered logs into a structured, explainable attack story with autonomous investigation.
          </p>
        </div>
      </div>

      {/* 5 Horizontally Aligned Precision Cards Connected by Green Arrows */}
      <div className="process-cards-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="relative flex flex-col">
              <div className="process-card h-full p-5 rounded-xl bg-gradient-to-b from-[#1C1F24] to-[#141619] border border-[#3A3F46] flex flex-col justify-between space-y-4 hover:border-[#C6CBD1]/70 transition-all shadow-sm hover:-translate-y-1">
                {/* Header with Icon and Number */}
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-[#08090A] border border-[#3A3F46] flex items-center justify-center text-[#C6CBD1] shadow-inner">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#727982]">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-[#F4F5F6] uppercase tracking-wide">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#A4AAB2] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connecting neon green arrow on desktop */}
              {idx < steps.length - 1 && (
                <div className="process-arrow hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-[#39FF6A] pointer-events-none drop-shadow-[0_0_8px_rgba(57,255,106,0.6)]">
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
