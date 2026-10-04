"""API routes for running security detections and querying findings.

Provides:
- POST /api/detections/run          — Execute detection engine against stored events
- GET  /api/detections              — Query generated detection findings with filters
- GET  /api/detections/{finding_id} — Retrieve finding details by ID
- GET  /api/detections/rules        — List all registered detection rules
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.detection.engine import get_detection_engine
from app.models.detection import DetectionFinding
from app.schemas.detection import (
    DetectionFindingResponse,
    DetectionRunRequest,
    DetectionRunResponse,
)

router = APIRouter(prefix="/detections", tags=["Detection Engine"])


@router.post(
    "/run",
    response_model=DetectionRunResponse,
    summary="Execute detection engine",
    description=(
        "Runs registered security detection rules against stored normalized events. "
        "Supports optional time-window, user, IP, and rule filtering. "
        "Persists findings to the database when persist_findings is True."
    ),
)
def run_detections(
    request: DetectionRunRequest = DetectionRunRequest(),
    db: Session = Depends(get_db),
) -> DetectionRunResponse:
    """Execute detection engine and return generated findings."""
    engine = get_detection_engine()
    return engine.run_on_database(db=db, request=request)


@router.get(
    "",
    response_model=list[DetectionFindingResponse],
    summary="Query detection findings",
    description="Retrieve stored detection findings with optional filtering.",
)
def get_findings(
    skip: int = Query(0, ge=0, description="Records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    rule_id: str | None = Query(None, description="Filter by rule ID"),
    detection_type: str | None = Query(None, description="Filter by detection type"),
    severity: str | None = Query(None, description="Filter by severity"),
    username: str | None = Query(None, description="Filter by username"),
    source_ip: str | None = Query(None, description="Filter by source IP"),
    db: Session = Depends(get_db),
) -> list[DetectionFindingResponse]:
    """Query stored detection findings."""
    query: Select[tuple[DetectionFinding]] = select(DetectionFinding)

    if rule_id:
        query = query.where(DetectionFinding.rule_id == rule_id)
    if detection_type:
        query = query.where(DetectionFinding.detection_type == detection_type.lower())
    if severity:
        query = query.where(DetectionFinding.severity == severity.lower())
    if username:
        query = query.where(DetectionFinding.username == username)
    if source_ip:
        query = query.where(DetectionFinding.source_ip == source_ip)

    query = query.order_by(DetectionFinding.timestamp.desc()).offset(skip).limit(limit)
    result = db.execute(query)
    findings = result.scalars().all()

    return [
        DetectionFindingResponse(
            id=f.id,
            rule_id=f.rule_id,
            rule_name=f.rule_name,
            detection_type=f.detection_type,
            severity=f.severity,
            confidence=f.confidence,
            source_ip=f.source_ip,
            username=f.username,
            timestamp=f.timestamp,
            first_seen=f.first_seen,
            last_seen=f.last_seen,
            description=f.description,
            evidence_event_ids=f.evidence_event_ids,
            metadata=f.metadata_,
            created_at=f.created_at,
        )
        for f in findings
    ]


@router.get(
    "/rules",
    summary="List registered detection rules",
    description="Returns metadata for all available security detection rules in the engine.",
)
def list_rules() -> list[dict[str, str | float]]:
    """List all registered detection rules."""
    engine = get_detection_engine()
    return [
        {
            "rule_id": r.rule_id,
            "rule_name": r.rule_name,
            "detection_type": r.detection_type,
            "default_severity": r.default_severity,
            "default_confidence": r.default_confidence,
        }
        for r in engine.get_rules()
    ]


@router.get(
    "/{finding_id}",
    response_model=DetectionFindingResponse,
    summary="Get detection finding by ID",
    description="Retrieve a single detection finding by its primary key.",
)
def get_finding_by_id(
    finding_id: int,
    db: Session = Depends(get_db),
) -> DetectionFindingResponse:
    """Get single finding by ID."""
    query = select(DetectionFinding).where(DetectionFinding.id == finding_id)
    finding = db.execute(query).scalar_one_or_none()

    if not finding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Detection finding with ID {finding_id} not found.",
        )

    return DetectionFindingResponse(
        id=finding.id,
        rule_id=finding.rule_id,
        rule_name=finding.rule_name,
        detection_type=finding.detection_type,
        severity=finding.severity,
        confidence=finding.confidence,
        source_ip=finding.source_ip,
        username=finding.username,
        timestamp=finding.timestamp,
        first_seen=finding.first_seen,
        last_seen=finding.last_seen,
        description=finding.description,
        evidence_event_ids=finding.evidence_event_ids,
        metadata=finding.metadata_,
        created_at=finding.created_at,
    )
