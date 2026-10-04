"""Successful Login Following Failures detection rule.

Detects when an account experiences multiple failed authentication attempts
followed by a successful authentication within a defined time window.
This pattern often signifies a successful credential compromise or brute force breach.
"""

from collections import defaultdict
from datetime import timedelta

from app.core.config import get_settings
from app.detection.base import BaseDetectionRule
from app.models.event import SecurityEvent
from app.schemas.detection import DetectionFindingCreate


class SuccessfulLoginAfterFailuresRule(BaseDetectionRule):
    """Detects successful authentication after repeated failures."""

    rule_id = "RULE_SUCCESS_AFTER_BRUTE_FORCE"
    rule_name = "Successful Login Following Multiple Failures"
    detection_type = "credential_access"
    default_severity = "critical"
    default_confidence = 0.95

    def __init__(
        self,
        failure_threshold: int | None = None,
        window_minutes: int | None = None,
    ) -> None:
        settings = get_settings()
        self.failure_threshold = failure_threshold or settings.login_after_failures_threshold
        self.window_minutes = window_minutes or settings.login_after_failures_window_minutes

    def detect(self, events: list[SecurityEvent]) -> list[DetectionFindingCreate]:
        findings: list[DetectionFindingCreate] = []

        sorted_events = self._sort_events(events)
        window_delta = timedelta(minutes=self.window_minutes)

        # Group events by username
        user_events: dict[str, list[SecurityEvent]] = defaultdict(list)
        for ev in sorted_events:
            if ev.username:
                user_events[ev.username].append(ev)

        for user, u_events in user_events.items():
            for idx, success_ev in enumerate(u_events):
                if success_ev.event_type.upper() != "LOGIN_SUCCESS":
                    continue

                success_time = success_ev.timestamp
                window_start = success_time - window_delta

                # Find preceding failures for this user within the lookback window
                preceding_failures = [
                    e for e in u_events[:idx]
                    if e.event_type.upper() == "LOGIN_FAILED" and e.timestamp >= window_start
                ]

                if len(preceding_failures) >= self.failure_threshold:
                    failure_count = len(preceding_failures)
                    first_failure = preceding_failures[0]
                    all_evidence = preceding_failures + [success_ev]
                    failure_ips = list({e.source_ip for e in preceding_failures if e.source_ip})

                    description = (
                        f"User '{user}' successfully logged in from {success_ev.source_ip or 'unknown'} "
                        f"after {failure_count} failed login attempts within {self.window_minutes} minutes."
                    )

                    metadata = {
                        "failed_attempts": failure_count,
                        "success_event_id": success_ev.id,
                        "success_ip": success_ev.source_ip,
                        "failure_ips": failure_ips,
                        "window_minutes": self.window_minutes,
                        "threshold": self.failure_threshold,
                    }

                    finding = self._build_finding(
                        description=description,
                        first_event=first_failure,
                        last_event=success_ev,
                        evidence_events=all_evidence,
                        source_ip=success_ev.source_ip or (failure_ips[0] if failure_ips else None),
                        username=user,
                        metadata=metadata,
                    )
                    findings.append(finding)

        return findings
