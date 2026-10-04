"""Security detection engine.

Orchestrates the registration and execution of security detection rules
against normalized security events, and handles finding persistence.
"""

from typing import Sequence

from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.core.logging import get_logger
from app.detection.base import BaseDetectionRule
from app.models.detection import DetectionFinding
from app.models.event import SecurityEvent
from app.schemas.detection import (
    DetectionFindingCreate,
    DetectionFindingResponse,
    DetectionRunRequest,
    DetectionRunResponse,
)

logger = get_logger(__name__)


class DetectionEngine:
    """Core engine responsible for executing registered security rules."""

    def __init__(self) -> None:
        self._rules: dict[str, BaseDetectionRule] = {}

    def register_rule(self, rule: BaseDetectionRule) -> None:
        """Register a detection rule instance in the engine."""
        if rule.rule_id in self._rules:
            logger.warning("Overwriting existing rule registration | rule_id=%s", rule.rule_id)
        self._rules[rule.rule_id] = rule
        logger.debug("Rule registered | id=%s name=%s", rule.rule_id, rule.rule_name)

    def get_rule(self, rule_id: str) -> BaseDetectionRule | None:
        """Retrieve a registered rule by its identifier."""
        return self._rules.get(rule_id)

    def get_rules(self) -> list[BaseDetectionRule]:
        """Return all registered rule instances."""
        return list(self._rules.values())

    def run(
        self,
        events: list[SecurityEvent],
        rule_ids: list[str] | None = None,
    ) -> list[DetectionFindingCreate]:
        """Execute rules against the provided list of events.

        Args:
            events: Normalized security events.
            rule_ids: Optional list of specific rule IDs to execute.
                      If None or empty, all registered rules run.

        Returns:
            List of generated DetectionFindingCreate objects.
        """
        findings: list[DetectionFindingCreate] = []

        rules_to_run = (
            [self._rules[rid] for rid in rule_ids if rid in self._rules]
            if rule_ids
            else list(self._rules.values())
        )

        logger.info(
            "Executing detection engine | rules=%d events=%d",
            len(rules_to_run),
            len(events),
        )

        for rule in rules_to_run:
            try:
                rule_findings = rule.detect(events)
                findings.extend(rule_findings)
                logger.debug(
                    "Rule executed | id=%s findings=%d",
                    rule.rule_id,
                    len(rule_findings),
                )
            except Exception as e:
                logger.error(
                    "Error executing rule | rule_id=%s error=%s",
                    rule.rule_id,
                    str(e),
                    exc_info=True,
                )

        logger.info(
            "Detection completed | total_findings=%d",
            len(findings),
        )
        return findings

    def run_on_database(
        self,
        db: Session,
        request: DetectionRunRequest,
    ) -> DetectionRunResponse:
        """Fetch events from the database, execute rules, and optionally persist findings.

        Args:
            db: Active SQLAlchemy database session.
            request: Parameters filtering events and controlling rule execution.

        Returns:
            DetectionRunResponse with execution metrics and generated findings.
        """
        # Build query
        query: Select[tuple[SecurityEvent]] = select(SecurityEvent)

        if request.start_time:
            query = query.where(SecurityEvent.timestamp >= request.start_time)
        if request.end_time:
            query = query.where(SecurityEvent.timestamp <= request.end_time)
        if request.source_ip:
            query = query.where(SecurityEvent.source_ip == request.source_ip)
        if request.username:
            query = query.where(SecurityEvent.username == request.username)

        query = query.order_by(SecurityEvent.timestamp.asc())

        result = db.execute(query)
        events_sequence: Sequence[SecurityEvent] = result.scalars().all()
        events: list[SecurityEvent] = list(events_sequence)

        # Run rules
        findings_created = self.run(events, rule_ids=request.rule_ids)

        stored_findings: list[DetectionFinding] = []
        if request.persist_findings and findings_created:
            for f in findings_created:
                db_finding = DetectionFinding(
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
                    metadata_=f.metadata,
                )
                db.add(db_finding)
                stored_findings.append(db_finding)
            db.commit()
            for sf in stored_findings:
                db.refresh(sf)
            logger.info("Persisted detection findings | count=%d", len(stored_findings))

        # Build response findings
        if stored_findings:
            response_findings = [
                DetectionFindingResponse(
                    id=sf.id,
                    rule_id=sf.rule_id,
                    rule_name=sf.rule_name,
                    detection_type=sf.detection_type,
                    severity=sf.severity,
                    confidence=sf.confidence,
                    source_ip=sf.source_ip,
                    username=sf.username,
                    timestamp=sf.timestamp,
                    first_seen=sf.first_seen,
                    last_seen=sf.last_seen,
                    description=sf.description,
                    evidence_event_ids=sf.evidence_event_ids,
                    metadata=sf.metadata_,
                    created_at=sf.created_at,
                )
                for sf in stored_findings
            ]
        else:
            from datetime import datetime, timezone

            now_utc = datetime.now(timezone.utc)
            response_findings = [
                DetectionFindingResponse(
                    id=idx + 1,
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
                    metadata=f.metadata,
                    created_at=now_utc,
                )
                for idx, f in enumerate(findings_created)
            ]

        rules_executed_names = [
            r.rule_id for r in self.get_rules()
            if request.rule_ids is None or r.rule_id in request.rule_ids
        ]

        return DetectionRunResponse(
            success=True,
            events_analyzed=len(events),
            findings_generated=len(findings_created),
            findings_stored=len(stored_findings),
            rules_executed=rules_executed_names,
            message=f"Detection run completed. Analyzed {len(events)} events, generated {len(findings_created)} findings.",
            findings=response_findings,
        )


_global_engine: DetectionEngine | None = None


def get_detection_engine() -> DetectionEngine:
    """Return the global detection engine singleton with all default rules registered."""
    global _global_engine
    if _global_engine is None:
        _global_engine = DetectionEngine()
        # Rules will be imported and registered as they are implemented
        _register_default_rules(_global_engine)
    return _global_engine


def _register_default_rules(engine: DetectionEngine) -> None:
    """Register built-in detection rules."""
    from app.detection.rules.brute_force import BruteForceDetectionRule
    from app.detection.rules.port_scan import PortScanDetectionRule
    from app.detection.rules.privilege_escalation import PrivilegeEscalationRule
    from app.detection.rules.successful_login_after_failures import (
        SuccessfulLoginAfterFailuresRule,
    )
    from app.detection.rules.suspicious_login import SuspiciousLoginRule

    engine.register_rule(BruteForceDetectionRule())
    engine.register_rule(SuccessfulLoginAfterFailuresRule())
    engine.register_rule(PortScanDetectionRule())
    engine.register_rule(PrivilegeEscalationRule())
    engine.register_rule(SuspiciousLoginRule())
