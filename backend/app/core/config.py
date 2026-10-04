"""Application configuration using pydantic-settings.

Loads configuration from environment variables and .env files.
Provides type-safe access to all application settings.
"""

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_env: Literal["development", "staging", "production"] = "development"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    port: int | None = Field(default=None, alias="PORT")
    app_name: str = "TraceX"
    app_version: str = "0.2.0"

    # CORS & Frontend
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    frontend_url: str | None = None

    # Database
    database_url: str = "sqlite:///./tracex.db"

    # Phase 2: Detection Engine Thresholds & Windows
    brute_force_threshold: int = 5
    brute_force_window_minutes: int = 5

    login_after_failures_threshold: int = 3
    login_after_failures_window_minutes: int = 10

    port_scan_threshold: int = 5
    port_scan_window_minutes: int = 5

    privilege_escalation_window_minutes: int = 15

    suspicious_login_ip_threshold: int = 2
    suspicious_login_window_hours: int = 24

    @property
    def effective_port(self) -> int:
        """Return dynamic PORT if provided by hosting environment, else app_port."""
        return self.port if self.port is not None else self.app_port

    @property
    def parsed_cors_origins(self) -> list[str]:
        """Parsed list of allowed CORS origins."""
        origins = [o.strip() for o in self.cors_origins.split(",") if o.strip()]
        if self.frontend_url and self.frontend_url.strip():
            cleaned = self.frontend_url.strip().rstrip("/")
            if cleaned not in origins:
                origins.append(cleaned)
        return origins

    @property
    def normalized_database_url(self) -> str:
        """Convert postgres:// to postgresql:// for SQLAlchemy compatibility."""
        url = self.database_url
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql://", 1)
        return url

    @property
    def is_sqlite(self) -> bool:
        """Check if the database is SQLite (for local dev without PostgreSQL)."""
        return self.normalized_database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    """Get cached application settings singleton."""
    return Settings()
