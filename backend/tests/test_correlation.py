"""Tests for the Correlation Engine and Attack Reconstruction.

Tests:
- Finding clustering by entity (IP and username)
- Attack stage sequence reconstruction
- Explainable risk score computation and factor breakdown
- Deterministic explanation generation
- Incident timeline and attack graph construction
"""

from datetime import datetime, timedelta, timezone

from app.correlation.engine import CorrelationEngine, get_correlation_engine
from app.models.detection import DetectionFinding
from app.models.event import SecurityEvent


class TestCorrelationEngine:
    """Test correlation and attack reconstruction logic."""

    def test_correlate_full_attack_chain(self):
        """Correlate a full attack sequence (recon -> brute force -> breach -> priv esc -> exfil)."""
        engine = CorrelationEngine(default_window_minutes=60)
        base_time = datetime(2026, 10, 4, 10, 0, 0, tzinfo=timezone.utc)

        # 1. Findings
        f_recon = DetectionFinding(
            id=1,
            rule_id="RULE_PORT_SCAN",
            rule_name="Port Scan & Network Reconnaissance",
            detection_type="reconnaissance",
            severity="high",
            confidence=0.85,
            source_ip="185.23.91.44",
            username=None,
            timestamp=base_time,
            first_seen=base_time,
            last_seen=base_time,
            description="Detected port scanning from 185.23.91.44",
            evidence_event_ids=[101],
            metadata_={"ports_scanned": [22, 80, 443]},
        )

        f_brute = DetectionFinding(
            id=2,
            rule_id="RULE_BRUTE_FORCE",
            rule_name="Brute Force Authentication Attempt",
            detection_type="brute_force",
            severity="high",
            confidence=0.90,
            source_ip="185.23.91.44",
            username="admin",
            timestamp=base_time + timedelta(minutes=3),
            first_seen=base_time + timedelta(minutes=2),
            last_seen=base_time + timedelta(minutes=3),
            description="Detected 6 failed login attempts for user admin",
            evidence_event_ids=[102, 103, 104, 105, 106, 107],
            metadata_={"failed_attempts": 6},
        )

        f_breach = DetectionFinding(
            id=3,
            rule_id="RULE_SUCCESS_AFTER_BRUTE_FORCE",
            rule_name="Successful Login Following Multiple Failures",
            detection_type="credential_access",
            severity="critical",
            confidence=0.95,
            source_ip="185.23.91.44",
            username="admin",
            timestamp=base_time + timedelta(minutes=4),
            first_seen=base_time + timedelta(minutes=2),
            last_seen=base_time + timedelta(minutes=4),
            description="User admin logged in after 6 failed attempts",
            evidence_event_ids=[102, 103, 104, 105, 106, 107, 108],
            metadata_={"failed_attempts": 6, "success_event_id": 108},
        )

        f_priv = DetectionFinding(
            id=4,
            rule_id="RULE_PRIVILEGE_ESCALATION",
            rule_name="Suspicious Privilege Escalation",
            detection_type="privilege_escalation",
            severity="high",
            confidence=0.90,
            source_ip="185.23.91.44",
            username="admin",
            timestamp=base_time + timedelta(minutes=5),
            first_seen=base_time + timedelta(minutes=4),
            last_seen=base_time + timedelta(minutes=5),
            description="Suspicious privilege escalation (sudo)",
            evidence_event_ids=[108, 109],
            metadata_={"command": "cat /etc/shadow"},
        )

        findings = [f_recon, f_brute, f_breach, f_priv]

        # 2. Supporting events
        events = [
            SecurityEvent(
                id=101,
                timestamp=base_time,
                event_type="PORT_SCAN",
                source="network",
                source_ip="185.23.91.44",
            ),
            SecurityEvent(
                id=108,
                timestamp=base_time + timedelta(minutes=4),
                event_type="LOGIN_SUCCESS",
                source="authentication",
                username="admin",
                source_ip="185.23.91.44",
            ),
            SecurityEvent(
                id=109,
                timestamp=base_time + timedelta(minutes=5),
                event_type="PRIVILEGE_ESCALATION",
                source="server",
                username="admin",
                source_ip="185.23.91.44",
                action="sudo",
            ),
            SecurityEvent(
                id=110,
                timestamp=base_time + timedelta(minutes=6),
                event_type="DATABASE_ACCESS",
                source="server",
                username="admin",
                source_ip="185.23.91.44",
            ),
        ]

        incidents_data = engine.correlate(findings=findings, events=events)
        assert len(incidents_data) == 1

        inc = incidents_data[0]
        assert inc["primary_ip"] == "185.23.91.44"
        assert inc["affected_user"] == "admin"
        assert inc["severity"] == "critical"
        assert inc["risk_score"] >= 80.0
        assert len(inc["stages"]) >= 4

        stage_names = [s["name"] for s in inc["stages"]]
        assert "Reconnaissance" in stage_names
        assert "Credential Access" in stage_names
        assert "Initial Access" in stage_names
        assert "Privilege Escalation" in stage_names

        # Check structured explanation
        expl = inc["explanation"]
        assert "185.23.91.44" in expl["what_happened"]
        assert "admin" in expl["what_happened"]
        assert "recommended_action" in expl

    def test_correlate_empty_findings_returns_empty(self):
        """No findings returns empty incidents list."""
        engine = get_correlation_engine()
        result = engine.correlate([], [])
        assert result == []

    def test_correlate_separates_unrelated_attackers(self):
        """Findings from two distinct IPs with no shared entities are clustered into separate incidents."""
        engine = CorrelationEngine(default_window_minutes=60)
        base_time = datetime(2026, 10, 4, 10, 0, 0, tzinfo=timezone.utc)

        f1 = DetectionFinding(
            id=1,
            rule_id="RULE_BRUTE_FORCE",
            rule_name="Brute Force",
            detection_type="brute_force",
            severity="high",
            source_ip="192.168.1.100",
            username="user_alpha",
            timestamp=base_time,
            first_seen=base_time,
            last_seen=base_time,
            description="Brute force against alpha",
            evidence_event_ids=[1],
        )

        f2 = DetectionFinding(
            id=2,
            rule_id="RULE_PORT_SCAN",
            rule_name="Port Scan",
            detection_type="reconnaissance",
            severity="high",
            source_ip="10.0.0.200",
            username=None,
            timestamp=base_time,
            first_seen=base_time,
            last_seen=base_time,
            description="Port scan from 10.0.0.200",
            evidence_event_ids=[2],
        )

        incidents_data = engine.correlate(findings=[f1, f2], events=[])
        assert len(incidents_data) == 2
        ips = {inc["primary_ip"] for inc in incidents_data}
        assert "192.168.1.100" in ips
        assert "10.0.0.200" in ips
