import React, { useState } from 'react';
import { TimelineEvent } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';
import { Clock, ShieldAlert, Flag, Terminal, User, Network, Filter } from 'lucide-react';

interface AttackTimelineProps {
  timeline: TimelineEvent[];
  onSelectEvent?: (eventId: number) => void;
}

export const AttackTimeline: React.FC<AttackTimelineProps> = ({ timeline, onSelectEvent }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');

  const stages = Array.from(new Set(timeline.map((t) => t.stage)));

  const filtered = timeline.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterStage !== 'all' && item.stage !== filterStage) return false;
    return true;
  });

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + d.toLocaleDateString();
    } catch {
      return ts;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Timeline Filter:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <label className="text-xs text-slate-400">Type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All ({timeline.length})</option>
              <option value="milestone">Milestones Only</option>
              <option value="detection">Detections Only</option>
              <option value="event">Raw Events</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <label className="text-xs text-slate-400">Stage:</label>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Stages</option>
              {stages.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timeline items */}
      <div className="relative pl-6 border-l-2 border-slate-800 space-y-6 before:absolute before:top-0 before:left-[-5px] before:w-2 before:h-2 before:rounded-full before:bg-cyan-500">
        {filtered.map((item, idx) => {
          const isMilestone = item.type === 'milestone';
          const isDetection = item.type === 'detection';

          return (
            <div
              key={item.id || idx}
              className={`relative group rounded-xl p-4 transition-all duration-200 ${
                isMilestone
                  ? 'bg-red-950/20 border-2 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                  : isDetection
                  ? 'bg-slate-900/90 border border-cyan-500/30'
                  : 'bg-slate-900/50 border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Dot on timeline */}
              <div
                className={`absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full border-2 transition ${
                  isMilestone
                    ? 'bg-red-500 border-slate-950 ring-4 ring-red-500/20'
                    : isDetection
                    ? 'bg-cyan-400 border-slate-950'
                    : 'bg-slate-700 border-slate-950 group-hover:bg-slate-400'
                }`}
              />

              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {isMilestone ? (
                    <Flag className="w-4 h-4 text-red-400 shrink-0" />
                  ) : isDetection ? (
                    <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  )}

                  <span className="text-xs font-mono text-cyan-400">{formatTime(item.timestamp)}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {item.stage}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <SeverityBadge severity={item.severity} size="sm" />
                </div>
              </div>

              <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

              {/* Entity Badges */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center gap-3 text-xs">
                {item.source_ip && (
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                    <Network className="w-3.5 h-3.5 text-cyan-400" />
                    <span>IP: {item.source_ip}</span>
                  </div>
                )}
                {item.username && (
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>User: {item.username}</span>
                  </div>
                )}
                {item.action && (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Action: {item.action}</span>
                  </div>
                )}

                {item.event_id && onSelectEvent && (
                  <button
                    onClick={() => onSelectEvent(item.event_id!)}
                    className="ml-auto text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 underline"
                  >
                    View Raw Event #{item.event_id}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
