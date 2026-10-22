import React, { useRef } from 'react';
import { Clock, BarChart3, FileCheck } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const InvestigationBenefits: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      // Editorial reveal
      gsap.from('.benefits-header', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        x: -20,
        duration: 0.6,
        ease: 'power2.out',
      });

      // Staggered cards reveal
      gsap.from('.benefit-card', {
        scrollTrigger: {
          trigger: '.benefits-grid',
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power2.out',
      });
    },
    { scope: containerRef }
  );

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
    <section ref={containerRef} className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#3A3F46]/50">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Heading & Description */}
        <div className="benefits-header lg:col-span-4 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#F4F5F6]">
            INVESTIGATE <br />
            WITH <span className="text-liquid-silver">CONTEXT.</span>
          </h2>
          <p className="text-sm text-[#A4AAB2] leading-relaxed">
            Turn complex security data into clear, actionable investigation insights.
          </p>
        </div>

        {/* Right Column: 3 Feature Cards in Brushed Steel Aesthetic */}
        <div className="benefits-grid lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={idx}
                className="benefit-card p-5 rounded-xl bg-gradient-to-b from-[#1C1F24] to-[#121417] border border-[#3A3F46] space-y-3 hover:border-[#C6CBD1]/70 transition-all shadow-sm hover:-translate-y-1"
              >
                <div className="w-9 h-9 rounded-lg bg-[#08090A] border border-[#3A3F46] flex items-center justify-center text-[#C6CBD1] shadow-inner">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-[#F4F5F6] uppercase tracking-wide">
                  {benefit.title}
                </h3>
                <p className="text-xs text-[#A4AAB2] leading-relaxed">
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
