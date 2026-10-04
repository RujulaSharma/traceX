# TraceX: Find the Intruder

**Security log analysis platform** that detects, correlates, and explains attack sequences from authentication, network, and server logs.

> Hackathon Problem: ALG-CYBER-01 — Analyze authentication, network, and server logs to identify suspicious users/IPs, connect related events, create an incident timeline, provide evidence, and explain the likely attack sequence.

## Phase 1: Log Ingestion & Database Foundation

Phase 1 implements the foundational data pipeline:

```text
CSV / JSON / NDJSON Log File
        ↓
Upload via REST API (/api/logs/upload)
        ↓
Parse (auto-detect format)
        ↓
Validate (Pydantic schemas)
        ↓
Normalize (canonical event structure)
        ↓
Store in PostgreSQL / SQLite
        ↓
Return ingestion summary
```

### What's Implemented

- **Log Ingestion API** — Upload security logs via `POST /api/logs/upload`
- **Multi-format support** — CSV, JSON, and NDJSON with auto-detection
- **Validation** — Pydantic-based validation of timestamps, IPs, event types, severities
- **Normalization** — All log formats converted to a canonical `SecurityEvent` structure
- **PostgreSQL storage** — SQLAlchemy ORM with indexed query patterns
- **Error handling** — Malformed records rejected individually without aborting the batch
- **Health check** — `GET /api/health` for app + database status
- **Events query** — `GET /api/logs/events` with filtering by event_type, username, source_ip, severity

### Supported Event Types

```text
LOGIN_SUCCESS    LOGIN_FAILED     LOGOUT
PASSWORD_RESET   PRIVILEGE_ESCALATION
FILE_ACCESS      DATABASE_ACCESS
PROCESS_EXECUTION OUTBOUND_TRANSFER
PORT_SCAN        FIREWALL_BLOCK   VPN_LOGIN
```

---

## Setup

### Prerequisites

- Python 3.12+
- PostgreSQL 16+ (or use SQLite for local development)

### Quick Start (Local Development with SQLite)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate    # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

The app will use SQLite by default when no PostgreSQL database URL is configured.

### With PostgreSQL (Docker)

```bash
# Start PostgreSQL
docker compose up -d db

# Set environment
copy .env.example .env
# Edit .env with your PostgreSQL credentials

# Run the backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Full Docker Setup

```bash
docker compose up -d
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./tracex.db` | Database connection string |
| `APP_ENV` | `development` | Environment (development/staging/production) |
| `LOG_LEVEL` | `INFO` | Logging level |
| `APP_HOST` | `0.0.0.0` | Server bind host |
| `APP_PORT` | `8000` | Server bind port |

See [`.env.example`](.env.example) for all options.

---

## API Documentation

Once the server is running, visit:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/logs/upload` | Upload and ingest a log file |
| `GET` | `/api/logs/events` | Query stored events with filters |
| `GET` | `/api/health` | Application + database health check |

### Upload Example

```bash
curl -X POST http://localhost:8000/api/logs/upload \
  -F "file=@data/sample_logs/normal_auth.csv"
```

Response:
```json
{
  "success": true,
  "total_records": 25,
  "successful_records": 25,
  "failed_records": 0,
  "format": "csv",
  "message": "Logs ingested successfully. 25 stored, 0 rejected.",
  "rejected": []
}
```

---

## Database

### Tables

| Table | Purpose |
|---|---|
| `security_events` | Normalized security events (core table) |
| `users` | Known user accounts from logs |
| `ip_addresses` | Known IPs with metadata and risk scores |

### Indexes

| Index | Purpose |
|---|---|
| `timestamp` | Time-range queries for incident timelines |
| `username` | User-based event correlation |
| `source_ip` | IP-based threat tracking |
| `event_type` | Filter by event category |
| `severity` | Filter by priority |
| `(username, timestamp)` | Composite index for user activity over time |
| `(source_ip, timestamp)` | Composite index for IP activity over time |
| `(event_type, severity)` | Composite index for category + priority queries |

---

## Sample Data

Sample log files are in `data/sample_logs/`:

| File | Format | Content |
|---|---|---|
| `normal_auth.csv` | CSV | 25 normal authentication events |
| `normal_server.json` | JSON | 10 server/infrastructure events |
| `mixed_security.ndjson` | NDJSON | 20 mixed auth/network/server events |

---

## Testing

```bash
cd backend
py -m pytest tests/ -v
```

---

## Project Structure

```text
traceX/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py          # API endpoints
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py          # App settings (Pydantic Settings)
│   │   │   ├── database.py        # DB engine, session, health check
│   │   │   ├── errors.py          # Centralized error handlers
│   │   │   └── logging.py         # Structured logging
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── event.py           # SQLAlchemy ORM models (SecurityEvent, User, IPAddress)
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── event.py           # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── ingestion.py       # Ingestion orchestrator
│   │   │   └── log_parser.py      # Format parsers (CSV, JSON, NDJSON)
│   │   ├── utils/
│   │   │   └── __init__.py
│   │   └── main.py                # FastAPI application entry point
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py            # Pytest fixtures & in-memory test DB
│   │   ├── test_database.py       # DB operation tests
│   │   ├── test_ingestion.py      # End-to-end API ingestion tests
│   │   ├── test_parsing.py        # Parser unit tests
│   │   └── test_validation.py     # Schema validation tests
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── Dockerfile
├── data/
│   └── sample_logs/
│       ├── normal_auth.csv
│       ├── normal_server.json
│       └── mixed_security.ndjson
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── ARCHITECTURE.md
```

---

## Roadmap

> **Future phases — not yet implemented:**

- **Phase 2**: Detection Engine (brute-force, anomaly detection, rule-based detection)
- **Phase 3**: Risk Scoring & Event Correlation
- **Phase 4**: Incident Creation & Timeline
- **Phase 5**: Attack Reconstruction & Evidence
- **Phase 6**: Security Dashboard (React + TypeScript)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0 |
| Database | PostgreSQL 16 (SQLite for local dev) |
| Infrastructure | Docker, docker-compose |
| Testing | pytest, httpx |
| Frontend (future) | React, Vite, TypeScript, Tailwind CSS |
