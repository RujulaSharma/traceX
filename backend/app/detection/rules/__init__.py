"""Detection rules package."""

from app.detection.rules.brute_force import BruteForceDetectionRule
from app.detection.rules.successful_login_after_failures import SuccessfulLoginAfterFailuresRule

__all__ = [
    "BruteForceDetectionRule",
    "SuccessfulLoginAfterFailuresRule",
]
