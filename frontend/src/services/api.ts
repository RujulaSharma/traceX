import axios from 'axios';
import {
  SecurityEvent,
  IngestionResult,
  DetectionFinding,
  Incident,
  TimelineEvent,
  AttackGraphData,
  DashboardStats,
} from '../types';

const rawBase =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim() ||
  (import.meta.env.PROD ? 'https://tracex-backend-lcy5.onrender.com' : '');
const API_BASE = rawBase
  ? (rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/+$/, '')}/api`)
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tracexApi = {
  // Health
  checkHealth: async () => {
    const res = await api.get('/health');
    return res.data;
  },

  // Log Ingestion
  uploadLogs: async (file: File): Promise<IngestionResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<IngestionResult>('/logs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Events
  getEvents: async (params?: {
    event_type?: string;
    username?: string;
    source_ip?: string;
    severity?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ total: number; events: SecurityEvent[] }> => {
    // Backend routes.py registers GET /api/logs/events with skip and limit
    const queryParams: any = { ...params };
    if (params?.offset !== undefined && queryParams.skip === undefined) {
      queryParams.skip = params.offset;
    }
    const res = await api.get('/logs/events', { params: queryParams });
    const data = res.data;
    if (Array.isArray(data)) {
      return { total: data.length, events: data };
    }
    return data || { total: 0, events: [] };
  },

  getEventById: async (id: number): Promise<SecurityEvent | null> => {
    // Note: The FastAPI backend currently provides /api/logs/events without single-event /{id} endpoint.
    // If ever invoked, query with reasonable limit to find matching event by ID.
    try {
      const res = await api.get('/logs/events', { params: { limit: 100 } });
      if (Array.isArray(res.data)) {
        return res.data.find((e: SecurityEvent) => e.id === id) || null;
      }
      return null;
    } catch {
      return null;
    }
  },

  // Detections
  runDetections: async (options?: { dry_run?: boolean; rule_ids?: string[] }) => {
    const res = await api.post('/detections/run', options || {});
    return res.data;
  },

  getDetections: async (params?: {
    severity?: string;
    rule_id?: string;
    entity_value?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ total: number; findings: DetectionFinding[] }> => {
    const res = await api.get('/detections', { params });
    const data = res.data;
    const rawList: any[] = Array.isArray(data) ? data : data?.findings || [];
    const findings: DetectionFinding[] = rawList.map((f: any) => ({
      ...f,
      title: f.title || f.rule_name || 'Threat Finding',
      entity_type: f.entity_type || (f.username ? 'user' : f.source_ip ? 'ip' : 'entity'),
      entity_value: f.entity_value || f.username || f.source_ip || 'N/A',
      event_count: f.event_count ?? (Array.isArray(f.evidence_event_ids) ? f.evidence_event_ids.length : 0),
      mitre_technique: f.mitre_technique || f.metadata?.mitre_technique || 'N/A',
      mitre_tactic: f.mitre_tactic || f.metadata?.mitre_tactic || f.detection_type || 'N/A',
    }));
    return {
      total: Array.isArray(data) ? data.length : (data?.total ?? findings.length),
      findings,
    };
  },

  getDetectionRules: async () => {
    const res = await api.get('/detections/rules');
    return res.data;
  },

  // Correlation & Incidents
  runCorrelation: async () => {
    const res = await api.post('/correlation/run');
    return res.data;
  },

  getIncidents: async (params?: {
    status?: string;
    severity?: string;
    min_risk_score?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ total: number; incidents: Incident[] }> => {
    const res = await api.get('/incidents', { params });
    const data = res.data;
    if (Array.isArray(data)) {
      return { total: data.length, incidents: data };
    }
    return data || { total: 0, incidents: [] };
  },

  getIncidentById: async (id: number): Promise<Incident> => {
    const res = await api.get(`/incidents/${id}`);
    return res.data;
  },

  getIncidentTimeline: async (id: number): Promise<{ incident_id: number; total_items: number; timeline: TimelineEvent[] }> => {
    const res = await api.get(`/incidents/${id}/timeline`);
    return res.data;
  },

  getIncidentEvidence: async (id: number): Promise<{ incident_id: number; findings: DetectionFinding[]; events: SecurityEvent[] }> => {
    const res = await api.get(`/incidents/${id}/evidence`);
    return res.data;
  },

  getIncidentGraph: async (id: number): Promise<AttackGraphData> => {
    const res = await api.get(`/incidents/${id}/graph`);
    return res.data;
  },

  updateIncidentStatus: async (id: number, status: string): Promise<Incident> => {
    const res = await api.patch(`/incidents/${id}/status`, { status });
    return res.data;
  },

  // Dashboard Stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await api.get('/stats/dashboard');
    return res.data;
  },
};

export default tracexApi;
