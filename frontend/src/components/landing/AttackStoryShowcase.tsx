import React, { useState } from 'react';
import {
  Layers,
  Clock,
  FileText,
  ShieldCheck,
  Network,
  User,
  Server,
  Cpu,
  ArrowRight,
} from 'lucide-react';

export const AttackStoryShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'graph' | 'timeline' | 'evidence' | 'narrative'>('graph');

  return (
    <section id="investigation" className="relative py-24 px-6 lg:px-12 max-w-7xl mx-auto z-10">
      {/* Narrative Lead In */}
      <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-[11px] font-mono uppercase tracking-widest">
          <Layers className="w-3.5 h-3.5" />
          <span>ATTACK RECONSTRUCTION</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-sans">
          Security teams don&apos;t need more alerts.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            They need to understand the connection.
          </span>
        </h2>
        <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
          TraceX links disparate security signals into a unified causal graph, revealing who broke in, how they escalated, and what assets were targeted.
        </p>
      </div>

      {/* Signature Chain: Attacker -> User -> Detection -> Target */}
      <div className="mb-12 p-6 rounded-2xl bg-[#06090e]/95 border border-emerald-950/60 shadow-xl">
        <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold mb-4 text-center sm:text-left">
          SIGNATURE ATTACK CHAIN TOPOLOGY
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {/* Node 1: Attacker IP */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-red-500/40 relative group hover:border-red-400 transition">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-800 text-red-400">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider block font-mono">
                  Origin Ingress
                </span>
                <span className="font-mono text-sm font-bold text-white">185.23.91.44</span>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 font-mono">External Threat Actor</div>
          </div>

          {/* Node 2: Compromised User */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/40 relative group hover:border-amber-400 transition">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block font-mono">
                  Compromised Identity
                </span>
                <span className="font-mono text-sm font-bold text-white">admin (root)</span>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 font-mono">Password Sprayed / Brute Forced</div>
          </div>

          {/* Node 3: Detection Rule */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/40 relative group hover:border-indigo-400 transition">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-950/80 border border-indigo-800 text-indigo-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block font-mono">
                  Detection Signal
                </span>
                <span className="font-mono text-sm font-bold text-white">Privilege Escalation</span>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 font-mono">MITRE T1068 (Sudo /etc/shadow)</div>
          </div>

          {/* Node 4: Target Asset */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/40 relative group hover:border-emerald-400 transition">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block font-mono">
                  Target Asset
                </span>
                <span className="font-mono text-sm font-bold text-white">10.0.0.50 (Prod DB)</span>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 font-mono">Customer Data & Exfiltration</div>
          </div>
        </div>
      </div>

      {/* Interactive Tabs Showcase */}
      <div className="rounded-3xl bg-[#06090e]/95 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white">The Four Forensic Pillars</h3>
            <p className="text-xs text-slate-400">Inspect every angle of the reconstructed intrusion</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('graph')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'graph'
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" /> Attack Graph
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'timeline'
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" /> Attack Timeline
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'evidence'
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" /> Evidence Logs
            </button>
            <button
              onClick={() => setActiveTab('narrative')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'narrative'
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Narrative & Actions
            </button>
          </div>
        </div>

        {/* Tab Content Panes */}
        <div className="pt-6">
          {activeTab === 'graph' && (
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Topological causal graph • 4 nodes, 3 causal directed edges</span>
                <span className="text-emerald-400">Directed Flow</span>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-8 px-4 text-center font-mono">
                <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 w-full md:w-48">
                  <span className="text-[10px] text-red-400 uppercase font-bold block">Attacker IP</span>
                  <span className="text-white font-bold text-sm">185.23.91.44</span>
                </div>
                <ArrowRight className="w-6 h-6 text-slate-600 hidden md:block" />
                <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-500/50 w-full md:w-48">
                  <span className="text-[10px] text-amber-400 uppercase font-bold block">Compromised User</span>
                  <span className="text-white font-bold text-sm">admin</span>
                </div>
                <ArrowRight className="w-6 h-6 text-slate-600 hidden md:block" />
                <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/50 w-full md:w-48">
                  <span className="text-[10px] text-indigo-400 uppercase font-bold block">Privilege Escalation</span>
                  <span className="text-white font-bold text-sm">sudo /etc/shadow</span>
                </div>
                <ArrowRight className="w-6 h-6 text-slate-600 hidden md:block" />
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 w-full md:w-48">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">Target DB</span>
                  <span className="text-white font-bold text-sm">10.0.0.50</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">10:00:00 UTC</span>
                  <span className="text-amber-400 font-bold">PORT_SCAN detected on 185.23.91.44</span>
                  <span className="text-slate-500">Reconnaissance</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">10:02:15 UTC</span>
                  <span className="text-orange-400 font-bold">6 failed logins against &apos;admin&apos;</span>
                  <span className="text-slate-500">Credential Access</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">10:04:00 UTC</span>
                  <span className="text-red-400 font-bold">LOGIN_SUCCESS following brute force</span>
                  <span className="text-red-400 font-bold">Initial Access (BREACH)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">10:05:00 UTC</span>
                  <span className="text-rose-400 font-bold">PRIVILEGE_ESCALATION sudo /etc/shadow</span>
                  <span className="text-slate-500">Privilege Escalation</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                <span className="text-emerald-400 block mb-1">Raw Evidence Log #14:</span>
                <code>2026-10-04T10:05:00Z,PRIVILEGE_ESCALATION,server,admin,185.23.91.44,10.0.0.5,high,sudo,{`{"command": "cat /etc/shadow"}`}</code>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                <span className="text-cyan-400 block mb-1">Raw Evidence Log #13:</span>
                <code>2026-10-04T10:04:00Z,LOGIN_SUCCESS,authentication,admin,185.23.91.44,10.0.0.5,info,login</code>
              </div>
            </div>
          )}

          {activeTab === 'narrative' && (
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 text-xs leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-cyan-400 font-bold uppercase text-[11px] block mb-1">
                  What Happened & Why Suspicious:
                </span>
                <p className="text-slate-300 font-sans">
                  Attacker IP 185.23.91.44 conducted network reconnaissance followed by high-frequency authentication spraying against administrative account &apos;admin&apos;. Upon successful login, the session immediately elevated to root privilege to inspect shadow files.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                <span className="text-emerald-400 font-bold uppercase text-[11px] block mb-1">
                  Immediate Recommended Containment Action:
                </span>
                <p className="text-emerald-200 font-medium font-sans">
                  1. Immediately terminate active sessions for admin. 2. Null-route IP 185.23.91.44 at perimeter firewall. 3. Rotate root credentials and review /etc/shadow exfiltration exposure.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
