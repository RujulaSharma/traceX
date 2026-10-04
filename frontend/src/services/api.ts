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

const rawBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
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
    const res = await api.get('/events', { params });
    return res.data;
  },

  getEventById: async (id: number): Promise<SecurityEvent> => {
    const res = await api.get(`/events/${id}`);
    return res.data;
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
    return res.data;
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
    return res.data;
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
