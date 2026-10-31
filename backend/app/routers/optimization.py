"""
ReguloMe — Optimization Studio Router
Habit tracking, goals, and self-optimization endpoints.
"""
from fastapi import APIRouter

from app.schemas.responses import OptimizationResponse
from app.services.optimization_service import OptimizationService

router = APIRouter(prefix="/optimization", tags=["optimization"])


@router.get("/{persona_id}", response_model=OptimizationResponse)
async def get_optimization(persona_id: str):
    """
    Get self-optimization data for a persona.
    Returns tracked habits, goals, weekly scores, and streaks.
    """
    return OptimizationService.get_data(persona_id)
