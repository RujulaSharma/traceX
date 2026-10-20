import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, ShieldAlert, GitMerge, Layers, FileCheck, ArrowUpRight } from 'lucide-react';

export const FiveFeatureCards: React.FC = () => {
  const navigate = useNavigate();

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
    <section id="features" className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(card.route)}
              className="group p-5 rounded-xl bg-[#171719] hover:bg-[#1D1E21] border border-[#383438] hover:border-[#E7A1B5]/60 transition-all cursor-pointer flex flex-col justify-between space-y-4 relative"
            >
              <div className="space-y-3">
                {/* Header with Icon and Arrow */}
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-[#08090A] border border-[#383438] flex items-center justify-center text-[#E7A1B5] group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="w-6 h-6 rounded-full border border-[#383438] flex items-center justify-center text-[#A5A3A7] group-hover:text-[#39FF6A] group-hover:border-[#39FF6A]/60 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-[#F4F2F3] group-hover:text-white transition-colors">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-[#A5A3A7] leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Tag Badge */}
              <div className="pt-2 border-t border-[#383438]/60">
                <span className="text-[10px] font-mono font-medium text-[#E7A1B5]/90">
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
