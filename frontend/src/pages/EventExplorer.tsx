import React, { useState, useEffect } from 'react';
import { ListFilter, Search, RefreshCw, Eye } from 'lucide-react';
import tracexApi from '../services/api';
import { SecurityEvent } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { Modal } from '../components/common/Modal';

export const EventExplorer: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await tracexApi.getEvents({
        event_type: typeFilter || undefined,
        severity: severityFilter || undefined,
        username: searchTerm || undefined,
        limit: pageSize,
        offset: page * pageSize,
      });
      setEvents(data.events || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [severityFilter, typeFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchEvents();
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <ListFilter className="w-5 h-5 text-cyan-400" />
            Security Event Explorer
          </h2>
          <p className="text-xs text-slate-400">
            Query normalized telemetries from authentication servers, firewalls, and application workloads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchEvents}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by username or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Event Types</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED</option>
            <option value="PORT_SCAN">PORT_SCAN</option>
            <option value="FIREWALL_BLOCK">FIREWALL_BLOCK</option>
            <option value="PRIVILEGE_ESCALATION">PRIVILEGE_ESCALATION</option>
            <option value="DATABASE_ACCESS">DATABASE_ACCESS</option>
            <option value="OUTBOUND_TRANSFER">OUTBOUND_TRANSFER</option>
            <option value="FILE_ACCESS">FILE_ACCESS</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Timestamp (UTC)</th>
                <th className="p-3.5">Event Type</th>
                <th className="p-3.5">Source IP</th>
                <th className="p-3.5">Target IP</th>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono text-slate-500">#{e.id}</td>
                  <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">{e.timestamp}</td>
                  <td className="p-3.5 font-semibold text-white">{e.event_type}</td>
                  <td className="p-3.5 font-mono text-cyan-400">{e.source_ip || '-'}</td>
                  <td className="p-3.5 font-mono text-slate-400">{e.destination_ip || '-'}</td>
                  <td className="p-3.5 font-mono text-amber-400 font-bold">{e.username || '-'}</td>
                  <td className="p-3.5 text-slate-300">{e.action || '-'}</td>
                  <td className="p-3.5">
                    <SeverityBadge severity={e.severity} size="sm" />
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedEvent(e)}
                      className="p-1.5 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                      title="Inspect event details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    {loading ? 'Loading events...' : 'No security events matched your query filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {events.length} of {total} events
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-white disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-mono text-slate-300">
              Page {page + 1} of {Math.max(1, Math.ceil(total / pageSize))}
            </span>
            <button
              disabled={(page + 1) * pageSize >= total}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={`Normalized Security Event #${selectedEvent?.id}`}
        maxWidth="2xl"
      >
        {selectedEvent && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 uppercase block mb-1">Timestamp</span>
                <span className="font-mono text-slate-200">{selectedEvent.timestamp}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 uppercase block mb-1">Log Source</span>
                <span className="text-slate-200 font-semibold">{selectedEvent.source}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 uppercase block mb-1">Source IP</span>
                <span className="font-mono text-cyan-400">{selectedEvent.source_ip || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 uppercase block mb-1">Target IP</span>
                <span className="font-mono text-slate-200">{selectedEvent.destination_ip || 'N/A'}</span>
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
                <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Raw Log Entry</span>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
                  {selectedEvent.raw_log}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
