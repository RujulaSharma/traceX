# TraceX: Find the Intruder

**Autonomous Cybersecurity Investigation & Attack Reconstruction Platform** that detects, correlates, and explains multi-stage cyber intrusions from authentication, network, and server logs.

> **Hackathon Problem: ALG-CYBER-01 — Find the Intruder**
> Analyze authentication, network, and server logs to identify suspicious users/IPs, connect related events, create an incident timeline, provide evidence, and explain the likely attack sequence.

---

## System Architecture

```text
[ Multi-Format Security Telemetry ]
  (CSV / JSON / NDJSON / Syslog)
                 │
                 ▼
     ┌───────────────────────┐
     │ Log Ingestion Engine  │ (FastAPI, Pandas, Pydantic v2)
     └───────────┬───────────┘
                 │ Normalized Events
                 ▼
     ┌───────────────────────┐
     │ Security Data Store   │ (PostgreSQL / SQLite, SQLAlchemy 2.0)
     └───────────┬───────────┘
                 │
                 ▼
     ┌───────────────────────┐
     │ Detection Rule Engine │ (Deterministic MITRE ATT&CK Rules)
     └───────────┬───────────┘
                 │ Security Findings
                 ▼
     ┌───────────────────────┐
     │ Correlation Engine    │ (Causal Entity Graph Clustering,
     │ & Risk Scorer         │  Kill-Chain Reconstruction 0-100)
     └───────────┬───────────┘
                 │ Incidents, Timelines & Graphs
                 ▼
     ┌───────────────────────┐
     │ Modern SOC Dashboard  │ (React 18, Vite, TypeScript, Tailwind, Recharts)
     └───────────────────────┘
```

---

## Key Features

1. **Multi-Format Ingestion**: Ingests CSV, JSON arrays, JSON objects, and NDJSON logs with UTC normalization and malformed line fault-tolerance.
2. **Deterministic Detection Rules**:
   - `RULE_BRUTE_FORCE`: Identifies password spraying & repeated authentication failures.
   - `RULE_SUCCESS_AFTER_BRUTE_FORCE`: Detects account takeover following multiple failures.
   - `RULE_PORT_SCAN`: Uncovers port scanning and firewall probe reconnaissance.
   - `RULE_PRIVILEGE_ESCALATION`: Catches administrative privilege elevation (sudo/su) after access.
   - `RULE_SUSPICIOUS_LOGIN`: Flags impossible travel and multi-IP simultaneous logins.
3. **Causal Incident Correlation**: Clusters findings by shared IP addresses and compromised accounts into cohesive multi-stage kill chains.
4. **MITRE-Aligned Attack Stages**: Maps activity across 5 stages: Reconnaissance, Credential Access, Initial Access, Privilege Escalation, and Data Access & Impact.
5. **Mathematical Risk Scoring (0–100)**: Transparent, factor-based scoring calculated with verifiable weights (severity, stage depth, compromised accounts).
6. **Zero-Hallucination Threat Narratives**: Deterministic, structured 5-part explanations detailing what happened, why it's suspicious, next progression, evidence proof, and immediate containment steps.
7. **Interactive SOC Dashboard**:
   - 4-Tier Interactive Attack Graph (Entrypoint IP $\rightarrow$ Compromised Identity $\rightarrow$ Detection Signal $\rightarrow$ Stage & Asset)
   - Unified Chronological Milestone Timeline
   - Forensic Evidence Drawer with Raw Payload Inspector
   - One-Click Demo Scenario Loader

---

## Quick Start Guide

### 1. Start Backend (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate    # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start backend API server (runs on port 8000)
uvicorn app.main:app --reload --port 8000
```

### 2. Start Frontend (React + Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite dev server (runs on port 5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Live Hackathon Demo Walkthrough (3-Minute Script)

1. **Load Telemetry**:
   - Navigate to **Log Ingestion** (`/ingestion`).
   - Click **"Load Full Attack Scenario"** (or upload `data/sample_logs/attack_scenario_full.csv`).
   - Notice immediate format detection, validation, and sub-second ingestion.
2. **Execute Detection Engine**:
   - Click **"Proceed to Threat Detections"** (`/detections`).
   - Click **"Execute Detection Engine"** to trigger deterministic rules. Review confidence scores and MITRE ATT&CK tags.
3. **Reconstruct Attack Chain**:
   - Go to **Incidents & Graph** (`/incidents`).
   - Click **"Run Correlation Engine"** to aggregate signals into a unified threat incident.
4. **Inspect Incident Cockpit**:
   - Click on the generated incident (`/incidents/1`).
   - **Attack Topology Graph**: Observe the visual flow from attacker IP `185.220.101.5` $\rightarrow$ compromised user `jsmith` $\rightarrow$ triggered signals $\rightarrow$ database target `10.0.0.50`.
   - **Kill Chain Stages**: Review the 5-stage attack progression.
   - **Attack Timeline**: Filter by milestones to see the exact minute-by-minute sequence.
   - **Deterministic Narrative**: Review the explanation and immediate containment actions.

---

## REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check (DB connectivity) |
| `POST` | `/api/logs/upload` | Ingest CSV, JSON, or NDJSON file |
| `GET` | `/api/events` | Query and filter normalized security events |
| `GET` | `/api/events/{id}` | Get event details and raw payload |
| `POST` | `/api/detections/run` | Execute detection rule engine |
| `GET` | `/api/detections` | List security findings |
| `GET` | `/api/detections/rules` | List registered detection rules |
| `POST` | `/api/correlation/run` | Execute correlation engine to create incidents |
| `GET` | `/api/incidents` | List correlated incidents |
| `GET` | `/api/incidents/{id}` | Get detailed incident record |
| `GET` | `/api/incidents/{id}/timeline` | Get unified chronological attack timeline |
| `GET` | `/api/incidents/{id}/evidence` | Get forensic evidence findings and events |
| `GET` | `/api/incidents/{id}/graph` | Get topological attack graph nodes and edges |
| `PATCH`| `/api/incidents/{id}/status` | Update incident workflow status |
| `GET` | `/api/stats/dashboard` | Aggregated metrics and telemetry charts |

---

## Test Suite & Verification

All 95 unit, integration, and rule tests pass with zero errors:

```bash
cd backend
python -m pytest
```

Static analysis & linting:
```bash
ruff check app tests
mypy app
```
