"""Log ingestion service.

Orchestrates the complete ingestion pipeline:
1. Parse raw file content into records
2. Validate each record through Pydantic schemas
3. Normalize valid records into SecurityEvent models
4. Bulk-insert events into PostgreSQL
5. Return ingestion summary with success/failure counts

This is the core service that connects parsing, validation,
and database storage into a single reliable pipeline.
"""

import logging
from typing import Any

from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.models.event import SecurityEvent
from app.schemas.event import EventCreate, IngestionResponse, RejectedRecord
from app.services.log_parser import detect_format, parse_csv, parse_json, parse_ndjson

logger = logging.getLogger(__name__)


def _validate_record(
    record: dict[str, Any], line_num: int
) -> tuple[EventCreate | None, RejectedRecord | None]:
    """Validate a single record through the Pydantic schema.

    Args:
        record: Raw dict from parser.
        line_num: Line/record number for error reporting.

    Returns:
        Tuple of (validated_event, None) on success,
        or (None, rejection_details) on failure.
    """
    try:
        event = EventCreate(**record)
        return event, None
    except ValidationError as e:
        # Extract human-readable error messages
        errors = []
        for err in e.errors():
            field = " -> ".join(str(loc) for loc in err["loc"])
            errors.append(f"{field}: {err['msg']}")
        error_msg = "; ".join(errors)

        logger.debug("Record %d validation failed: %s", line_num, error_msg)
        return None, RejectedRecord(line=line_num, error=error_msg)


def _event_to_model(event: EventCreate, raw_line: str | None = None) -> SecurityEvent:
    """Convert a validated Pydantic event to a SQLAlchemy model.

    Args:
        event: Validated event data.
        raw_line: Optional raw log line for evidence preservation.

    Returns:
        SecurityEvent model ready for database insertion.
    """
    return SecurityEvent(
        timestamp=event.timestamp,
        event_type=event.event_type,
        source=event.source,
        username=event.username,
        source_ip=event.source_ip,
        destination_ip=event.destination_ip,
        severity=event.severity,
        action=event.action,
        metadata_=event.metadata,
        raw_log=event.raw_log or raw_line,
    )


def ingest_logs(
    db: Session,
    content: str,
    filename: str,
) -> IngestionResponse:
    """Main ingestion pipeline.

    Processes an uploaded log file through the complete pipeline:
    parse -> validate -> normalize -> store.

    Args:
        db: Active database session.
        content: Raw text content of the uploaded file.
        filename: Original filename (used for format detection).

    Returns:
        IngestionResponse with counts and rejection details.
    """
    logger.info("Ingestion started | filename=%s size=%d bytes", filename, len(content))

    # Step 1: Detect format
    try:
        fmt = detect_format(filename, content)
    except ValueError as e:
        logger.error("Format detection failed: %s", str(e))
        return IngestionResponse(
            success=False,
            total_records=0,
            successful_records=0,
            failed_records=0,
            format="unknown",
            message=str(e),
        )

    logger.info("Format detected | format=%s", fmt)

    # Step 2: Parse based on format
    valid_events: list[SecurityEvent] = []
    rejected: list[RejectedRecord] = []
    total_records = 0

    if fmt == "csv":
        _process_csv(content, valid_events, rejected)
        total_records = len(valid_events) + len(rejected)

    elif fmt == "json":
        _process_json(content, valid_events, rejected)
        total_records = len(valid_events) + len(rejected)

    elif fmt == "ndjson":
        _process_ndjson(content, valid_events, rejected)
        total_records = len(valid_events) + len(rejected)

    # Step 3: Bulk insert valid events
    if valid_events:
        try:
            db.bulk_save_objects(valid_events)
            db.commit()
            logger.info(
                "Events stored | count=%d",
                len(valid_events),
            )
        except Exception as e:
            db.rollback()
            logger.error("Database insertion failed: %s", str(e))
            return IngestionResponse(
                success=False,
                total_records=total_records,
                successful_records=0,
                failed_records=total_records,
                format=fmt,
                message=f"Database error: {str(e)}",
            )

    success = len(valid_events) > 0 or total_records == 0
    message = (
        f"Logs ingested successfully. "
        f"{len(valid_events)} stored, {len(rejected)} rejected."
    )

    logger.info(
        "Ingestion completed | total=%d success=%d failed=%d",
        total_records,
        len(valid_events),
        len(rejected),
    )

    return IngestionResponse(
        success=success,
        total_records=total_records,
        successful_records=len(valid_events),
        failed_records=len(rejected),
        format=fmt,
        message=message,
        rejected=rejected,
    )


def _process_csv(
    content: str,
    valid_events: list[SecurityEvent],
    rejected: list[RejectedRecord],
) -> None:
    """Process CSV content through validation pipeline."""
    try:
        records = parse_csv(content)
    except Exception as e:
        rejected.append(RejectedRecord(line=0, error=f"CSV parse error: {str(e)}"))
        return

    for i, record in enumerate(records, start=2):  # Line 2 because line 1 is header
        # Preserve raw log as the CSV row representation
        record["raw_log"] = str(record)
        event, rejection = _validate_record(record, line_num=i)
        if event:
            valid_events.append(_event_to_model(event, raw_line=str(record)))
        if rejection:
            rejected.append(rejection)


def _process_json(
    content: str,
    valid_events: list[SecurityEvent],
    rejected: list[RejectedRecord],
) -> None:
    """Process JSON content through validation pipeline."""
    try:
        records = parse_json(content)
    except ValueError as e:
        rejected.append(RejectedRecord(line=0, error=str(e)))
        return

    for i, record in enumerate(records, start=1):
        import json

        raw = json.dumps(record)
        record["raw_log"] = raw
        event, rejection = _validate_record(record, line_num=i)
        if event:
            valid_events.append(_event_to_model(event, raw_line=raw))
        if rejection:
            rejected.append(rejection)


def _process_ndjson(
    content: str,
    valid_events: list[SecurityEvent],
    rejected: list[RejectedRecord],
) -> None:
    """Process NDJSON content through validation pipeline."""
    import json

    parsed = parse_ndjson(content)

    for line_num, result in parsed:
        if isinstance(result, str):
            # Parse error
            rejected.append(RejectedRecord(line=line_num, error=result))
        else:
            raw = json.dumps(result)
            result["raw_log"] = raw
            event, rejection = _validate_record(result, line_num=line_num)
            if event:
                valid_events.append(_event_to_model(event, raw_line=raw))
            if rejection:
                rejected.append(rejection)
