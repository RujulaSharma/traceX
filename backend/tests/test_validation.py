"""Tests for Pydantic validation schemas.

Tests:
- Valid event creation
- Missing required fields
- Invalid timestamps
- Invalid IP addresses
- Invalid severity levels
- Invalid event types
- Edge cases (empty strings, None values)
"""

import pytest
from pydantic import ValidationError

from app.schemas.event import EventCreate


class TestValidEvent:
    """Test that valid events pass validation."""

    def test_full_event(self):
        """All fields provided and valid."""
        event = EventCreate(
            timestamp="2026-10-04T10:32:01Z",
            event_type="LOGIN_FAILED",
            source="authentication",
            username="admin",
            source_ip="185.23.91.44",
            destination_ip="10.0.0.5",
            severity="medium",
            action="login",
            metadata={"attempt": 3},
        )
        assert event.event_type == "LOGIN_FAILED"
        assert event.source == "authentication"
        assert event.username == "admin"
        assert event.source_ip == "185.23.91.44"
        assert event.severity == "medium"

    def test_minimal_event(self):
        """Only required fields provided."""
        event = EventCreate(
            timestamp="2026-10-04T10:32:01Z",
            event_type="LOGIN_SUCCESS",
            source="authentication",
        )
        assert event.username is None
        assert event.source_ip is None
        assert event.destination_ip is None
        assert event.severity == "info"  # default

    def test_all_event_types(self):
        """Every supported event type should validate."""
        valid_types = [
            "LOGIN_SUCCESS", "LOGIN_FAILED", "LOGOUT",
            "PASSWORD_RESET", "PRIVILEGE_ESCALATION",
            "FILE_ACCESS", "DATABASE_ACCESS",
            "PROCESS_EXECUTION", "OUTBOUND_TRANSFER",
            "PORT_SCAN", "FIREWALL_BLOCK", "VPN_LOGIN",
        ]
        for event_type in valid_types:
            event = EventCreate(
                timestamp="2026-10-04T10:00:00Z",
                event_type=event_type,
                source="test",
            )
            assert event.event_type == event_type

    def test_ipv6_address(self):
        """IPv6 addresses should be accepted."""
        event = EventCreate(
            timestamp="2026-10-04T10:00:00Z",
            event_type="LOGIN_SUCCESS",
            source="authentication",
            source_ip="2001:0db8:85a3:0000:0000:8a2e:0370:7334",
        )
        assert event.source_ip == "2001:0db8:85a3:0000:0000:8a2e:0370:7334"

    def test_lowercase_event_type(self):
        """Event types should be normalized to uppercase."""
        event = EventCreate(
            timestamp="2026-10-04T10:00:00Z",
            event_type="login_failed",
            source="test",
        )
        assert event.event_type == "LOGIN_FAILED"


class TestMissingRequiredFields:
    """Test validation errors for missing required fields."""

    def test_missing_timestamp(self):
        """Timestamp is required."""
        with pytest.raises(ValidationError) as exc_info:
            EventCreate(
                event_type="LOGIN_FAILED",
                source="authentication",
            )
        errors = exc_info.value.errors()
        assert any(e["loc"] == ("timestamp",) for e in errors)

    def test_missing_event_type(self):
        """Event type is required."""
        with pytest.raises(ValidationError) as exc_info:
            EventCreate(
                timestamp="2026-10-04T10:00:00Z",
                source="authentication",
            )
        errors = exc_info.value.errors()
        assert any(e["loc"] == ("event_type",) for e in errors)

    def test_missing_source(self):
        """Source is required."""
        with pytest.raises(ValidationError) as exc_info:
            EventCreate(
                timestamp="2026-10-04T10:00:00Z",
                event_type="LOGIN_FAILED",
            )
        errors = exc_info.value.errors()
        assert any(e["loc"] == ("source",) for e in errors)


