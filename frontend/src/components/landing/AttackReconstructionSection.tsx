import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, User, AlertCircle, FileSearch, Server, ArrowRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const AttackReconstructionSection: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      // Header entrance
      gsap.from('.recon-header', {
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

      // Recon Main Card entrance
      gsap.from('.recon-box', {
        scrollTrigger: {
          trigger: '.recon-box',
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: 'power2.out',
      });

      // Nodes Staggered Entrance
      gsap.from('.recon-node-item', {
        scrollTrigger: {
          trigger: '.recon-box',
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        scale: 0.8,
        y: 12,
        stagger: 0.12,
        duration: 0.6,
        ease: 'back.out(1.4)',
      });

      // Connector Lines Reveal
      gsap.from('.recon-connector-line', {
        scrollTrigger: {
          trigger: '.recon-box',
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true,
        },
        scaleX: 0,
        transformOrigin: 'left center',
        stagger: 0.12,
        duration: 0.5,
        delay: 0.2,
        ease: 'power2.out',
      });
    },
    { scope: containerRef }
  );

  const nodes = [
    {
      step: '1',
      title: 'Suspicious IP',
      value: '185.220.101.5',
      icon: Globe,
      color: '#C6CBD1',
      borderColor: 'border-[#C6CBD1]',
      textColor: 'text-[#C6CBD1]',
      bgGlow: 'bg-[#C6CBD1]/10',
    },
    {
      step: '2',
      title: 'User Account',
      value: 'jsmith / admin',
      icon: User,
      color: '#C6CBD1',
      borderColor: 'border-[#C6CBD1]',
      textColor: 'text-[#C6CBD1]',
      bgGlow: 'bg-[#C6CBD1]/10',
    },
    {
      step: '3',
      title: 'Authentication',
      value: 'Failed Logins (Brute Force)',
      icon: AlertCircle,
      color: '#FFD84D',
      borderColor: 'border-[#FFD84D]',
      textColor: 'text-[#FFD84D]',
      bgGlow: 'bg-[#FFD84D]/10',
    },
    {
      step: '4',
      title: 'Related Findings',
      value: 'Lateral Recon & PrivEsc',
      icon: FileSearch,
      color: '#C6CBD1',
      borderColor: 'border-[#C6CBD1]',
      textColor: 'text-[#C6CBD1]',
      bgGlow: 'bg-[#C6CBD1]/10',
    },
    {
      step: '5',
      title: 'Target System',
      value: '10.0.0.50 (Internal Server)',
      icon: Server,
      color: '#39FF6A',
      borderColor: 'border-[#39FF6A]',
      textColor: 'text-[#39FF6A]',
      bgGlow: 'bg-[#39FF6A]/10',
    },
  ];

  return (
    <section ref={containerRef} className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#3A3F46]/50">
      <div className="recon-header space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#17191C] border border-[#3A3F46] text-[10px] sm:text-xs font-mono font-semibold tracking-wider text-[#C6CBD1]">
          <span>[ ATTACK RECONSTRUCTION ]</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#F4F5F6]">
          EVERY SIGNAL <br />
          HAS <span className="text-liquid-silver">A STORY.</span>
        </h2>

        <p className="text-sm text-[#A4AAB2] max-w-xl">
          TraceX connects related security events to reveal the sequence of a suspected attack.
        </p>
      </div>

      {/* Horizontal investigation chain with 5 connected nodes */}
      <div className="recon-box p-6 sm:p-8 rounded-2xl bg-[#101113] border border-[#3A3F46] space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#3A3F46]/60 text-xs text-[#A4AAB2]">
          <span className="font-mono text-[11px] text-[#C6CBD1]">DEMONSTRATION INCIDENT CHAIN</span>
          <span className="font-mono text-[11px] text-[#727982]">5 CORRELATED ENTITIES</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {nodes.map((node, idx) => {
            const Icon = node.icon;
            return (
              <div key={idx} className="recon-node-item relative flex flex-col items-center text-center space-y-3">
                {/* Circular metallic node */}
                <div
                  className={`w-14 h-14 rounded-full border-2 ${node.borderColor} ${node.bgGlow} flex items-center justify-center shadow-lg transition-transform hover:scale-110 bg-[#17191C]`}
                >
                  <Icon className={`w-6 h-6 ${node.textColor}`} />
                </div>

                {/* Node info */}
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#F4F5F6]">{node.title}</div>
                  <div className={`font-mono text-[11px] ${node.textColor} truncate max-w-[160px]`}>
                    {node.value}
                  </div>
                </div>

                {/* Connecting dotted connector line on desktop */}
                {idx < nodes.length - 1 && (
                  <div className="recon-connector-line hidden md:block absolute top-7 left-[calc(50%+28px)] right-[calc(-50%+28px)] h-[1px] border-t-2 border-dotted border-[#3A3F46] z-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-6 flex justify-start border-t border-[#3A3F46]/60">
          <button
            onClick={() => navigate('/incidents')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#08090A] hover:bg-[#17191C] border border-[#39FF6A] text-[#39FF6A] text-xs font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(57,255,106,0.18)] active:scale-95"
          >
            <span>View Attack Graph</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </section>
  );
};
