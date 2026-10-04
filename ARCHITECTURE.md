# TraceX — System Architecture (Phase 1)

## 1. High-Level Architecture

TraceX Phase 1 establishes the log ingestion and database normalization foundation for security analytics.

```text
[ Raw Log Files ]
(CSV / JSON / NDJSON)
        │
        ▼ HTTP POST /api/logs/upload
┌────────────────────────────────────────────────────────┐
│ FastAPI Web Layer (app/api/routes.py)                  │
│  - Multipart file handling                             │
│  - UTF-8 decoding & boundary verification              │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│ Format Detection & Parsing (app/services/log_parser.py)│
│  - File extension & content sniff                      │
│  - CSV DictReader with whitespace/null cleanup         │
│  - JSON Array & Object deserialization                 │
│  - NDJSON Line-by-Line isolated parsing                │
└───────────────────────┬────────────────────────────────┘
                        │ Raw Records
                        ▼
┌────────────────────────────────────────────────────────┐
│ Validation & Normalization (app/schemas/event.py)      │
│  - Pydantic v2 EventCreate model                       │
│  - ISO-8601 & multi-format timestamp normalization (UTC)│
│  - IPv4 / IPv6 syntax & boundary verification          │
│  - Event type categorization against standard taxonomy │
│  - Severity normalization & default assignment         │
│  - Granular per-record error capture (RejectedRecord)  │
└───────────────────────┬────────────────────────────────┘
                        │ Validated Canonical Events
                        ▼
┌────────────────────────────────────────────────────────┐
│ Ingestion Orchestration (app/services/ingestion.py)    │
│  - SQLAlchemy ORM Model Mapping                        │
│  - Bulk persistence with transaction management        │
│  - Summary generation (total/success/failed/rejected)  │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│ PostgreSQL / SQLite Storage (app/models/event.py)      │
│  - security_events (composite indexed)                 │
│  - users                                               │
│  - ip_addresses                                        │
└────────────────────────────────────────────────────────┘
```

---

## 2. Component Breakdown

### 2.1 API Layer (`app/api/routes.py`)
- `POST /api/logs/upload`: Accepts file uploads, reads streams, invokes ingestion service, returns structured ingestion summary.
- `GET /api/logs/events`: Provides indexed queries into stored normalized security events with filtering on `event_type`, `username`, `source_ip`, and `severity`.
- `GET /api/health`: Validates application status and database connectivity (executes `SELECT 1` ping).

### 2.2 Ingestion Engine (`app/services/ingestion.py` & `app/services/log_parser.py`)
- **Format Auto-Detection**: Inspects file extension first, then content structure (e.g. leading `[` for JSON arrays, multiple `{` for NDJSON, header commas for CSV).
- **Resilient Parsing**: Malformed records are isolated without discarding the batch.
- **Evidence Preservation**: Raw log payloads are preserved alongside normalized attributes in `raw_log` column for auditability.

### 2.3 Data Validation & Normalization (`app/schemas/event.py`)
- **Strict Typing**: Enforces valid event types, IP formats, and severity levels.
- **Timezone Normalization**: Non-UTC and naive timestamps are converted to UTC datetime objects to maintain consistent chronological ordering.

### 2.4 Data Storage & Indexing (`app/models/event.py`)
- **Primary Model**: `SecurityEvent` represents canonical security records.
- **Auxiliary Models**: `User` and `IPAddress` tables for entity profiling.
- **Indexes**:
  - `timestamp`: Fast time-window slicing.
  - `username` & `(username, timestamp)`: User timeline reconstruction.
  - `source_ip` & `(source_ip, timestamp)`: IP timeline reconstruction.
  - `event_type`, `severity` & `(event_type, severity)`: High-priority event filtering.

---

## 3. Data Flow Example

```text
Input CSV Row:
"2026-10-04T10:32:01Z,LOGIN_FAILED,authentication,admin,185.23.91.44,,medium,login"

Parsing (log_parser.py):
{
    "timestamp": "2026-10-04T10:32:01Z",
    "event_type": "LOGIN_FAILED",
    "source": "authentication",
    "username": "admin",
    "source_ip": "185.23.91.44",
    "destination_ip": None,
    "severity": "medium",
    "action": "login"
}

Validation (schemas/event.py):
- Timestamp parsed -> datetime.datetime(2026, 10, 4, 10, 32, 1, tzinfo=timezone.utc)
- Event type verified -> "LOGIN_FAILED" (in VALID_EVENT_TYPES)
- IP verified -> "185.23.91.44" (valid IPv4)
- Severity normalized -> "medium" (in VALID_SEVERITIES)

Persistence (models/event.py):
- SecurityEvent entity created and added to database session
- Batch commit executed
```
