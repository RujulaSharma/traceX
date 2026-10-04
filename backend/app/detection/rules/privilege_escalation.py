"""Privilege Escalation detection rule.

Detects suspicious administrative elevation and privilege escalation attempts
(such as sudo execution or root role assumption) in relation to user sessions.
"""

from collections import defaultdict
from datetime import timedelta

from app.core.config import get_settings
from app.detection.base import BaseDetectionRule
from app.models.event import SecurityEvent
from app.schemas.detection import DetectionFindingCreate


class PrivilegeEscalationRule(BaseDetectionRule):
    """Detects suspicious privilege escalation events and sudo abuse."""

    rule_id = "RULE_PRIVILEGE_ESCALATION"
    rule_name = "Suspicious Privilege Escalation"
    detection_type = "privilege_escalation"
    default_severity = "high"
    default_confidence = 0.90

    def __init__(self, window_minutes: int | None = None) -> None:
        settings = get_settings()
        self.window_minutes = window_minutes or settings.privilege_escalation_window_minutes

    def detect(self, events: list[SecurityEvent]) -> list[DetectionFindingCreate]:
        findings: list[DetectionFindingCreate] = []
        sorted_events = self._sort_events(events)
        window_delta = timedelta(minutes=self.window_minutes)

        # Group by username
        user_events: dict[str, list[SecurityEvent]] = defaultdict(list)
        for ev in sorted_events:
            if ev.username:
                user_events[ev.username].append(ev)

        for user, u_events in user_events.items():
            for idx, ev in enumerate(u_events):
                is_priv_esc = (
                    ev.event_type.upper() == "PRIVILEGE_ESCALATION"
                    or (ev.action and ev.action.lower() in ("sudo", "su", "privilege_change", "escalate"))
                )

                if not is_priv_esc:
                    continue

                # Look for preceding login within the window
                window_start = ev.timestamp - window_delta
                preceding_logins = [
                    e for e in u_events[:idx]
                    if e.event_type.upper() in ("LOGIN_SUCCESS", "VPN_LOGIN")
                    and e.timestamp >= window_start
                ]

                evidence_events = preceding_logins + [ev] if preceding_logins else [ev]
                first_ev = evidence_events[0]

                command_info = None
                if ev.metadata_ and "command" in ev.metadata_:
                    command_info = ev.metadata_["command"]

                desc_parts = [f"Suspicious privilege escalation detected for user '{user}'"]
                if ev.action:
                    desc_parts.append(f"(action: {ev.action})")
                if command_info:
                    desc_parts.append(f"executing '{command_info}'")
                if preceding_logins:
                    desc_parts.append(f"following login from IP {preceding_logins[-1].source_ip or 'unknown'}")

                description = " ".join(desc_parts) + "."

                metadata = {
                    "target_user": user,
                    "escalation_event_id": ev.id,
                    "action": ev.action,
                    "command": command_info,
                    "has_preceding_login": len(preceding_logins) > 0,
                    "source_ip": ev.source_ip or (preceding_logins[-1].source_ip if preceding_logins else None),
                }

                finding = self._build_finding(
                    description=description,
                    first_event=first_ev,
                    last_event=ev,
                    evidence_events=evidence_events,
                    source_ip=ev.source_ip or (preceding_logins[-1].source_ip if preceding_logins else None),
                    username=user,
                    metadata=metadata,
                )
                findings.append(finding)

        return findings
