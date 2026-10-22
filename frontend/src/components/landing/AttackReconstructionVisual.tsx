import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, User, ShieldAlert, Terminal, Server, ArrowRight, GitBranch, AlertTriangle } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const AttackReconstructionVisual: React.FC = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      gsap.from('.recon-visual-header', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
      });

      gsap.from('.recon-visual-canvas', {
        scrollTrigger: {
          trigger: '.recon-visual-canvas',
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        scale: 0.98,
        y: 24,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('.recon-node-box', {
        scrollTrigger: {
          trigger: '.recon-visual-canvas',
          start: 'top 75%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        y: 16,
        stagger: 0.1,
        duration: 0.6,
        ease: 'back.out(1.2)',
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="attack-graph"
      className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#3A3F46]/60"
    >
      {/* Editorial Header */}
      <div className="recon-visual-header space-y-4 mb-14 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#101113] border border-[#3A3F46] text-xs font-mono text-[#C6CBD1]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#39FF6A]" />
          <span>[ SIGNATURE CAPABILITY // ATTACK RECONSTRUCTION ]</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#F4F5F6]">
          EVERY THREAT SIGNAL <br />
          <span className="text-liquid-silver">HAS AN ATTACHED STORY.</span>
        </h2>

        <p className="text-sm sm:text-base text-[#A4AAB2] leading-relaxed">
          Traditional SOC tools isolate alerts into disconnected queues. TraceX traces the entity graph across network boundaries, host execution, and data storage to uncover the full intrusion trajectory.
        </p>
      </div>

      {/* Signature Large-Scale Visual Graph Frame */}
      <div className="recon-visual-canvas rounded-3xl p-[1px] bg-gradient-to-b from-[#8D949D] via-[#3A3F46] to-[#101113] shadow-2xl overflow-hidden">
        <div className="rounded-[23px] bg-[#0E1012] p-6 sm:p-10 relative overflow-hidden">
          {/* Subtle background coordinate grid */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#F1F3F5 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          {/* Header Bar inside graph frame */}
          <div className="relative z-10 flex flex-wrap items-center justify-between pb-6 border-b border-[#3A3F46]/70 gap-4">
            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="px-2.5 py-1 rounded bg-[#17191C] border border-[#3A3F46] text-[#39FF6A] font-bold flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-[#39FF6A]" />
                RECONSTRUCTED INCIDENT GRAPH
              </div>
              <span className="text-[#A4AAB2]">CLUSTER ID: #INC-9402</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-[#FFD84D] flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                CONFIRMED THREAT ACTOR
              </span>
              <span className="text-[#727982]">|</span>
              <span className="text-[#39FF6A]">5 LINKED ENTITIES</span>
            </div>
          </div>

          {/* Central 5-Node Large Scale Connected Diagram */}
          <div className="relative z-10 py-10">
            {/* SVG Connector Spline Curves */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 1000 240" fill="none">
                <defs>
                  <linearGradient id="reconGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF6464" />
                    <stop offset="25%" stopColor="#FFD84D" />
                    <stop offset="50%" stopColor="#C6CBD1" />
                    <stop offset="75%" stopColor="#F1F3F5" />
                    <stop offset="100%" stopColor="#39FF6A" />
                  </linearGradient>
                </defs>

                {/* Main liquid chrome connection spline */}
                <path
                  d="M 120 120 C 220 50, 280 180, 380 120 C 480 60, 520 180, 620 120 C 720 60, 780 170, 880 120"
                  stroke="url(#reconGradient)"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                />

                {/* Ambient glow behind spline */}
                <path
                  d="M 120 120 C 220 50, 280 180, 380 120 C 480 60, 520 180, 620 120 C 720 60, 780 170, 880 120"
                  stroke="url(#reconGradient)"
                  strokeWidth="8"
                  opacity="0.15"
                />
              </svg>
            </div>

            {/* 5 Prominent Entity Nodes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative">
              {/* NODE 1: Ingress Attacker IP */}
              <div className="recon-node-box p-5 rounded-2xl bg-gradient-to-b from-[#1C1F24] to-[#121417] border border-[#FF6464]/60 shadow-lg space-y-3 relative group hover:border-[#FF6464] transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#08090A] border border-[#FF6464] flex items-center justify-center text-[#FF6464] shadow-md group-hover:scale-105 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#FF6464] font-bold uppercase tracking-wider">
                    01. INGRESS ATTACKER
                  </div>
                  <div className="text-sm font-bold text-[#F4F5F6] font-mono mt-0.5">
                    185.220.101.5
                  </div>
                </div>
                <div className="pt-2 border-t border-[#3A3F46]/60 text-[11px] font-mono text-[#A4AAB2] space-y-1">
                  <div>PORT: Inbound Sweep</div>
                  <div className="text-[#FF6464]">Tor Exit / Malicious</div>
                </div>
              </div>

              {/* NODE 2: Compromised User */}
              <div className="recon-node-box p-5 rounded-2xl bg-gradient-to-b from-[#1C1F24] to-[#121417] border border-[#FFD84D]/60 shadow-lg space-y-3 relative group hover:border-[#FFD84D] transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#08090A] border border-[#FFD84D] flex items-center justify-center text-[#FFD84D] shadow-md group-hover:scale-105 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#FFD84D] font-bold uppercase tracking-wider">
                    02. COMPROMISED USER
                  </div>
                  <div className="text-sm font-bold text-[#F4F5F6] font-mono mt-0.5">
                    jsmith (admin)
                  </div>
                </div>
                <div className="pt-2 border-t border-[#3A3F46]/60 text-[11px] font-mono text-[#A4AAB2] space-y-1">
                  <div>AUTH: Password Spray</div>
                  <div className="text-[#FFD84D]">28 Failures → 1 Success</div>
                </div>
              </div>

              {/* NODE 3: Authentication Barrier */}
              <div className="recon-node-box p-5 rounded-2xl bg-gradient-to-b from-[#1C1F24] to-[#121417] border border-[#C6CBD1]/70 shadow-lg space-y-3 relative group hover:border-[#F1F3F5] transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#08090A] border border-[#C6CBD1] flex items-center justify-center text-[#C6CBD1] shadow-md group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#C6CBD1] font-bold uppercase tracking-wider">
                    03. AUTH BARRIER
                  </div>
                  <div className="text-sm font-bold text-[#F4F5F6] font-mono mt-0.5">
                    10.0.0.5:22 (SSH)
                  </div>
                </div>
                <div className="pt-2 border-t border-[#3A3F46]/60 text-[11px] font-mono text-[#A4AAB2] space-y-1">
                  <div>HOST: web-prod-01</div>
                  <div className="text-liquid-silver">Session Established</div>
                </div>
              </div>

              {/* NODE 4: Privilege Escalation */}
              <div className="recon-node-box p-5 rounded-2xl bg-gradient-to-b from-[#1C1F24] to-[#121417] border border-[#F1F3F5]/60 shadow-lg space-y-3 relative group hover:border-white transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#08090A] border border-[#F1F3F5] flex items-center justify-center text-[#F1F3F5] shadow-md group-hover:scale-105 transition-transform">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#F1F3F5] font-bold uppercase tracking-wider">
                    04. PRIVILEGE ESCALATION
                  </div>
                  <div className="text-sm font-bold text-[#F4F5F6] font-mono mt-0.5">
                    sudo -i (root)
                  </div>
                </div>
                <div className="pt-2 border-t border-[#3A3F46]/60 text-[11px] font-mono text-[#A4AAB2] space-y-1">
                  <div>CMD: /usr/bin/sudo</div>
                  <div className="text-[#39FF6A]">Root Shell Gained</div>
                </div>
              </div>

              {/* NODE 5: Target Asset (Impact) */}
              <div className="recon-node-box p-5 rounded-2xl bg-gradient-to-b from-[#1C1F24] to-[#121417] border border-[#39FF6A]/70 shadow-lg space-y-3 relative group hover:border-[#39FF6A] transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#08090A] border border-[#39FF6A] flex items-center justify-center text-[#39FF6A] shadow-md group-hover:scale-105 transition-transform">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#39FF6A] font-bold uppercase tracking-wider">
                    05. TARGET ASSET IMPACT
                  </div>
                  <div className="text-sm font-bold text-[#F4F5F6] font-mono mt-0.5">
                    10.0.0.50 (Postgres)
                  </div>
                </div>
                <div className="pt-2 border-t border-[#3A3F46]/60 text-[11px] font-mono text-[#A4AAB2] space-y-1">
                  <div>DATA: customers table</div>
                  <div className="text-[#39FF6A] font-bold">2.4 GB Exfiltrated</div>
                </div>
              </div>
            </div>
          </div>

          {/* Deep Explanatory Forensic Strip */}
          <div className="relative z-10 mt-8 pt-6 border-t border-[#3A3F46]/70 grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase text-[#727982] font-bold">HOW TRACEX CONNECTED THIS</div>
              <p className="text-[#A4AAB2] leading-relaxed">
                External IP <span className="text-[#F4F5F6]">185.220.101.5</span> was linked to SSH login attempts at 02:19 UTC, which matched the successful session timestamp for user <span className="text-[#F4F5F6]">jsmith</span> at 02:22 UTC.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] uppercase text-[#727982] font-bold">INTERNAL LATERAL PIVOT</div>
              <p className="text-[#A4AAB2] leading-relaxed">
                Process logs from server <span className="text-[#F4F5F6]">web-prod-01</span> recorded a sudo privilege escalation 6 minutes later, followed by network egress to target DB <span className="text-[#F4F5F6]">10.0.0.50</span>.
              </p>
            </div>

            <div className="space-y-1.5 flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase text-[#727982] font-bold">TIME SAVED FOR SOC</div>
                <p className="text-[#39FF6A] font-bold text-sm">
                  ~4.5 Hours of Manual Query Correlating
                </p>
              </div>
              <button
                onClick={() => navigate('/incidents')}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#F4F5F6] hover:text-[#39FF6A] transition-colors cursor-pointer"
              >
                <span>Explore in Incident Console</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
