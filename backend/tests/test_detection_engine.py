"""Comprehensive tests for DetectionEngine orchestration.

Tests:
- Empty events handling
- Rule subset execution
- Time-range and entity query filtering
- Non-persisted dry runs
- Multi-rule attack simulation
- Rule error fault tolerance
"""

from datetime import datetime, timedelta, timezone

from app.detection.base import BaseDetectionRule
from app.detection.engine import DetectionEngine, get_detection_engine
from app.models.detection import DetectionFinding
from app.models.event import SecurityEvent
from app.schemas.detection import DetectionFindingCreate, DetectionRunRequest


class FaultyRule(BaseDetectionRule):
    """Test rule that raises an exception to verify engine fault tolerance."""

    rule_id = "RULE_FAULTY"
    rule_name = "Faulty Test Rule"
    detection_type = "test"

    def detect(self, events: list[SecurityEvent]) -> list[DetectionFindingCreate]:
        raise RuntimeError("Simulated rule exception")


class TestDetectionEngineOrchestration:
    """Test engine mechanics and execution isolation."""

    def test_engine_empty_events_returns_empty(self):
        """Empty events list produces 0 findings."""
        engine = get_detection_engine()
        findings = engine.run([])
        assert findings == []

    def test_engine_executes_specific_rule_subset(self):
        """Filtering by rule_ids runs only requested rules."""
        engine = get_detection_engine()
        base_time = datetime(2026, 10, 4, 10, 0, 0, tzinfo=timezone.utc)

        events = [
            SecurityEvent(
                id=i + 1,
                timestamp=base_time + timedelta(seconds=i * 10),
                event_type="LOGIN_FAILED",
                source="authentication",
                username="admin",
                source_ip="192.168.1.50",
            )
            for i in range(5)
        ]

        # Run only PORT_SCAN rule (should return 0 because events are auth)
        findings = engine.run(events, rule_ids=["RULE_PORT_SCAN"])
        assert len(findings) == 0

        # Run BRUTE_FORCE rule (should return 1)
        findings_bf = engine.run(events, rule_ids=["RULE_BRUTE_FORCE"])
        assert len(findings_bf) == 1
        assert findings_bf[0].rule_id == "RULE_BRUTE_FORCE"

    def test_engine_fault_tolerance(self):
        """Exception in one rule does not prevent other rules from completing."""
        engine = DetectionEngine()
        engine.register_rule(FaultyRule())

        from app.detection.rules.brute_force import BruteForceDetectionRule
        engine.register_rule(BruteForceDetectionRule(threshold=5, window_minutes=5))

        base_time = datetime(2026, 10, 4, 10, 0, 0, tzinfo=timezone.utc)
        events = [
            SecurityEvent(
                id=i + 1,
                timestamp=base_time + timedelta(seconds=i * 10),
                event_type="LOGIN_FAILED",
                source="authentication",
                username="admin",
                source_ip="192.168.1.50",
            )
            for i in range(5)
        ]

        # Engine should log error for FaultyRule and continue to produce brute force finding
        findings = engine.run(events)
        assert len(findings) == 1
        assert findings[0].rule_id == "RULE_BRUTE_FORCE"

    def test_run_on_database_with_time_range_filter(self, db_session):
        """Database run with time range respects start_time and end_time."""
        engine = get_detection_engine()
        t0 = datetime(2026, 10, 4, 8, 0, 0, tzinfo=timezone.utc)

        # 5 events at 08:00
        for i in range(5):
            db_session.add(
                SecurityEvent(
                    timestamp=t0 + timedelta(seconds=i * 10),
                    event_type="LOGIN_FAILED",
                    source="authentication",
                    username="user1",
                    source_ip="10.0.0.1",
                )
            )

        # 5 events at 12:00
        t1 = datetime(2026, 10, 4, 12, 0, 0, tzinfo=timezone.utc)
        for i in range(5):
            db_session.add(
                SecurityEvent(
                    timestamp=t1 + timedelta(seconds=i * 10),
                    event_type="LOGIN_FAILED",
                    source="authentication",
                    username="user2",
                    source_ip="10.0.0.2",
                )
            )
        db_session.commit()

        # Run for only 08:00 window
        req = DetectionRunRequest(
            start_time=t0,
            end_time=t0 + timedelta(minutes=10),
            persist_findings=False,
        )
        res = engine.run_on_database(db=db_session, request=req)
        assert res.events_analyzed == 5
        assert res.findings_generated == 1
        assert res.findings[0].username == "user1"

    def test_run_on_database_dry_run_does_not_persist(self, db_session):
        """When persist_findings is False, findings are not saved to the database."""
        engine = get_detection_engine()
        t0 = datetime(2026, 10, 4, 8, 0, 0, tzinfo=timezone.utc)

        for i in range(5):
            db_session.add(
                SecurityEvent(
                    timestamp=t0 + timedelta(seconds=i * 10),
                    event_type="LOGIN_FAILED",
                    source="authentication",
                    username="testuser",
                    source_ip="10.0.0.99",
                )
            )
        db_session.commit()

        req = DetectionRunRequest(persist_findings=False)
        res = engine.run_on_database(db=db_session, request=req)
        assert res.findings_generated == 1
        assert res.findings_stored == 0

        # Verify DB is empty of findings
        count = db_session.query(DetectionFinding).count()
        assert count == 0

    def test_multi_rule_scenario(self):
        """Complex scenario triggers multiple independent rules."""
        engine = get_detection_engine()
        base_time = datetime(2026, 10, 4, 6, 0, 0, tzinfo=timezone.utc)

        events = [
            # Port scan
            SecurityEvent(
                id=1,
                timestamp=base_time,
                event_type="PORT_SCAN",
                source="network",
                source_ip="198.51.100.23",
                action="scan",
                metadata_={"ports_scanned": [22, 80, 443, 3306, 5432]},
            ),
            # Brute force login
            SecurityEvent(
                id=2,
                timestamp=base_time + timedelta(minutes=10),
                event_type="LOGIN_FAILED",
                source="authentication",
                username="admin",
                source_ip="185.23.91.44",
            ),
            SecurityEvent(
                id=3,
                timestamp=base_time + timedelta(minutes=11),
                event_type="LOGIN_FAILED",
                source="authentication",
                username="admin",
                source_ip="185.23.91.44",
            ),
            SecurityEvent(
                id=4,
                timestamp=base_time + timedelta(minutes=12),
                event_type="LOGIN_FAILED",
                source="authentication",
                username="admin",
                source_ip="185.23.91.44",
            ),
            # Successful login after failure
            SecurityEvent(
                id=5,
                timestamp=base_time + timedelta(minutes=13),
                event_type="LOGIN_SUCCESS",
                source="authentication",
                username="admin",
                source_ip="185.23.91.44",
            ),
            # Privilege escalation
            SecurityEvent(
                id=6,
                timestamp=base_time + timedelta(minutes=14),
                event_type="PRIVILEGE_ESCALATION",
                source="server",
                username="admin",
                source_ip="185.23.91.44",
                action="sudo",
                metadata_={"command": "cat /etc/shadow"},
            ),
        ]

        findings = engine.run(events)
        rule_ids = {f.rule_id for f in findings}

        assert "RULE_PORT_SCAN" in rule_ids
        assert "RULE_SUCCESS_AFTER_BRUTE_FORCE" in rule_ids
        assert "RULE_PRIVILEGE_ESCALATION" in rule_ids
