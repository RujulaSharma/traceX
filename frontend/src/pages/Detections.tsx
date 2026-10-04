import React, { useState, useEffect } from 'react';
import { AlertTriangle, Play, RefreshCw, Eye, Cpu } from 'lucide-react';
import tracexApi from '../services/api';
import { DetectionFinding } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { Modal } from '../components/common/Modal';

export const Detections: React.FC = () => {
  const [findings, setFindings] = useState<DetectionFinding[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<DetectionFinding | null>(null);
  const [severityFilter, setSeverityFilter] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchFindings = async () => {
    try {
      setLoading(true);
      const data = await tracexApi.getDetections({
        severity: severityFilter || undefined,
        limit: 50,
      });
      setFindings(data.findings || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load detections', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFindings();
  }, [severityFilter]);

  const handleRunDetections = async () => {
    try {
      setRunning(true);
      setActionNotice('Executing deterministic rule evaluation...');
      const res = await tracexApi.runDetections();
      setActionNotice(
        `Analysis complete: Evaluated ${res.total_events_evaluated} events, found ${res.new_findings_count} new threat signals!`
      );
      await fetchFindings();
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      setActionNotice(`Error: ${err.message || 'Detection failed'}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Security Detection Findings
          </h2>
          <p className="text-xs text-slate-400">
            Rule-based threat signals evaluated over authentication sequences, reconnaissance activity, and privilege escalation patterns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFindings}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleRunDetections}
            disabled={running}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] transition active:scale-95 disabled:opacity-50"
          >
            <Play className={`w-4 h-4 fill-current ${running ? 'animate-spin' : ''}`} />
            {running ? 'Evaluating Rules...' : 'Execute Detection Engine'}
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-amber-950/80 border border-amber-500/50 text-xs text-amber-200 font-mono flex items-center gap-2 animate-fadeIn">
          <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">Filter Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="font-bold text-white">{findings.length}</span> of {total} findings
        </div>
      </div>

      {/* Findings Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Rule / Tactic</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">MITRE ATT&CK</th>
                <th className="p-3.5">Confidence</th>
                <th className="p-3.5">Evidence Events</th>
                <th className="p-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {findings.map((f) => (
                <tr key={f.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    <SeverityBadge severity={f.severity} size="sm" />
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-white">{f.rule_name}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{f.title}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {f.entity_value}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800 text-indigo-300 font-semibold">
                        {f.mitre_tactic || 'ATT&CK'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {f.mitre_technique || 'T1110'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full"
                          style={{ width: `${Math.round(f.confidence * 100)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-200">
                        {Math.round(f.confidence * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">{f.event_count} events</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedFinding(f)}
                      className="p-1.5 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                      title="Inspect finding details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {findings.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    {loading
                      ? 'Loading detections...'
                      : 'No detections available. Run the detection engine above to analyze ingested logs.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Finding Inspection Modal */}
      <Modal
        isOpen={!!selectedFinding}
        onClose={() => setSelectedFinding(null)}
        title={`Detection Signal #${selectedFinding?.id} — ${selectedFinding?.rule_name}`}
        maxWidth="2xl"
      >
        {selectedFinding && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <SeverityBadge severity={selectedFinding.severity} size="md" />
              <span className="text-cyan-400 font-mono font-bold">
                Confidence: {Math.round(selectedFinding.confidence * 100)}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 uppercase text-[11px] font-bold">Detection Narrative</span>
              <p className="text-slate-200 leading-relaxed">{selectedFinding.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">
                  MITRE TACTIC
                </span>
                <span className="text-indigo-300 font-semibold">{selectedFinding.mitre_tactic}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">
                  MITRE TECHNIQUE
                </span>
                <span className="text-indigo-300 font-mono font-semibold">
                  {selectedFinding.mitre_technique}
                </span>
              </div>
            </div>

            {selectedFinding.metadata && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">
                  Rule Context & Thresholds
                </span>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
                  {JSON.stringify(selectedFinding.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
