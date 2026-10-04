"""Base interface for all security detection rules.

Every detection rule implements the BaseDetectionRule interface,
ensuring clean separation between individual detection logic and
the execution engine.
"""

from abc import ABC, abstractmethod
from typing import Any

from app.models.event import SecurityEvent
from app.schemas.detection import DetectionFindingCreate


class BaseDetectionRule(ABC):
    """Abstract base class for security detection rules.

    Subclasses must implement:
    - rule_id: Unique identifier string (e.g. 'RULE_BRUTE_FORCE')
    - rule_name: Human-readable name
    - detection_type: Category (e.g. 'brute_force', 'reconnaissance')
    - default_severity: Initial severity ('low', 'medium', 'high', 'critical')
    - default_confidence: Initial confidence (0.0 - 1.0)
    - detect(events): Evaluates events and yields DetectionFindingCreate objects
    """

    rule_id: str
    rule_name: str
    detection_type: str
    default_severity: str = "medium"
    default_confidence: float = 0.85

    @abstractmethod
    def detect(self, events: list[SecurityEvent]) -> list[DetectionFindingCreate]:
        """Analyze a list of security events and return detection findings.

        Args:
            events: Normalized security events ordered chronologically.

        Returns:
            List of structured findings with evidence IDs and metadata.
        """
        pass

    def _sort_events(self, events: list[SecurityEvent]) -> list[SecurityEvent]:
        """Utility to ensure events are ordered chronologically by timestamp."""
        return sorted(events, key=lambda e: e.timestamp)

    def _build_finding(
        self,
        description: str,
        first_event: SecurityEvent,
        last_event: SecurityEvent,
        evidence_events: list[SecurityEvent],
        severity: str | None = None,
        confidence: float | None = None,
        source_ip: str | None = None,
        username: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> DetectionFindingCreate:
        """Helper to construct a standardized DetectionFindingCreate object."""
        evidence_ids = [e.id for e in evidence_events if e.id is not None]
        return DetectionFindingCreate(
            rule_id=self.rule_id,
            rule_name=self.rule_name,
            detection_type=self.detection_type,
            severity=severity or self.default_severity,
            confidence=confidence or self.default_confidence,
            source_ip=source_ip or last_event.source_ip,
            username=username or last_event.username,
            timestamp=last_event.timestamp,
            first_seen=first_event.timestamp,
            last_seen=last_event.timestamp,
            description=description,
            evidence_event_ids=evidence_ids,
            metadata=metadata or {},
        )
