"""
ReguloMe — Personas Router
Endpoints for listing and retrieving demo personas.
"""
from fastapi import APIRouter

from app.schemas.responses import DemoPersona
from app.services.persona_service import PersonaService

router = APIRouter(prefix="/personas", tags=["personas"])


@router.get("", response_model=list[DemoPersona])
async def list_personas():
    """List all available demo personas."""
    return PersonaService.list_all()


@router.get("/{persona_id}", response_model=DemoPersona)
async def get_persona(persona_id: str):
    """Get a specific demo persona by ID."""
    return PersonaService.get_by_id(persona_id)