class TestInvalidTimestamp:
    """Test timestamp validation with invalid inputs."""

    def test_garbage_string(self):
        """Random string should fail."""
        with pytest.raises(ValidationError):
            EventCreate(
                timestamp="not-a-date",
                event_type="LOGIN_FAILED",
                source="test",
            )

    def test_empty_string(self):
        """Empty string should fail."""
        with pytest.raises(ValidationError):
            EventCreate(
                timestamp="",
                event_type="LOGIN_FAILED",
                source="test",
            )

    def test_partial_date(self):
        """Incomplete date should fail."""
        with pytest.raises(ValidationError):
            EventCreate(
                timestamp="2026-10",
                event_type="LOGIN_FAILED",
                source="test",
            )


class TestInvalidIP:
    """Test IP address validation."""

    def test_invalid_ipv4(self):
        """Malformed IPv4 should fail."""
        with pytest.raises(ValidationError):
            EventCreate(
                timestamp="2026-10-04T10:00:00Z",
                event_type="LOGIN_FAILED",
                source="test",
                source_ip="999.999.999.999",
            )

    def test_random_string_ip(self):
        """Non-IP string should fail."""
        with pytest.raises(ValidationError):
            EventCreate(
                timestamp="2026-10-04T10:00:00Z",
                event_type="LOGIN_FAILED",
                source="test",
                source_ip="not-an-ip",
            )

    def test_empty_ip_becomes_none(self):
        """Empty string IP should normalize to None."""
        event = EventCreate(
            timestamp="2026-10-04T10:00:00Z",
            event_type="LOGIN_FAILED",
            source="test",
            source_ip="",
        )
        assert event.source_ip is None

    def test_none_ip_is_valid(self):
        """None IP is acceptable (optional field)."""
        event = EventCreate(
            timestamp="2026-10-04T10:00:00Z",
            event_type="LOGIN_FAILED",
            source="test",
            source_ip=None,
        )
        assert event.source_ip is None


class TestInvalidSeverity:
    """Test severity validation."""

    def test_invalid_severity(self):
        """Unknown severity should fail."""
        with pytest.raises(ValidationError):
            EventCreate(
                timestamp="2026-10-04T10:00:00Z",
                event_type="LOGIN_FAILED",
                source="test",
                severity="extreme",
            )

    def test_severity_case_insensitive(self):
        """Severity should be normalized to lowercase."""
        event = EventCreate(
            timestamp="2026-10-04T10:00:00Z",
            event_type="LOGIN_FAILED",
            source="test",
            severity="HIGH",
        )
        assert event.severity == "high"

    def test_all_valid_severities(self):
        """All defined severities should pass."""
        for sev in ("info", "low", "medium", "high", "critical"):
            event = EventCreate(
                timestamp="2026-10-04T10:00:00Z",
                event_type="LOGIN_FAILED",
                source="test",
                severity=sev,
            )
            assert event.severity == sev


class TestInvalidEventType:
    """Test event type validation."""

    def test_unknown_event_type(self):
        """Unrecognized event type should fail."""
        with pytest.raises(ValidationError):
            EventCreate(
                timestamp="2026-10-04T10:00:00Z",
                event_type="UNKNOWN_EVENT",
                source="test",
            )

    def test_empty_event_type(self):
        """Empty event type should fail."""
        with pytest.raises(ValidationError):
            EventCreate(
                timestamp="2026-10-04T10:00:00Z",
                event_type="",
                source="test",
            )


class TestTimestampNormalization:
    """Test that timestamps are normalized to UTC."""

    def test_utc_preserved(self):
        """UTC timestamps remain UTC."""
        event = EventCreate(
            timestamp="2026-10-04T10:32:01Z",
            event_type="LOGIN_FAILED",
            source="test",
        )
        assert event.timestamp.tzname() == "UTC"

    def test_naive_becomes_utc(self):
        """Timestamps without timezone are assumed UTC."""
        event = EventCreate(
            timestamp="2026-10-04 10:32:01",
            event_type="LOGIN_FAILED",
            source="test",
        )
        assert event.timestamp.tzname() == "UTC"

    def test_offset_converted_to_utc(self):
        """Timestamps with offset are converted to UTC."""
        event = EventCreate(
            timestamp="2026-10-04T15:32:01+05:00",
            event_type="LOGIN_FAILED",
            source="test",
        )
        assert event.timestamp.tzname() == "UTC"
        assert event.timestamp.hour == 10  # 15:00 IST = 10:00 UTC (approximately)
