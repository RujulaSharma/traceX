import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  FileText,
  Activity,
  Zap,
  Play,
  ArrowRight,
  TrendingUp,
  Server,
  User,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import tracexApi from '../services/api';
import { DashboardStats } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { SeverityBadge } from '../components/common/SeverityBadge';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#06b6d4', '#64748b'];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const data = await tracexApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRunPipeline = async () => {
    try {
      setRunningAction('running');
      setActionMessage('Running detection engine rules...');
      const detRes = await tracexApi.runDetections();
      setActionMessage(`Generated ${detRes.new_findings_count} findings! Correlating attack chains...`);
      const corrRes = await tracexApi.runCorrelation();
      setActionMessage(`Created/Updated ${corrRes.incidents_created} attack incidents!`);
      await fetchStats();
      setTimeout(() => {
        setRunningAction(null);
        setActionMessage(null);
      }, 3000);
    } catch (err: any) {
      setActionMessage(`Error: ${err.message || 'Pipeline failed'}`);
      setRunningAction(null);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome & Quick Pipeline Trigger */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-xl font-black tracking-tight text-white">
              Autonomous Security Operations Center
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Real-time multi-log ingestion, deterministic rule detection, and MITRE-aligned causal
            attack chain reconstruction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/ingestion')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Upload Logs
          </button>
          <button
            onClick={handleRunPipeline}
            disabled={!!runningAction}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition active:scale-95 disabled:opacity-50"
          >
            <Play className={`w-4 h-4 fill-current ${runningAction ? 'animate-spin' : ''}`} />
            {runningAction ? 'Processing Pipeline...' : 'Run Autonomous Investigation'}
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-xs text-cyan-200 font-mono flex items-center justify-between animate-fadeIn">
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Ingested Events"
          value={stats?.total_events ?? 0}
          subtitle="From Auth, Network & Server Logs"
          icon={FileText}
          colorScheme="cyan"
          onClick={() => navigate('/events')}
        />
        <MetricCard
          title="Detection Findings"
          value={stats?.total_detections ?? 0}
          subtitle="Identified across 5 core rules"
          icon={AlertTriangle}
          colorScheme="amber"
          onClick={() => navigate('/detections')}
        />
        <MetricCard
          title="Correlated Incidents"
          value={stats?.total_incidents ?? 0}
          subtitle={`${stats?.critical_incidents ?? 0} Critical • ${stats?.high_incidents ?? 0} High`}
          icon={ShieldAlert}
          colorScheme="red"
          onClick={() => navigate('/incidents')}
        />
        <MetricCard
          title="Average Risk Score"
          value={stats?.avg_risk_score ? `${stats.avg_risk_score}/100` : '0/100'}
          subtitle="Weighted Kill-Chain Assessment"
          icon={Activity}
          colorScheme="indigo"
          onClick={() => navigate('/incidents')}
        />
      </div>

      {/* Charts & Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events by Type Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Log Event Distribution
              </h3>
              <p className="text-xs text-slate-400">Events categorized by normalized event types</p>
            </div>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="h-64 w-full">
            {stats && stats.events_by_type.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.events_by_type}>
                  <XAxis
                    dataKey="event_type"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No event data available. Ingest logs to view distribution.
              </div>
            )}
          </div>
        </div>

        {/* Severity Pie Chart */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Severity Ratio
              </h3>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xs text-slate-400">Security event severity breakdown</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {stats && stats.events_by_severity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.events_by_severity}
                    dataKey="count"
                    nameKey="severity"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {stats.events_by_severity.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">No severity distribution</div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-800">
            {stats?.events_by_severity.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1 text-[11px] text-slate-400">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="capitalize">{s.severity}:</span>
                <span className="font-bold text-white">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Threat Entities Drilldown Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Suspicious IPs */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Top Suspicious IP Addresses
              </h3>
            </div>
            <button
              onClick={() => navigate('/events')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              Explore <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {stats?.top_suspicious_ips && stats.top_suspicious_ips.length > 0 ? (
              stats.top_suspicious_ips.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500">#{idx + 1}</span>
                    <span className="font-mono text-sm font-bold text-cyan-400">{item.ip}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{item.count} events</span>
                    <SeverityBadge severity={item.max_severity} size="sm" />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                No suspicious IP activity recorded.
              </div>
            )}
          </div>
        </div>

        {/* Top Targeted Users */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Top Targeted User Accounts
              </h3>
            </div>
            <button
              onClick={() => navigate('/events')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              Explore <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {stats?.top_targeted_users && stats.top_targeted_users.length > 0 ? (
              stats.top_targeted_users.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500">#{idx + 1}</span>
                    <span className="font-mono text-sm font-bold text-amber-400">{item.username}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{item.count} events</span>
                    <SeverityBadge severity={item.max_severity} size="sm" />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                No targeted user activity recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
