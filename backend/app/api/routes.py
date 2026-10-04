"""API routes for log ingestion and system health.

Provides:
- POST /api/logs/upload  — Upload and ingest security logs
- GET  /api/logs/events  — Query stored events
- GET  /api/health       — Application and database health check
"""

import logging

from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import check_database_health, get_db
from app.core.errors import InvalidLogFormatError
from app.models.event import SecurityEvent
from app.schemas.event import EventResponse, HealthResponse, IngestionResponse
from app.services.ingestion import ingest_logs

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/logs/upload",
    response_model=IngestionResponse,
    summary="Upload security logs",
    description=(
        "Upload a security log file in CSV, JSON, or NDJSON format. "
        "The file is parsed, validated, normalized, and stored in the database. "
        "Returns a summary of the ingestion including success/failure counts."
    ),
    tags=["Log Ingestion"],
)
async def upload_logs(
    file: UploadFile = File(
        ...,
        description="Log file in CSV, JSON, or NDJSON format",
    ),
    db: Session = Depends(get_db),
) -> IngestionResponse:
    """Upload and ingest a security log file.

    The ingestion pipeline:
    1. Reads the uploaded file content
    2. Detects the format (CSV/JSON/NDJSON)
    3. Parses individual records
    4. Validates each record against the security event schema
    5. Normalizes valid records
    6. Stores them in PostgreSQL
    7. Returns ingestion summary with rejected record details
    """
    # Read file content
    try:
        raw_bytes = await file.read()
        content = raw_bytes.decode("utf-8")
    except UnicodeDecodeError:
        raise InvalidLogFormatError("File must be UTF-8 encoded text.")
    except Exception as e:
        logger.error("Failed to read uploaded file: %s", str(e))
        raise InvalidLogFormatError(f"Failed to read file: {str(e)}")

    if not content.strip():
        raise InvalidLogFormatError("Uploaded file is empty.")

    filename = file.filename or "unknown"
    logger.info("File uploaded | name=%s size=%d bytes", filename, len(content))

    # Run the ingestion pipeline
    result = ingest_logs(db=db, content=content, filename=filename)

    return result


@router.get(
    "/logs/events",
    response_model=list[EventResponse],
    summary="Query security events",
    description="Retrieve stored security events with optional filtering.",
    tags=["Log Ingestion"],
)
async def get_events(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    event_type: str | None = Query(None, description="Filter by event type"),
    username: str | None = Query(None, description="Filter by username"),
    source_ip: str | None = Query(None, description="Filter by source IP"),
    severity: str | None = Query(None, description="Filter by severity"),
    db: Session = Depends(get_db),
) -> list[EventResponse]:
    """Query stored security events with optional filters."""
    query = db.query(SecurityEvent)

    if event_type:
        query = query.filter(SecurityEvent.event_type == event_type.upper())
    if username:
        query = query.filter(SecurityEvent.username == username)
    if source_ip:
        query = query.filter(SecurityEvent.source_ip == source_ip)
    if severity:
        query = query.filter(SecurityEvent.severity == severity.lower())

    query = query.order_by(SecurityEvent.timestamp.desc())
    events = query.offset(skip).limit(limit).all()

    return [
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


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Check application and database health status.",
    tags=["System"],
)
async def health_check() -> HealthResponse:
    """Check application and database health.

    Returns:
        Health status including app info and database connectivity.
    """
    settings = get_settings()
    db_health = check_database_health()

    return HealthResponse(
        status="healthy" if db_health["status"] == "healthy" else "degraded",
        app_name=settings.app_name,
        version=settings.app_version,
        environment=settings.app_env,
        database=db_health,
    )
