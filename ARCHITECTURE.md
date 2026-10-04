# TraceX — System Architecture (Phase 1 & Phase 2)

## 1. High-Level Architecture Overview

TraceX is architected into layered, modular subsystems where each phase builds cleanly upon the foundation of preceding phases without tight coupling:

```text
[ Raw Log Files ] (CSV / JSON / NDJSON)
        │
        ▼ HTTP POST /api/logs/upload
┌────────────────────────────────────────────────────────┐
│ Phase 1: Ingestion & Normalization Layer               │
│  - Stream Parsing (log_parser.py)                      │
│  - Strict Schema Validation & UTC Normalization        │
│  - Forensic Raw Log Preservation (raw_log)             │
│  - Bulk Database Persistence (security_events)         │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼ Normalized Events Query
┌────────────────────────────────────────────────────────┐
│ Phase 2: Security Detection Layer                      │
│  - DetectionEngine (detection/engine.py)               │
│  - Abstract Base Rule Plugin Interface (base.py)       │
│  - Configurable Thresholds & Time Windows (config.py)  │
│  - Deterministic Security Rules:                       │
│     * RULE_BRUTE_FORCE                                 │
│     * RULE_SUCCESS_AFTER_BRUTE_FORCE                   │
│     * RULE_PORT_SCAN                                   │
│     * RULE_PRIVILEGE_ESCALATION                        │
│     * RULE_SUSPICIOUS_LOGIN                            │
│  - Structured Findings with Evidence IDs & Metrics     │
│  - Database Persistence (detection_findings)           │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼ Detection Findings
┌────────────────────────────────────────────────────────┐
│ Phase 3 (Future): Risk Scoring & Event Correlation     │
│  - Correlate distinct findings into attack sequences   │
│  - Entity risk scoring (IP & User risk aggregation)    │
└────────────────────────────────────────────────────────┘
```

---

## 2. Detection Engine Architecture

### 2.1 Decoupled Plugin Design (`app/detection/base.py`)
All detection rules inherit from `BaseDetectionRule`:

```python
class BaseDetectionRule(ABC):
    rule_id: str
    rule_name: str
    detection_type: str
    default_severity: str
    default_confidence: float

    @abstractmethod
    def detect(self, events: list[SecurityEvent]) -> list[DetectionFindingCreate]:
        ...
```

**Benefits**:
- **Extensibility**: Adding a new detection rule (e.g. `PasswordSprayingRule` or `DataExfiltrationRule`) requires only implementing a subclass of `BaseDetectionRule` and registering it in `DetectionEngine`.
- **Fault Tolerance**: An unexpected exception in one rule is trapped and logged by `DetectionEngine`, allowing all other rules to complete uninterrupted.
- **Testability**: Every rule is completely unit-testable against in-memory lists of `SecurityEvent` objects without requiring database access or network calls.

---

## 3. Implemented Detection Rules & Forensic Logic

### 3.1 `RULE_BRUTE_FORCE` (`app/detection/rules/brute_force.py`)
- **Category**: `brute_force` | **Severity**: `high` | **Confidence**: `0.90`
- **Logic**: Filters `LOGIN_FAILED` events grouped by `(username, source_ip)`. Uses a sliding window $[T_0, T_0 + \Delta W]$ (default: 5 min). When the count of failed logins within the window is $\ge \text{threshold}$ (default: 5), it produces a finding containing all failed event IDs.
- **False Positive Controls**: Distinct user accounts and distinct source IPs are never cross-aggregated. Once a window triggers, the sliding cursor advances past the cluster to avoid duplicate overlapping alerts.

### 3.2 `RULE_SUCCESS_AFTER_BRUTE_FORCE` (`app/detection/rules/successful_login_after_failures.py`)
- **Category**: `credential_access` | **Severity**: `critical` | **Confidence**: `0.95`
- **Logic**: Identifies `LOGIN_SUCCESS` events. For each success at time $T_{\text{success}}$, looks back within $[T_{\text{success}} - \Delta W, T_{\text{success}}]$ (default: 10 min) for preceding `LOGIN_FAILED` events targeting the same username. When failure count is $\ge \text{threshold}$ (default: 3), emits a critical alert containing both the failure event IDs and the success event ID.
- **Significance for Phase 3**: This finding links the credential attack phase to the initial access phase of an attack sequence.

