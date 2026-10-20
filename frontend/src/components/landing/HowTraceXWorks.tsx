import React from 'react';
import { Database, Search, GitMerge, Layers, FileCheck, ArrowRight } from 'lucide-react';

export const HowTraceXWorks: React.FC = () => {
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
    <section id="how-it-works" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#383438]/50">
      <div className="space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171719] border border-[#383438] text-[10px] sm:text-xs font-mono font-semibold tracking-wider text-[#E7A1B5]">
          <span>[ HOW TRACEX WORKS ]</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#F4F2F3]">
            FROM NOISE <br />
            TO <span className="text-[#E7A1B5]">NARRATIVE</span>
          </h2>
          <p className="text-sm text-[#A5A3A7] max-w-md">
            Turn scattered logs into a structured, explainable attack story with autonomous investigation.
          </p>
        </div>
      </div>

      {/* 5 Horizontally Aligned Numbered Cards Connected by Green Arrows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="relative flex flex-col">
              <div className="h-full p-5 rounded-xl bg-[#171719] border border-[#383438] flex flex-col justify-between space-y-4 hover:border-[#E7A1B5]/50 transition-colors">
                {/* Header with Icon and Number */}
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-[#08090A] border border-[#383438] flex items-center justify-center text-[#E7A1B5]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#A5A3A7]">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-[#F4F2F3] uppercase tracking-wide">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#A5A3A7] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connecting neon green arrow (visible on lg screens between cards) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-[#39FF6A] pointer-events-none">
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
