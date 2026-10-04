"""API routes for security incidents, timelines, evidence, and attack graphs.

Provides:
- POST /api/correlation/run         — Run event correlation & incident creation
- GET  /api/incidents               — List all correlated incidents
- GET  /api/incidents/{id}          — Get incident details with reconstruction & explanation
- GET  /api/incidents/{id}/timeline — Get chronological incident attack timeline
- GET  /api/incidents/{id}/evidence — Get supporting events & raw logs
- GET  /api/incidents/{id}/graph    — Get React Flow attack graph nodes & edges
- PATCH /api/incidents/{id}/status  — Update incident status (open/investigating/resolved)
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.correlation.engine import get_correlation_engine
from app.models.detection import DetectionFinding
from app.models.event import SecurityEvent
from app.models.incident import Incident
from app.schemas.detection import DetectionFindingResponse
from app.schemas.event import EventResponse
from app.schemas.incident import (
    AttackGraphResponse,
    AttackStage,
    AttackTimelineResponse,
    CorrelationRunRequest,
    CorrelationRunResponse,
    IncidentEvidenceResponse,
    IncidentResponse,
    RiskFactor,
)

router = APIRouter(tags=["Incident Investigation"])


class StatusUpdateRequest(BaseModel):
    status: str  # "open", "investigating", "contained", "resolved"


@router.post(
    "/correlation/run",
    response_model=CorrelationRunResponse,
    summary="Run correlation engine",
    description="Correlates stored detection findings and events into unified security incidents.",
)
def run_correlation(
    request: CorrelationRunRequest = CorrelationRunRequest(),
    db: Session = Depends(get_db),
) -> CorrelationRunResponse:
    """Trigger the correlation engine."""
    engine = get_correlation_engine()
    return engine.run_on_database(db=db, request=request)


@router.get(
    "/incidents",
    response_model=list[IncidentResponse],
    summary="List security incidents",
    description="Retrieve all correlated security incidents with optional filtering.",
)
def list_incidents(
    skip: int = Query(0, ge=0, description="Records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    severity: str | None = Query(None, description="Filter by severity"),
    status: str | None = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
) -> list[IncidentResponse]:
    """List security incidents."""
    query: Select[tuple[Incident]] = select(Incident)

    if severity:
        query = query.where(Incident.severity == severity.lower())
    if status:
        query = query.where(Incident.status == status.lower())

    query = query.order_by(Incident.risk_score.desc(), Incident.last_seen.desc()).offset(skip).limit(limit)
    incidents = db.execute(query).scalars().all()

    return [
        IncidentResponse(
            id=inc.id,
            incident_number=inc.incident_number,
            title=inc.title,
            status=inc.status,
            severity=inc.severity,
            risk_score=inc.risk_score,
            confidence=inc.confidence,
            primary_ip=inc.primary_ip,
            affected_user=inc.affected_user,
            first_seen=inc.first_seen,
            last_seen=inc.last_seen,
            summary=inc.summary,
            attack_stage=inc.attack_stage,
            risk_factors=[RiskFactor(**rf) for rf in inc.risk_factors],
            stages=[AttackStage(**s) for s in inc.stages],
            explanation=inc.explanation,
            finding_ids=inc.finding_ids,
            event_ids=inc.event_ids,
            created_at=inc.created_at,
            updated_at=inc.updated_at,
        )
        for inc in incidents
    ]


@router.get(
    "/incidents/{incident_id}",
    response_model=IncidentResponse,
    summary="Get incident details",
    description="Retrieve a single incident by ID with attack reconstruction, risk breakdown, and explanation.",
)
def get_incident_by_id(
    incident_id: int,
    db: Session = Depends(get_db),
) -> IncidentResponse:
    """Get single incident by ID."""
    inc = db.execute(select(Incident).where(Incident.id == incident_id)).scalar_one_or_none()

    if not inc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with ID {incident_id} not found.",
        )

    return IncidentResponse(
        id=inc.id,
        incident_number=inc.incident_number,
        title=inc.title,
        status=inc.status,
        severity=inc.severity,
        risk_score=inc.risk_score,
        confidence=inc.confidence,
        primary_ip=inc.primary_ip,
        affected_user=inc.affected_user,
        first_seen=inc.first_seen,
        last_seen=inc.last_seen,
        summary=inc.summary,
        attack_stage=inc.attack_stage,
        risk_factors=[RiskFactor(**rf) for rf in inc.risk_factors],
        stages=[AttackStage(**s) for s in inc.stages],
        explanation=inc.explanation,
        finding_ids=inc.finding_ids,
        event_ids=inc.event_ids,
        created_at=inc.created_at,
        updated_at=inc.updated_at,
    )


@router.get(
    "/incidents/{incident_id}/timeline",
    response_model=AttackTimelineResponse,
    summary="Get incident attack timeline",
    description="Retrieve the unified chronological event and alert timeline for an incident.",
)
def get_incident_timeline(
    incident_id: int,
    db: Session = Depends(get_db),
) -> AttackTimelineResponse:
    """Get attack timeline for an incident."""
    inc = db.execute(select(Incident).where(Incident.id == incident_id)).scalar_one_or_none()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found.")

    # Fetch events & findings
    events = list(db.execute(select(SecurityEvent).where(SecurityEvent.id.in_(inc.event_ids))).scalars().all())
    findings = list(db.execute(select(DetectionFinding).where(DetectionFinding.id.in_(inc.finding_ids))).scalars().all())

    engine = get_correlation_engine()
    return engine.build_timeline(incident=inc, events=events, findings=findings)


@router.get(
    "/incidents/{incident_id}/evidence",
    response_model=IncidentEvidenceResponse,
    summary="Get incident evidence",
    description="Retrieve all raw and normalized evidence logs supporting an incident.",
)
def get_incident_evidence(
    incident_id: int,
    db: Session = Depends(get_db),
) -> IncidentEvidenceResponse:
    """Get all supporting evidence events and findings."""
    inc = db.execute(select(Incident).where(Incident.id == incident_id)).scalar_one_or_none()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found.")

    events = list(db.execute(select(SecurityEvent).where(SecurityEvent.id.in_(inc.event_ids))).scalars().all())
    findings = list(db.execute(select(DetectionFinding).where(DetectionFinding.id.in_(inc.finding_ids))).scalars().all())

    event_responses = [
        EventResponse(
            id=e.id,
            timestamp=e.timestamp,
            event_type=e.event_type,
            source=e.source,
            username=e.username,
            source_ip=e.source_ip,
            destination_ip=e.destination_ip,
            severity=e.severity,
            action=e.action,
            metadata=e.metadata_,
            created_at=e.created_at,
        )
        for e in events
    ]

    finding_responses = [
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

    return IncidentEvidenceResponse(
        incident_id=inc.id,
        incident_number=inc.incident_number,
        total_events=len(event_responses),
        total_findings=len(finding_responses),
        events=event_responses,
        findings=finding_responses,
    )


@router.get(
    "/incidents/{incident_id}/graph",
    response_model=AttackGraphResponse,
    summary="Get incident attack graph",
    description="Retrieve nodes and directed edges formatted for React Flow attack graph visualization.",
)
def get_incident_attack_graph(
    incident_id: int,
    db: Session = Depends(get_db),
) -> AttackGraphResponse:
    """Get attack graph structure."""
    inc = db.execute(select(Incident).where(Incident.id == incident_id)).scalar_one_or_none()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found.")

    engine = get_correlation_engine()
    return engine.build_attack_graph(incident=inc)


@router.patch(
    "/incidents/{incident_id}/status",
    response_model=IncidentResponse,
    summary="Update incident status",
    description="Update the triage status of an incident (open, investigating, contained, resolved).",
)
def update_incident_status(
    incident_id: int,
    body: StatusUpdateRequest,
    db: Session = Depends(get_db),
) -> IncidentResponse:
    """Update status of an incident."""
    inc = db.execute(select(Incident).where(Incident.id == incident_id)).scalar_one_or_none()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found.")

    valid_statuses = {"open", "investigating", "contained", "resolved"}
    if body.status.lower() not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    inc.status = body.status.lower()
    db.commit()
    db.refresh(inc)

    return get_incident_by_id(incident_id=incident_id, db=db)
