"""Structured application logging configuration.

Configures Python logging with structured format for
consistent log output across the application.
"""

import logging
import sys
from datetime import datetime, timezone

from app.core.config import get_settings


class StructuredFormatter(logging.Formatter):
    """Custom formatter that outputs structured log messages."""

    def format(self, record: logging.LogRecord) -> str:
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        level = record.levelname
        logger_name = record.name
        message = record.getMessage()

        log_line = f"{timestamp} | {level:<8} | {logger_name} | {message}"

        if record.exc_info and record.exc_info[0] is not None:
            log_line += f"\n{self.formatException(record.exc_info)}"

        return log_line


def setup_logging() -> None:
    """Configure application-wide logging."""
    settings = get_settings()

    # Create structured formatter
    formatter = StructuredFormatter()

    # Configure root handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    # Set up root logger
    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    root_logger.setLevel(getattr(logging, settings.log_level))

    # Reduce noise from third-party libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    logging.getLogger(__name__).info(
        "Logging configured | level=%s env=%s",
        settings.log_level,
        settings.app_env,
    )


def get_logger(name: str) -> logging.Logger:
    """Get a named logger instance."""
    return logging.getLogger(name)
