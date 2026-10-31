"""
ReguloMe — Dashboard Router
Main dashboard summary endpoint — aggregated persona overview.
"""
from fastapi import APIRouter

from app.schemas.responses import DashboardResponse
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/{persona_id}", response_model=DashboardResponse)
async def get_dashboard(persona_id: str):
    """
    Get a comprehensive dashboard summary for a persona.
    Includes: regulatory age, top variants, tissue highlights,
    disease systems, habit snapshot, and weekly report summary.
    """
    return DashboardService.get_dashboard(persona_id)
