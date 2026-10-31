"""
ReguloMe — Epigenetic Clock Router
Epigenetic/regulatory age endpoints.
"""
from fastapi import APIRouter

from app.schemas.responses import EpigeneticAgeResponse
from app.services.epigenetic_service import EpigeneticService

router = APIRouter(prefix="/epigenetic", tags=["epigenetic"])


@router.get("/{persona_id}", response_model=EpigeneticAgeResponse)
async def get_epigenetic_age(persona_id: str):
    """
    Get epigenetic & regulatory age data for a persona.
    Returns chronological, epigenetic, and regulatory methylation ages
    plus trend/history data for visualization.
    """
    return EpigeneticService.get_age_data(persona_id)
