"""API integration tests for Detection Engine endpoints.

Tests:
- POST /api/detections/run with real database events
- GET /api/detections with filtering (rule_id, severity, username, source_ip)
- GET /api/detections/{id}
- GET /api/detections/rules
"""

from datetime import datetime, timedelta, timezone

from app.models.event import SecurityEvent


class TestDetectionAPI:
    """Test detection engine REST API endpoints."""

    def test_list_rules_endpoint(self, client):
        """GET /api/detections/rules returns metadata for all 5 rules."""
        response = client.get("/api/detections/rules")
        assert response.status_code == 200
        rules = response.json()
        assert len(rules) == 5
        rule_ids = [r["rule_id"] for r in rules]
        assert "RULE_BRUTE_FORCE" in rule_ids
        assert "RULE_SUCCESS_AFTER_BRUTE_FORCE" in rule_ids
        assert "RULE_PORT_SCAN" in rule_ids
        assert "RULE_PRIVILEGE_ESCALATION" in rule_ids
        assert "RULE_SUSPICIOUS_LOGIN" in rule_ids

    def test_run_detections_on_brute_force_events(self, client, db_session):
        """POST /api/detections/run analyzes events and persists findings."""
        base_time = datetime(2026, 10, 4, 10, 0, 0, tzinfo=timezone.utc)

        # Seed 5 failed logins
        for i in range(5):
            db_session.add(
                SecurityEvent(
                    timestamp=base_time + timedelta(seconds=i * 15),
                    event_type="LOGIN_FAILED",
                    source="authentication",
                    username="admin",
                    source_ip="192.168.1.50",
                    severity="medium",
                    action="login",
                )
            )
        db_session.commit()

        # Execute detection run
        response = client.post("/api/detections/run", json={})
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["events_analyzed"] == 5
        assert data["findings_generated"] >= 1
        assert data["findings_stored"] >= 1

        finding = data["findings"][0]
        assert finding["rule_id"] == "RULE_BRUTE_FORCE"
        assert finding["username"] == "admin"
        assert finding["source_ip"] == "192.168.1.50"
        assert len(finding["evidence_event_ids"]) == 5

    def test_query_findings_with_filters(self, client, db_session):
        """GET /api/detections returns findings with query filtering."""
        base_time = datetime(2026, 10, 4, 10, 0, 0, tzinfo=timezone.utc)

        # Seed brute force + success
        for i in range(4):
            db_session.add(
                SecurityEvent(
                    timestamp=base_time + timedelta(seconds=i * 20),
                    event_type="LOGIN_FAILED",
                    source="authentication",
                    username="admin",
                    source_ip="185.23.91.44",
                    severity="medium",
                )
            )
        db_session.add(
            SecurityEvent(
                timestamp=base_time + timedelta(seconds=100),
                event_type="LOGIN_SUCCESS",
                source="authentication",
                username="admin",
                source_ip="185.23.91.44",
                severity="info",
            )
        )
        db_session.commit()

        # Run detections
        client.post("/api/detections/run", json={})

        # Query all findings
        res = client.get("/api/detections")
        assert res.status_code == 200
        findings = res.json()
        assert len(findings) >= 1

        # Query by rule_id filter
        res_filter = client.get("/api/detections?rule_id=RULE_SUCCESS_AFTER_BRUTE_FORCE")
        assert res_filter.status_code == 200
        filtered = res_filter.json()
        assert len(filtered) == 1
        assert filtered[0]["rule_id"] == "RULE_SUCCESS_AFTER_BRUTE_FORCE"

    def test_get_finding_by_id(self, client, db_session):
        """GET /api/detections/{id} returns specific finding."""
        base_time = datetime(2026, 10, 4, 12, 0, 0, tzinfo=timezone.utc)
        for i in range(5):
            db_session.add(
                SecurityEvent(
                    timestamp=base_time + timedelta(seconds=i * 10),
                    event_type="LOGIN_FAILED",
                    source="authentication",
                    username="root",
                    source_ip="10.0.0.99",
                )
            )
        db_session.commit()

        run_res = client.post("/api/detections/run", json={})
        finding_id = run_res.json()["findings"][0]["id"]

        get_res = client.get(f"/api/detections/{finding_id}")
        assert get_res.status_code == 200
        assert get_res.json()["id"] == finding_id
        assert get_res.json()["username"] == "root"

    def test_get_nonexistent_finding_returns_404(self, client):
        """GET /api/detections/99999 returns 404."""
        res = client.get("/api/detections/99999")
        assert res.status_code == 404
