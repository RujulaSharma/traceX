"""API integration tests for Incident and Dashboard endpoints.

Tests:
- POST /api/correlation/run
- GET /api/incidents
- GET /api/incidents/{id}
- GET /api/incidents/{id}/timeline
- GET /api/incidents/{id}/evidence
- GET /api/incidents/{id}/graph
- PATCH /api/incidents/{id}/status
- GET /api/stats/dashboard
"""

from datetime import datetime, timedelta, timezone

from app.models.event import SecurityEvent


class TestIncidentAndDashboardAPI:
    """Test incident and dashboard endpoints."""

    def test_full_investigation_api_lifecycle(self, client, db_session):
        """Seed attack logs, run detection, run correlation, query timeline, graph, evidence, and dashboard."""
        base_time = datetime(2026, 10, 4, 10, 0, 0, tzinfo=timezone.utc)

        # 1. Seed events
        ev_scan = SecurityEvent(
            timestamp=base_time,
            event_type="PORT_SCAN",
            source="network",
            source_ip="185.23.91.44",
            metadata_={"ports_scanned": [22, 80, 443, 3306, 5432]},
        )
        db_session.add(ev_scan)

        for i in range(6):
            db_session.add(
                SecurityEvent(
                    timestamp=base_time + timedelta(minutes=2, seconds=i * 15),
                    event_type="LOGIN_FAILED",
                    source="authentication",
                    username="admin",
                    source_ip="185.23.91.44",
                )
            )

        ev_success = SecurityEvent(
            timestamp=base_time + timedelta(minutes=4),
            event_type="LOGIN_SUCCESS",
            source="authentication",
            username="admin",
            source_ip="185.23.91.44",
        )
        db_session.add(ev_success)

        ev_sudo = SecurityEvent(
            timestamp=base_time + timedelta(minutes=5),
            event_type="PRIVILEGE_ESCALATION",
            source="server",
            username="admin",
            source_ip="185.23.91.44",
            action="sudo",
            metadata_={"command": "cat /etc/shadow"},
        )
        db_session.add(ev_sudo)
        db_session.commit()

        # 2. Run detection
        det_res = client.post("/api/detections/run", json={})
        assert det_res.status_code == 200
        assert det_res.json()["findings_generated"] >= 3

        # 3. Run correlation
        corr_res = client.post("/api/correlation/run", json={})
        assert corr_res.status_code == 200
        data = corr_res.json()
        assert data["success"] is True
        assert data["incidents_created"] >= 1
        incident = data["incidents"][0]
        incident_id = incident["id"]

        assert incident["incident_number"] == "TRX-001"
        assert incident["primary_ip"] == "185.23.91.44"
        assert incident["affected_user"] == "admin"
        assert incident["risk_score"] >= 80.0
        assert len(incident["stages"]) >= 3

        # 4. GET /api/incidents
        list_res = client.get("/api/incidents")
        assert list_res.status_code == 200
        assert len(list_res.json()) >= 1

        # 5. GET /api/incidents/{id}
        get_res = client.get(f"/api/incidents/{incident_id}")
        assert get_res.status_code == 200
        assert get_res.json()["id"] == incident_id

        # 6. GET /api/incidents/{id}/timeline
        tl_res = client.get(f"/api/incidents/{incident_id}/timeline")
        assert tl_res.status_code == 200
        tl_data = tl_res.json()
        assert tl_data["total_items"] >= 5
        assert len(tl_data["timeline"]) >= 5

        # 7. GET /api/incidents/{id}/evidence
        ev_res = client.get(f"/api/incidents/{incident_id}/evidence")
        assert ev_res.status_code == 200
        ev_data = ev_res.json()
        assert ev_data["total_events"] >= 5
        assert ev_data["total_findings"] >= 3

        # 8. GET /api/incidents/{id}/graph
        graph_res = client.get(f"/api/incidents/{incident_id}/graph")
        assert graph_res.status_code == 200
        g_data = graph_res.json()
        assert len(g_data["nodes"]) >= 3
        assert len(g_data["edges"]) >= 2

        # 9. PATCH /api/incidents/{id}/status
        patch_res = client.patch(f"/api/incidents/{incident_id}/status", json={"status": "investigating"})
        assert patch_res.status_code == 200
        assert patch_res.json()["status"] == "investigating"

        # 10. GET /api/stats/dashboard
        dash_res = client.get("/api/stats/dashboard")
        assert dash_res.status_code == 200
        d_stats = dash_res.json()
        assert d_stats["total_events"] >= 9
        assert d_stats["total_detections"] >= 3
        assert d_stats["active_incidents"] >= 1
        assert len(d_stats["top_suspicious_ips"]) >= 1
