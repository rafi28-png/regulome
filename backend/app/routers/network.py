"""
ReguloMe — Network Router
Regulatory network graph endpoints (nodes + edges for D3.js visualization).
"""
from fastapi import APIRouter

from app.schemas.responses import NetworkGraphResponse
from app.services.network_service import NetworkService

router = APIRouter(prefix="/network", tags=["network"])


@router.get("/{persona_id}", response_model=NetworkGraphResponse)
async def get_network(persona_id: str):
    """
    Get the regulatory network graph for a persona.
    Returns nodes (TFs, enhancers, genes, pathways, tissues, diseases)
    and weighted edges suitable for D3 force-directed layout.
    """
    return NetworkService.get_network(persona_id)
