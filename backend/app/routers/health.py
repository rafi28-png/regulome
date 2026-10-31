"""
ReguloMe — Health Check Router
"""
from fastapi import APIRouter
from app.schemas.responses import HealthResponse
from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint — verify the API is running."""
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        mode="demo" if settings.DEMO_MODE else "real",
        demo_personas_available=6,
    )


@router.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "Next-generation regulatory genomics platform API",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
