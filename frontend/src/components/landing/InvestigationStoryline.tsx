import React, { useRef } from 'react';
import { Database, Search, GitMerge, Layers, FileCheck, ArrowDown } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface NarrativeStep {
  number: string;
  title: string;
  tag: string;
  summary: string;
  description: string;
  icon: React.ElementType;
  technicalDetails: {
    label: string;
    value: string;
  }[];
}

const STEPS: NarrativeStep[] = [
  {
    number: '01',
    title: 'RAW SIGNALS INGESTION',
    tag: 'MULTI-FORMAT TELEMETRY',
    summary: 'Authentication failures, unusual connections, and server events enter the investigation pipeline.',
    description:
      'Security telemetry is collected from disparate operational endpoints — authentication servers (auth.log/CSV), web gateways (nginx/NDJSON), and internal systems (auditd/JSON). TraceX parses and normalizes every event into a single schema.',
    icon: Database,
    technicalDetails: [
      { label: 'Ingested Formats', value: 'CSV, JSON, NDJSON' },
      { label: 'Normalization', value: 'Timestamp, User, IP, Action' },
      { label: 'Validation', value: 'Schema conformance & deduplication' },
    ],
  },
  {
    number: '02',
    title: 'SUSPICIOUS ACTIVITY DETECTION',
    tag: 'DETERMINISTIC RULES',
    summary: 'Detection rules evaluate telemetry to surface high-confidence threat signals without black-box drift.',
    description:
      'Rather than relying on opaque probabilities, TraceX applies deterministic detection rules: brute force burst detection, credential abuse from novel IPs, unprivileged sudo elevation, and anomalous database exfiltration patterns.',
    icon: Search,
    technicalDetails: [
      { label: 'Detection Model', value: 'Deterministic rule triggers' },
      { label: 'Framework', value: 'MITRE ATT&CK enterprise mapping' },
      { label: 'Latency', value: '< 100ms per rule evaluation' },
    ],
  },
  {
    number: '03',
    title: 'CORRELATED EVIDENCE CLUSTERING',
    tag: 'ENTITY GRAPH LINKING',
    summary: 'Related activity is connected across identities, IP addresses, timestamps, and systems.',
    description:
      'Single alerts often masquerade as isolated noise. TraceX automatically groups events that share common identifiers — an attacker IP traversing from external firewall blocks to internal SSH logins, or a compromised username escalating privilege on a secondary server.',
    icon: GitMerge,
    technicalDetails: [
      { label: 'Correlation Graph', value: 'User ↔ IP ↔ Host ↔ Timestamp' },
      { label: 'Entity Clustering', value: 'Connected component subgraphs' },
      { label: 'Noise Reduction', value: 'Aggregates 100s of events into 1 incident' },
    ],
  },
  {
    number: '04',
    title: 'RECONSTRUCTED ATTACK SEQUENCE',
    tag: 'CHRONOLOGICAL TIMELINE',
    summary: 'The investigator follows a chronological view of the suspected intrusion from initial probe to exfiltration.',
    description:
      'TraceX synthesizes correlated detections into an unbroken timeline. Each phase of the intrusion is placed in order: Reconnaissance → Credential Access → Initial Access → Privilege Escalation → Impact, establishing the full chain of events.',
    icon: Layers,
    technicalDetails: [
      { label: 'Chronology', value: 'Sub-millisecond event ordering' },
      { label: 'Attack Stage', value: '5-phase kill-chain alignment' },
      { label: 'Blast Radius', value: 'Identifies all compromised assets' },
    ],
  },
  {
    number: '05',
    title: 'EXPLAINABLE FINDINGS & FORENSICS',
    tag: 'ROOT-CAUSE STORY',
    summary: 'The investigator reviews verified supporting evidence and the likely attack progression with complete audit transparency.',
    description:
      'Every conclusion TraceX presents is backed by the exact raw log entry that produced it. SOC analysts can inspect raw packet counts, process IDs, query strings, and hashes, giving leadership and auditors verifiable certainty.',
    icon: FileCheck,
    technicalDetails: [
      { label: 'Explainability', value: '100% auditable raw log lineage' },
      { label: 'Reporting', value: 'Executive summary & forensic detail' },
      { label: 'SOC Action', value: 'Instant containment recommendations' },
    ],
  },
];

