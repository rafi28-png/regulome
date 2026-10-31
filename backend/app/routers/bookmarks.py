"""
ReguloMe — Bookmarks Router
Persistent bookmark storage for variants (works in both demo and real mode).
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import TokenData, get_current_user_optional
from app.services.bookmark_service import BookmarkService
from app.schemas.responses import BookmarkListResponse

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])


@router.get("/", response_model=BookmarkListResponse)
async def list_bookmarks(
    persona_id: Optional[str] = Query(None, description="Demo persona ID"),
    db: Session = Depends(get_db),
    user: Optional[TokenData] = Depends(get_current_user_optional),
):
    """List all bookmarks for the current user or demo persona."""
    user_id = user.user_id if user else None
    return BookmarkService.list_bookmarks(db=db, user_id=user_id, persona_id=persona_id)


@router.post("/{variant_id}")
async def toggle_bookmark(
    variant_id: str,
    persona_id: Optional[str] = Query(None),
    rs_id: Optional[str] = Query(None),
    gene: Optional[str] = Query(None),
    chromosome: Optional[str] = Query(None),
    position: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    user: Optional[TokenData] = Depends(get_current_user_optional),
):
    """Toggle a bookmark. No auth required in demo mode (pass persona_id)."""
    user_id = user.user_id if user else None
    return BookmarkService.toggle_bookmark(
        db=db,
        variant_id=variant_id,
        user_id=user_id,
        persona_id=persona_id,
        rs_id=rs_id,
        gene=gene,
        chromosome=chromosome,
        position=position,
    )
