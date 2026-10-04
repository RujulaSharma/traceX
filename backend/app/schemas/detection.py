"""Pydantic schemas for detection findings and execution requests.

Defines schemas for:
- Creating findings from rules (DetectionFindingCreate)
- Returning findings via API (DetectionFindingResponse)
- Triggering detection engine runs (DetectionRunRequest, DetectionRunResponse)
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class DetectionFindingCreate(BaseModel):
    """Schema for a detection finding produced by a detection rule."""

    rule_id: str
    rule_name: str
    detection_type: str
    severity: str = "medium"
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    source_ip: str | None = None
    username: str | None = None
    timestamp: datetime
    first_seen: datetime
    last_seen: datetime
    description: str
    evidence_event_ids: list[int] = Field(default_factory=list)
    metadata: dict[str, Any] | None = None


class DetectionFindingResponse(BaseModel):
    """Schema for returning a detection finding via API."""

    id: int
    rule_id: str
    rule_name: str
    detection_type: str
    severity: str
    confidence: float
    source_ip: str | None = None
    username: str | None = None
    timestamp: datetime
    first_seen: datetime
    last_seen: datetime
    description: str
    evidence_event_ids: list[int] = Field(default_factory=list)
    metadata: dict[str, Any] | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DetectionRunRequest(BaseModel):
    """Request payload for triggering detection engine."""

    start_time: datetime | None = None
    end_time: datetime | None = None
    rule_ids: list[str] | None = None
    source_ip: str | None = None
    username: str | None = None
    persist_findings: bool = True


class DetectionRunResponse(BaseModel):
    """Summary of detection engine execution."""

    success: bool
    events_analyzed: int
    findings_generated: int
    findings_stored: int
    rules_executed: list[str]
    message: str
    findings: list[DetectionFindingResponse] = Field(default_factory=list)
