"""Centralized error handling for the API.

Provides consistent error response format and prevents
internal details (stack traces, DB errors) from leaking
to API clients.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError


class AppError(Exception):
    """Base application error with user-safe message."""

    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class InvalidLogFormatError(AppError):
    """Raised when an uploaded file cannot be parsed."""

    def __init__(self, message: str = "The uploaded file could not be parsed."):
        super().__init__(
            code="INVALID_LOG_FORMAT",
            message=message,
            status_code=400,
        )


class DatabaseError(AppError):
    """Raised when a database operation fails."""

    def __init__(self, message: str = "A database error occurred."):
        super().__init__(
            code="DATABASE_ERROR",
            message=message,
            status_code=500,
        )


def register_error_handlers(app: FastAPI) -> None:
    """Register all error handlers on the FastAPI app."""

    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                },
            },
        )

    @app.exception_handler(ValidationError)
    async def validation_error_handler(
        request: Request, exc: ValidationError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Request validation failed.",
                    "details": exc.errors(),
                },
            },
        )

    @app.exception_handler(Exception)
    async def generic_error_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        # Log the full error internally but don't expose it
        import logging

        logging.getLogger(__name__).error(
            "Unhandled error: %s", str(exc), exc_info=True
        )
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An unexpected error occurred.",
                },
            },
        )
