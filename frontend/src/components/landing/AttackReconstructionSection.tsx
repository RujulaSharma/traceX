import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, User, AlertCircle, FileSearch, Server, ArrowRight } from 'lucide-react';

export const AttackReconstructionSection: React.FC = () => {
  const navigate = useNavigate();

  const nodes = [
    {
      step: '1',
      title: 'Suspicious IP',
      value: '185.220.101.5',
      icon: Globe,
      color: '#E7A1B5', // Pink
      borderColor: 'border-[#E7A1B5]',
      textColor: 'text-[#E7A1B5]',
      bgGlow: 'bg-[#E7A1B5]/10',
    },
    {
      step: '2',
      title: 'User Account',
      value: 'jsmith / admin',
      icon: User,
      color: '#E7A1B5', // Pink
      borderColor: 'border-[#E7A1B5]',
      textColor: 'text-[#E7A1B5]',
      bgGlow: 'bg-[#E7A1B5]/10',
    },
    {
      step: '3',
      title: 'Authentication',
      value: 'Failed Logins (Brute Force)',
      icon: AlertCircle,
      color: '#FFD84D', // Yellow warning
      borderColor: 'border-[#FFD84D]',
      textColor: 'text-[#FFD84D]',
      bgGlow: 'bg-[#FFD84D]/10',
    },
    {
      step: '4',
      title: 'Related Findings',
      value: 'Lateral Recon & PrivEsc',
      icon: FileSearch,
      color: '#E7A1B5', // Pink
      borderColor: 'border-[#E7A1B5]',
      textColor: 'text-[#E7A1B5]',
      bgGlow: 'bg-[#E7A1B5]/10',
    },
    {
      step: '5',
      title: 'Target System',
      value: '10.0.0.50 (Internal Server)',
      icon: Server,
      color: '#39FF6A', // Green confirmed target
      borderColor: 'border-[#39FF6A]',
      textColor: 'text-[#39FF6A]',
      bgGlow: 'bg-[#39FF6A]/10',
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#383438]/50">
      <div className="space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171719] border border-[#383438] text-[10px] sm:text-xs font-mono font-semibold tracking-wider text-[#E7A1B5]">
          <span>[ ATTACK RECONSTRUCTION ]</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#F4F2F3]">
          EVERY SIGNAL <br />
          HAS <span className="text-[#E7A1B5]">A STORY.</span>
        </h2>

        <p className="text-sm text-[#A5A3A7] max-w-xl">
          TraceX connects related security events to reveal the sequence of a suspected attack.
        </p>
      </div>

      {/* Horizontal investigation chain with 5 connected nodes */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#101113] border border-[#383438] space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#383438]/60 text-xs text-[#A5A3A7]">
          <span className="font-mono text-[11px] text-[#E7A1B5]">DEMONSTRATION INCIDENT CHAIN</span>
          <span className="font-mono text-[11px] text-[#A5A3A7]">5 CORRELATED ENTITIES</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {nodes.map((node, idx) => {
            const Icon = node.icon;
            return (
              <div key={idx} className="relative flex flex-col items-center text-center space-y-3">
                {/* Circular Icon with dotted/solid border */}
                <div
                  className={`w-14 h-14 rounded-full border-2 ${node.borderColor} ${node.bgGlow} flex items-center justify-center shadow-lg transition-transform hover:scale-110`}
                >
                  <Icon className={`w-6 h-6 ${node.textColor}`} />
                </div>

                {/* Node info */}
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#F4F2F3]">{node.title}</div>
                  <div className={`font-mono text-[11px] ${node.textColor} truncate max-w-[160px]`}>
                    {node.value}
                  </div>
                </div>

                {/* Connecting dotted connector line on desktop */}
                {idx < nodes.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+28px)] right-[calc(-50%+28px)] h-[1px] border-t-2 border-dotted border-[#383438] z-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-6 flex justify-start border-t border-[#383438]/60">
          <button
            onClick={() => navigate('/incidents')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#08090A] hover:bg-[#171719] border border-[#39FF6A] text-[#39FF6A] text-xs font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(57,255,106,0.15)] active:scale-95"
          >
            <span>View Attack Graph</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </section>
  );
};
