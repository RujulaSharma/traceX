import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Search, AlertTriangle, Layers, ArrowRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const BuiltForSecurityTeams: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      gsap.from('.teams-header', {
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

      gsap.from('.tool-card', {
        scrollTrigger: {
          trigger: '.tools-grid',
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        y: 22,
        stagger: 0.09,
        duration: 0.6,
        ease: 'power2.out',
      });
    },
    { scope: containerRef }
  );

  const tools = [
    {
      title: 'Log Ingestion',
      description: 'Manage and validate uploaded log files.',
      route: '/ingestion',
      icon: Database,
    },
    {
      title: 'Event Explorer',
      description: 'Search and inspect security events.',
      route: '/events',
      icon: Search,
    },
    {
      title: 'Detections',
      description: 'Review suspicious activity and rule-based findings.',
      route: '/detections',
      icon: AlertTriangle,
    },
    {
      title: 'Investigations',
      description: 'Explore incident timelines, evidence, and attack relationships.',
      route: '/incidents',
      icon: Layers,
    },
  ];

  return (
    <section ref={containerRef} className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#3A3F46]/50">
      <div className="teams-header space-y-3 mb-8">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#F4F5F6]">
          BUILT FOR <span className="text-liquid-silver">SECURITY TEAMS.</span>
        </h2>
        <p className="text-sm text-[#A4AAB2] max-w-2xl leading-relaxed">
          From SOC analysts to threat hunters, TraceX brings related security evidence into one investigation workflow.
        </p>
      </div>

      <div className="tools-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(tool.route)}
              className="tool-card group p-5 rounded-xl bg-gradient-to-b from-[#1C1F24] to-[#121417] hover:from-[#22252A] hover:to-[#17191C] border border-[#3A3F46] hover:border-[#C6CBD1]/70 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-sm hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-lg bg-[#08090A] border border-[#3A3F46] flex items-center justify-center text-[#C6CBD1] group-hover:scale-105 transition-transform shadow-inner">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#F4F5F6] group-hover:text-white transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-[#A4AAB2] leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[#39FF6A] group-hover:translate-x-1 transition-transform">
                <span>Open Tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
