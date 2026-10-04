"""Unit tests for security detection rules.

Tests:
- BruteForceDetectionRule (threshold reached, below threshold, time window, multi-user/IP isolation)
- SuccessfulLoginAfterFailuresRule (success following failures, standalone success, time window)
- PortScanDetectionRule (event count threshold, port list metadata, window boundaries)
- PrivilegeEscalationRule (sudo after login, standalone escalation, event sequencing)
- SuspiciousLoginRule (multi-IP logins within window, single IP normal)
"""

from datetime import datetime, timedelta, timezone

from app.detection.rules.brute_force import BruteForceDetectionRule
from app.detection.rules.port_scan import PortScanDetectionRule
from app.detection.rules.privilege_escalation import PrivilegeEscalationRule
from app.detection.rules.successful_login_after_failures import (
    SuccessfulLoginAfterFailuresRule,
)
from app.detection.rules.suspicious_login import SuspiciousLoginRule
from app.models.event import SecurityEvent


class TestBruteForceDetectionRule:
    """Test brute force login detection logic."""

    def test_brute_force_triggers_when_threshold_reached(self):
        """5 failed logins in 2 minutes should trigger brute force finding."""
        rule = BruteForceDetectionRule(threshold=5, window_minutes=5)
        base_time = datetime(2026, 10, 4, 10, 0, 0, tzinfo=timezone.utc)

        events = [
            SecurityEvent(
                id=i + 1,
                timestamp=base_time + timedelta(seconds=i * 20),
                event_type="LOGIN_FAILED",
                source="authentication",
                username="admin",
                source_ip="192.168.1.50",
                severity="medium",
                action="login",
            )
            for i in range(5)
        ]

        findings = rule.detect(events)
        assert len(findings) == 1
        f = findings[0]
        assert f.rule_id == "RULE_BRUTE_FORCE"
        assert f.username == "admin"
        assert f.source_ip == "192.168.1.50"
        assert f.severity == "high"
        assert f.evidence_event_ids == [1, 2, 3, 4, 5]
        assert f.metadata["failed_attempts"] == 5

    def test_brute_force_below_threshold_no_detection(self):
        """4 failed logins with threshold 5 should produce 0 findings."""
        rule = BruteForceDetectionRule(threshold=5, window_minutes=5)
        base_time = datetime(2026, 10, 4, 10, 0, 0, tzinfo=timezone.utc)

        events = [
            SecurityEvent(
                id=i + 1,
                timestamp=base_time + timedelta(seconds=i * 20),
                event_type="LOGIN_FAILED",
                source="authentication",
                username="admin",
                source_ip="192.168.1.50",
            )
            for i in range(4)
        ]

        findings = rule.detect(events)
        assert len(findings) == 0

    def test_brute_force_outside_window_no_detection(self):
        """5 failed logins spread over 20 minutes (window 5m) should not trigger."""
        rule = BruteForceDetectionRule(threshold=5, window_minutes=5)
        base_time = datetime(2026, 10, 4, 10, 0, 0, tzinfo=timezone.utc)

        events = [
            SecurityEvent(
                id=i + 1,
                timestamp=base_time + timedelta(minutes=i * 4),
                event_type="LOGIN_FAILED",
                source="authentication",
                username="admin",
                source_ip="192.168.1.50",
            )
            for i in range(5)
        ]

        findings = rule.detect(events)
        assert len(findings) == 0

    def test_brute_force_isolates_different_users(self):
        """Failures across different users should not be grouped together."""
        rule = BruteForceDetectionRule(threshold=5, window_minutes=5)
        base_time = datetime(2026, 10, 4, 10, 0, 0, tzinfo=timezone.utc)

        events = [
            SecurityEvent(
                id=1,
                timestamp=base_time,
                event_type="LOGIN_FAILED",
                source="authentication",
                username="user_a",
                source_ip="192.168.1.50",
            ),
            SecurityEvent(
                id=2,
                timestamp=base_time + timedelta(seconds=10),
                event_type="LOGIN_FAILED",
                source="authentication",
                username="user_b",
                source_ip="192.168.1.50",
            ),
            SecurityEvent(
                id=3,
                timestamp=base_time + timedelta(seconds=20),
                event_type="LOGIN_FAILED",
                source="authentication",
                username="user_c",
                source_ip="192.168.1.50",
            ),
        ]

        findings = rule.detect(events)
        assert len(findings) == 0

    def test_brute_force_isolates_different_ips(self):
        """Failures against the same user from different IPs are tracked separately."""
        rule = BruteForceDetectionRule(threshold=5, window_minutes=5)
        base_time = datetime(2026, 10, 4, 10, 0, 0, tzinfo=timezone.utc)

        events = [
            SecurityEvent(
                id=i + 1,
                timestamp=base_time + timedelta(seconds=i * 5),
                event_type="LOGIN_FAILED",
                source="authentication",
                username="admin",
                source_ip=f"10.0.0.{i}",
            )
            for i in range(5)
        ]

        findings = rule.detect(events)
        assert len(findings) == 0


