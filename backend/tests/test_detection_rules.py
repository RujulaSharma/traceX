"""Unit tests for security detection rules.

Tests:
- BruteForceDetectionRule (threshold reached, below threshold, time window, multi-user/IP isolation)
- SuccessfulLoginAfterFailuresRule (success following failures, standalone success, time window)
"""

from datetime import datetime, timedelta, timezone

from app.detection.rules.brute_force import BruteForceDetectionRule
from app.detection.rules.successful_login_after_failures import (
    SuccessfulLoginAfterFailuresRule,
)
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
                timestamp=base_time + timedelta(minutes=i * 4),  # 0, 4, 8, 12, 16 mins
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
                source_ip=f"10.0.0.{i}",  # 5 distinct IPs, 1 attempt each
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
            # 3 failures at 08:00
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
            # Success 3 hours later at 11:00 (outside 10m window)
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
