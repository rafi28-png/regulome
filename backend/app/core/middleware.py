"""
ReguloMe — Middleware
Request logging, timing, and demo-mode header injection.
"""
import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.config import settings

logger = logging.getLogger("regulome")


class RequestTimingMiddleware(BaseHTTPMiddleware):
    """Add X-Process-Time header and log request duration."""

    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()
        response: Response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000

        response.headers["X-Process-Time-Ms"] = f"{duration_ms:.1f}"
        response.headers["X-ReguloMe-Version"] = settings.APP_VERSION
        response.headers["X-ReguloMe-Mode"] = "demo" if settings.DEMO_MODE else "real"

        # Log slow requests (> 500ms)
        if duration_ms > 500:
            logger.warning(
                f"SLOW REQUEST: {request.method} {request.url.path} "
                f"took {duration_ms:.1f}ms"
            )

        return response


class DemoModeMiddleware(BaseHTTPMiddleware):
    """
    In demo mode, inject demo context into request state.
    This allows services to check request.state.demo_mode
    without needing to import config everywhere.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        request.state.demo_mode = settings.DEMO_MODE
        request.state.app_version = settings.APP_VERSION
        response = await call_next(request)
        return response
