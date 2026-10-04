# TraceX: Find the Intruder

**Security log analysis and threat detection platform** that detects, correlates, and explains attack sequences from authentication, network, and server logs.

> Hackathon Problem: ALG-CYBER-01 — Analyze authentication, network, and server logs to identify suspicious users/IPs, connect related events, create an incident timeline, provide evidence, and explain the likely attack sequence.

---

## Current Status: Phase 1 & Phase 2 Implemented

- **Phase 1: Log Ingestion & Database Foundation** (Completed)
- **Phase 2: Security Detection Engine & Rule Catalog** (Completed)
- **Phase 3: Risk Scoring & Event Correlation** (Upcoming)
- **Phase 4: Incident Creation & Attack Timelines** (Upcoming)
- **Phase 5: Attack Reconstruction & Forensic Evidence** (Upcoming)
- **Phase 6: Security Operations Center (SOC) Dashboard** (Upcoming)

---

## Phase 2: Security Detection Engine

The Detection Engine evaluates normalized security events against deterministic, explainable security rules to produce structured **Detection Findings** with forensic evidence links.

```text
Normalized Security Events (Phase 1)
                ↓
    Detection Engine (engine.py)
                ↓
┌────────────────────────────────────────────────────────┐
│ Registered Detection Rules:                            │
│  1. RULE_BRUTE_FORCE                                   │
│  2. RULE_SUCCESS_AFTER_BRUTE_FORCE                     │
│  3. RULE_PORT_SCAN                                     │
│  4. RULE_PRIVILEGE_ESCALATION                          │
│  5. RULE_SUSPICIOUS_LOGIN                              │
└────────────────────────────────────────────────────────┘
                ↓
    Detection Findings (detection_findings table)
    (rule_id, severity, confidence, evidence_event_ids, metadata)
                ↓
    REST API (/api/detections/run, /api/detections)
```

### Implemented Detection Rules

| Rule ID | Rule Name | Detection Type | Default Severity | Default Threshold | Description |
|---|---|---|---|---|---|
| `RULE_BRUTE_FORCE` | Brute Force Authentication Attempt | `brute_force` | High | $\ge 5$ failures in 5 min | Identifies repeated failed logins against a user from an IP. |
| `RULE_SUCCESS_AFTER_BRUTE_FORCE` | Successful Login Following Failures | `credential_access` | Critical | $\ge 3$ failures before success in 10 min | Detects account compromise or successful brute force breach. |
| `RULE_PORT_SCAN` | Port Scan & Network Reconnaissance | `reconnaissance` | High | $\ge 5$ ports/probes in 5 min | Probes against multiple destination ports or firewall blocks. |
| `RULE_PRIVILEGE_ESCALATION` | Suspicious Privilege Escalation | `privilege_escalation` | High | Sudo/su within 15 min of login | Unauthorized or suspicious administrative command elevation. |
| `RULE_SUSPICIOUS_LOGIN` | Suspicious Login Activity | `unusual_access` | Medium | $\ge 2$ distinct IPs in 24 hrs | Account authenticating from multiple distinct geographic/IP locations. |

---

## Setup & Quick Start

### Prerequisites

- Python 3.12+
- PostgreSQL 16+ (or automatic SQLite fallback for local development)

### Quick Start (Local Development)

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate    # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Quick Start with Docker Compose

```bash
# Start PostgreSQL container
docker compose up -d db

# Run full stack with Docker
docker compose up -d
```

---

