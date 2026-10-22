import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Terminal,
  ShieldAlert,
  GitMerge,
  ExternalLink,
  CheckCircle2,
  Clock,
  Server,
  User,
  Globe,
  FileCode,
  ArrowRight,
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface StageData {
  id: string;
  stepNum: string;
  phase: string;
  timestamp: string;
  title: string;
  eventType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  attackerIp: string;
  user: string;
  target: string;
  mitreTactic: string;
  mitreTechnique: string;
  ruleTriggered: string;
  rawLog: string;
  narrative: string;
}

const STAGES: StageData[] = [
  {
    id: 'recon',
    stepNum: '01',
    phase: 'RECONNAISSANCE',
    timestamp: '2026-10-21 02:14:02 UTC',
    title: 'External Ingress Port Scan',
    eventType: 'PORT_SCAN',
    severity: 'medium',
    attackerIp: '185.220.101.5',
    user: 'N/A (Unauthenticated)',
    target: '10.0.0.5 (Edge Gateway)',
    mitreTactic: 'Reconnaissance',
    mitreTechnique: 'T1046 - Network Service Discovery',
    ruleTriggered: 'RAPID_PORT_SWEEP_RULE',
    rawLog: `{"src_ip": "185.220.101.5", "dst_ip": "10.0.0.5", "ports": [22, 80, 443, 3306, 5432], "packets_sent": 840, "action": "BLOCKED_PARTIAL"}`,
    narrative:
      'Attacker probes public-facing IP 10.0.0.5 for accessible ports. Port 22 (SSH) responded, revealing a pathway for subsequent brute-force authentication.',
  },
  {
    id: 'brute-force',
    stepNum: '02',
    phase: 'CREDENTIAL ATTACK',
    timestamp: '2026-10-21 02:19:44 UTC',
    title: 'Distributed SSH Password Spray',
    eventType: 'LOGIN_FAILED',
    severity: 'high',
    attackerIp: '185.220.101.5',
    user: 'root, admin, jsmith',
    target: '10.0.0.5:22 (SSH Server)',
    mitreTactic: 'Credential Access',
    mitreTechnique: 'T1110.001 - Password Spraying',
    ruleTriggered: 'AUTH_BRUTE_FORCE_BURST',
    rawLog: `{"src_ip": "185.220.101.5", "usernames": ["root", "admin", "jsmith"], "failed_count": 28, "time_window_sec": 45, "status": "FAIL"}`,
    narrative:
      'Burst of 28 authentication failures targeting multiple accounts. TraceX flagged anomalous rate velocity matching brute-force thresholds.',
  },
  {
    id: 'initial-access',
    stepNum: '03',
    phase: 'INITIAL ACCESS',
    timestamp: '2026-10-21 02:22:18 UTC',
    title: 'Compromised SSH Login (jsmith)',
    eventType: 'LOGIN_SUCCESS',
    severity: 'high',
    attackerIp: '185.220.101.5',
    user: 'jsmith',
    target: '10.0.0.5 (Host: web-prod-01)',
    mitreTactic: 'Initial Access',
    mitreTechnique: 'T1078.002 - Valid Accounts: Domain Accounts',
    ruleTriggered: 'LOGIN_AFTER_BRUTE_FORCE_SUCCESS',
    rawLog: `{"timestamp": "2026-10-21T02:22:18Z", "user": "jsmith", "src_ip": "185.220.101.5", "auth_method": "password", "session_id": "ssh-sess-9821"}`,
    narrative:
      'A successful login occurred for user jsmith immediately following 28 failures from the same external IP, establishing initial access.',
  },
  {
    id: 'priv-esc',
    stepNum: '04',
    phase: 'PRIVILEGE ESCALATION',
    timestamp: '2026-10-21 02:28:05 UTC',
    title: 'Sudo Execution & Lateral Movement',
    eventType: 'PRIVILEGE_ESCALATION',
    severity: 'critical',
    attackerIp: '185.220.101.5 (via 10.0.0.5)',
    user: 'jsmith -> root',
    target: '10.0.0.5 -> 10.0.0.50 (Internal)',
    mitreTactic: 'Privilege Escalation',
    mitreTechnique: 'T1548.003 - Sudo and Sudo Caching',
    ruleTriggered: 'UNAUTHORIZED_SUDO_ELEVATION',
    rawLog: `{"user": "jsmith", "command": "/usr/bin/sudo -i", "terminal": "/dev/pts/1", "pwd": "/home/jsmith", "exit_code": 0}`,
    narrative:
      'The intruder executed sudo command elevation to root on web-prod-01, granting internal access to target the core production database.',
  },
  {
    id: 'exfiltration',
    stepNum: '05',
    phase: 'EXFILTRATION',
    timestamp: '2026-10-21 02:35:12 UTC',
    title: 'Database Query & Bulk Exfiltration',
    eventType: 'OUTBOUND_TRANSFER',
    severity: 'critical',
    attackerIp: '185.220.101.5',
    user: 'app_service / root',
    target: '10.0.0.50 (PostgreSQL customers)',
    mitreTactic: 'Exfiltration',
    mitreTechnique: 'T1048.002 - Exfiltration Over Asymmetric Encrypted Channel',
    ruleTriggered: 'MASS_DB_DUMP_AND_TRANSFER',
    rawLog: `{"src_ip": "10.0.0.50", "dst_ip": "185.220.101.5", "query": "SELECT * FROM customers", "bytes_transferred": 2584102912, "protocol": "HTTPS"}`,
    narrative:
      'Over 2.4 GB of customer records were queried from PostgreSQL and streamed outbound to the original external IP address.',
  },
];

