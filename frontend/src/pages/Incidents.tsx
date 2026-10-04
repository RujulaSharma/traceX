import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitMerge, Play, RefreshCw, ArrowRight, ShieldAlert, User, Network, Layers } from 'lucide-react';
import tracexApi from '../services/api';
import { Incident } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { RiskGauge } from '../components/common/RiskGauge';

export const Incidents: React.FC = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await tracexApi.getIncidents({ limit: 50 });
      setIncidents(data.incidents || []);
    } catch (err) {
      console.error('Failed to load incidents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleRunCorrelation = async () => {
    try {
      setRunning(true);
      setActionNotice('Running Graph & Entity Correlation Engine...');
      const res = await tracexApi.runCorrelation();
      setActionNotice(
        `Clustered findings: Formed ${res.incidents_created} correlated attack incidents!`
      );
      await fetchIncidents();
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      setActionNotice(`Error: ${err.message || 'Correlation failed'}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-red-400" />
            Correlated Attack Incidents
          </h2>
          <p className="text-xs text-slate-400">
            Multi-stage intrusion chains reconstructed from interconnected authentication, firewall and server signals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchIncidents}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleRunCorrelation}
            disabled={running}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)] transition active:scale-95 disabled:opacity-50"
          >
            <Play className={`w-4 h-4 fill-current ${running ? 'animate-spin' : ''}`} />
            {running ? 'Correlating Entities...' : 'Run Correlation Engine'}
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-xs text-red-200 font-mono flex items-center gap-2 animate-fadeIn">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Incidents List Cards */}
      <div className="space-y-4">
        {incidents.map((inc) => (
          <div
            key={inc.id}
            onClick={() => navigate(`/incidents/${inc.id}`)}
            className="cursor-pointer group p-6 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all duration-200 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="flex items-start gap-5">
              <RiskGauge score={inc.risk_score} size={84} />

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={inc.severity} size="md" />
                  <span className="text-xs font-mono text-slate-500">Incident #{inc.id}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    Status: {inc.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                  {inc.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  {inc.primary_attacker_ip && (
                    <div className="flex items-center gap-1.5 font-mono text-red-400">
                      <Network className="w-3.5 h-3.5" />
                      <span>Attacker: {inc.primary_attacker_ip}</span>
                    </div>
                  )}

                  {inc.compromised_username && (
                    <div className="flex items-center gap-1.5 font-mono text-amber-400">
                      <User className="w-3.5 h-3.5" />
                      <span>Target User: {inc.compromised_username}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>{inc.stages?.length || 0} Attack Stages Reconstructed</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end md:self-center">
              <div className="text-right hidden sm:block text-xs">
                <div className="font-semibold text-slate-300">{inc.findings_count} Detections</div>
                <div className="text-slate-500">{inc.events_count} Evidence Logs</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/50 transition">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}

        {incidents.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 space-y-3">
            <GitMerge className="w-10 h-10 mx-auto text-slate-700" />
            <p className="text-sm font-medium">No attack incidents correlated yet.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload logs and click &quot;Run Correlation Engine&quot; above to cluster multi-stage threat activities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
