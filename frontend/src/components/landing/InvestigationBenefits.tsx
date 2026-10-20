import React from 'react';
import { Clock, BarChart3, FileCheck } from 'lucide-react';

export const InvestigationBenefits: React.FC = () => {
  const benefits = [
    {
      title: 'FASTER INVESTIGATIONS',
      description: 'Connect related security events to reduce manual investigation effort.',
      icon: Clock,
    },
    {
      title: 'DEEPER INSIGHTS',
      description: 'Understand relationships between suspicious users, IP addresses, timestamps, and systems.',
      icon: BarChart3,
    },
    {
      title: 'CLEAR EXPLANATIONS',
      description: 'Review findings, supporting evidence, and the likely sequence of an intrusion.',
      icon: FileCheck,
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#383438]/50">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Heading & Description */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#F4F2F3]">
            INVESTIGATE <br />
            WITH <span className="text-[#E7A1B5]">CONTEXT.</span>
          </h2>
          <p className="text-sm text-[#A5A3A7] leading-relaxed">
            Turn complex security data into clear, actionable investigation insights.
          </p>
        </div>

        {/* Right Column: 3 Feature Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-xl bg-[#171719] border border-[#383438] space-y-3 hover:border-[#E7A1B5]/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-[#08090A] border border-[#383438] flex items-center justify-center text-[#E7A1B5]">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-[#F4F2F3] uppercase tracking-wide">
                  {benefit.title}
                </h3>
                <p className="text-xs text-[#A5A3A7] leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
