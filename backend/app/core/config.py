"""Application configuration using pydantic-settings.

Loads configuration from environment variables and .env files.
Provides type-safe access to all application settings.
"""

from functools import lru_cache
from typing import Literal

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
    app_name: str = "TraceX"
    app_version: str = "0.1.0"

    # Database
    database_url: str = "sqlite:///./tracex.db"

    @property
    def is_sqlite(self) -> bool:
        """Check if the database is SQLite (for local dev without PostgreSQL)."""
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    """Get cached application settings singleton."""
    return Settings()
