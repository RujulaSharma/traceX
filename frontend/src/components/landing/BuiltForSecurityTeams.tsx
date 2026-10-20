import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Search, AlertTriangle, Layers, ArrowRight } from 'lucide-react';

export const BuiltForSecurityTeams: React.FC = () => {
  const navigate = useNavigate();

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
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#383438]/50">
      <div className="space-y-3 mb-8">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#F4F2F3]">
          BUILT FOR <span className="text-[#E7A1B5]">SECURITY TEAMS.</span>
        </h2>
        <p className="text-sm text-[#A5A3A7] max-w-2xl leading-relaxed">
          From SOC analysts to threat hunters, TraceX brings related security evidence into one investigation workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(tool.route)}
              className="group p-5 rounded-xl bg-[#171719] hover:bg-[#1D1E21] border border-[#383438] hover:border-[#E7A1B5]/60 transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-lg bg-[#08090A] border border-[#383438] flex items-center justify-center text-[#E7A1B5] group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#F4F2F3] group-hover:text-white transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-[#A5A3A7] leading-relaxed">
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