## Environment & Configuration

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./tracex.db` | PostgreSQL connection string (or SQLite path) |
| `APP_ENV` | `development` | Environment (`development`/`staging`/`production`) |
| `LOG_LEVEL` | `INFO` | Logging level (`DEBUG`, `INFO`, `WARNING`, `ERROR`) |
| `BRUTE_FORCE_THRESHOLD` | `5` | Failed attempts threshold for brute force rule |
| `BRUTE_FORCE_WINDOW_MINUTES` | `5` | Sliding window in minutes for brute force |
| `LOGIN_AFTER_FAILURES_THRESHOLD` | `3` | Preceding failures required before success |
| `LOGIN_AFTER_FAILURES_WINDOW_MINUTES` | `10` | Lookback window in minutes for login after failures |
| `PORT_SCAN_THRESHOLD` | `5` | Distinct ports / probe count threshold |
| `PORT_SCAN_WINDOW_MINUTES` | `5` | Time window for port scan reconnaissance |
| `PRIVILEGE_ESCALATION_WINDOW_MINUTES` | `15` | Lookback window correlating login to elevation |
| `SUSPICIOUS_LOGIN_IP_THRESHOLD` | `2` | Distinct source IPs threshold for single user |
| `SUSPICIOUS_LOGIN_WINDOW_HOURS` | `24` | Lookback window in hours for multi-IP logins |

See [`.env.example`](.env.example) for all variables.

---

## API Endpoints

Once the application is running, visit **Swagger UI** at [http://localhost:8000/docs](http://localhost:8000/docs).

### Ingestion APIs (Phase 1)
- `POST /api/logs/upload` — Ingest CSV, JSON, or NDJSON logs with validation and normalization.
- `GET /api/logs/events` — Query stored normalized events with filtering.
- `GET /api/health` — Application and database connectivity health check.

### Detection APIs (Phase 2)
- `POST /api/detections/run` — Run detection engine against stored events (supports dry-run, time-range, and entity filters).
- `GET /api/detections` — Query generated detection findings with filtering by `rule_id`, `severity`, `username`, `source_ip`.
- `GET /api/detections/{id}` — Get single detection finding details and evidence IDs.
- `GET /api/detections/rules` — List all registered detection rules with metadata and thresholds.

### Example Detection Run Request

```bash
curl -X POST http://localhost:8000/api/detections/run \
  -H "Content-Type: application/json" \
  -d '{
    "persist_findings": true
  }'
```

---

## Database Design

### Tables
- **`security_events`**: Canonical normalized security logs (timestamps in UTC, IPv4/IPv6 validated, indexed).
- **`detection_findings`**: Generated detection findings referencing underlying event IDs with confidence, severity, and metadata.
- **`users`**: Entity directory of observed user identities.
- **`ip_addresses`**: Entity directory of observed source/destination IPs.

---

## Testing & Quality Assurance

Run the automated test suite (91 passing tests):

```bash
cd backend
py -m pytest tests/ -v
```

Linting and Type Checking:

```bash
cd backend
py -m ruff check app tests
py -m mypy app
```

---

## Project Structure

```text
traceX/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes.py                 # Ingestion & health endpoints
│   │   │   └── detection_routes.py       # Detection engine run & query endpoints
│   │   ├── core/
│   │   │   ├── config.py                 # Pydantic Settings with detection thresholds
│   │   │   ├── database.py               # SQLAlchemy engine & session management
│   │   │   ├── errors.py                 # Centralized exception handling
│   │   │   └── logging.py                # Structured logging
│   │   ├── detection/
│   │   │   ├── base.py                   # BaseDetectionRule abstract class
│   │   │   ├── engine.py                 # DetectionEngine orchestrator
│   │   │   └── rules/
│   │   │       ├── brute_force.py        # Rule: Brute force login attempts
│   │   │       ├── successful_login_after_failures.py # Rule: Success after failures
│   │   │       ├── port_scan.py          # Rule: Port scanning & reconnaissance
│   │   │       ├── privilege_escalation.py # Rule: Suspicious privilege escalation
│   │   │       └── suspicious_login.py   # Rule: Multi-IP unusual logins
│   │   ├── models/
│   │   │   ├── event.py                  # SecurityEvent, User, IPAddress models
│   │   │   └── detection.py              # DetectionFinding model
│   │   ├── schemas/
│   │   │   ├── event.py                  # Event validation schemas
│   │   │   └── detection.py              # Detection finding schemas & API models
│   │   ├── services/
│   │   │   ├── ingestion.py              # Ingestion pipeline
│   │   │   └── log_parser.py             # CSV, JSON, NDJSON parsers
│   │   └── main.py                       # FastAPI application entry point
│   ├── tests/
│   │   ├── conftest.py                   # Pytest fixtures
│   │   ├── test_database.py              # DB operation tests
│   │   ├── test_validation.py            # Event schema validation tests
│   │   ├── test_parsing.py               # Log parsing tests
│   │   ├── test_ingestion.py             # Ingestion API tests
│   │   ├── test_detection_rules.py       # Unit tests for all 5 detection rules
│   │   ├── test_detection_engine.py      # Detection engine orchestration tests
│   │   └── test_detection_api.py         # Detection API integration tests
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── Dockerfile
├── data/
│   └── sample_logs/                      # Realistic sample log files
├── docker-compose.yml
├── .env.example
├── README.md
└── ARCHITECTURE.md
```
