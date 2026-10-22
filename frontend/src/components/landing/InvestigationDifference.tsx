import React, { useRef } from 'react';
import { XCircle, CheckCircle2, Eye, ShieldCheck, Clock, Layers } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const InvestigationDifference: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      gsap.from('.diff-header', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
      });

      gsap.from('.diff-comparison', {
        scrollTrigger: {
          trigger: '.diff-comparison',
          start: 'top 75%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: 'power2.out',
      });

      gsap.from('.diff-pillar', {
        scrollTrigger: {
          trigger: '.diff-pillars-grid',
          start: 'top 80%',
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

  return (
    <section
      ref={containerRef}
      className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#3A3F46]/60"
    >
      {/* Editorial Header */}
      <div className="diff-header space-y-4 mb-16 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#101113] border border-[#3A3F46] text-xs font-mono text-[#C6CBD1]">
          <span>[ THE PARADIGM SHIFT ]</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#F4F5F6]">
          STOP TRIAGING ISOLATED ALERTS. <br />
          <span className="text-liquid-silver">START RECONSTRUCTING INCIDENTS.</span>
        </h2>

        <p className="text-sm sm:text-base text-[#A4AAB2] leading-relaxed">
          How moving from disjointed query tools to connected entity graphs changes the day-to-day workflow for cybersecurity investigators.
        </p>
      </div>

      {/* High-Contrast Comparison Layout */}
      <div className="diff-comparison grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Left: Traditional Disjointed Tooling */}
        <div className="p-8 rounded-3xl bg-[#0E1012] border border-[#3A3F46] space-y-6">
          <div className="space-y-2 pb-4 border-b border-[#3A3F46]/60">
            <div className="flex items-center gap-2 text-xs font-mono text-[#FF6464] font-bold">
              <XCircle className="w-4 h-4" />
              <span>THE OLD SOC REALITY</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#F4F5F6]">
              Fragmented Alerts & Hours of Manual Correlating
            </h3>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#A4AAB2]">
            <div className="flex items-start gap-3">
              <span className="text-[#FF6464] font-mono text-base font-bold">✕</span>
              <div>
                <strong className="text-[#F4F5F6]">Alert Fatigue:</strong> Dozens of unlinked notifications from disparate log sources clutter the analyst queue with no obvious root cause.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-[#FF6464] font-mono text-base font-bold">✕</span>
              <div>
                <strong className="text-[#F4F5F6]">Manual Query Juggling:</strong> Analysts write bespoke SQL or SIEM search strings to cross-reference IPs, timestamps, and usernames.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-[#FF6464] font-mono text-base font-bold">✕</span>
              <div>
                <strong className="text-[#F4F5F6]">Blind Spots in Progression:</strong> Lateral movements and internal privilege elevations often go unnoticed between external firewall blocks.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-[#FF6464] font-mono text-base font-bold">✕</span>
              <div>
                <strong className="text-[#F4F5F6]">Unverifiable Reporting:</strong> Reports rely on guesswork or probabilistic summaries without one-click raw log evidence backing.
              </div>
            </div>
          </div>
        </div>

        {/* Right: TraceX Connected Workflow */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-[#1C1F24] to-[#121417] border border-[#39FF6A]/60 shadow-[0_4px_30px_rgba(57,255,106,0.08)] space-y-6">
          <div className="space-y-2 pb-4 border-b border-[#3A3F46]/60">
            <div className="flex items-center gap-2 text-xs font-mono text-[#39FF6A] font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>THE TRACEX INVESTIGATION WORKFLOW</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#F4F5F6]">
              Autonomous Entity Clustering & Chronological Story
            </h3>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#A4AAB2]">
            <div className="flex items-start gap-3">
              <span className="text-[#39FF6A] font-mono text-base font-bold">✓</span>
              <div>
                <strong className="text-[#F4F5F6]">Related Events in Context:</strong> Events sharing common source IPs, usernames, or target ports automatically cluster into a single cohesive incident.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-[#39FF6A] font-mono text-base font-bold">✓</span>
              <div>
                <strong className="text-[#F4F5F6]">Chronological Reconstruction:</strong> Follow the suspected intrusion from external probe through internal database exfiltration in minutes.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-[#39FF6A] font-mono text-base font-bold">✓</span>
              <div>
                <strong className="text-[#F4F5F6]">100% Raw Evidence Backing:</strong> Every finding links directly to the immutable raw audit log entry with zero probability drift.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-[#39FF6A] font-mono text-base font-bold">✓</span>
              <div>
                <strong className="text-[#F4F5F6]">Decisive SOC Containment:</strong> Understand which identities and IP addresses must be revoked immediately to stop data leakage.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Investigator Value Pillars */}
      <div className="diff-pillars-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="diff-pillar p-6 rounded-2xl bg-[#101113] border border-[#3A3F46] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#08090A] border border-[#3A3F46] flex items-center justify-center text-[#39FF6A]">
            <Eye className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#F4F5F6]">Contextual Clarity</h4>
          <p className="text-xs text-[#A4AAB2] leading-relaxed">
            See the bigger picture instead of drowning in disconnected single-event alerts.
          </p>
        </div>

        <div className="diff-pillar p-6 rounded-2xl bg-[#101113] border border-[#3A3F46] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#08090A] border border-[#3A3F46] flex items-center justify-center text-[#C6CBD1]">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#F4F5F6]">Time to Understanding</h4>
          <p className="text-xs text-[#A4AAB2] leading-relaxed">
            Reduce investigation cycles from hours of manual parsing to immediate visual clarity.
          </p>
        </div>

        <div className="diff-pillar p-6 rounded-2xl bg-[#101113] border border-[#3A3F46] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#08090A] border border-[#3A3F46] flex items-center justify-center text-[#FFD84D]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#F4F5F6]">Deterministic Rules</h4>
          <p className="text-xs text-[#A4AAB2] leading-relaxed">
            Reliable threshold triggers aligned with MITRE ATT&CK for auditable compliance.
          </p>
        </div>

        <div className="diff-pillar p-6 rounded-2xl bg-[#101113] border border-[#3A3F46] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#08090A] border border-[#3A3F46] flex items-center justify-center text-[#39FF6A]">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#F4F5F6]">Root-Cause Story</h4>
          <p className="text-xs text-[#A4AAB2] leading-relaxed">
            Present incident timelines that executives, security leads, and auditors can trust.
          </p>
        </div>
      </div>
    </section>
  );
};