export const InvestigationStoryline: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      gsap.from('.storyline-header', {
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

      // Animate each storyline step on scroll
      const stepElements = gsap.utils.toArray<HTMLElement>('.storyline-step-item');
      stepElements.forEach((stepEl) => {
        gsap.from(stepEl, {
          scrollTrigger: {
            trigger: stepEl,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true,
          },
          opacity: 0,
          y: 30,
          duration: 0.7,
          ease: 'power2.out',
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="storyline"
      className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#3A3F46]/60"
    >
      {/* Header */}
      <div className="storyline-header space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#101113] border border-[#3A3F46] text-xs font-mono text-[#C6CBD1]">
          <span>[ THE INVESTIGATION LIFECYCLE ]</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#F4F5F6]">
              FROM RAW SIGNALS TO <br />
              <span className="text-liquid-silver">EXPLAINABLE STORY.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#A4AAB2] max-w-xl mt-3 leading-relaxed">
              How TraceX transforms high-volume operational noise into a structured, evidence-backed narrative of a cyber intrusion.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#39FF6A] pb-2">
            <span>CONTINUOUS RECONSTRUCTION PIPELINE</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Connected Editorial Narrative Steps (Asymmetrical, Rich Content) */}
      <div className="relative space-y-12 before:absolute before:left-8 md:before:left-1/2 before:top-4 before:bottom-4 before:w-[1px] before:bg-gradient-to-b before:from-[#39FF6A] before:via-[#8D949D] before:to-[#3A3F46] before:hidden md:before:block">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isEven = idx % 2 === 0;

          return (
            <div
              key={step.number}
              className={`storyline-step-item relative grid grid-cols-1 md:grid-cols-12 gap-8 items-center ${
                isEven ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Left Column (Editorial Content on even, technical details on odd) */}
              <div
                className={`md:col-span-6 space-y-4 ${
                  isEven ? 'md:pr-12 md:text-right' : 'md:order-2 md:pl-12 md:text-left'
                }`}
              >
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#17191C] border border-[#3A3F46] text-[11px] font-mono font-semibold text-[#C6CBD1] ${
                    isEven ? 'md:ml-auto' : ''
                  }`}
                >
                  <span className="text-[#39FF6A] font-bold">STAGE {step.number}</span>
                  <span className="text-[#727982]">/</span>
                  <span>{step.tag}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[#F4F5F6]">
                  {step.title}
                </h3>

                <p className="text-sm font-semibold text-liquid-silver">
                  {step.summary}
                </p>

                <p className="text-xs sm:text-sm text-[#A4AAB2] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Right Column: High-Tech Specular Surface Box */}
              <div
                className={`md:col-span-6 ${
                  isEven ? 'md:pl-12' : 'md:order-1 md:pr-12'
                }`}
              >
                <div className="p-[1px] rounded-2xl bg-gradient-to-b from-[#8D949D] via-[#3A3F46] to-[#17191C] shadow-lg">
                  <div className="p-5 sm:p-6 rounded-[15px] bg-[#101113] space-y-4 font-mono">
                    <div className="flex items-center justify-between pb-3 border-b border-[#3A3F46]/60">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#F4F5F6]">
                        <div className="w-7 h-7 rounded-lg bg-[#08090A] border border-[#3A3F46] flex items-center justify-center text-[#39FF6A]">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>SYSTEM SPECIFICATION</span>
                      </div>
                      <span className="text-[10px] text-[#727982]">[VERIFIED PIPELINE]</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {step.technicalDetails.map((item, dIdx) => (
                        <div
                          key={dIdx}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#08090A] border border-[#3A3F46]/60"
                        >
                          <span className="text-[#A4AAB2]">{item.label}</span>
                          <span className="text-[#F4F5F6] font-semibold text-right">{item.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-[#727982]">
                      <span>TRACE ENGINE PHASE</span>
                      <span className="text-[#39FF6A] font-bold">100% AUTOMATED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