class TestSuccessfulLoginAfterFailuresRule:
    """Test successful login after failures detection rule."""

    def test_detects_login_after_repeated_failures(self):
        """3 failures followed by success should trigger finding with all evidence."""
        rule = SuccessfulLoginAfterFailuresRule(failure_threshold=3, window_minutes=10)
        base_time = datetime(2026, 10, 4, 10, 0, 0, tzinfo=timezone.utc)

        events = [
            SecurityEvent(
                id=1,
                timestamp=base_time,
                event_type="LOGIN_FAILED",
                source="authentication",
                username="admin",
                source_ip="185.23.91.44",
            ),
            SecurityEvent(
                id=2,
                timestamp=base_time + timedelta(seconds=30),
                event_type="LOGIN_FAILED",
                source="authentication",
                username="admin",
                source_ip="185.23.91.44",
            ),
            SecurityEvent(
                id=3,
                timestamp=base_time + timedelta(seconds=60),
                event_type="LOGIN_FAILED",
                source="authentication",
                username="admin",
                source_ip="185.23.91.44",
            ),
            SecurityEvent(
                id=4,
                timestamp=base_time + timedelta(seconds=90),
                event_type="LOGIN_SUCCESS",
                source="authentication",
                username="admin",
                source_ip="185.23.91.44",
            ),
        ]

        findings = rule.detect(events)
        assert len(findings) == 1
        f = findings[0]
        assert f.rule_id == "RULE_SUCCESS_AFTER_BRUTE_FORCE"
        assert f.severity == "critical"
        assert f.username == "admin"
        assert f.evidence_event_ids == [1, 2, 3, 4]
        assert f.metadata["failed_attempts"] == 3
        assert f.metadata["success_event_id"] == 4

    def test_standalone_success_no_detection(self):
        """LOGIN_SUCCESS without preceding failures does not trigger alert."""
        rule = SuccessfulLoginAfterFailuresRule(failure_threshold=3, window_minutes=10)
        events = [
            SecurityEvent(
                id=1,
                timestamp=datetime(2026, 10, 4, 10, 0, 0, tzinfo=timezone.utc),
                event_type="LOGIN_SUCCESS",
                source="authentication",
                username="jsmith",
                source_ip="192.168.1.10",
            )
        ]
        findings = rule.detect(events)
        assert len(findings) == 0

    def test_failures_outside_window_no_detection(self):
        """Failures that occurred outside the lookback window are not counted."""
        rule = SuccessfulLoginAfterFailuresRule(failure_threshold=3, window_minutes=10)
        base_time = datetime(2026, 10, 4, 8, 0, 0, tzinfo=timezone.utc)

        events = [
            SecurityEvent(
                id=1,
                timestamp=base_time,
                event_type="LOGIN_FAILED",
                source="authentication",
                username="admin",
                source_ip="185.23.91.44",
            ),
            SecurityEvent(
                id=2,
                timestamp=base_time + timedelta(seconds=10),
                event_type="LOGIN_FAILED",
                source="authentication",
                username="admin",
                source_ip="185.23.91.44",
            ),
            SecurityEvent(
                id=3,
                timestamp=base_time + timedelta(seconds=20),
                event_type="LOGIN_FAILED",
                source="authentication",
                username="admin",
                source_ip="185.23.91.44",
            ),
            SecurityEvent(
                id=4,
                timestamp=base_time + timedelta(hours=3),
                event_type="LOGIN_SUCCESS",
                source="authentication",
                username="admin",
                source_ip="185.23.91.44",
            ),
        ]

        findings = rule.detect(events)
        assert len(findings) == 0


class TestPortScanDetectionRule:
    """Test port scan and reconnaissance detection logic."""

    def test_port_scan_event_list_triggers_detection(self):
        """PORT_SCAN event containing ports list >= 5 triggers detection."""
        rule = PortScanDetectionRule(threshold=5, window_minutes=5)
        event = SecurityEvent(
            id=10,
            timestamp=datetime(2026, 10, 4, 12, 0, 0, tzinfo=timezone.utc),
            event_type="PORT_SCAN",
            source="network",
            source_ip="198.51.100.23",
            destination_ip="10.0.0.5",
            severity="high",
            action="scan",
            metadata_={"ports_scanned": [22, 80, 443, 3306, 5432]},
        )

        findings = rule.detect([event])
        assert len(findings) == 1
        f = findings[0]
        assert f.rule_id == "RULE_PORT_SCAN"
        assert f.source_ip == "198.51.100.23"
        assert f.metadata["probe_count"] == 5
        assert len(f.metadata["unique_ports"]) == 5

    def test_repeated_firewall_blocks_trigger_reconnaissance(self):
        """5 individual block events from the same IP trigger port scan finding."""
        rule = PortScanDetectionRule(threshold=5, window_minutes=5)
        base_time = datetime(2026, 10, 4, 12, 0, 0, tzinfo=timezone.utc)

        events = [
            SecurityEvent(
                id=i + 1,
                timestamp=base_time + timedelta(seconds=i * 10),
                event_type="FIREWALL_BLOCK",
                source="network",
                source_ip="203.0.113.50",
                destination_ip="10.0.0.5",
                action="block",
                metadata_={"port": 1000 + i},
            )
            for i in range(5)
        ]

        findings = rule.detect(events)
        assert len(findings) == 1
        assert findings[0].evidence_event_ids == [1, 2, 3, 4, 5]

    def test_reconnaissance_below_threshold_no_detection(self):
        """3 probes with threshold 5 should not trigger."""
        rule = PortScanDetectionRule(threshold=5, window_minutes=5)
        base_time = datetime(2026, 10, 4, 12, 0, 0, tzinfo=timezone.utc)

        events = [
            SecurityEvent(
                id=i + 1,
                timestamp=base_time + timedelta(seconds=i * 10),
                event_type="FIREWALL_BLOCK",
                source="network",
                source_ip="203.0.113.50",
            )
            for i in range(3)
        ]

        findings = rule.detect(events)
        assert len(findings) == 0


