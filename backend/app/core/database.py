"""Database connection and session management.

Provides SQLAlchemy engine and session factory for PostgreSQL
(or SQLite for local development).
"""

from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


def _build_engine_args() -> dict:
    """Build engine arguments based on database type."""
    settings = get_settings()
    args: dict = {
        "echo": settings.app_env == "development" and settings.log_level == "DEBUG",
    }
    if settings.is_sqlite:
        args["connect_args"] = {"check_same_thread": False}
    else:
        args["pool_size"] = 10
        args["max_overflow"] = 20
        args["pool_pre_ping"] = True
    return args


def get_engine():
    """Create and return a SQLAlchemy engine."""
    settings = get_settings()
    engine_args = _build_engine_args()
    engine = create_engine(settings.database_url, **engine_args)
    logger.info("Database engine created | url=%s", _mask_url(settings.database_url))
    return engine


def _mask_url(url: str) -> str:
    """Mask password in database URL for safe logging."""
    if "@" in url:
        # postgresql://user:password@host/db -> postgresql://user:***@host/db
        pre_at = url.split("@")[0]
        post_at = url.split("@")[1]
        if ":" in pre_at:
            scheme_user = pre_at.rsplit(":", 1)[0]
            return f"{scheme_user}:***@{post_at}"
    return url


# Global engine and session factory
engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that provides a database session.

    Yields a session and ensures it is closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database_health() -> dict:
    """Check if the database is reachable and responsive.

    Returns:
        dict with 'status' ('healthy' or 'unhealthy') and optional 'error'.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy"}
    except Exception as e:
        logger.error("Database health check failed: %s", str(e))
        return {"status": "unhealthy", "error": str(e)}


def init_db() -> None:
    """Create all database tables from models."""
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")
