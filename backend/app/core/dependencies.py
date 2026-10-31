"""
ReguloMe — Common Dependencies
Shared FastAPI dependencies for query parameters, pagination, filtering.
"""
from typing import Optional
from fastapi import Query
from pydantic import BaseModel


class PaginationParams(BaseModel):
    """Standard pagination parameters."""
    page: int = 1
    page_size: int = 50

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


def get_pagination(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=200, description="Items per page"),
) -> PaginationParams:
    """Pagination dependency for list endpoints."""
    return PaginationParams(page=page, page_size=page_size)


class VariantFilterParams(BaseModel):
    """Query filters for the Variant Explorer."""
    element_type: Optional[str] = None
    tissue: Optional[str] = None
    confidence_min: Optional[float] = None
    priority_min: Optional[float] = None
    effect: Optional[str] = None  # gain | loss | neutral
    search: Optional[str] = None
    sort_by: Optional[str] = None
    sort_order: str = "desc"


def get_variant_filters(
    element_type: Optional[str] = Query(None, description="Filter by regulatory element type"),
    tissue: Optional[str] = Query(None, description="Filter by tissue"),
    confidence_min: Optional[float] = Query(None, ge=0, le=1, description="Minimum confidence score"),
    priority_min: Optional[float] = Query(None, ge=0, le=100, description="Minimum priority score"),
    effect: Optional[str] = Query(None, description="Filter by predicted effect: gain, loss, neutral"),
    search: Optional[str] = Query(None, description="Search across variant fields"),
    sort_by: Optional[str] = Query(None, description="Sort field"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
) -> VariantFilterParams:
    """Variant filtering dependency."""
    return VariantFilterParams(
        element_type=element_type,
        tissue=tissue,
        confidence_min=confidence_min,
        priority_min=priority_min,
        effect=effect,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )
