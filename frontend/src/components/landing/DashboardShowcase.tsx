import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Activity,
  AlertTriangle,
  GitMerge,
  FileText,
  ExternalLink,
} from 'lucide-react';
import tracexApi from '../../services/api';
import { DashboardStats, DetectionFinding } from '../../types';

export const DashboardShowcase: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [findings, setFindings] = useState<DetectionFinding[]>([]);

  useEffect(() => {
    Promise.all([
      tracexApi.getDashboardStats().catch(() => null),
      tracexApi.getDetections({ limit: 4 }).catch(() => ({ total: 0, findings: [] })),
    ])
      .then(([statsData, detectionsData]) => {
        if (statsData) setStats(statsData);
        if (detectionsData?.findings) setFindings(detectionsData.findings);
      });
  }, []);

  const totalEvents = stats?.total_events ?? 138;
  const totalDetections = stats?.total_detections ?? 58;
  const totalIncidents = stats?.total_incidents ?? 4;
  const criticalIncidents = stats?.critical_incidents ?? 1;

  return (
    <section id="dashboard-preview" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Editorial info) */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171719] border border-[#383438] text-[10px] sm:text-xs font-mono font-semibold tracking-wider text-[#E7A1B5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39FF6A]" />
            <span>[ SEE THE BIGGER PICTURE ]</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-[#F4F2F3]">
            SEE THE <br />
            <span className="text-[#E7A1B5]">BIGGER PICTURE</span>
          </h2>

          <p className="text-sm text-[#A5A3A7] leading-relaxed">
            A unified cybersecurity investigation workspace to analyze, correlate, and understand cyber attacks from start to finish.
          </p>

          <div className="pt-2">
            <button
              onClick={() => navigate('/soc')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#08090A] hover:bg-[#171719] border border-[#39FF6A] text-[#39FF6A] text-xs font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(57,255,106,0.15)] active:scale-95"
            >
              <span>Explore Demo</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Quick feature list */}
          <div className="pt-4 space-y-2 border-t border-[#383438]/70 text-xs text-[#A5A3A7]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#39FF6A]" />
              <span>Deterministic multi-rule correlation engine</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E7A1B5]" />
              <span>Interactive 5-stage attack reconstruction graph</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#39FF6A]" />
              <span>Full audit log evidence and timeline inspection</span>
            </div>
          </div>
        </div>

        {/* Right Column (Product Dashboard Preview) */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-[#383438] bg-[#101113] p-1 shadow-2xl overflow-hidden">
            {/* Window Chrome Header */}
            <div className="px-4 py-2.5 bg-[#08090A] border-b border-[#383438] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#F4F2F3] pl-2 border-l border-[#383438]">
                  <Shield className="w-3.5 h-3.5 text-[#E7A1B5]" />
                  <span>TraceX Security Console</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#A5A3A7]">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#171719] border border-[#383438] font-mono text-[10px] text-[#39FF6A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#39FF6A] animate-pulse" />
                  LIVE SYSTEM
                </span>
                <button
                  onClick={() => navigate('/soc')}
                  className="flex items-center gap-1 text-[11px] text-[#A5A3A7] hover:text-white transition-colors"
                >
                  <span>Launch SOC</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Simulated Workspace Content */}
            <div className="p-4 sm:p-5 space-y-4 bg-[#08090A]">
              {/* 4 Metric Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#171719] border border-[#383438]">
                  <div className="text-[10px] font-mono uppercase text-[#A5A3A7]">Total Events</div>
                  <div className="text-xl font-black text-[#F4F2F3] mt-1">{totalEvents}</div>
                  <div className="text-[10px] text-[#39FF6A] mt-0.5 flex items-center gap-1">
                    <span>↑ Ingested</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#171719] border border-[#383438]">
                  <div className="text-[10px] font-mono uppercase text-[#A5A3A7]">Detections</div>
                  <div className="text-xl font-black text-[#FFD84D] mt-1">{totalDetections}</div>
                  <div className="text-[10px] text-[#FFD84D] mt-0.5 flex items-center gap-1">
                    <span>Threat Signals</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#171719] border border-[#383438]">
                  <div className="text-[10px] font-mono uppercase text-[#A5A3A7]">Investigations</div>
                  <div className="text-xl font-black text-[#E7A1B5] mt-1">{totalIncidents}</div>
                  <div className="text-[10px] text-[#E7A1B5] mt-0.5 flex items-center gap-1">
                    <span>Active Clusters</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#171719] border border-[#383438]">
                  <div className="text-[10px] font-mono uppercase text-[#A5A3A7]">Critical Incidents</div>
                  <div className="text-xl font-black text-rose-400 mt-1">{criticalIncidents}</div>
                  <div className="text-[10px] text-rose-400 mt-0.5 flex items-center gap-1">
                    <span>Prioritized</span>
                  </div>
                </div>
              </div>

              {/* Middle Row: Attack Timeline & Incident Overview */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Attack Timeline Visual */}
                <div className="md:col-span-7 p-4 rounded-xl bg-[#171719] border border-[#383438] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F4F2F3] flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-[#39FF6A]" />
                      Attack Timeline
                    </span>
                    <button
                      onClick={() => navigate('/incidents')}
                      className="text-[11px] font-mono text-[#39FF6A] hover:underline"
                    >
                      View Details →
                    </button>
                  </div>

                  {/* SVG Attack Sequence Chart */}
                  <div className="h-32 w-full rounded-lg bg-[#08090A] border border-[#383438]/80 p-2 relative flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="25" x2="400" y2="25" stroke="#383438" strokeWidth="0.5" strokeDasharray="3 3" />
                      <line x1="0" y1="50" x2="400" y2="50" stroke="#383438" strokeWidth="0.5" strokeDasharray="3 3" />
                      <line x1="0" y1="75" x2="400" y2="75" stroke="#383438" strokeWidth="0.5" strokeDasharray="3 3" />

                      {/* Timeline line connecting stages */}
                      <path
                        d="M 20 70 Q 100 20 180 50 T 290 30 T 380 60"
                        fill="none"
                        stroke="#E7A1B5"
                        strokeWidth="2"
                      />

                      {/* Stage 1 Node */}
                      <circle cx="40" cy="65" r="4" fill="#39FF6A" />
                      <text x="40" y="85" fontSize="8" fill="#A5A3A7" textAnchor="middle">Recon</text>

                      {/* Stage 2 Node */}
                      <circle cx="120" cy="35" r="4" fill="#FFD84D" />
                      <text x="120" y="20" fontSize="8" fill="#FFD84D" textAnchor="middle">Brute Force</text>

                      {/* Stage 3 Node */}
                      <circle cx="200" cy="50" r="4" fill="#E7A1B5" />
                      <text x="200" y="70" fontSize="8" fill="#A5A3A7" textAnchor="middle">Initial Access</text>

                      {/* Stage 4 Node */}
                      <circle cx="290" cy="30" r="5" fill="#E7A1B5" />
                      <text x="290" y="18" fontSize="8" fill="#E7A1B5" textAnchor="middle">PrivEsc</text>

                      {/* Stage 5 Node */}
                      <circle cx="360" cy="60" r="4" fill="#39FF6A" />
                      <text x="360" y="80" fontSize="8" fill="#39FF6A" textAnchor="middle">Data Exfil</text>
                    </svg>
                  </div>
                </div>

                {/* Threat / Entity Relationship Overview */}
                <div className="md:col-span-5 p-4 rounded-xl bg-[#171719] border border-[#383438] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F4F2F3] flex items-center gap-2">
                      <GitMerge className="w-3.5 h-3.5 text-[#E7A1B5]" />
                      Attack Relationship
                    </span>
                    <span className="text-[10px] font-mono text-[#E7A1B5]">Demo Incident</span>
                  </div>

                  <div className="h-32 rounded-lg bg-[#08090A] border border-[#383438]/80 p-3 flex flex-col justify-between text-xs font-mono">
                    <div className="flex items-center justify-between pb-1 border-b border-[#383438]/50">
                      <span className="text-[#A5A3A7]">Attacker IP:</span>
                      <span className="text-red-400 font-bold">185.220.101.5</span>
                    </div>
                    <div className="flex items-center justify-between pb-1 border-b border-[#383438]/50">
                      <span className="text-[#A5A3A7]">Compromised User:</span>
                      <span className="text-[#FFD84D]">admin / jsmith</span>
                    </div>
                    <div className="flex items-center justify-between pb-1 border-b border-[#383438]/50">
                      <span className="text-[#A5A3A7]">Target Asset:</span>
                      <span className="text-cyan-400">10.0.0.50 (db)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#A5A3A7]">Stages Detected:</span>
                      <span className="text-[#39FF6A]">5 of 5 Stages</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Recent Detections & Evidence Artifacts */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Recent Detections Table */}
                <div className="md:col-span-7 p-4 rounded-xl bg-[#171719] border border-[#383438] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F4F2F3] flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#FFD84D]" />
                      Recent Detections
                    </span>
                    <button
                      onClick={() => navigate('/detections')}
                      className="text-[11px] font-mono text-[#39FF6A] hover:underline"
                    >
                      See All ({totalDetections}) →
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {findings.length > 0 ? (
                      findings.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#08090A] border border-[#383438]/70 text-[11px]"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                f.severity === 'critical'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : f.severity === 'high'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-slate-900 text-slate-300 border border-slate-700'
                              }`}
                            >
                              {f.severity}
                            </span>
                            <span className="text-[#F4F2F3] font-medium truncate">{f.rule_name}</span>
                          </div>
                          <span className="font-mono text-[#A5A3A7] text-[10px] shrink-0">
                            {f.username || f.source_ip || 'entity'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-[#A5A3A7]">
                        No detections found. Ingest logs to view findings.
                      </div>
                    )}
                  </div>
                </div>

                {/* Evidence Artifacts Preview */}
                <div className="md:col-span-5 p-4 rounded-xl bg-[#171719] border border-[#383438] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F4F2F3] flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[#E7A1B5]" />
                      Evidence Artifacts
                    </span>
                    <button
                      onClick={() => navigate('/events')}
                      className="text-[11px] font-mono text-[#39FF6A] hover:underline"
                    >
                      Explore →
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-[#08090A] border border-[#383438]/70 flex items-center justify-between text-[11px]">
                      <span className="text-[#F4F2F3]">auth.csv / auth.log</span>
                      <span className="text-[#39FF6A]">Authentication</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#08090A] border border-[#383438]/70 flex items-center justify-between text-[11px]">
                      <span className="text-[#F4F2F3]">server.json</span>
                      <span className="text-[#E7A1B5]">PrivEsc & Files</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#08090A] border border-[#383438]/70 flex items-center justify-between text-[11px]">
                      <span className="text-[#F4F2F3]">network.ndjson</span>
                      <span className="text-[#FFD84D]">Recon & Scans</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
