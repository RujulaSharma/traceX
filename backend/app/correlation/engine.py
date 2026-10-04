"""Security Event Correlation & Attack Reconstruction Engine.

Connects discrete detection findings and security events into unified,
chronological incident timelines, reconstructs attack stages, and computes
explainable composite risk scores.
"""

from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.logging import get_logger
from app.models.detection import DetectionFinding
from app.models.event import SecurityEvent
from app.models.incident import Incident
from app.schemas.incident import (
    AttackGraphResponse,
    AttackStage,
    AttackTimelineResponse,
    CorrelationRunRequest,
    CorrelationRunResponse,
    GraphEdge,
    GraphNode,
    IncidentExplanation,
    IncidentResponse,
    RiskFactor,
    TimelineItem,
)

logger = get_logger(__name__)


class CorrelationEngine:
    """Orchestrates the correlation of detection findings into actionable security incidents."""

    def __init__(self, default_window_minutes: int = 60) -> None:
        self.default_window_minutes = default_window_minutes

    def correlate(
        self,
        findings: list[DetectionFinding],
        events: list[SecurityEvent],
        window_minutes: int | None = None,
    ) -> list[dict[str, Any]]:
        """Correlate findings and related events by common entities (IP and User).

        Args:
            findings: Detection findings to cluster.
            events: Security events to attach as supporting evidence.
            window_minutes: Temporal correlation threshold.

        Returns:
            List of correlated incident payload dictionaries.
        """
        if not findings:
            return []

        window_delta = timedelta(minutes=window_minutes or self.default_window_minutes)
        events_by_id = {e.id: e for e in events if e.id is not None}

        # Step 1: Group findings by primary entity (source_ip, or username)
        entity_clusters: dict[str, list[DetectionFinding]] = defaultdict(list)
        for f in findings:
            key = f.source_ip or f.username or "unknown_entity"
            entity_clusters[key].append(f)

        incidents_data: list[dict[str, Any]] = []

        for entity_key, cluster_findings in entity_clusters.items():
            # Sort findings chronologically
            sorted_findings = sorted(cluster_findings, key=lambda f: f.timestamp)

            # Subdivide into temporal chains if time gap exceeds correlation window
            chains: list[list[DetectionFinding]] = []
            current_chain: list[DetectionFinding] = [sorted_findings[0]]

            for f in sorted_findings[1:]:
                if f.timestamp - current_chain[-1].timestamp <= window_delta:
                    current_chain.append(f)
                else:
                    chains.append(current_chain)
                    current_chain = [f]
            chains.append(current_chain)

            for chain in chains:
                # Aggregate finding IDs and evidence event IDs
                finding_ids: list[int] = [f.id for f in chain if f.id is not None]
                all_event_ids: set[int] = set()
                for f in chain:
                    all_event_ids.update(f.evidence_event_ids)

                first_seen = min(f.first_seen for f in chain)
                last_seen = max(f.last_seen for f in chain)

                # Attach surrounding context events for same entity within [first_seen - 5m, last_seen + 5m]
                context_window_start = first_seen - timedelta(minutes=5)
                context_window_end = last_seen + timedelta(minutes=5)

                primary_ip: str | None = None
                affected_user: str | None = None

                for f in chain:
                    if f.source_ip and not primary_ip:
                        primary_ip = f.source_ip
                    if f.username and not affected_user:
                        affected_user = f.username

                for ev in events:
                    if ev.id is not None and ev.timestamp >= context_window_start and ev.timestamp <= context_window_end:
                        if (primary_ip and ev.source_ip == primary_ip) or (affected_user and ev.username == affected_user):
                            all_event_ids.add(ev.id)

                incident_events = [events_by_id[eid] for eid in all_event_ids if eid in events_by_id]
                incident_events.sort(key=lambda e: e.timestamp)

                # Step 2: Reconstruct Attack Stages
                stages = self._reconstruct_attack_stages(chain, incident_events)

                # Step 3: Compute Explainable Risk Score
                risk_score, risk_factors, severity, confidence = self._compute_risk_score(chain, incident_events)

                # Step 4: Generate Deterministic Structured Explanation
                explanation = self._generate_explanation(
                    chain=chain,
                    events=incident_events,
                    stages=stages,
                    primary_ip=primary_ip,
                    affected_user=affected_user,
                )

                # Step 5: Derive Title & Summary
                highest_stage = stages[-1].name if stages else "Suspicious Activity"
                title = self._generate_title(chain, primary_ip, affected_user, highest_stage)
                summary = (
                    f"Correlated attack sequence identified involving IP {primary_ip or 'unknown'} "
                    f"and user '{affected_user or 'unknown'}'. {len(chain)} detection findings and "
                    f"{len(incident_events)} evidence events across {len(stages)} attack stages."
                )

                incidents_data.append({
                    "title": title,
                    "severity": severity,
                    "risk_score": risk_score,
                    "confidence": confidence,
                    "primary_ip": primary_ip,
                    "affected_user": affected_user,
                    "first_seen": first_seen,
                    "last_seen": last_seen,
                    "summary": summary,
                    "attack_stage": highest_stage,
                    "risk_factors": [rf.model_dump(mode="json") for rf in risk_factors],
                    "stages": [s.model_dump(mode="json") for s in stages],
                    "explanation": explanation.model_dump(mode="json"),
                    "finding_ids": finding_ids,
                    "event_ids": sorted(list(all_event_ids)),
                })

        return incidents_data

    def _reconstruct_attack_stages(
        self,
        findings: list[DetectionFinding],
        events: list[SecurityEvent],
    ) -> list[AttackStage]:
        """Reconstruct the sequence of attack stages supported by evidence."""
        stages: list[AttackStage] = []
        stage_num = 1

        # Stage 1: Reconnaissance
        port_scan_findings = [f for f in findings if f.rule_id == "RULE_PORT_SCAN"]
        port_scan_events = [e for e in events if e.event_type.upper() in ("PORT_SCAN", "FIREWALL_BLOCK")]
        if port_scan_findings or port_scan_events:
            ts = port_scan_findings[0].timestamp if port_scan_findings else port_scan_events[0].timestamp
            desc = (
                f"Network reconnaissance detected with {len(port_scan_events)} probe events "
                f"targeting internal assets."
            )
            stages.append(
                AttackStage(
                    stage_number=stage_num,
                    name="Reconnaissance",
                    status="detected",
                    timestamp=ts,
                    description=desc,
                    finding_ids=[f.id for f in port_scan_findings if f.id is not None],
                    event_ids=[e.id for e in port_scan_events if e.id is not None],
                )
            )
            stage_num += 1

        # Stage 2: Credential Access / Brute Force
        bf_findings = [f for f in findings if f.rule_id == "RULE_BRUTE_FORCE"]
        bf_events = [e for e in events if e.event_type.upper() == "LOGIN_FAILED"]
        if bf_findings or len(bf_events) >= 3:
            ts = bf_findings[0].timestamp if bf_findings else bf_events[0].timestamp
            desc = f"Repeated authentication failures ({len(bf_events)} attempts) targeting user account credentials."
            stages.append(
                AttackStage(
                    stage_number=stage_num,
                    name="Credential Access",
                    status="detected",
                    timestamp=ts,
                    description=desc,
                    finding_ids=[f.id for f in bf_findings if f.id is not None],
                    event_ids=[e.id for e in bf_events if e.id is not None],
                )
            )
            stage_num += 1

        # Stage 3: Initial Access / Compromise
        login_success_findings = [
            f for f in findings
            if f.rule_id in ("RULE_SUCCESS_AFTER_BRUTE_FORCE", "RULE_SUSPICIOUS_LOGIN")
        ]
        login_success_events = [e for e in events if e.event_type.upper() in ("LOGIN_SUCCESS", "VPN_LOGIN")]
        if login_success_findings or (login_success_events and stage_num > 1):
            ts = login_success_findings[0].timestamp if login_success_findings else login_success_events[0].timestamp
            desc = "Successful authentication following reconnaissance and credential probing, achieving initial access."
            stages.append(
                AttackStage(
                    stage_number=stage_num,
                    name="Initial Access",
                    status="detected",
                    timestamp=ts,
                    description=desc,
                    finding_ids=[f.id for f in login_success_findings if f.id is not None],
                    event_ids=[e.id for e in login_success_events if e.id is not None],
                )
            )
            stage_num += 1

        # Stage 4: Privilege Escalation
        priv_esc_findings = [f for f in findings if f.rule_id == "RULE_PRIVILEGE_ESCALATION"]
        priv_esc_events = [
            e for e in events
            if e.event_type.upper() == "PRIVILEGE_ESCALATION"
            or (e.action and e.action.lower() in ("sudo", "su", "privilege_change"))
        ]
        if priv_esc_findings or priv_esc_events:
            ts = priv_esc_findings[0].timestamp if priv_esc_findings else priv_esc_events[0].timestamp
            desc = "Administrative privilege escalation executed to gain elevated system privileges."
            stages.append(
                AttackStage(
                    stage_number=stage_num,
                    name="Privilege Escalation",
                    status="detected",
                    timestamp=ts,
                    description=desc,
                    finding_ids=[f.id for f in priv_esc_findings if f.id is not None],
                    event_ids=[e.id for e in priv_esc_events if e.id is not None],
                )
            )
            stage_num += 1

        # Stage 5: Execution & Data Access
        data_events = [
            e for e in events
            if e.event_type.upper() in ("DATABASE_ACCESS", "FILE_ACCESS", "OUTBOUND_TRANSFER")
        ]
        if data_events:
            ts = data_events[0].timestamp
            actions_list = {e.event_type for e in data_events}
            desc = f"Access to sensitive data assets and database resources ({', '.join(sorted(actions_list))})."
            stages.append(
                AttackStage(
                    stage_number=stage_num,
                    name="Data Access & Impact",
                    status="detected",
                    timestamp=ts,
                    description=desc,
                    finding_ids=[],
                    event_ids=[e.id for e in data_events if e.id is not None],
                )
            )

        return stages

    def _compute_risk_score(
        self,
        findings: list[DetectionFinding],
        events: list[SecurityEvent],
    ) -> tuple[float, list[RiskFactor], str, float]:
        """Calculate explainable weighted risk score (0-100) and factor breakdown."""
        score = 0.0
        factors: list[RiskFactor] = []

        rule_counts: dict[str, int] = defaultdict(int)
        for f in findings:
            rule_counts[f.rule_id] += 1

        # Factor 1: Brute Force
        if "RULE_BRUTE_FORCE" in rule_counts:
            score += 30.0
            factors.append(
                RiskFactor(
                    factor="Brute Force Credential Attack",
                    points=30.0,
                    description="Multiple failed login attempts exceeding detection threshold.",
                )
            )

        # Factor 2: Success After Failures
        if "RULE_SUCCESS_AFTER_BRUTE_FORCE" in rule_counts:
            score += 25.0
            factors.append(
                RiskFactor(
                    factor="Account Compromise / Successful Login",
                    points=25.0,
                    description="Successful authentication immediately following repeated failures.",
                )
            )

        # Factor 3: Privilege Escalation
        if "RULE_PRIVILEGE_ESCALATION" in rule_counts:
            score += 25.0
            factors.append(
                RiskFactor(
                    factor="Privilege Escalation Detected",
                    points=25.0,
                    description="Administrative elevation or sudo execution during suspicious session.",
                )
            )

        # Factor 4: Reconnaissance
        if "RULE_PORT_SCAN" in rule_counts:
            score += 15.0
            factors.append(
                RiskFactor(
                    factor="Network Reconnaissance",
                    points=15.0,
                    description="Port scanning or probe attempts targeting internal assets.",
                )
            )

        # Factor 5: Suspicious Login Multi-IP
        if "RULE_SUSPICIOUS_LOGIN" in rule_counts:
            score += 10.0
            factors.append(
                RiskFactor(
                    factor="Anomalous Multi-IP Access",
                    points=10.0,
                    description="User account authenticated across multiple distinct IP addresses.",
                )
            )

        # Factor 6: Sensitive File/DB Activity
        sensitive_events = [
            e for e in events
            if e.event_type.upper() in ("DATABASE_ACCESS", "FILE_ACCESS", "OUTBOUND_TRANSFER")
        ]
        if sensitive_events:
            score += 10.0
            factors.append(
                RiskFactor(
                    factor="Sensitive Asset Access",
                    points=10.0,
                    description=f"Observed {len(sensitive_events)} data access / transfer events following compromise.",
                )
            )

        # Cap score at 100.0
        final_score = min(score, 100.0)

        # Determine severity
        if final_score >= 80.0:
            severity = "critical"
        elif final_score >= 60.0:
            severity = "high"
        elif final_score >= 40.0:
            severity = "medium"
        else:
            severity = "low"

        # Calculate average confidence
        conf_scores = [f.confidence for f in findings if f.confidence is not None]
        avg_confidence = round(sum(conf_scores) / len(conf_scores), 2) if conf_scores else 0.85

        return final_score, factors, severity, avg_confidence

    def _generate_explanation(
        self,
        chain: list[DetectionFinding],
        events: list[SecurityEvent],
        stages: list[AttackStage],
        primary_ip: str | None,
        affected_user: str | None,
    ) -> IncidentExplanation:
        """Generate a deterministic, structured natural-language narrative of the attack sequence."""
        stages_names = [s.name for s in stages]

        what_happened = (
            f"An intrusion sequence originating from IP {primary_ip or 'unknown'} targeted "
            f"user account '{affected_user or 'unknown'}'. The attack progressed through "
            f"{len(stages)} distinct stages: {' -> '.join(stages_names)}."
        )

        why_suspicious = (
            "The activity exhibited a rapid progression from external reconnaissance and automated "
            "credential probing to successful login and subsequent administrative escalation within a "
            "correlated time window. Multiple deterministic security rules were triggered."
        )

        what_happened_next = (
            "Following initial access and privilege elevation, the actor executed privileged commands "
            "and probed database / file assets."
            if any("Privilege Escalation" in s for s in stages_names)
            else "The actor attempted multiple unauthorized access steps."
        )

        evidence_summary = (
            f"Supported by {len(chain)} correlated detection findings and {len(events)} individual "
            f"forensic log records across authentication, network, and server subsystems."
        )

        recommended_action = (
            f"1. Immediately block source IP {primary_ip or 'unknown'} at the perimeter firewall.\n"
            f"2. Terminate active sessions and force password reset for user '{affected_user or 'unknown'}'.\n"
            f"3. Audit recent sudo and database access logs for data tampering or exfiltration.\n"
            f"4. Inspect host logs for persistence mechanisms."
        )

        return IncidentExplanation(
            what_happened=what_happened,
            why_suspicious=why_suspicious,
            what_happened_next=what_happened_next,
            evidence_summary=evidence_summary,
            recommended_action=recommended_action,
        )

    def _generate_title(
        self,
        findings: list[DetectionFinding],
        primary_ip: str | None,
        affected_user: str | None,
        highest_stage: str,
    ) -> str:
        """Derive an informative incident title."""
        if any(f.rule_id == "RULE_SUCCESS_AFTER_BRUTE_FORCE" for f in findings):
            return f"Credential Compromise & Breach on '{affected_user or 'unknown'}' from {primary_ip or 'IP'}"
        if any(f.rule_id == "RULE_BRUTE_FORCE" for f in findings):
            return f"Brute Force Authentication Attack against '{affected_user or 'unknown'}'"
        if any(f.rule_id == "RULE_PORT_SCAN" for f in findings):
            return f"Network Reconnaissance and Port Scan from {primary_ip or 'IP'}"
        return f"Suspicious Activity ({highest_stage}) by {primary_ip or affected_user or 'Unknown'}"

    def run_on_database(
        self,
        db: Session,
        request: CorrelationRunRequest,
    ) -> CorrelationRunResponse:
        """Run correlation on stored detection findings and events, creating or updating incidents.

        Args:
            db: SQLAlchemy session.
            request: Correlation parameters.

        Returns:
            CorrelationRunResponse with created incidents.
        """
        findings_query = select(DetectionFinding).order_by(DetectionFinding.timestamp.asc())
        findings_seq: Sequence[DetectionFinding] = db.execute(findings_query).scalars().all()
        findings = list(findings_seq)

        events_query = select(SecurityEvent).order_by(SecurityEvent.timestamp.asc())
        events_seq: Sequence[SecurityEvent] = db.execute(events_query).scalars().all()
        events = list(events_seq)

        if not findings:
            return CorrelationRunResponse(
                success=True,
                findings_analyzed=0,
                incidents_created=0,
                incidents_updated=0,
                message="No detection findings available to correlate. Run detection engine first.",
                incidents=[],
            )

        incidents_data = self.correlate(
            findings=findings,
            events=events,
            window_minutes=request.time_window_minutes,
        )

        persisted_incidents: list[Incident] = []

        for idx, inc_dict in enumerate(incidents_data, start=1):
            inc_num = f"TRX-{idx:03d}"

            existing = db.execute(select(Incident).where(Incident.incident_number == inc_num)).scalar_one_or_none()

            if existing:
                existing.title = inc_dict["title"]
                existing.severity = inc_dict["severity"]
                existing.risk_score = inc_dict["risk_score"]
                existing.confidence = inc_dict["confidence"]
                existing.primary_ip = inc_dict["primary_ip"]
                existing.affected_user = inc_dict["affected_user"]
                existing.first_seen = inc_dict["first_seen"]
                existing.last_seen = inc_dict["last_seen"]
                existing.summary = inc_dict["summary"]
                existing.attack_stage = inc_dict["attack_stage"]
                existing.risk_factors = inc_dict["risk_factors"]
                existing.stages = inc_dict["stages"]
                existing.explanation = inc_dict["explanation"]
                existing.finding_ids = inc_dict["finding_ids"]
                existing.event_ids = inc_dict["event_ids"]
                existing.updated_at = datetime.now(timezone.utc)
                persisted_incidents.append(existing)
            else:
                new_inc = Incident(
                    incident_number=inc_num,
                    title=inc_dict["title"],
                    status="open",
                    severity=inc_dict["severity"],
                    risk_score=inc_dict["risk_score"],
                    confidence=inc_dict["confidence"],
                    primary_ip=inc_dict["primary_ip"],
                    affected_user=inc_dict["affected_user"],
                    first_seen=inc_dict["first_seen"],
                    last_seen=inc_dict["last_seen"],
                    summary=inc_dict["summary"],
                    attack_stage=inc_dict["attack_stage"],
                    risk_factors=inc_dict["risk_factors"],
                    stages=inc_dict["stages"],
                    explanation=inc_dict["explanation"],
                    finding_ids=inc_dict["finding_ids"],
                    event_ids=inc_dict["event_ids"],
                )
                db.add(new_inc)
                persisted_incidents.append(new_inc)

        db.commit()
        for pi in persisted_incidents:
            db.refresh(pi)

        response_incidents = [
            IncidentResponse(
                id=pi.id,
                incident_number=pi.incident_number,
                title=pi.title,
                status=pi.status,
                severity=pi.severity,
                risk_score=pi.risk_score,
                confidence=pi.confidence,
                primary_ip=pi.primary_ip,
                affected_user=pi.affected_user,
                first_seen=pi.first_seen,
                last_seen=pi.last_seen,
                summary=pi.summary,
                attack_stage=pi.attack_stage,
                risk_factors=[RiskFactor(**rf) for rf in pi.risk_factors],
                stages=[AttackStage(**s) for s in pi.stages],
                explanation=pi.explanation,
                finding_ids=pi.finding_ids,
                event_ids=pi.event_ids,
                created_at=pi.created_at,
                updated_at=pi.updated_at,
            )
            for pi in persisted_incidents
        ]

        logger.info(
            "Correlation run completed | findings=%d incidents=%d",
            len(findings),
            len(persisted_incidents),
        )

        return CorrelationRunResponse(
            success=True,
            findings_analyzed=len(findings),
            incidents_created=len(persisted_incidents),
            incidents_updated=0,
            message=f"Correlation engine created {len(persisted_incidents)} correlated incident(s) from {len(findings)} findings.",
            incidents=response_incidents,
        )

    def build_timeline(
        self,
        incident: Incident,
        events: list[SecurityEvent],
        findings: list[DetectionFinding],
    ) -> AttackTimelineResponse:
        """Construct a unified chronological timeline for an incident."""
        timeline_items: list[TimelineItem] = []
        events_map = {e.id: e for e in events if e.id is not None}
        findings_map = {f.id: f for f in findings if f.id is not None}

        # 1. Add relevant events
        for eid in incident.event_ids:
            if eid in events_map:
                ev = events_map[eid]
                is_milestone = ev.event_type.upper() in (
                    "LOGIN_SUCCESS",
                    "PRIVILEGE_ESCALATION",
                    "OUTBOUND_TRANSFER",
                )
                title = f"{ev.event_type.replace('_', ' ').title()}"
                if ev.action:
                    title += f" ({ev.action})"

                desc = f"Source: {ev.source} | IP: {ev.source_ip or 'N/A'} | User: {ev.username or 'N/A'}"
                if ev.metadata_:
                    desc += f" | Metadata: {ev.metadata_}"

                timeline_items.append(
                    TimelineItem(
                        id=f"ev-{ev.id}",
                        item_type="event",
                        timestamp=ev.timestamp,
                        title=title,
                        description=desc,
                        severity=ev.severity,
                        event_type=ev.event_type,
                        source_ip=ev.source_ip,
                        username=ev.username,
                        action=ev.action,
                        is_key_milestone=is_milestone,
                        evidence_id=ev.id,
                        metadata=ev.metadata_,
                    )
                )

        # 2. Add relevant findings
        for fid in incident.finding_ids:
            if fid in findings_map:
                f = findings_map[fid]
                timeline_items.append(
                    TimelineItem(
                        id=f"fd-{f.id}",
                        item_type="finding",
                        timestamp=f.timestamp,
                        title=f"ALERT: {f.rule_name}",
                        description=f.description,
                        severity=f.severity,
                        rule_id=f.rule_id,
                        source_ip=f.source_ip,
                        username=f.username,
                        is_key_milestone=True,
                        evidence_id=f.id,
                        metadata=f.metadata_,
                    )
                )

        # Sort strictly by timestamp
        timeline_items.sort(key=lambda item: item.timestamp)

        return AttackTimelineResponse(
            incident_id=incident.id,
            incident_number=incident.incident_number,
            total_items=len(timeline_items),
            timeline=timeline_items,
        )

    def build_attack_graph(self, incident: Incident) -> AttackGraphResponse:
        """Construct nodes and directed edges for the interactive attack reconstruction graph."""
        nodes: list[GraphNode] = []
        edges: list[GraphEdge] = []

        attacker_ip = incident.primary_ip or "External-Threat-Actor"
        nodes.append(
            GraphNode(
                id="attacker_node",
                type="attacker_ip",
                label=f"Threat Origin: {attacker_ip}",
                subtitle="Source IP / Reconnaissance Probe",
                severity="critical" if incident.severity == "critical" else "high",
                data={"ip": attacker_ip, "country": "External Internet"},
            )
        )

        prev_node_id = "attacker_node"

        for idx, stage in enumerate(incident.stages):
            stage_node_id = f"stage_node_{idx + 1}"
            nodes.append(
                GraphNode(
                    id=stage_node_id,
                    type="attack_stage",
                    label=f"Stage {stage['stage_number']}: {stage['name']}",
                    subtitle=stage["description"][:60] + "...",
                    severity="high",
                    data={
                        "stage_number": stage["stage_number"],
                        "name": stage["name"],
                        "description": stage["description"],
                        "timestamp": str(stage["timestamp"]),
                    },
                )
            )

            edges.append(
                GraphEdge(
                    id=f"edge_{prev_node_id}_{stage_node_id}",
                    source=prev_node_id,
                    target=stage_node_id,
                    label=f"Progresses to {stage['name']}",
                    animated=True,
                )
            )
            prev_node_id = stage_node_id

        if incident.affected_user:
            user_node_id = "user_node"
            nodes.append(
                GraphNode(
                    id=user_node_id,
                    type="target_user",
                    label=f"Compromised User: {incident.affected_user}",
                    subtitle="Account Identity Credential",
                    severity="critical",
                    data={"username": incident.affected_user},
                )
            )
            edges.append(
                GraphEdge(
                    id=f"edge_{prev_node_id}_{user_node_id}",
                    source=prev_node_id,
                    target=user_node_id,
                    label="Account Controlled",
                    animated=True,
                )
            )

        asset_node_id = "asset_node"
        nodes.append(
            GraphNode(
                id=asset_node_id,
                type="target_asset",
                label="Target Resource: Core Database / Host",
                subtitle="High-Value Internal Asset",
                severity="high",
                data={"asset_type": "Database / Linux Host"},
            )
        )
        edges.append(
            GraphEdge(
                id=f"edge_{prev_node_id}_{asset_node_id}",
                source=prev_node_id,
                target=asset_node_id,
                label="Impacted Resource",
                animated=True,
            )
        )

        return AttackGraphResponse(
            incident_id=incident.id,
            nodes=nodes,
            edges=edges,
        )


_global_correlation_engine: CorrelationEngine | None = None


def get_correlation_engine() -> CorrelationEngine:
    """Return the global correlation engine singleton."""
    global _global_correlation_engine
    if _global_correlation_engine is None:
        _global_correlation_engine = CorrelationEngine()
    return _global_correlation_engine
