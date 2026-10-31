"""
ReguloMe — Custom Exception Classes & Handlers
Structured error responses for the API.
"""
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional


# --- Custom exceptions ---
class ReguloMeError(Exception):
    """Base exception for all ReguloMe domain errors."""

    def __init__(self, message: str, code: str = "INTERNAL_ERROR", status_code: int = 500):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(self.message)


class PersonaNotFoundError(ReguloMeError):
    def __init__(self, persona_id: str):
        super().__init__(
            message=f"Demo persona '{persona_id}' not found",
            code="PERSONA_NOT_FOUND",
            status_code=404,
        )


class VariantNotFoundError(ReguloMeError):
    def __init__(self, variant_id: str):
        super().__init__(
            message=f"Variant '{variant_id}' not found",
            code="VARIANT_NOT_FOUND",
            status_code=404,
        )


class InvalidFileError(ReguloMeError):
    def __init__(self, detail: str):
        super().__init__(
            message=f"Invalid file upload: {detail}",
            code="INVALID_FILE",
            status_code=400,
        )


class PipelineError(ReguloMeError):
    def __init__(self, detail: str):
        super().__init__(
            message=f"Pipeline processing failed: {detail}",
            code="PIPELINE_ERROR",
            status_code=500,
        )


class AuthenticationError(ReguloMeError):
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            message=detail,
            code="AUTH_ERROR",
            status_code=401,
        )


class DuplicateEmailError(ReguloMeError):
    def __init__(self, email: str):
        super().__init__(
            message=f"An account with email '{email}' already exists",
            code="DUPLICATE_EMAIL",
            status_code=409,
        )


# --- Error response model ---
class ErrorResponse(BaseModel):
    error: str
    code: str
    detail: Optional[str] = None


# --- Register exception handlers on the app ---
def register_exception_handlers(app: FastAPI) -> None:
    """Attach structured error handlers to the FastAPI app."""

    @app.exception_handler(ReguloMeError)
    async def regulome_error_handler(request: Request, exc: ReguloMeError):
        return JSONResponse(
            status_code=exc.status_code,
            content=ErrorResponse(
                error=exc.message,
                code=exc.code,
            ).model_dump(),
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content=ErrorResponse(
                error=str(exc.detail),
                code=f"HTTP_{exc.status_code}",
            ).model_dump(),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(
                error="An unexpected error occurred",
                code="INTERNAL_ERROR",
                detail=str(exc),
            ).model_dump(),
        )
