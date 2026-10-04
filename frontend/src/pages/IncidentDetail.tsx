import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldAlert,
  Layers,
  Clock,
  HelpCircle,
  FileText,
  Network,
  User,
  Calendar,
} from 'lucide-react';
import tracexApi from '../services/api';
import {
  Incident,
  TimelineEvent,
  AttackGraphData,
  DetectionFinding,
  SecurityEvent,
} from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { RiskGauge } from '../components/common/RiskGauge';
import { AttackStages } from '../components/incidents/AttackStages';
import { AttackTimeline } from '../components/incidents/AttackTimeline';
import { AttackGraph } from '../components/incidents/AttackGraph';
import { NarrativeExplanation } from '../components/incidents/NarrativeExplanation';
import { EvidenceTable } from '../components/incidents/EvidenceTable';

export const IncidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [graphData, setGraphData] = useState<AttackGraphData | null>(null);
  const [evidence, setEvidence] = useState<{ findings: DetectionFinding[]; events: SecurityEvent[] }>({
    findings: [],
    events: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'graph' | 'stages' | 'timeline' | 'explanation' | 'evidence'>('graph');

  const fetchIncidentData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const incId = parseInt(id, 10);
      const [inc, tl, gr, ev] = await Promise.all([
        tracexApi.getIncidentById(incId),
        tracexApi.getIncidentTimeline(incId),
        tracexApi.getIncidentGraph(incId),
        tracexApi.getIncidentEvidence(incId),
      ]);
      setIncident(inc);
      setTimeline(tl.timeline || []);
      setGraphData(gr);
      setEvidence({ findings: ev.findings || [], events: ev.events || [] });
    } catch (err) {
      console.error('Failed to load incident details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentData();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!incident) return;
    try {
      const updated = await tracexApi.updateIncidentStatus(incident.id, newStatus);
      setIncident(updated);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Reconstructing incident topology and timeline...</p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4">
        <p>Incident not found.</p>
        <button
          onClick={() => navigate('/incidents')}
          className="text-cyan-400 hover:underline text-xs"
        >
          Return to incident queue
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Back Navigation */}
      <button
        onClick={() => navigate('/incidents')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Incidents Queue
      </button>

      {/* Incident Master Header Banner */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-start gap-6">
          <RiskGauge score={incident.risk_score} size={96} />

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <SeverityBadge severity={incident.severity} size="md" />
              <span className="text-xs font-mono text-slate-500">Incident #{incident.id}</span>
              <span className="text-xs text-slate-500">•</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>{new Date(incident.first_seen).toLocaleString()} — {new Date(incident.last_seen).toLocaleString()}</span>
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-white tracking-tight">{incident.title}</h2>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              {incident.primary_attacker_ip && (
                <div className="flex items-center gap-1.5 font-mono text-red-400 bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-800/60">
                  <Network className="w-3.5 h-3.5" />
                  <span>Attacker IP: {incident.primary_attacker_ip}</span>
                </div>
              )}

              {incident.compromised_username && (
                <div className="flex items-center gap-1.5 font-mono text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/60">
                  <User className="w-3.5 h-3.5" />
                  <span>Target User: {incident.compromised_username}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                <span>{incident.findings_count} Detections / {incident.events_count} Evidence Events</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400">Incident Status:</span>
          <select
            value={incident.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-cyan-400 focus:outline-none focus:border-cyan-500 uppercase"
          >
            <option value="open">OPEN</option>
            <option value="investigating">INVESTIGATING</option>
            <option value="resolved">RESOLVED</option>
            <option value="closed">CLOSED</option>
          </select>
        </div>
      </div>

      {/* Investigation Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('graph')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'graph'
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Attack Topology Graph
        </button>

        <button
          onClick={() => setActiveTab('stages')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'stages'
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Kill Chain Stages ({incident.stages?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'timeline'
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Attack Timeline ({timeline.length})
        </button>

        <button
          onClick={() => setActiveTab('explanation')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'explanation'
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Deterministic Narrative & Remediation
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'evidence'
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Evidence Logs ({evidence.events.length})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {activeTab === 'graph' && graphData && <AttackGraph graphData={graphData} />}

        {activeTab === 'stages' && <AttackStages stages={incident.stages || []} />}

        {activeTab === 'timeline' && <AttackTimeline timeline={timeline} />}

        {activeTab === 'explanation' && (
          <NarrativeExplanation
            explanation={incident.explanation}
            riskFactors={incident.risk_factors || []}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidenceTable findings={evidence.findings} events={evidence.events} />
        )}
      </div>
    </div>
  );
};