### 3.3 `RULE_PORT_SCAN` (`app/detection/rules/port_scan.py`)
- **Category**: `reconnaissance` | **Severity**: `high` | **Confidence**: `0.85`
- **Logic**: Collects `PORT_SCAN` and `FIREWALL_BLOCK` probe events for each `source_ip`. Evaluates probe volume and distinct destination ports within $[T_0, T_0 + \Delta W]$ (default: 5 min). When probe count or distinct ports $\ge \text{threshold}$ (default: 5), generates a reconnaissance finding.

### 3.4 `RULE_PRIVILEGE_ESCALATION` (`app/detection/rules/privilege_escalation.py`)
- **Category**: `privilege_escalation` | **Severity**: `high` | **Confidence**: `0.90`
- **Logic**: Evaluates `PRIVILEGE_ESCALATION` events and `sudo` / `su` actions. Correlates with preceding `LOGIN_SUCCESS` / `VPN_LOGIN` within 15 minutes to trace the originating user and IP.

### 3.5 `RULE_SUSPICIOUS_LOGIN` (`app/detection/rules/suspicious_login.py`)
- **Category**: `unusual_access` | **Severity**: `medium` | **Confidence**: `0.80`
- **Logic**: Analyzes successful logins for each user across a 24-hour window. Emits an alert when the user authenticates from $\ge 2$ distinct IP addresses within the window.

---

## 4. Detection Finding & Evidence Model

Every generated finding is persisted to the `detection_findings` table:

```text
Table: detection_findings
├── id (Integer PK)
├── rule_id (String index)
├── rule_name (String)
├── detection_type (String index)
├── severity (String index: low, medium, high, critical)
├── confidence (Float: 0.0 - 1.0)
├── source_ip (String index)
├── username (String index)
├── timestamp (DateTime UTC index)
├── first_seen (DateTime UTC)
├── last_seen (DateTime UTC)
├── description (Text explanation with metrics)
├── evidence_event_ids (JSON Array of SecurityEvent.id integers)
├── metadata (JSON Object with rule-specific parameters)
└── created_at (DateTime UTC)
```

### Forensic Evidence Traceability
Every finding maintains an explicit `evidence_event_ids: [101, 102, 103, ...]` pointer array. This enables:
1. **Zero Evidence Loss**: Analysts and Phase 3 correlation engines can look up the exact raw logs and normalized events that justified the finding.
2. **Audit Proof**: Forensic reports can display chronological event timelines supporting each alert.

---

## 5. REST API Architecture (Phase 2)

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/detections/run` | Triggers detection engine across stored events. Supports `start_time`, `end_time`, `source_ip`, `username`, `rule_ids`, and `persist_findings`. |
| `GET` | `/api/detections` | Queries stored findings with filtering on `rule_id`, `severity`, `source_ip`, `username`, `limit`, `skip`. |
| `GET` | `/api/detections/{id}` | Retrieves a single finding by ID. |
| `GET` | `/api/detections/rules` | Returns catalog of registered rules with metadata and default confidence/severity. |

---

## 6. How Phase 3 (Correlation) Will Consume Phase 2 Findings

In Phase 3, the Correlation Engine will not analyze millions of raw log lines directly; instead, it will ingest the **structured Detection Findings** produced by Phase 2:
1. **Entity Linking**: Finding $A$ (`RULE_BRUTE_FORCE` on `185.23.91.44`) and Finding $B$ (`RULE_SUCCESS_AFTER_BRUTE_FORCE` on `admin` from `185.23.91.44`) are linked by IP and user.
2. **Temporal Sequencing**: Finding $B$ followed by Finding $C$ (`RULE_PRIVILEGE_ESCALATION` on `admin`) within 10 minutes constructs the chronological attack progression:
   $$\text{Reconnaissance} \longrightarrow \text{Brute Force} \longrightarrow \text{Initial Access} \longrightarrow \text{Privilege Escalation}$$
3. **Graph Building**: Attack graphs in Phase 4/5 will use findings as nodes and correlation links as edges.