export const InvestigationWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const workspaceRef = useRef<HTMLElement>(null);
  const [activeStageIndex, setActiveStageIndex] = useState(2); // default to initial access
  const activeStage = STAGES[activeStageIndex];

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      gsap.from('.workspace-header', {
        scrollTrigger: {
          trigger: workspaceRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
      });

      gsap.from('.workspace-console', {
        scrollTrigger: {
          trigger: '.workspace-console',
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        y: 30,
        scale: 0.99,
        duration: 0.8,
        ease: 'power3.out',
      });
    },
    { scope: workspaceRef }
  );

  return (
    <section
      ref={workspaceRef}
      id="workspace"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#3A3F46]/60"
    >
      {/* Editorial Header */}
      <div className="workspace-header space-y-4 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101113] border border-[#3A3F46] text-xs font-mono text-[#C6CBD1]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#39FF6A]" />
          <span>[ INTERACTIVE INVESTIGATION CONSOLE ]</span>
          <span className="text-[#727982]">|</span>
          <span className="text-[#A4AAB2]">DEMO INCIDENT TRACE-9402</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#F4F5F6]">
              THE ANATOMY OF <span className="text-liquid-silver">AN INTRUSION.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#A4AAB2] max-w-2xl mt-2 leading-relaxed">
              TraceX unifies fragmented event logs into a multi-region investigation workspace. Click any stage below to inspect how raw telemetry, deterministic detections, and forensic evidence link together.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/soc')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#39FF6A] hover:bg-[#25E653] text-[#08090A] text-xs font-bold tracking-wide shadow-[0_0_15px_rgba(57,255,106,0.25)] transition-all active:scale-95 cursor-pointer"
            >
              <span>Open Live SOC Console</span>
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Unified Workspace Console (Asymmetrical Multi-Region) */}
      <div className="workspace-console rounded-2xl p-[1px] bg-gradient-to-b from-[#8D949D] via-[#3A3F46] to-[#101113] shadow-2xl overflow-hidden">
        <div className="rounded-[15px] bg-[#101113] overflow-hidden">
          {/* Top Console Bar */}
          <div className="px-5 py-3 bg-[#08090A] border-b border-[#3A3F46] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="font-mono text-xs font-bold text-[#F4F5F6] pl-2 border-l border-[#3A3F46]">
                INCIDENT TRACE-9402: Multi-Stage SSH Compromise & Data Exfil
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-[#A4AAB2]">
                STATUS: <span className="text-[#39FF6A] font-bold">RECONSTRUCTED</span>
              </span>
              <span className="text-[#727982]">|</span>
              <span className="text-[#A4AAB2]">
                ENTITIES: <span className="text-[#F1F3F5] font-semibold">1 IP, 2 Users, 2 Hosts</span>
              </span>
              <span className="text-[#727982]">|</span>
              <span className="px-2 py-0.5 rounded bg-[#FF6464]/20 border border-[#FF6464]/50 text-[#FF6464] font-bold text-[10px]">
                CRITICAL
              </span>
            </div>
          </div>

          {/* Interactive Stage Stepper Ribbon */}
          <div className="bg-[#17191C]/70 border-b border-[#3A3F46] p-2 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-[700px]">
              {STAGES.map((stage, idx) => {
                const isActive = idx === activeStageIndex;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setActiveStageIndex(idx)}
                    className={`flex-1 p-2.5 rounded-lg border text-left transition-all font-mono text-xs cursor-pointer ${
                      isActive
                        ? 'bg-[#101113] border-[#39FF6A] shadow-[0_0_12px_rgba(57,255,106,0.2)] text-[#F4F5F6]'
                        : 'bg-[#08090A]/60 border-[#3A3F46]/60 text-[#A4AAB2] hover:bg-[#101113] hover:border-[#8D949D]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#727982]">STAGE {stage.stepNum}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          stage.severity === 'critical'
                            ? 'bg-[#FF6464]'
                            : stage.severity === 'high'
                            ? 'bg-[#FFD84D]'
                            : 'bg-[#C6CBD1]'
                        }`}
                      />
                    </div>
                    <div className="font-bold truncate mt-0.5">{stage.phase}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Three Connected Asymmetric Regions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px] divide-y lg:divide-y-0 lg:divide-x divide-[#3A3F46]">
            {/* REGION 1 (Left 3.5 cols): Live Ingestion Stream */}
            <div className="lg:col-span-4 p-4 sm:p-5 bg-[#08090A]/80 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#3A3F46]/60">
                  <span className="flex items-center gap-2 text-xs font-mono font-bold text-[#F4F5F6]">
                    <Terminal className="w-3.5 h-3.5 text-[#39FF6A]" />
                    SECURITY EVENT STREAM
                  </span>
                  <span className="text-[10px] font-mono text-[#727982] animate-pulse">● LIVE BUFFER</span>
                </div>

                <div className="space-y-2">
                  {STAGES.map((s, idx) => {
                    const isSelected = idx === activeStageIndex;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setActiveStageIndex(idx)}
                        className={`p-2.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#17191C] border-[#39FF6A] shadow-sm'
                            : 'bg-[#101113]/70 border-[#3A3F46]/50 hover:border-[#8D949D]/70'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-[#727982]">
                          <span>{s.timestamp.split(' ')[1]}</span>
                          <span
                            className={`font-bold ${
                              s.severity === 'critical'
                                ? 'text-[#FF6464]'
                                : s.severity === 'high'
                                ? 'text-[#FFD84D]'
                                : 'text-[#C6CBD1]'
                            }`}
                          >
                            {s.eventType}
                          </span>
                        </div>
                        <div className="text-[#F4F5F6] font-medium truncate mt-1">{s.title}</div>
                        <div className="flex items-center justify-between text-[10px] text-[#A4AAB2] mt-1 pt-1 border-t border-[#3A3F46]/30">
                          <span>{s.attackerIp}</span>
                          <span className="text-[#39FF6A]">{s.user}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#101113] border border-[#3A3F46] font-mono text-[11px] text-[#A4AAB2] space-y-1">
                <div className="text-[10px] uppercase text-[#727982]">STREAM TELEMETRY</div>
                <div>PARSER: CSV / JSON / NDJSON Normalizer</div>
                <div>INGESTED RATE: 42 events/sec</div>
              </div>
            </div>

            {/* REGION 2 (Center 4.5 cols): Attack Path Timeline & Dynamic Relationship Graph */}
            <div className="lg:col-span-5 p-5 bg-[#101113] flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#3A3F46]/60">
                  <span className="flex items-center gap-2 text-xs font-mono font-bold text-[#F4F5F6]">
                    <GitMerge className="w-3.5 h-3.5 text-liquid-silver" />
                    CORRELATED INCIDENT GRAPH
                  </span>
                  <span className="text-[10px] font-mono text-[#39FF6A]">
                    PHASE {activeStage.stepNum} OF 05
                  </span>
                </div>

                {/* Narrative Summary of the Active Step */}
                <div className="p-3.5 rounded-xl bg-[#17191C] border border-[#3A3F46] space-y-1.5">
                  <div className="text-xs font-bold text-[#F4F5F6] flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#39FF6A]" />
                    {activeStage.title}
                  </div>
                  <p className="text-xs text-[#A4AAB2] leading-relaxed">
                    {activeStage.narrative}
                  </p>
                </div>

                {/* Visual Connected Node Diagram */}
                <div className="p-4 rounded-xl bg-[#08090A] border border-[#3A3F46] space-y-3 font-mono text-xs">
                  <div className="text-[10px] text-[#727982] uppercase tracking-wider">
                    ENTITY RELATIONSHIP CLUSTER
                  </div>

                  <div className="space-y-2.5">
                    {/* Attacker node */}
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-[#101113] border border-[#3A3F46]">
                      <Globe className="w-4 h-4 text-[#FF6464] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-[#727982]">THREAT SOURCE IP</div>
                        <div className="font-bold text-[#F4F5F6] truncate">{activeStage.attackerIp}</div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-950 text-red-300 border border-red-800">
                        TOR / EXTERNAL
                      </span>
                    </div>

                    {/* Arrow down */}
                    <div className="flex justify-center text-[#727982] -my-1">
                      <span>↓ [AUTHENTICATION BREACH]</span>
                    </div>

                    {/* User node */}
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-[#101113] border border-[#3A3F46]">
                      <User className="w-4 h-4 text-[#FFD84D] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-[#727982]">COMPROMISED IDENTITY</div>
                        <div className="font-bold text-[#F4F5F6] truncate">{activeStage.user}</div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-950 text-amber-300 border border-amber-800">
                        ELEVATED
                      </span>
                    </div>

                    {/* Arrow down */}
                    <div className="flex justify-center text-[#727982] -my-1">
                      <span>↓ [LATERAL PIVOT]</span>
                    </div>

                    {/* Target host node */}
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-[#101113] border border-[#3A3F46]">
                      <Server className="w-4 h-4 text-[#39FF6A] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-[#727982]">TARGET ASSET IMPACTED</div>
                        <div className="font-bold text-[#F4F5F6] truncate">{activeStage.target}</div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                        INTERNAL
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="pt-2 border-t border-[#3A3F46]/50 flex items-center justify-between text-xs font-mono text-[#A4AAB2]">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#39FF6A]" />
                  Attribution: 100% Deterministic
                </span>
                <button
                  onClick={() => navigate('/incidents')}
                  className="text-[#39FF6A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Graph</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* REGION 3 (Right 3.5 cols): Forensic Evidence & Findings Inspector */}
            <div className="lg:col-span-3 p-4 sm:p-5 bg-[#08090A]/90 flex flex-col justify-between space-y-4 font-mono text-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#3A3F46]/60">
                  <span className="flex items-center gap-2 font-bold text-[#F4F5F6]">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#FFD84D]" />
                    EVIDENCE INSPECTOR
                  </span>
                  <span className="text-[10px] text-[#C6CBD1]">FORENSIC PROOF</span>
                </div>

                {/* MITRE ATT&CK Mapping */}
                <div className="p-3 rounded-lg bg-[#101113] border border-[#3A3F46] space-y-1.5">
                  <div className="text-[10px] text-[#727982] uppercase">MITRE ATT&CK MAPPING</div>
                  <div className="text-xs font-bold text-[#F4F5F6]">{activeStage.mitreTactic}</div>
                  <div className="text-[11px] text-[#39FF6A] font-semibold">{activeStage.mitreTechnique}</div>
                </div>

                {/* Rule Trigger info */}
                <div className="p-3 rounded-lg bg-[#101113] border border-[#3A3F46] space-y-1">
                  <div className="text-[10px] text-[#727982] uppercase">DETERMINISTIC RULE</div>
                  <div className="text-xs font-bold text-[#FFD84D] truncate">{activeStage.ruleTriggered}</div>
                  <div className="text-[10px] text-[#A4AAB2]">STATUS: VERIFIED HIT</div>
                </div>

                {/* Raw Ingested Log Record */}
                <div className="p-3 rounded-lg bg-[#101113] border border-[#3A3F46] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#727982] uppercase flex items-center gap-1">
                      <FileCode className="w-3 h-3 text-[#C6CBD1]" />
                      RAW AUDIT LOG
                    </span>
                    <span className="text-[9px] text-[#39FF6A]">VERIFIED JSON</span>
                  </div>
                  <pre className="p-2 rounded bg-[#08090A] border border-[#3A3F46]/60 text-[10px] text-[#C6CBD1] overflow-x-auto whitespace-pre-wrap max-h-32 leading-relaxed">
                    {activeStage.rawLog}
                  </pre>
                </div>
              </div>

              {/* Direct Link to Investigation Details */}
              <div className="pt-2">
                <button
                  onClick={() => navigate('/detections')}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#17191C] hover:bg-[#22252A] border border-[#3A3F46] hover:border-[#39FF6A] text-xs font-bold text-[#F4F5F6] hover:text-[#39FF6A] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Review All Rule Detections</span>
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
