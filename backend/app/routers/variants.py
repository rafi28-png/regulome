"""
ReguloMe — Variants Router
Variant listing, detail, and comparison endpoints.
"""
from fastapi import APIRouter, Depends

from app.schemas.responses import RegulatoryVariant, VariantListResponse
from app.core.dependencies import (
    PaginationParams,
    VariantFilterParams,
    get_pagination,
    get_variant_filters,
)
from app.services.variant_service import VariantService

router = APIRouter(prefix="/variants", tags=["variants"])


@router.get("/{persona_id}", response_model=VariantListResponse)
async def list_variants(
    persona_id: str,
    pagination: PaginationParams = Depends(get_pagination),
    filters: VariantFilterParams = Depends(get_variant_filters),
):
    """
    List all regulatory variants for a persona.
    Supports pagination, filtering, searching, and sorting.
    """
    return VariantService.list_variants(persona_id, pagination, filters)


@router.get("/{persona_id}/{variant_id}", response_model=RegulatoryVariant)
async def get_variant_detail(persona_id: str, variant_id: str):
    """Get full detail for a specific variant."""
    return VariantService.get_variant(persona_id, variant_id)


@router.post("/{persona_id}/{variant_id}/bookmark")
async def toggle_bookmark(persona_id: str, variant_id: str):
    """Toggle bookmark status for a variant."""
    return VariantService.toggle_bookmark(persona_id, variant_id)
