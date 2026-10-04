"""SQLAlchemy models for security events.

Defines the core database tables: SecurityEvent, User, IPAddress.
These represent the normalized security data stored in PostgreSQL.
"""

import enum
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import (
    DateTime,
    Float,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.core.config import get_settings
from app.core.database import Base


def _json_type():
    """Return JSONB for PostgreSQL, JSON for SQLite."""
    settings = get_settings()
    if settings.is_sqlite:
        return JSON
    return JSONB


class SeverityLevel(str, enum.Enum):
    """Severity levels for security events."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    INFO = "info"


class EventType(str, enum.Enum):
    """Types of security events the system can process."""
    LOGIN_SUCCESS = "LOGIN_SUCCESS"
    LOGIN_FAILED = "LOGIN_FAILED"
    LOGOUT = "LOGOUT"
    PASSWORD_RESET = "PASSWORD_RESET"
    PRIVILEGE_ESCALATION = "PRIVILEGE_ESCALATION"
    FILE_ACCESS = "FILE_ACCESS"
    DATABASE_ACCESS = "DATABASE_ACCESS"
    PROCESS_EXECUTION = "PROCESS_EXECUTION"
    OUTBOUND_TRANSFER = "OUTBOUND_TRANSFER"
    PORT_SCAN = "PORT_SCAN"
    FIREWALL_BLOCK = "FIREWALL_BLOCK"
    VPN_LOGIN = "VPN_LOGIN"


class SecurityEvent(Base):
    """Core security event model.

    Represents a single normalized security event parsed from
    any supported log format (CSV, JSON, NDJSON).

    This is the most important table in TraceX. Every log
    entry, regardless of source format, is normalized into this
    structure for consistent analysis.
    """

    __tablename__ = "security_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    source: Mapped[str] = mapped_column(String(100), nullable=False)
    username: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    source_ip: Mapped[str | None] = mapped_column(String(45), nullable=True, index=True)  # 45 chars for IPv6
    destination_ip: Mapped[str | None] = mapped_column(String(45), nullable=True)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, default="info", index=True)
    action: Mapped[str | None] = mapped_column(String(100), nullable=True)
    metadata_: Mapped[dict[str, Any] | None] = mapped_column("metadata", JSON, nullable=True)
    raw_log: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Composite indexes for common query patterns
    __table_args__ = (
        Index("ix_events_user_time", "username", "timestamp"),
        Index("ix_events_ip_time", "source_ip", "timestamp"),
        Index("ix_events_type_severity", "event_type", "severity"),
    )

    def __repr__(self) -> str:
        return (
            f"<SecurityEvent(id={self.id}, type={self.event_type}, "
            f"user={self.username}, ip={self.source_ip}, "
            f"time={self.timestamp})>"
        )


class User(Base):
    """Known user accounts seen in security logs.

    Populated during log ingestion when new usernames are encountered.
    Used for tracking user-specific patterns in later phases.
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username={self.username})>"


class IPAddress(Base):
    """Known IP addresses seen in security logs.

    Tracks IP metadata and reputation. Updated during ingestion
    when new IPs are encountered. Risk scoring populated in later phases.
    """

    __tablename__ = "ip_addresses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ip_address: Mapped[str] = mapped_column(String(45), unique=True, nullable=False, index=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    reputation: Mapped[str | None] = mapped_column(String(50), nullable=True)
    first_seen: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_seen: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<IPAddress(id={self.id}, ip={self.ip_address}, risk={self.risk_score})>"
