"""Pydantic schemas for security event validation and serialization.

These schemas define the contract for:
- Incoming log data validation (EventCreate)
- API response formatting (EventResponse, IngestionResponse)
- Internal normalization rules

Every log record passes through EventCreate validation before
being stored, ensuring data consistency regardless of source format.
"""

import ipaddress
from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

# Valid event types the system recognizes
VALID_EVENT_TYPES = {
    "LOGIN_SUCCESS",
    "LOGIN_FAILED",
    "LOGOUT",
    "PASSWORD_RESET",
    "PRIVILEGE_ESCALATION",
    "FILE_ACCESS",
    "DATABASE_ACCESS",
    "PROCESS_EXECUTION",
    "OUTBOUND_TRANSFER",
    "PORT_SCAN",
    "FIREWALL_BLOCK",
    "VPN_LOGIN",
}

# Valid severity levels
VALID_SEVERITIES = {"info", "low", "medium", "high", "critical"}


class EventCreate(BaseModel):
    """Schema for validating incoming security events.

    This is the core validation gate. Every record parsed from
    CSV/JSON/NDJSON must pass through this schema before storage.

    Validation includes:
    - Timestamp parsing and UTC normalization
    - Event type checking against known types
    - IP address format validation (IPv4/IPv6)
    - Severity level normalization
    """

    timestamp: datetime
    event_type: str
    source: str
    username: str | None = None
    source_ip: str | None = None
    destination_ip: str | None = None
    severity: str = "info"
    action: str | None = None
    metadata: dict[str, Any] | None = None
    raw_log: str | None = None

    @field_validator("timestamp", mode="before")
    @classmethod
    def parse_timestamp(cls, v: Any) -> datetime:
        """Parse timestamp from various string formats and normalize to UTC.

        Supports ISO 8601 format. If no timezone info is provided,
        assumes UTC. All timestamps are converted to UTC for consistent
        storage and querying.
        """
        if isinstance(v, datetime):
            if v.tzinfo is None:
                return v.replace(tzinfo=timezone.utc)
            return v.astimezone(timezone.utc)

        if isinstance(v, str):
            # Try ISO format parsing
            try:
                dt = datetime.fromisoformat(v.replace("Z", "+00:00"))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt.astimezone(timezone.utc)
            except ValueError:
                pass

            # Try common formats
            for fmt in (
                "%Y-%m-%d %H:%M:%S",
                "%Y-%m-%d %H:%M:%S.%f",
                "%d/%m/%Y %H:%M:%S",
                "%m/%d/%Y %H:%M:%S",
            ):
                try:
                    dt = datetime.strptime(v, fmt)
                    return dt.replace(tzinfo=timezone.utc)
                except ValueError:
                    continue

            raise ValueError(
                f"Unable to parse timestamp: '{v}'. "
                "Expected ISO 8601 format (e.g., 2026-10-04T10:32:01Z)"
            )

        raise ValueError(f"Timestamp must be a string or datetime, got {type(v)}")

    @field_validator("event_type", mode="before")
    @classmethod
    def validate_event_type(cls, v: str) -> str:
        """Normalize and validate event type."""
        normalized = v.strip().upper()
        if normalized not in VALID_EVENT_TYPES:
            raise ValueError(
                f"Unknown event type: '{v}'. "
                f"Valid types: {', '.join(sorted(VALID_EVENT_TYPES))}"
            )
        return normalized

    @field_validator("source_ip", "destination_ip", mode="before")
    @classmethod
    def validate_ip_address(cls, v: Any) -> str | None:
        """Validate IPv4 or IPv6 address format."""
        if v is None or v == "" or (isinstance(v, float) and str(v) == "nan"):
            return None
        val = str(v).strip()
        if not val:
            return None
        try:
            ipaddress.ip_address(val)
            return val
        except ValueError:
            raise ValueError(
                f"Invalid IP address: '{val}'. Expected IPv4 or IPv6 format."
            )

    @field_validator("severity", mode="before")
    @classmethod
    def validate_severity(cls, v: str) -> str:
        """Normalize severity to lowercase and validate."""
        if v is None:
            return "info"
        normalized = str(v).strip().lower()
        if normalized not in VALID_SEVERITIES:
            raise ValueError(
                f"Invalid severity: '{v}'. "
                f"Valid levels: {', '.join(sorted(VALID_SEVERITIES))}"
            )
        return normalized

    @field_validator("username", mode="before")
    @classmethod
    def clean_username(cls, v: Any) -> str | None:
        """Clean and validate username."""
        if v is None or v == "" or (isinstance(v, float) and str(v) == "nan"):
            return None
        return str(v).strip()

    @field_validator("source", mode="before")
    @classmethod
    def clean_source(cls, v: str) -> str:
        """Ensure source is not empty."""
        if not v or not str(v).strip():
            raise ValueError("Source field cannot be empty")
        return str(v).strip().lower()

    @field_validator("action", mode="before")
    @classmethod
    def clean_action(cls, v: Any) -> str | None:
        """Clean action field."""
        if v is None or v == "" or (isinstance(v, float) and str(v) == "nan"):
            return None
        return str(v).strip().lower()


class EventResponse(BaseModel):
    """Schema for returning a security event via API."""

    id: int
    timestamp: datetime
    event_type: str
    source: str
    username: str | None = None
    source_ip: str | None = None
    destination_ip: str | None = None
    severity: str
    action: str | None = None
    metadata: dict[str, Any] | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RejectedRecord(BaseModel):
    """Details about a record that failed validation."""

    line: int
    error: str


class IngestionResponse(BaseModel):
    """Response returned after log ingestion."""

    success: bool
    total_records: int
    successful_records: int
    failed_records: int
    format: str
    message: str
    rejected: list[RejectedRecord] = Field(default_factory=list)


class HealthResponse(BaseModel):
    """Response for the health check endpoint."""

    status: str
    app_name: str
    version: str
    environment: str
    database: dict