class TestPrivilegeEscalationRule:
    """Test privilege escalation detection rule."""

    def test_sudo_execution_following_login(self):
        """Sudo execution 5 minutes after login triggers finding."""
        rule = PrivilegeEscalationRule(window_minutes=15)
        base_time = datetime(2026, 10, 4, 14, 0, 0, tzinfo=timezone.utc)

        login_ev = SecurityEvent(
            id=1,
            timestamp=base_time,
            event_type="LOGIN_SUCCESS",
            source="authentication",
            username="mjohnson",
            source_ip="192.168.1.15",
        )
        priv_ev = SecurityEvent(
            id=2,
            timestamp=base_time + timedelta(minutes=5),
            event_type="PRIVILEGE_ESCALATION",
            source="server",
            username="mjohnson",
            source_ip="192.168.1.15",
            action="sudo",
            metadata_={"command": "apt update"},
        )

        findings = rule.detect([login_ev, priv_ev])
        assert len(findings) == 1
        f = findings[0]
        assert f.rule_id == "RULE_PRIVILEGE_ESCALATION"
        assert f.username == "mjohnson"
        assert f.evidence_event_ids == [1, 2]
        assert f.metadata["command"] == "apt update"

    def test_unrelated_server_event_no_detection(self):
        """Standard process execution does not trigger privilege escalation."""
        rule = PrivilegeEscalationRule(window_minutes=15)
        event = SecurityEvent(
            id=1,
            timestamp=datetime(2026, 10, 4, 14, 0, 0, tzinfo=timezone.utc),
            event_type="PROCESS_EXECUTION",
            source="server",
            username="system",
            action="cron",
        )
        findings = rule.detect([event])
        assert len(findings) == 0


class TestSuspiciousLoginRule:
    """Test suspicious multi-IP login detection rule."""

    def test_multi_ip_login_triggers_detection(self):
        """User logging in from 2 distinct IPs in 24 hours triggers finding."""
        rule = SuspiciousLoginRule(ip_threshold=2, window_hours=24)
        base_time = datetime(2026, 10, 4, 8, 0, 0, tzinfo=timezone.utc)

        events = [
            SecurityEvent(
                id=1,
                timestamp=base_time,
                event_type="LOGIN_SUCCESS",
                source="authentication",
                username="agarcia",
                source_ip="192.168.1.22",
            ),
            SecurityEvent(
                id=2,
                timestamp=base_time + timedelta(hours=2),
                event_type="LOGIN_SUCCESS",
                source="authentication",
                username="agarcia",
                source_ip="203.0.113.88",
            ),
        ]

        findings = rule.detect(events)
        assert len(findings) == 1
        f = findings[0]
        assert f.rule_id == "RULE_SUSPICIOUS_LOGIN"
        assert f.username == "agarcia"
        assert f.metadata["ip_count"] == 2
        assert "192.168.1.22" in f.metadata["distinct_ips"]
        assert "203.0.113.88" in f.metadata["distinct_ips"]

    def test_single_ip_repeated_logins_normal(self):
        """Multiple logins from the exact same IP should not trigger multi-IP alert."""
        rule = SuspiciousLoginRule(ip_threshold=2, window_hours=24)
        base_time = datetime(2026, 10, 4, 8, 0, 0, tzinfo=timezone.utc)

        events = [
            SecurityEvent(
                id=1,
                timestamp=base_time,
                event_type="LOGIN_SUCCESS",
                source="authentication",
                username="agarcia",
                source_ip="192.168.1.22",
            ),
            SecurityEvent(
                id=2,
                timestamp=base_time + timedelta(hours=1),
                event_type="LOGIN_SUCCESS",
                source="authentication",
                username="agarcia",
                source_ip="192.168.1.22",
            ),
        ]

        findings = rule.detect(events)
        assert len(findings) == 0
