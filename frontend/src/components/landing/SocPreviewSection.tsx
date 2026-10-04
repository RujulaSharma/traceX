import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Activity,
  ArrowRight,
  CheckCircle2,
  UploadCloud,
} from 'lucide-react';

export const SocPreviewSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ingestion' | 'detections' | 'incident'>('overview');

  return (
    <section id="preview" className="relative py-24 px-6 lg:px-12 max-w-7xl mx-auto z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[11px] font-mono uppercase tracking-widest">
            <Activity className="w-3.5 h-3.5" />
            <span>SOC INVESTIGATION CONSOLE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-sans">
            Security Operations Dashboard
          </h2>
          <p className="text-sm text-slate-300 font-light max-w-xl">
            Real-time interactive view of your security telemetry, deterministic threat signals, and correlated attack graphs.
          </p>
        </div>

        <Link
          to="/soc"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-[0_0_25px_rgba(16,185,129,0.4)] transition active:scale-95 shrink-0"
        >
          <span>Launch Working SOC</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </Link>
      </div>

      {/* Main SOC Dashboard Frame (Representing Bottom Half of Collage) */}
      <div className="rounded-3xl bg-[#06090e]/95 border border-emerald-900/40 shadow-2xl overflow-hidden">
        {/* Mock Top Application Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-mono text-sm font-bold text-white">TraceX SOC Operations</span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>API ONLINE</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>DB ONLINE</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>DETECTION READY</span>
            </div>
          </div>

          {/* Quick tab switchers */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'overview'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('ingestion')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'ingestion'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              Log Ingestion
            </button>
            <button
              onClick={() => setActiveTab('detections')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'detections'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              Detections
            </button>
            <button
              onClick={() => setActiveTab('incident')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'incident'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              Incident Cockpit
            </button>
          </div>
        </div>

        {/* Preview Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top 5 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">TOTAL EVENTS</div>
                  <div className="text-2xl font-black text-white">19</div>
                  <div className="text-[10px] text-emerald-400 mt-1 font-sans">↑ Multi-source logs</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">DETECTIONS</div>
                  <div className="text-2xl font-black text-amber-400">4</div>
                  <div className="text-[10px] text-amber-400/80 mt-1 font-sans">↑ 4 Rules triggered</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">INCIDENTS</div>
                  <div className="text-2xl font-black text-cyan-400">1</div>
                  <div className="text-[10px] text-cyan-400/80 mt-1 font-sans">Correlated chain</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">CRITICAL</div>
                  <div className="text-2xl font-black text-red-500">1</div>
                  <div className="text-[10px] text-red-400/80 mt-1 font-sans">Breach confirmed</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">AVG RISK SCORE</div>
                  <div className="text-2xl font-black text-emerald-400">100/100</div>
                  <div className="text-[10px] text-emerald-400/80 mt-1 font-sans">Weighted kill-chain</div>
                </div>
              </div>

              {/* Charts & Threat Tables Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visual Chart Mock */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-200">Event Distribution</span>
                    <span className="text-emerald-400">9 Types Normalized</span>
                  </div>
                  <div className="h-44 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
                    <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="w-full bg-cyan-500 rounded-t h-[75%]" />
                      <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center">FAILED</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="w-full bg-cyan-500 rounded-t h-[50%]" />
                      <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center">BLOCK</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="w-full bg-cyan-500 rounded-t h-[38%]" />
                      <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center">SUCCESS</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="w-full bg-emerald-500 rounded-t h-[20%]" />
                      <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center">SCAN</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="w-full bg-red-500 rounded-t h-[20%]" />
                      <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center">PRIV_ESC</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="w-full bg-indigo-500 rounded-t h-[20%]" />
                      <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center">DB_ACCESS</span>
                    </div>
                  </div>
                </div>

                {/* Threat Tables Mock */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">Top Suspicious Entities</span>
                    <span className="text-red-400">High Risk Correlated</span>
                  </div>
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div>
                        <span className="text-red-400 font-bold block">IP: 185.23.91.44</span>
                        <span className="text-[10px] text-slate-400 font-sans">4 events • Port Scan & Brute Force</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 font-bold text-[10px]">CRITICAL</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div>
                        <span className="text-amber-400 font-bold block">User: admin</span>
                        <span className="text-[10px] text-slate-400 font-sans">3 events • Targeted Account</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 font-bold text-[10px]">CRITICAL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ingestion' && (
            <div className="p-8 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-4">
              <UploadCloud className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Multi-Format Log Parser</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Ingests CSV, JSON, and NDJSON logs with UTC normalization and automatic error line isolation.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-xs font-mono text-emerald-300 border border-emerald-800/40">
                <span>Supports: .csv, .json, .ndjson, .log</span>
              </div>
            </div>
          )}

          {activeTab === 'detections' && (
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-red-400 font-bold">CRITICAL: Successful Login Post Brute Force</span>
                <span className="text-slate-400">T1110 • 95% Confidence</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-orange-400 font-bold">HIGH: Suspicious Privilege Escalation</span>
                <span className="text-slate-400">T1068 • 90% Confidence</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-amber-400 font-bold">HIGH: Port Scan & Reconnaissance</span>
                <span className="text-slate-400">T1595 • 85% Confidence</span>
              </div>
            </div>
          )}

          {activeTab === 'incident' && (
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-red-400">Incident #INC-000001 (CRITICAL)</span>
                <span className="font-mono text-xs text-slate-400">Risk Score 100/100</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                <p className="text-slate-300">
                  <strong className="text-emerald-400">Attack Chain:</strong> External IP 185.23.91.44 executed port scan against 10.0.0.5, conducted brute force against admin, authenticated successfully, elevated privilege via sudo, and accessed database 10.0.0.50.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
