"""Detection rules package."""

from app.detection.rules.brute_force import BruteForceDetectionRule
from app.detection.rules.port_scan import PortScanDetectionRule
from app.detection.rules.privilege_escalation import PrivilegeEscalationRule
from app.detection.rules.successful_login_after_failures import (
    SuccessfulLoginAfterFailuresRule,
)
from app.detection.rules.suspicious_login import SuspiciousLoginRule

__all__ = [
    "BruteForceDetectionRule",
    "SuccessfulLoginAfterFailuresRule",
    "PortScanDetectionRule",
    "PrivilegeEscalationRule",
    "SuspiciousLoginRule",
]
