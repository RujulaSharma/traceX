"""Brute Force Authentication detection rule.

Identifies repeated failed authentication attempts against the same user account
from the same source IP within a configurable time window.
"""

from collections import defaultdict
from datetime import timedelta

from app.core.config import get_settings
from app.detection.base import BaseDetectionRule
from app.models.event import SecurityEvent
from app.schemas.detection import DetectionFindingCreate


class BruteForceDetectionRule(BaseDetectionRule):
    """Detects brute force login attempts."""

    rule_id = "RULE_BRUTE_FORCE"
    rule_name = "Brute Force Authentication Attempt"
    detection_type = "brute_force"
    default_severity = "high"
    default_confidence = 0.90

    def __init__(
        self,
        threshold: int | None = None,
        window_minutes: int | None = None,
    ) -> None:
        settings = get_settings()
        self.threshold = threshold or settings.brute_force_threshold
        self.window_minutes = window_minutes or settings.brute_force_window_minutes

    def detect(self, events: list[SecurityEvent]) -> list[DetectionFindingCreate]:
        findings: list[DetectionFindingCreate] = []

        # Filter LOGIN_FAILED events
        failed_logins = [
            e for e in events
            if e.event_type.upper() == "LOGIN_FAILED" and e.username and e.source_ip
        ]

        if not failed_logins:
            return findings

        # Group by (username, source_ip)
        grouped: dict[tuple[str, str], list[SecurityEvent]] = defaultdict(list)
        for event in failed_logins:
            if event.username and event.source_ip:
                grouped[(event.username, event.source_ip)].append(event)

        window_delta = timedelta(minutes=self.window_minutes)

        for (user, ip), group_events in grouped.items():
            sorted_group = self._sort_events(group_events)
            n = len(sorted_group)
            if n < self.threshold:
                continue

            i = 0
            while i < n:
                window_start = sorted_group[i].timestamp
                window_end = window_start + window_delta

                # Collect all events within this sliding window
                window_events = [
                    e for e in sorted_group[i:]
                    if e.timestamp <= window_end
                ]

                if len(window_events) >= self.threshold:
                    count = len(window_events)
                    first_ev = window_events[0]
                    last_ev = window_events[-1]

                    description = (
                        f"Detected {count} failed login attempts for user '{user}' "
                        f"from IP {ip} within {self.window_minutes} minutes."
                    )

                    metadata = {
                        "failed_attempts": count,
                        "window_minutes": self.window_minutes,
                        "target_user": user,
                        "attacker_ip": ip,
                        "threshold": self.threshold,
                    }

                    finding = self._build_finding(
                        description=description,
                        first_event=first_ev,
                        last_event=last_ev,
                        evidence_events=window_events,
                        source_ip=ip,
                        username=user,
                        metadata=metadata,
                    )
                    findings.append(finding)

                    # Advance i past the current cluster to prevent duplicate findings
                    i += len(window_events)
                else:
                    i += 1

        return findings
