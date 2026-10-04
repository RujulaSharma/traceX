"""Tests for database operations.

Tests:
- Database connection
- Event insertion and retrieval
- Model field types and constraints
"""

from datetime import datetime, timezone

from app.models.event import SecurityEvent


class TestDatabaseConnection:
    """Test database connectivity and basic operations."""

    def test_session_connects(self, db_session):
        """Verify we can create and use a database session."""
        assert db_session is not None
        # Simple query should not raise
        result = db_session.execute(
            __import__("sqlalchemy").text("SELECT 1")
        )
        assert result.scalar() == 1

    def test_tables_created(self, db_session):
        """Verify all expected tables exist."""
        from sqlalchemy import inspect

        inspector = inspect(db_session.bind)
        tables = inspector.get_table_names()
        assert "security_events" in tables
        assert "users" in tables
        assert "ip_addresses" in tables


class TestEventInsertion:
    """Test inserting and retrieving SecurityEvent records."""

    def test_insert_single_event(self, db_session):
        """Insert one event and verify it's stored correctly."""
        event = SecurityEvent(
            timestamp=datetime(2026, 10, 4, 10, 32, 1, tzinfo=timezone.utc),
            event_type="LOGIN_FAILED",
            source="authentication",
            username="admin",
            source_ip="185.23.91.44",
            destination_ip=None,
            severity="medium",
            action="login",
            raw_log="test raw log line",
        )
        db_session.add(event)
        db_session.commit()

        # Retrieve
        stored = db_session.query(SecurityEvent).first()
        assert stored is not None
        assert stored.event_type == "LOGIN_FAILED"
        assert stored.username == "admin"
        assert stored.source_ip == "185.23.91.44"
        assert stored.severity == "medium"
        assert stored.raw_log == "test raw log line"

    def test_insert_multiple_events(self, db_session):
        """Insert multiple events and verify count."""
        events = [
            SecurityEvent(
                timestamp=datetime(2026, 10, 4, 8, i, 0, tzinfo=timezone.utc),
                event_type="LOGIN_SUCCESS",
                source="authentication",
                username=f"user{i}",
                source_ip=f"192.168.1.{i}",
                severity="info",
                action="login",
            )
            for i in range(1, 11)
        ]
        db_session.add_all(events)
        db_session.commit()

        count = db_session.query(SecurityEvent).count()
        assert count == 10

    def test_event_metadata_json(self, db_session):
        """Verify JSON metadata is stored and retrieved correctly."""
        metadata = {"process": "nginx", "pid": 1024, "cpu_percent": 2.5}
        event = SecurityEvent(
            timestamp=datetime(2026, 10, 4, 7, 0, 0, tzinfo=timezone.utc),
            event_type="PROCESS_EXECUTION",
            source="server",
            username="system",
            source_ip="10.0.0.5",
            severity="info",
            action="start",
            metadata_=metadata,
        )
        db_session.add(event)
        db_session.commit()

        stored = db_session.query(SecurityEvent).first()
        assert stored.metadata_ is not None
        assert stored.metadata_["process"] == "nginx"
        assert stored.metadata_["pid"] == 1024

    def test_event_created_at_auto(self, db_session):
        """Verify created_at is automatically set."""
        event = SecurityEvent(
            timestamp=datetime(2026, 10, 4, 7, 0, 0, tzinfo=timezone.utc),
            event_type="LOGIN_SUCCESS",
            source="authentication",
            username="testuser",
            severity="info",
        )
        db_session.add(event)
        db_session.commit()

        stored = db_session.query(SecurityEvent).first()
        assert stored.created_at is not None

    def test_query_by_event_type(self, db_session):
        """Test filtering events by type."""
        db_session.add_all([
            SecurityEvent(
                timestamp=datetime(2026, 10, 4, 8, 0, 0, tzinfo=timezone.utc),
                event_type="LOGIN_SUCCESS",
                source="authentication",
                severity="info",
            ),
            SecurityEvent(
                timestamp=datetime(2026, 10, 4, 8, 1, 0, tzinfo=timezone.utc),
                event_type="LOGIN_FAILED",
                source="authentication",
                severity="medium",
            ),
            SecurityEvent(
                timestamp=datetime(2026, 10, 4, 8, 2, 0, tzinfo=timezone.utc),
                event_type="LOGIN_FAILED",
                source="authentication",
                severity="medium",
            ),
        ])
        db_session.commit()

        failed = (
            db_session.query(SecurityEvent)
            .filter(SecurityEvent.event_type == "LOGIN_FAILED")
            .all()
        )
        assert len(failed) == 2

    def test_query_by_source_ip(self, db_session):
        """Test filtering events by source IP."""
        db_session.add_all([
            SecurityEvent(
                timestamp=datetime(2026, 10, 4, 8, 0, 0, tzinfo=timezone.utc),
                event_type="LOGIN_FAILED",
                source="authentication",
                source_ip="185.23.91.44",
                severity="medium",
            ),
            SecurityEvent(
                timestamp=datetime(2026, 10, 4, 8, 1, 0, tzinfo=timezone.utc),
                event_type="LOGIN_SUCCESS",
                source="authentication",
                source_ip="192.168.1.10",
                severity="info",
            ),
        ])
        db_session.commit()

        external = (
            db_session.query(SecurityEvent)
            .filter(SecurityEvent.source_ip == "185.23.91.44")
            .all()
        )
        assert len(external) == 1
        assert external[0].event_type == "LOGIN_FAILED"
