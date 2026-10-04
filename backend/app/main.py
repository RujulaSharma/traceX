"""TraceX FastAPI application.

Entry point for the backend. Configures:
- CORS middleware
- API routes
- Error handlers
- Database initialization
- Structured logging
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.dashboard_routes import router as dashboard_router
from app.api.detection_routes import router as detection_router
from app.api.incident_routes import router as incident_router
from app.api.routes import router
from app.core.config import get_settings
from app.core.database import init_db
from app.core.errors import register_error_handlers
from app.core.logging import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler.

    Runs setup on startup and cleanup on shutdown.
    """
    # Startup
    setup_logging()
    logger = logging.getLogger(__name__)

    settings = get_settings()
    logger.info(
        "TraceX starting | env=%s version=%s",
        settings.app_env,
        settings.app_version,
    )

    # Initialize database tables
    init_db()
    logger.info("Application started successfully")

    yield

    # Shutdown
    logger.info("TraceX shutting down")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        description=(
            "Security log analysis platform that detects, correlates, "
            "and explains attack sequences from authentication, network, "
            "and server logs."
        ),
        version=settings.app_version,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS middleware for frontend access
    allow_credentials = "*" not in settings.parsed_cors_origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.parsed_cors_origins,
        allow_credentials=allow_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register error handlers
    register_error_handlers(app)

    # Register API routes
    app.include_router(router, prefix="/api")
    app.include_router(detection_router, prefix="/api")
    app.include_router(incident_router, prefix="/api")
    app.include_router(dashboard_router, prefix="/api")

    return app


# Application instance used by uvicorn
app = create_app()
