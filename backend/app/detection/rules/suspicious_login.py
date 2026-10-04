"""Suspicious Login Activity detection rule.

Detects unusual authentication patterns, such as multiple distinct source IP
addresses successfully authenticating to the same user account across a short time window.
"""

from collections import defaultdict
from datetime import timedelta

from app.core.config import get_settings
from app.detection.base import BaseDetectionRule
from app.models.event import SecurityEvent
from app.schemas.detection import DetectionFindingCreate


class SuspiciousLoginRule(BaseDetectionRule):
    """Detects unusual login behavior, such as logins from multiple distinct IPs."""

    rule_id = "RULE_SUSPICIOUS_LOGIN"
    rule_name = "Suspicious Login Activity"
    detection_type = "unusual_access"
    default_severity = "medium"
    default_confidence = 0.80

    def __init__(
        self,
        ip_threshold: int | None = None,
        window_hours: int | None = None,
    ) -> None:
        settings = get_settings()
        self.ip_threshold = ip_threshold or settings.suspicious_login_ip_threshold
        self.window_hours = window_hours or settings.suspicious_login_window_hours

    def detect(self, events: list[SecurityEvent]) -> list[DetectionFindingCreate]:
        findings: list[DetectionFindingCreate] = []

        # Filter successful logins with both username and IP
        valid_logins = [
            e for e in events
            if e.event_type.upper() in ("LOGIN_SUCCESS", "VPN_LOGIN")
            and e.username and e.source_ip
        ]

        if not valid_logins:
            return findings

        # Group by username
        user_logins: dict[str, list[SecurityEvent]] = defaultdict(list)
        for ev in valid_logins:
            if ev.username:
                user_logins[ev.username].append(ev)

        window_delta = timedelta(hours=self.window_hours)

        for user, u_events in user_logins.items():
            sorted_events = self._sort_events(u_events)
            n = len(sorted_events)

            i = 0
            while i < n:
                window_start = sorted_events[i].timestamp
                window_end = window_start + window_delta

                window_events = [
                    e for e in sorted_events[i:]
                    if e.timestamp <= window_end
                ]

                # Collect distinct IPs
                distinct_ips = {e.source_ip for e in window_events if e.source_ip}

                if len(distinct_ips) >= self.ip_threshold:
                    first_ev = window_events[0]
                    last_ev = window_events[-1]
                    ips_list = sorted(list(distinct_ips))

                    description = (
                        f"User '{user}' authenticated successfully from {len(distinct_ips)} distinct "
                        f"IP addresses ({', '.join(ips_list)}) within {self.window_hours} hours."
                    )

                    metadata = {
                        "target_user": user,
                        "distinct_ips": ips_list,
                        "ip_count": len(distinct_ips),
                        "window_hours": self.window_hours,
                        "threshold": self.ip_threshold,
                    }

                    finding = self._build_finding(
                        description=description,
                        first_event=first_ev,
                        last_event=last_ev,
                        evidence_events=window_events,
                        source_ip=last_ev.source_ip,
                        username=user,
                        metadata=metadata,
                    )
                    findings.append(finding)

                    i += len(window_events)
                else:
                    i += 1

        return findings
