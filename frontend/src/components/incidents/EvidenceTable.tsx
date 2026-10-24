import React, { useState, useEffect } from 'react';
import { DetectionFinding, SecurityEvent } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';
import { Modal } from '../common/Modal';
import { Search, Eye, ShieldAlert, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface EvidenceTableProps {
  findings: DetectionFinding[];
  events: SecurityEvent[];
}

export const EvidenceTable: React.FC<EvidenceTableProps> = ({ findings, events }) => {
  const [tab, setTab] = useState<'events' | 'findings'>('events');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<DetectionFinding | null>(null);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, tab]);

  const filteredFindings = findings.filter((f) => {
    const term = searchTerm.toLowerCase();
    const title = (f.title || f.rule_name || '').toLowerCase();
    const rule = (f.rule_name || '').toLowerCase();
    const ip = (f.source_ip || '').toLowerCase();
    const user = (f.username || '').toLowerCase();
    const entity = (f.entity_value || '').toLowerCase();
    return title.includes(term) || rule.includes(term) || ip.includes(term) || user.includes(term) || entity.includes(term);
  });

  const filteredEvents = events.filter((e) => {
    const term = searchTerm.toLowerCase();
    const type = (e.event_type || '').toLowerCase();
    const user = (e.username || '').toLowerCase();
    const src = (e.source_ip || '').toLowerCase();
    const dst = (e.destination_ip || '').toLowerCase();
    const action = (e.action || '').toLowerCase();
    const source = (e.source || '').toLowerCase();
    const idStr = String(e.id ?? '');
    return (
      type.includes(term) ||
      user.includes(term) ||
      src.includes(term) ||
      dst.includes(term) ||
      action.includes(term) ||
      source.includes(term) ||
      idStr.includes(term)
    );
  });

  const totalEventPages = Math.ceil(filteredEvents.length / pageSize) || 1;
  const paginatedEvents = filteredEvents.slice((page - 1) * pageSize, page * pageSize);

  const totalFindingPages = Math.ceil(filteredFindings.length / pageSize) || 1;
  const paginatedFindings = filteredFindings.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      {/* Search & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('events')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === 'events'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Forensic Evidence Records ({events.length})
          </button>
          <button
            onClick={() => setTab('findings')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === 'findings'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Detection Findings ({findings.length})
          </button>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search evidence records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Events Table */}
      {tab === 'events' && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Timestamp (UTC)</th>
                  <th className="p-3">Subsystem</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Source IP</th>
                  <th className="p-3">Target IP</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3 text-right">Raw Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {paginatedEvents.length > 0 ? (
                  paginatedEvents.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 font-mono text-slate-400 font-semibold">#{e.id}</td>
                      <td className="p-3 font-mono text-slate-400 whitespace-nowrap">{e.timestamp}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-indigo-300 uppercase">
                          {e.source || 'syslog'}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-white">{e.event_type}</td>
                      <td className="p-3 font-mono text-cyan-400">{e.source_ip || '-'}</td>
                      <td className="p-3 font-mono text-slate-400">{e.destination_ip || '-'}</td>
                      <td className="p-3 font-mono text-amber-400">{e.username || '-'}</td>
                      <td className="p-3">{e.action || '-'}</td>
                      <td className="p-3">
                        <SeverityBadge severity={e.severity} size="sm" />
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedEvent(e)}
                          className="p-1 rounded text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                          title="Inspect raw event"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      No forensic evidence records found matching search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs text-slate-400">
            <div>
              Showing {filteredEvents.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredEvents.length)} of {filteredEvents.length} records (Total Associated Records: {events.length})
            </div>

            {totalEventPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-mono">
                  Page {page} of {totalEventPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalEventPages, p + 1))}
                  disabled={page === totalEventPages}
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Findings Table */}
      {tab === 'findings' && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Rule Name</th>
                  <th className="p-3">Entity</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3">MITRE Tactic / Technique</th>
                  <th className="p-3">Evidence Count</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {paginatedFindings.length > 0 ? (
                  paginatedFindings.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3">
                        <SeverityBadge severity={f.severity} size="sm" />
                      </td>
                      <td className="p-3 font-semibold text-white">{f.rule_name}</td>
                      <td className="p-3 font-mono text-cyan-400">{f.entity_value}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-cyan-400 h-full rounded-full"
                              style={{ width: `${Math.round(f.confidence * 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px]">{Math.round(f.confidence * 100)}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-indigo-300">
                          {f.mitre_tactic || 'ATT&CK'} • {f.mitre_technique || 'T1110'}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{f.event_count} log events</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedFinding(f)}
                          className="p-1 rounded text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                          title="Inspect finding details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No detection findings found matching search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls for Findings */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs text-slate-400">
            <div>
              Showing {filteredFindings.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredFindings.length)} of {filteredFindings.length} findings (Total Associated Findings: {findings.length})
            </div>

            {totalFindingPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-mono">
                  Page {page} of {totalFindingPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalFindingPages, p + 1))}
                  disabled={page === totalFindingPages}
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={`Security Event #${selectedEvent?.id} — ${selectedEvent?.event_type}`}
        maxWidth="2xl"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 uppercase block mb-1">Timestamp</span>
                <span className="font-mono text-slate-200">{selectedEvent.timestamp}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 uppercase block mb-1">Source Log Provider</span>
                <span className="text-slate-200 font-semibold">{selectedEvent.source}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 uppercase block mb-1">Source IP</span>
                <span className="font-mono text-cyan-400">{selectedEvent.source_ip || 'None'}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 uppercase block mb-1">Target IP</span>
                <span className="font-mono text-slate-200">{selectedEvent.destination_ip || 'None'}</span>
              </div>
            </div>

            {selectedEvent.metadata && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Metadata</span>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
                  {JSON.stringify(selectedEvent.metadata, null, 2)}
                </pre>
              </div>
            )}

            {selectedEvent.raw_log && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Original Raw Ingested Log</span>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
                  {selectedEvent.raw_log}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Finding Details Modal */}
      <Modal
        isOpen={!!selectedFinding}
        onClose={() => setSelectedFinding(null)}
        title={`Detection Finding #${selectedFinding?.id} — ${selectedFinding?.rule_name}`}
        maxWidth="2xl"
      >
        {selectedFinding && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
              <SeverityBadge severity={selectedFinding.severity} size="md" />
              <div className="font-mono text-cyan-400 font-bold">
                Confidence: {Math.round(selectedFinding.confidence * 100)}%
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 uppercase text-[11px] font-bold">Description</span>
              <p className="text-slate-200 leading-relaxed">{selectedFinding.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 uppercase text-[11px] font-bold block mb-1">MITRE Tactic</span>
                <span className="text-indigo-300 font-semibold">{selectedFinding.mitre_tactic || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 uppercase text-[11px] font-bold block mb-1">MITRE Technique</span>
                <span className="text-indigo-300 font-mono font-semibold">{selectedFinding.mitre_technique || 'N/A'}</span>
              </div>
            </div>

            {selectedFinding.metadata && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Detection Metadata</span>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
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
