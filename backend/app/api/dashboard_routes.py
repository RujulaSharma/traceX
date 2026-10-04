"""API routes for SOC dashboard statistics and executive summary metrics.

Provides:
- GET /api/stats/dashboard — Aggregated security metrics, activity charts, and top threats
"""

from collections import Counter, defaultdict
from typing import cast

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.detection import DetectionFinding
from app.models.event import SecurityEvent
from app.models.incident import Incident
from app.schemas.incident import DashboardStatsResponse

router = APIRouter(prefix="/stats", tags=["SOC Dashboard"])


@router.get(
    "/dashboard",
    response_model=DashboardStatsResponse,
    summary="Get SOC dashboard metrics",
    description="Returns aggregated metrics, active incidents, severity distributions, and threat statistics.",
)
def get_dashboard_stats(db: Session = Depends(get_db)) -> DashboardStatsResponse:
    """Calculate and return overall SOC dashboard statistics.

    Provides full compatibility with both the frontend DashboardStats interface
    and backend integration tests.
    """
    # 1. Total events
    total_events: int = (
        db.execute(select(func.count(SecurityEvent.id))).scalar() or 0
    )

    # 2. Suspicious events (severity not info/low)
    suspicious_events: int = (
        db.execute(
            select(func.count(SecurityEvent.id)).where(
                SecurityEvent.severity.in_(["medium", "high", "critical"])
            )
        ).scalar()
        or 0
    )

    # 3. Detections & Severities
    total_detections: int = (
        db.execute(select(func.count(DetectionFinding.id))).scalar() or 0
    )
    critical_findings: int = (
        db.execute(
            select(func.count(DetectionFinding.id)).where(DetectionFinding.severity == "critical")
        ).scalar()
        or 0
    )
    high_findings: int = (
        db.execute(
            select(func.count(DetectionFinding.id)).where(DetectionFinding.severity == "high")
        ).scalar()
        or 0
    )

    # 4. Incidents
    total_incidents: int = (
        db.execute(select(func.count(Incident.id))).scalar() or 0
    )
    active_incidents: int = (
        db.execute(
            select(func.count(Incident.id)).where(Incident.status.in_(["open", "investigating"]))
        ).scalar()
        or 0
    )
    critical_incidents: int = (
        db.execute(
            select(func.count(Incident.id)).where(Incident.severity == "critical")
        ).scalar()
        or 0
    )
    high_incidents: int = (
        db.execute(
            select(func.count(Incident.id)).where(Incident.severity == "high")
        ).scalar()
        or 0
    )

    avg_risk_raw = db.execute(select(func.avg(Incident.risk_score))).scalar()
    avg_risk_score: float = round(float(avg_risk_raw), 1) if avg_risk_raw else 0.0

    # 5. Events & Findings in-memory aggregations
    events = list(db.execute(select(SecurityEvent)).scalars().all())
    findings = list(db.execute(select(DetectionFinding)).scalars().all())

    # events_by_type & legacy event_distribution
    type_counter = Counter(e.event_type for e in events)
    events_by_type = [
        {"event_type": etype, "count": count}
        for etype, count in type_counter.most_common(12)
    ]
    event_distribution = [
        {"name": etype, "value": count}
        for etype, count in type_counter.most_common(8)
    ]

    # events_by_severity
    severity_counter = Counter(e.severity for e in events)
    events_by_severity = [
        {"severity": sev, "count": count}
        for sev, count in severity_counter.most_common()
    ]

    # detections_by_rule
    rule_counter = Counter(f.rule_name for f in findings)
    detections_by_rule = [
        {"rule_name": rname, "count": count}
        for rname, count in rule_counter.most_common()
    ]

    # top_suspicious_ips (with both max_severity and risk_level for compatibility)
    ip_findings: dict[str, list[str]] = {}
    for f in findings:
        if f.source_ip:
            ip_findings.setdefault(f.source_ip, []).append(f.severity or "info")
    severity_order = {"critical": 4, "high": 3, "medium": 2, "low": 1, "info": 0}
    top_suspicious_ips = sorted(
        [
            {
                "ip": ip,
                "count": len(sevs),
                "max_severity": max(sevs, key=lambda s: severity_order.get(s, 0)),
                "risk_level": "Critical" if len(sevs) >= 3 else "High",
            }
            for ip, sevs in ip_findings.items()
        ],
        key=lambda x: cast(int, x["count"]),
        reverse=True,
    )[:5]

    # top_targeted_users (with both max_severity and impact for compatibility)
    user_findings: dict[str, list[str]] = {}
    for f in findings:
        if f.username:
            user_findings.setdefault(f.username, []).append(f.severity or "info")
    top_targeted_users = sorted(
        [
            {
                "username": user,
                "count": len(sevs),
                "max_severity": max(sevs, key=lambda s: severity_order.get(s, 0)),
                "impact": "High" if len(sevs) >= 3 else "Medium",
            }
            for user, sevs in user_findings.items()
        ],
        key=lambda x: cast(int, x["count"]),
        reverse=True,
    )[:5]

    # recent_timeline and legacy recent_activity
    recent_timeline: list[dict] = []
    recent_activity: list[dict] = []
    if events:
        sorted_events = sorted(events, key=lambda e: e.timestamp)
        # minute bucket for timeline
        bucket: dict[str, int] = {}
        # 10-minute intervals for smooth chart
        time_buckets: dict[str, dict] = defaultdict(lambda: {"total": 0, "suspicious": 0})
        for ev in sorted_events:
            bucket_key = ev.timestamp.strftime("%Y-%m-%dT%H:%M")
            bucket[bucket_key] = bucket.get(bucket_key, 0) + 1

            act_key = ev.timestamp.strftime("%H:%M")
            time_buckets[act_key]["total"] += 1
            if ev.severity in ("medium", "high", "critical"):
                time_buckets[act_key]["suspicious"] += 1

        recent_timeline = [
            {"timestamp": k, "count": v} for k, v in list(bucket.items())[-20:]
        ]
        recent_activity = [
            {"time": k, "events": v["total"], "suspicious": v["suspicious"]}
            for k, v in list(time_buckets.items())[-15:]
        ]

    return DashboardStatsResponse(
        total_events=total_events,
        suspicious_events=suspicious_events,
        total_detections=total_detections,
        total_incidents=total_incidents,
        active_incidents=active_incidents,
        critical_incidents=critical_incidents,
        high_incidents=high_incidents,
        critical_findings=critical_findings,
        high_findings=high_findings,
        avg_risk_score=avg_risk_score,
        average_risk_score=avg_risk_score,
        events_by_type=events_by_type,
        events_by_severity=events_by_severity,
        detections_by_rule=detections_by_rule,
        top_suspicious_ips=top_suspicious_ips,
        top_targeted_users=top_targeted_users,
        event_distribution=event_distribution,
        recent_activity=recent_activity,
        recent_timeline=recent_timeline,
    )
