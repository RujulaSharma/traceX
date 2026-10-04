"""Tests for the log ingestion API endpoints.

Tests:
- Successful CSV upload and ingestion
- Successful JSON upload and ingestion
- Successful NDJSON upload and ingestion
- Mixed valid/invalid record handling
- Empty file rejection
- Correct database counts after ingestion
- Health endpoint
- Events query endpoint
"""

import json

from app.models.event import SecurityEvent


class TestHealthEndpoint:
    """Test the health check endpoint."""

    def test_health_check(self, client):
        """Health endpoint should return application status."""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ("healthy", "degraded")
        assert data["app_name"] == "TraceX"
        assert "database" in data


class TestCSVIngestion:
    """Test CSV file upload and ingestion."""

    def test_upload_valid_csv(self, client, db_session):
        """Upload a valid CSV and verify ingestion."""
        csv_content = (
            "timestamp,event_type,source,username,source_ip,severity,action\n"
            "2026-10-04T08:01:12Z,LOGIN_SUCCESS,authentication,jsmith,192.168.1.10,info,login\n"
            "2026-10-04T08:05:33Z,LOGIN_SUCCESS,authentication,mjohnson,192.168.1.15,info,login\n"
            "2026-10-04T08:12:45Z,LOGIN_FAILED,authentication,admin,185.23.91.44,medium,login\n"
        )
        response = client.post(
            "/api/logs/upload",
            files={"file": ("test.csv", csv_content, "text/csv")},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["total_records"] == 3
        assert data["successful_records"] == 3
        assert data["failed_records"] == 0
        assert data["format"] == "csv"

        # Verify database
        count = db_session.query(SecurityEvent).count()
        assert count == 3

    def test_csv_with_invalid_records(self, client, db_session):
        """CSV with some invalid rows: valid rows stored, invalid rejected."""
        csv_content = (
            "timestamp,event_type,source,username,source_ip,severity,action\n"
            "2026-10-04T08:01:12Z,LOGIN_SUCCESS,authentication,jsmith,192.168.1.10,info,login\n"
            "not-a-timestamp,LOGIN_FAILED,authentication,admin,185.23.91.44,medium,login\n"
            "2026-10-04T08:12:45Z,INVALID_TYPE,authentication,admin,185.23.91.44,medium,login\n"
            "2026-10-04T08:15:00Z,LOGIN_SUCCESS,authentication,klee,192.168.1.30,info,login\n"
        )
        response = client.post(
            "/api/logs/upload",
            files={"file": ("test.csv", csv_content, "text/csv")},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_records"] == 4
        assert data["successful_records"] == 2
        assert data["failed_records"] == 2
        assert len(data["rejected"]) == 2

        # Verify only valid records in database
        count = db_session.query(SecurityEvent).count()
        assert count == 2


class TestJSONIngestion:
    """Test JSON file upload and ingestion."""

    def test_upload_valid_json_array(self, client, db_session):
        """Upload a JSON array of events."""
        events = [
            {
                "timestamp": "2026-10-04T07:00:00Z",
                "event_type": "PROCESS_EXECUTION",
                "source": "server",
                "username": "system",
                "source_ip": "10.0.0.5",
                "severity": "info",
                "action": "start",
                "metadata": {"process": "nginx"},
            },
            {
                "timestamp": "2026-10-04T07:05:30Z",
                "event_type": "FILE_ACCESS",
                "source": "server",
                "username": "app_service",
                "source_ip": "10.0.0.10",
                "severity": "info",
                "action": "read",
            },
        ]
        json_content = json.dumps(events)
        response = client.post(
            "/api/logs/upload",
            files={"file": ("events.json", json_content, "application/json")},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["total_records"] == 2
        assert data["successful_records"] == 2
        assert data["format"] == "json"

    def test_upload_single_json_object(self, client, db_session):
        """Upload a single JSON event object."""
        event = {
            "timestamp": "2026-10-04T07:00:00Z",
            "event_type": "LOGIN_SUCCESS",
            "source": "authentication",
            "username": "admin",
            "source_ip": "192.168.1.1",
            "severity": "info",
            "action": "login",
        }
        json_content = json.dumps(event)
        response = client.post(
            "/api/logs/upload",
            files={"file": ("event.json", json_content, "application/json")},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["successful_records"] == 1


class TestNDJSONIngestion:
    """Test NDJSON file upload and ingestion."""

    def test_upload_valid_ndjson(self, client, db_session):
        """Upload valid NDJSON events."""
        ndjson_content = (
            '{"timestamp": "2026-10-04T06:00:00Z", "event_type": "LOGIN_SUCCESS", "source": "authentication", "username": "jsmith", "source_ip": "192.168.1.10", "severity": "info", "action": "login"}\n'
            '{"timestamp": "2026-10-04T06:05:12Z", "event_type": "FILE_ACCESS", "source": "server", "username": "jsmith", "source_ip": "192.168.1.10", "severity": "info", "action": "read"}\n'
            '{"timestamp": "2026-10-04T06:10:30Z", "event_type": "LOGOUT", "source": "authentication", "username": "jsmith", "source_ip": "192.168.1.10", "severity": "info", "action": "logout"}\n'
        )
        response = client.post(
            "/api/logs/upload",
            files={"file": ("events.ndjson", ndjson_content, "application/x-ndjson")},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["total_records"] == 3
        assert data["successful_records"] == 3
        assert data["format"] == "ndjson"

    def test_ndjson_mixed_valid_invalid(self, client, db_session):
        """NDJSON with valid and invalid lines."""
        ndjson_content = (
            '{"timestamp": "2026-10-04T06:00:00Z", "event_type": "LOGIN_SUCCESS", "source": "authentication", "severity": "info"}\n'
            'this is not valid json\n'
            '{"timestamp": "2026-10-04T06:10:00Z", "event_type": "LOGOUT", "source": "authentication", "severity": "info"}\n'
        )
        response = client.post(
            "/api/logs/upload",
            files={"file": ("events.ndjson", ndjson_content, "application/x-ndjson")},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_records"] == 3
        assert data["successful_records"] == 2
        assert data["failed_records"] == 1

        count = db_session.query(SecurityEvent).count()
        assert count == 2


class TestEmptyFile:
    """Test empty file handling."""

    def test_empty_file_rejected(self, client):
        """Empty file should return an error."""
        response = client.post(
            "/api/logs/upload",
            files={"file": ("empty.csv", "", "text/csv")},
        )
        assert response.status_code == 400
        data = response.json()
        assert data["success"] is False


class TestBulkIngestion:
    """Test ingestion with larger record counts."""

    def test_hundred_records(self, client, db_session):
        """Ingest 100 records and verify count."""
        events = []
        for i in range(100):
            events.append({
                "timestamp": f"2026-10-04T{i // 60:02d}:{i % 60:02d}:00Z",
                "event_type": "LOGIN_SUCCESS",
                "source": "authentication",
                "username": f"user{i}",
                "source_ip": f"192.168.1.{i % 256}",
                "severity": "info",
                "action": "login",
            })
        json_content = json.dumps(events)
        response = client.post(
            "/api/logs/upload",
            files={"file": ("bulk.json", json_content, "application/json")},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_records"] == 100
        assert data["successful_records"] == 100
        assert data["failed_records"] == 0

        count = db_session.query(SecurityEvent).count()
        assert count == 100


class TestEventsEndpoint:
    """Test the events query endpoint."""

    def test_get_events_empty(self, client):
        """Empty database should return empty list."""
        response = client.get("/api/logs/events")
        assert response.status_code == 200
        assert response.json() == []

    def test_get_events_after_ingestion(self, client, db_session):
        """Events should be queryable after ingestion."""
        # Ingest some events
        csv_content = (
            "timestamp,event_type,source,username,source_ip,severity,action\n"
            "2026-10-04T08:01:12Z,LOGIN_SUCCESS,authentication,jsmith,192.168.1.10,info,login\n"
            "2026-10-04T08:05:33Z,LOGIN_FAILED,authentication,admin,185.23.91.44,medium,login\n"
        )
        client.post(
            "/api/logs/upload",
            files={"file": ("test.csv", csv_content, "text/csv")},
        )

        # Query events
        response = client.get("/api/logs/events")
        assert response.status_code == 200
        events = response.json()
        assert len(events) == 2

    def test_filter_by_event_type(self, client, db_session):
        """Filter events by event_type parameter."""
        csv_content = (
            "timestamp,event_type,source,username,source_ip,severity,action\n"
            "2026-10-04T08:01:12Z,LOGIN_SUCCESS,authentication,jsmith,192.168.1.10,info,login\n"
            "2026-10-04T08:05:33Z,LOGIN_FAILED,authentication,admin,185.23.91.44,medium,login\n"
            "2026-10-04T08:10:00Z,LOGIN_FAILED,authentication,admin,185.23.91.44,medium,login\n"
        )
        client.post(
            "/api/logs/upload",
            files={"file": ("test.csv", csv_content, "text/csv")},
        )

        response = client.get("/api/logs/events?event_type=LOGIN_FAILED")
        assert response.status_code == 200
        events = response.json()
        assert len(events) == 2
        assert all(e["event_type"] == "LOGIN_FAILED" for e in events)
