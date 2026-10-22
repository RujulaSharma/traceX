import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, ArrowRight, Check, Database, ShieldAlert } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const PlatformCapabilities: React.FC = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const [activeFormatTab, setActiveFormatTab] = useState<'csv' | 'json' | 'ndjson'>('csv');

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      gsap.from('.cap-header', {
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

      gsap.from('.cap-block', {
        scrollTrigger: {
          trigger: '.cap-blocks-container',
          start: 'top 75%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        y: 28,
        stagger: 0.15,
        duration: 0.7,
        ease: 'power2.out',
      });
    },
    { scope: sectionRef }
  );

  const sampleFormats = {
    csv: `timestamp,event_type,source,username,source_ip,destination_ip,severity,action
2026-10-21T02:19:44Z,LOGIN_FAILED,authentication,admin,185.220.101.5,10.0.0.5,medium,login
2026-10-21T02:19:45Z,LOGIN_FAILED,authentication,admin,185.220.101.5,10.0.0.5,medium,login
2026-10-21T02:22:18Z,LOGIN_SUCCESS,authentication,jsmith,185.220.101.5,10.0.0.5,info,login`,
    json: `[
  {
    "timestamp": "2026-10-21T02:28:05Z",
    "event_type": "PRIVILEGE_ESCALATION",
    "source": "server",
    "username": "jsmith",
    "source_ip": "10.0.0.5",
    "severity": "high",
    "action": "sudo",
    "metadata": {"command": "sudo -i", "pid": 4821}
  }
]`,
    ndjson: `{"timestamp":"2026-10-21T02:35:12Z","event_type":"OUTBOUND_TRANSFER","source":"database","username":"app_service","source_ip":"10.0.0.50","destination_ip":"185.220.101.5","severity":"critical","metadata":{"size_bytes":2584102912,"table":"customers"}}`,
  };

  return (
    <section
      ref={sectionRef}
      id="capabilities"
      className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#3A3F46]/60"
    >
      {/* Header */}
      <div className="cap-header space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#101113] border border-[#3A3F46] text-xs font-mono text-[#C6CBD1]">
          <span>[ ARCHITECTURAL CAPABILITIES ]</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#F4F5F6]">
              ENGINEERED FOR <br />
              <span className="text-liquid-silver">FORENSIC CERTAINTY.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#A4AAB2] max-w-xl mt-3 leading-relaxed">
              TraceX replaces disconnected security tools with an integrated ingestion, detection, and explainability architecture.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/events')}
              className="px-4 py-2 rounded-lg bg-[#101113] hover:bg-[#17191C] border border-[#3A3F46] hover:border-[#C6CBD1] text-[#F4F5F6] text-xs font-mono transition-all flex items-center gap-2 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-[#39FF6A]" />
              <span>Inspect Raw Events</span>
            </button>
          </div>
        </div>
      </div>

      {/* Varied Editorial Capability Blocks */}
      <div className="cap-blocks-container space-y-16">
        {/* BLOCK 1: Wide Split Log Ingestion Terminal */}
        <div className="cap-block rounded-3xl p-[1px] bg-gradient-to-r from-[#8D949D]/80 via-[#3A3F46] to-[#101113] shadow-xl overflow-hidden">
          <div className="rounded-[23px] bg-[#101113] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 5 cols: Editorial text */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#17191C] border border-[#3A3F46] text-xs font-mono text-[#39FF6A]">
                <Database className="w-3.5 h-3.5" />
                <span>UNIFIED LOG INGESTION</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-[#F4F5F6] tracking-tight">
                Ingest CSV, JSON, and NDJSON with Schema Normalization.
              </h3>

              <p className="text-xs sm:text-sm text-[#A4AAB2] leading-relaxed">
                Security operations rely on heterogeneous systems that output logs in radically different shapes. TraceX dynamically parses CSV tabular logs, standard JSON records, and high-velocity NDJSON streams into a single queryable <code className="text-[#39FF6A] font-mono">SecurityEvent</code> schema.
              </p>

              <div className="space-y-2 pt-2 text-xs font-mono text-[#C6CBD1]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#39FF6A]" />
                  <span>Automatic timestamp timezone conversion to UTC</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#39FF6A]" />
                  <span>Entity extraction: User, Source IP, Destination IP, Action</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#39FF6A]" />
                  <span>JSONB metadata preservation for custom payload inspection</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => navigate('/ingestion')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#39FF6A] hover:underline font-mono cursor-pointer"
                >
                  <span>Upload & Ingest Log Files</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right 7 cols: Interactive Log Parser Terminal */}
            <div className="lg:col-span-7 rounded-2xl bg-[#08090A] border border-[#3A3F46] p-4 sm:p-5 font-mono text-xs space-y-3">
              {/* Terminal tabs */}
              <div className="flex items-center justify-between pb-3 border-b border-[#3A3F46]/60">
                <div className="flex items-center gap-2">
                  {(['csv', 'json', 'ndjson'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setActiveFormatTab(fmt)}
                      className={`px-3 py-1 rounded text-[11px] uppercase transition-all cursor-pointer ${
                        activeFormatTab === fmt
                          ? 'bg-[#17191C] text-[#39FF6A] border border-[#3A3F46] font-bold'
                          : 'text-[#727982] hover:text-[#C6CBD1]'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-[#727982]">PARSER: ACTIVE</span>
              </div>

              {/* Ingested Sample preview */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase text-[#727982]">RAW TELEMETRY INPUT</div>
                <pre className="p-3 rounded-lg bg-[#101113] border border-[#3A3F46]/60 text-[11px] text-[#C6CBD1] overflow-x-auto whitespace-pre-wrap max-h-36 leading-relaxed">
                  {sampleFormats[activeFormatTab]}
                </pre>
              </div>

              {/* Normalized representation output */}
              <div className="space-y-1.5 pt-2 border-t border-[#3A3F46]/40">
                <div className="flex items-center justify-between text-[10px] text-[#727982]">
                  <span>NORMALIZED DATABASE SCHEMA</span>
                  <span className="text-[#39FF6A]">✓ PARSED & INDEXED</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#17191C] border border-[#3A3F46]/60 text-[11px] text-[#F1F3F5] grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[#727982]">Timestamp:</span> 2026-10-21T02:19:44Z
                  </div>
                  <div>
                    <span className="text-[#727982]">Event:</span> LOGIN_FAILED
                  </div>
                  <div>
                    <span className="text-[#727982]">User:</span> admin
                  </div>
                  <div>
                    <span className="text-[#727982]">Source IP:</span> 185.220.101.5
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BLOCK 2: Deterministic Threat Detection & MITRE ATT&CK Mapping */}
        <div className="cap-block rounded-3xl p-[1px] bg-gradient-to-r from-[#101113] via-[#3A3F46] to-[#8D949D]/80 shadow-xl overflow-hidden">
          <div className="rounded-[23px] bg-[#101113] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 7 cols: 5 Configured Detection Rules Matrix */}
            <div className="lg:col-span-7 order-2 lg:order-1 space-y-3 font-mono text-xs">
              <div className="text-[10px] uppercase text-[#727982] flex items-center justify-between pb-2 border-b border-[#3A3F46]/60">
                <span>CONFIGURED DETECTION RULES</span>
                <span className="text-[#39FF6A]">5 OF 5 ACTIVE</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#08090A] border border-[#3A3F46] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#FFD84D] font-bold text-xs">BRUTE_FORCE_BURST</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">T1110</span>
                  </div>
                  <p className="text-[11px] text-[#A4AAB2]">
                    Triggers when &gt; 5 authentication failures occur within a 3-minute window.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#08090A] border border-[#3A3F46] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#39FF6A] font-bold text-xs">NEW_IP_AFTER_BURST</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300">T1078</span>
                  </div>
                  <p className="text-[11px] text-[#A4AAB2]">
                    Detects successful login following a failed brute force burst from the same source IP.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#08090A] border border-[#3A3F46] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#FF6464] font-bold text-xs">UNAUTHORIZED_SUDO</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950 text-red-300">T1548</span>
                  </div>
                  <p className="text-[11px] text-[#A4AAB2]">
                    Flags privilege escalation executed via sudo commands by compromised accounts.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#08090A] border border-[#3A3F46] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#FF6464] font-bold text-xs">MASS_DATA_EXFIL</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950 text-red-300">T1048</span>
                  </div>
                  <p className="text-[11px] text-[#A4AAB2]">
                    Surfaces outbound transfers exceeding threshold gigabyte payloads to untrusted external IPs.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#17191C] border border-[#3A3F46] text-[#A4AAB2] flex items-center justify-between text-[11px]">
                <span>RAPID_PORT_SWEEP_RULE (T1046)</span>
                <span className="text-[#39FF6A] font-bold">RECON DETECTED</span>
              </div>
            </div>

            {/* Right 5 cols: Editorial text */}
            <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#17191C] border border-[#3A3F46] text-xs font-mono text-[#FFD84D]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>MULTI-RULE THREAT DETECTION</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-[#F4F5F6] tracking-tight">
                Deterministic Rule Detection Without Probabilistic Drift.
              </h3>

              <p className="text-xs sm:text-sm text-[#A4AAB2] leading-relaxed">
                Rather than trusting unexplainable AI black boxes, TraceX runs high-performance deterministic rules directly against normalized telemetry. When a rule fires, analysts see the exact threshold condition, the involved entities, and the mapped MITRE technique.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/detections')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#39FF6A] hover:underline font-mono cursor-pointer"
                >
                  <span>Review Configured Detections</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
