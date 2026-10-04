"""Port Scan and Network Reconnaissance detection rule.

Identifies potential network reconnaissance and port scanning by analyzing
repeated PORT_SCAN and FIREWALL_BLOCK events, or probes targeting multiple
distinct destination ports/IPs within a configurable time window.
"""

from collections import defaultdict
from datetime import timedelta
from typing import Any

from app.core.config import get_settings
from app.detection.base import BaseDetectionRule
from app.models.event import SecurityEvent
from app.schemas.detection import DetectionFindingCreate


class PortScanDetectionRule(BaseDetectionRule):
    """Detects port scanning and reconnaissance probes from a single source IP."""

    rule_id = "RULE_PORT_SCAN"
    rule_name = "Port Scan & Network Reconnaissance"
    detection_type = "reconnaissance"
    default_severity = "high"
    default_confidence = 0.85

    def __init__(
        self,
        threshold: int | None = None,
        window_minutes: int | None = None,
    ) -> None:
        settings = get_settings()
        self.threshold = threshold or settings.port_scan_threshold
        self.window_minutes = window_minutes or settings.port_scan_window_minutes

    def detect(self, events: list[SecurityEvent]) -> list[DetectionFindingCreate]:
        findings: list[DetectionFindingCreate] = []

        # Filter reconnaissance-related events
        recon_events = [
            e for e in events
            if e.source_ip and (
                e.event_type.upper() in ("PORT_SCAN", "FIREWALL_BLOCK")
                or (e.action and e.action.lower() in ("scan", "port_scan", "probe"))
            )
        ]

        if not recon_events:
            return findings

        # Group by source_ip
        grouped: dict[str, list[SecurityEvent]] = defaultdict(list)
        for e in recon_events:
            if e.source_ip:
                grouped[e.source_ip].append(e)

        window_delta = timedelta(minutes=self.window_minutes)

        for ip, ip_events in grouped.items():
            sorted_events = self._sort_events(ip_events)
            n = len(sorted_events)

            i = 0
            while i < n:
                window_start = sorted_events[i].timestamp
                window_end = window_start + window_delta

                window_events = [
                    e for e in sorted_events[i:]
                    if e.timestamp <= window_end
                ]

                # Extract distinct ports and destination IPs from events and metadata
                ports_scanned: set[Any] = set()
                dest_ips: set[str] = set()

                for ev in window_events:
                    if ev.destination_ip:
                        dest_ips.add(ev.destination_ip)
                    if ev.metadata_:
                        if "port" in ev.metadata_:
                            ports_scanned.add(ev.metadata_["port"])
                        if "ports_scanned" in ev.metadata_ and isinstance(ev.metadata_["ports_scanned"], list):
                            ports_scanned.update(ev.metadata_["ports_scanned"])

                # Effective probe count = total probe events OR total distinct ports scanned
                probe_metric = max(len(window_events), len(ports_scanned))

                if probe_metric >= self.threshold:
                    first_ev = window_events[0]
                    last_ev = window_events[-1]
                    total_evs = len(window_events)

                    description = (
                        f"Detected network reconnaissance / port scanning from IP {ip} "
                        f"(metric: {probe_metric}, events: {total_evs}, unique targets: {len(dest_ips)}) "
                        f"within {self.window_minutes} minutes."
                    )

                    metadata = {
                        "attacker_ip": ip,
                        "probe_count": probe_metric,
                        "event_count": total_evs,
                        "unique_ports": sorted([str(p) for p in ports_scanned]),
                        "destination_ips": sorted(list(dest_ips)),
                        "window_minutes": self.window_minutes,
                        "threshold": self.threshold,
                    }

                    finding = self._build_finding(
                        description=description,
                        first_event=first_ev,
                        last_event=last_ev,
                        evidence_events=window_events,
                        source_ip=ip,
                        username=first_ev.username,
                        metadata=metadata,
                    )
                    findings.append(finding)

                    i += len(window_events)
                else:
                    i += 1

        return findings
