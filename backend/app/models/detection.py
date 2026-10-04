"""SQLAlchemy models for security detection findings.

Defines the DetectionFinding table to persist structured
findings identified by the detection engine.
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


class DetectionFinding(Base):
    """Represents a suspicious activity detected by a detection rule.

    A finding correlates one or more underlying SecurityEvents into
    an actionable security alert with confidence, severity, and evidence.
    """

    __tablename__ = "detection_findings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    rule_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    rule_name: Mapped[str] = mapped_column(String(255), nullable=False)
    detection_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, default="medium", index=True)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.8)

    source_ip: Mapped[str | None] = mapped_column(String(45), nullable=True, index=True)
    username: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)

    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    first_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    last_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    description: Mapped[str] = mapped_column(Text, nullable=False)
    evidence_event_ids: Mapped[list[int]] = mapped_column(JSON, nullable=False, default=list)
    metadata_: Mapped[dict[str, Any] | None] = mapped_column("metadata", JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        Index("ix_findings_rule_time", "rule_id", "timestamp"),
        Index("ix_findings_ip_time", "source_ip", "timestamp"),
        Index("ix_findings_user_time", "username", "timestamp"),
        Index("ix_findings_type_severity", "detection_type", "severity"),
    )

    def __repr__(self) -> str:
        return (
            f"<DetectionFinding(id={self.id}, rule={self.rule_id}, "
            f"user={self.username}, ip={self.source_ip}, "
            f"severity={self.severity}, time={self.timestamp})>"
        )
