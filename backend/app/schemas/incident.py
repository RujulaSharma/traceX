"""Pydantic schemas for security incidents, timelines, evidence, and attack graphs.

Defines API representations for correlated security incidents.
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.detection import DetectionFindingResponse
from app.schemas.event import EventResponse


class RiskFactor(BaseModel):
    """Breakdown component of the incident risk score."""

    factor: str
    points: float
    description: str


class AttackStage(BaseModel):
    """A stage in the reconstructed attack sequence."""

    stage_number: int
    name: str  # e.g. Reconnaissance, Credential Access, Initial Access, Privilege Escalation, Exfiltration
    status: str  # detected, inferred
    timestamp: datetime
    description: str
    finding_ids: list[int] = Field(default_factory=list)
    event_ids: list[int] = Field(default_factory=list)


class IncidentExplanation(BaseModel):
    """Deterministic structured narrative of the incident."""

    what_happened: str
    why_suspicious: str
    what_happened_next: str
    evidence_summary: str
    recommended_action: str


class IncidentResponse(BaseModel):
    """Full incident details returned via API."""

    id: int
    incident_number: str
    title: str
    status: str
    severity: str
    risk_score: float
    confidence: float
    primary_ip: str | None = None
    affected_user: str | None = None
    first_seen: datetime
    last_seen: datetime
    summary: str
    attack_stage: str
    risk_factors: list[RiskFactor] = Field(default_factory=list)
    stages: list[AttackStage] = Field(default_factory=list)
    explanation: IncidentExplanation | dict[str, Any] = Field(default_factory=dict)
    finding_ids: list[int] = Field(default_factory=list)
    event_ids: list[int] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TimelineItem(BaseModel):
    """A single chronological entry in the incident attack timeline."""

    id: str  # e.g. "ev-12" or "fd-4"
    item_type: str  # "event" or "finding"
    timestamp: datetime
    title: str
    description: str
    severity: str
    event_type: str | None = None
    rule_id: str | None = None
    source_ip: str | None = None
    username: str | None = None
    action: str | None = None
    is_key_milestone: bool = False
    evidence_id: int | None = None
    metadata: dict[str, Any] | None = None


class AttackTimelineResponse(BaseModel):
    """Chronological timeline for an incident."""

    incident_id: int
    incident_number: str
    total_items: int
    timeline: list[TimelineItem]


class IncidentEvidenceResponse(BaseModel):
    """All supporting raw and normalized evidence for an incident."""

    incident_id: int
    incident_number: str
    total_events: int
    total_findings: int
    events: list[EventResponse]
    findings: list[DetectionFindingResponse]


class GraphNode(BaseModel):
    """Node in the attack reconstruction graph."""

    id: str
    type: str  # "attacker_ip", "attack_stage", "target_user", "target_asset"
    label: str
    subtitle: str | None = None
    severity: str | None = None
    data: dict[str, Any] = Field(default_factory=dict)


class GraphEdge(BaseModel):
    """Directed edge in the attack reconstruction graph."""

    id: str
    source: str
    target: str
    label: str | None = None
    animated: bool = True


class AttackGraphResponse(BaseModel):
    """Graph structure representation for React Flow attack graph visualization."""

    incident_id: int
    nodes: list[GraphNode]
    edges: list[GraphEdge]


class CorrelationRunRequest(BaseModel):
    """Request parameters for triggering the correlation engine."""

    time_window_minutes: int = 60
    min_findings_per_incident: int = 1


class CorrelationRunResponse(BaseModel):
    """Summary of correlation execution."""

    success: bool
    findings_analyzed: int
    incidents_created: int
    incidents_updated: int
    message: str
    incidents: list[IncidentResponse] = Field(default_factory=list)


class DashboardStatsResponse(BaseModel):
    """Aggregated SOC metrics for dashboard overview."""

    total_events: int = 0
    suspicious_events: int = 0
    total_detections: int = 0
    total_incidents: int = 0
    active_incidents: int = 0
    critical_incidents: int = 0
    high_incidents: int = 0
    critical_findings: int = 0
    high_findings: int = 0
    avg_risk_score: float = 0.0
    average_risk_score: float = 0.0
    events_by_type: list[dict[str, Any]] = Field(default_factory=list)
    events_by_severity: list[dict[str, Any]] = Field(default_factory=list)
    detections_by_rule: list[dict[str, Any]] = Field(default_factory=list)
    top_suspicious_ips: list[dict[str, Any]] = Field(default_factory=list)
    top_targeted_users: list[dict[str, Any]] = Field(default_factory=list)
    event_distribution: list[dict[str, Any]] = Field(default_factory=list)
    recent_activity: list[dict[str, Any]] = Field(default_factory=list)
    recent_timeline: list[dict[str, Any]] = Field(default_factory=list)
