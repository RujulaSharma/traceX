"""SQLAlchemy models for security incidents.

Defines the Incident table to persist correlated multi-stage
attack incidents, chronological timelines, and risk assessments.
"""

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
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.core.database import Base


class Incident(Base):
    """Represents a correlated security incident composed of multiple detection findings and events."""

    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    incident_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="open", index=True)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, default="high", index=True)
    risk_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.85)

    primary_ip: Mapped[str | None] = mapped_column(String(45), nullable=True, index=True)
    affected_user: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)

    first_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    last_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    summary: Mapped[str] = mapped_column(Text, nullable=False)
    attack_stage: Mapped[str] = mapped_column(String(100), nullable=False, default="Initial Access")

    # Structured metadata
    risk_factors: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    stages: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    explanation: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)

    # Correlated foreign keys
    finding_ids: Mapped[list[int]] = mapped_column(JSON, nullable=False, default=list)
    event_ids: Mapped[list[int]] = mapped_column(JSON, nullable=False, default=list)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        Index("ix_incidents_severity_status", "severity", "status"),
        Index("ix_incidents_ip_user", "primary_ip", "affected_user"),
        Index("ix_incidents_time", "first_seen", "last_seen"),
    )

    def __repr__(self) -> str:
        return (
            f"<Incident(number={self.incident_number}, title={self.title}, "
            f"severity={self.severity}, risk={self.risk_score})>"
        )
