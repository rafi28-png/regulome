"""
ReguloMe — Disease Hub Router
Disease/systems biology domain endpoints.
"""
from fastapi import APIRouter

from app.schemas.responses import DiseaseHubResponse
from app.services.disease_service import DiseaseService

router = APIRouter(prefix="/diseases", tags=["diseases"])


@router.get("/{persona_id}", response_model=DiseaseHubResponse)
async def get_disease_hub(persona_id: str):
    """
    Get the disease & systems biology hub for a persona.
    Returns all 12 disease/biology domains with variant counts,
    disrupted pathways, tissue impacts, and support strategies.
    """
    return DiseaseService.get_hub(persona_id)
