import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, ShieldAlert, GitMerge, Layers, FileCheck, ArrowUpRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const FiveFeatureCards: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        y: 24,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power2.out',
      });
    },
    { scope: containerRef }
  );

  const cards = [
    {
      icon: Database,
      title: 'Unified Log Ingestion',
      description: 'Process authentication, network, and server logs from multiple sources.',
      route: '/ingestion',
      badge: 'CSV, JSON, NDJSON',
    },
    {
      icon: ShieldAlert,
      title: 'Multi-Stage Threat Detection',
      description: 'Identify suspicious activity using deterministic detection rules and security indicators.',
      route: '/detections',
      badge: '5 Detection Rules',
    },
    {
      icon: GitMerge,
      title: 'Event Correlation',
      description: 'Correlate related events across users, IP addresses, timestamps, and systems to uncover attack paths.',
      route: '/incidents',
      badge: 'Entity Clustering',
    },
    {
      icon: Layers,
      title: 'Attack Reconstruction',
      description: 'Build a chronological view of a suspected intrusion with linked events and supporting evidence.',
      route: '/incidents',
      badge: 'Interactive Graph',
    },
    {
      icon: FileCheck,
      title: 'Evidence & Explainability',
      description: 'Review detection findings, forensic evidence, and the likely sequence of a suspected attack.',
      route: '/incidents',
      badge: 'Root-Cause Story',
    },
  ];

  return (
    <section ref={containerRef} id="features" className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(card.route)}
              className="feature-card group p-5 rounded-xl bg-gradient-to-b from-[#1C1F24] to-[#121417] hover:from-[#22252A] hover:to-[#17191C] border border-[#3A3F46] hover:border-[#C6CBD1]/70 transition-all cursor-pointer flex flex-col justify-between space-y-4 relative shadow-sm hover:shadow-[0_4px_20px_rgba(198,203,209,0.1)] hover:-translate-y-1"
            >
              <div className="space-y-3">
                {/* Header with Metallic Icon Frame & Arrow */}
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-[#08090A] border border-[#3A3F46] group-hover:border-[#C6CBD1] flex items-center justify-center text-[#C6CBD1] group-hover:text-[#F1F3F5] transition-all group-hover:scale-105 shadow-inner">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="w-6 h-6 rounded-full border border-[#3A3F46] flex items-center justify-center text-[#A4AAB2] group-hover:text-[#39FF6A] group-hover:border-[#39FF6A]/60 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-[#F4F5F6] group-hover:text-white transition-colors">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-[#A4AAB2] leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Tag Badge with Liquid Chrome accent */}
              <div className="pt-2 border-t border-[#3A3F46]/60">
                <span className="text-[10px] font-mono font-medium text-[#C6CBD1]">
                  {card.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
