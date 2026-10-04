export interface SecurityEvent {
  id: number;
  timestamp: string;
  event_type: string;
  source: string;
  username: string | null;
  source_ip: string | null;
  destination_ip: string | null;
  severity: string;
  action: string | null;
  metadata?: Record<string, any>;
  raw_log?: string | null;
  created_at: string;
}

export interface IngestionResult {
  total_records: number;
  valid_records: number;
  invalid_records: number;
  format_detected: string;
  errors: string[];
  duration_ms: number;
}

export interface DetectionFinding {
  id: number;
  rule_id: string;
  rule_name: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'info';
  confidence: number;
  title: string;
  description: string;
  entity_type: string;
  entity_value: string;
  source_ip?: string | null;
  username?: string | null;
  first_seen: string;
  last_seen: string;
  event_count: number;
  evidence_event_ids: number[];
  mitre_technique?: string | null;
  mitre_tactic?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AttackStage {
  stage: string;
  title: string;
  description: string;
  first_seen: string;
  last_seen: string;
  findings_count: number;
  event_count: number;
  severities: string[];
}

export interface RiskFactor {
  factor: string;
  score: number;
  reason: string;
}

export interface IncidentExplanation {
  what_happened: string;
  why_suspicious: string;
  what_happened_next: string;
  evidence_summary: string;
  recommended_action: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'attacker_ip' | 'compromised_user' | 'target_ip' | 'detection_rule' | 'attack_stage' | 'action_event';
  stage?: string;
  severity?: string;
  confidence?: number;
  timestamp?: string;
  data?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type?: string;
}

export interface AttackGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  stage: string;
  stage_order: number;
  type: 'event' | 'detection' | 'milestone';
  title: string;
  description: string;
  severity: string;
  source_ip?: string | null;
  target_ip?: string | null;
  username?: string | null;
  action?: string | null;
  event_id?: number | null;
  finding_id?: number | null;
  metadata?: Record<string, any>;
}

export interface Incident {
  id: number;
  title: string;
  primary_attacker_ip?: string | null;
  compromised_username?: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'info';
  risk_score: number;
  confidence: number;
  first_seen: string;
  last_seen: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  stages: AttackStage[];
  risk_factors: RiskFactor[];
  explanation: IncidentExplanation;
  findings_count: number;
  events_count: number;
  detection_finding_ids: number[];
  event_ids: number[];
  created_at: string;
}

export interface DashboardStats {
  total_events: number;
  total_detections: number;
  total_incidents: number;
  critical_incidents: number;
  high_incidents: number;
  avg_risk_score: number;
  events_by_type: { event_type: string; count: number }[];
  events_by_severity: { severity: string; count: number }[];
  detections_by_rule: { rule_name: string; count: number }[];
  top_suspicious_ips: { ip: string; count: number; max_severity: string }[];
  top_targeted_users: { username: string; count: number; max_severity: string }[];
  recent_timeline: { timestamp: string; count: number }[];
}
