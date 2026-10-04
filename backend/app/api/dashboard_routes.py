"""API routes for SOC dashboard statistics and executive summary metrics.

Provides:
- GET /api/stats/dashboard — Aggregated security metrics, activity charts, and top threats
"""

from collections import Counter, defaultdict

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
    """Calculate and return overall SOC dashboard statistics."""
    # 1. Total events
    total_events = db.execute(select(func.count(SecurityEvent.id))).scalar() or 0

    # 2. Suspicious events (severity not info/low)
    suspicious_events = (
        db.execute(
            select(func.count(SecurityEvent.id)).where(
                SecurityEvent.severity.in_(["medium", "high", "critical"])
            )
        ).scalar()
        or 0
    )

    # 3. Detections & Severities
    total_detections = db.execute(select(func.count(DetectionFinding.id))).scalar() or 0
    critical_findings = (
        db.execute(
            select(func.count(DetectionFinding.id)).where(DetectionFinding.severity == "critical")
        ).scalar()
        or 0
    )
    high_findings = (
        db.execute(
            select(func.count(DetectionFinding.id)).where(DetectionFinding.severity == "high")
        ).scalar()
        or 0
    )

    # 4. Active incidents
    active_incidents = (
        db.execute(
            select(func.count(Incident.id)).where(Incident.status.in_(["open", "investigating"]))
        ).scalar()
        or 0
    )

    # Average risk score
    avg_risk_raw = db.execute(select(func.avg(Incident.risk_score))).scalar()
    avg_risk = round(float(avg_risk_raw), 1) if avg_risk_raw else 0.0

    # 5. Top Suspicious IPs (from findings and high-severity events)
    findings = list(db.execute(select(DetectionFinding)).scalars().all())
    ip_counter = Counter(f.source_ip for f in findings if f.source_ip)
    top_ips = [
        {"ip": ip, "count": count, "risk_level": "Critical" if count >= 3 else "High"}
        for ip, count in ip_counter.most_common(5)
    ]

    # 6. Top Targeted Users
    user_counter = Counter(f.username for f in findings if f.username)
    top_users = [
        {"username": user, "count": count, "impact": "High" if count >= 3 else "Medium"}
        for user, count in user_counter.most_common(5)
    ]

    # 7. Event distribution by type
    events = list(db.execute(select(SecurityEvent)).scalars().all())
    type_counter = Counter(e.event_type for e in events)
    event_distribution = [
        {"name": etype, "value": count}
        for etype, count in type_counter.most_common(8)
    ]

    # 8. Activity over time (hourly buckets or sorted chronological chunks)
    recent_activity: list[dict] = []
    if events:
        sorted_events = sorted(events, key=lambda e: e.timestamp)
        # Group by 10-minute intervals for smooth chart
        time_buckets: dict[str, dict] = defaultdict(lambda: {"total": 0, "suspicious": 0})
        for ev in sorted_events:
            bucket_key = ev.timestamp.strftime("%H:%M")
            time_buckets[bucket_key]["total"] += 1
            if ev.severity in ("medium", "high", "critical"):
                time_buckets[bucket_key]["suspicious"] += 1

        recent_activity = [
            {"time": k, "events": v["total"], "suspicious": v["suspicious"]}
            for k, v in list(time_buckets.items())[-15:]
        ]

    return DashboardStatsResponse(
        total_events=total_events,
        suspicious_events=suspicious_events,
        total_detections=total_detections,
        active_incidents=active_incidents,
        critical_findings=critical_findings,
        high_findings=high_findings,
        average_risk_score=avg_risk,
        top_suspicious_ips=top_ips,
        top_targeted_users=top_users,
        event_distribution=event_distribution,
        recent_activity=recent_activity,
    )
