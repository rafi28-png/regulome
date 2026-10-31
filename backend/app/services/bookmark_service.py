"""
ReguloMe — Bookmarks Service
Persistent bookmarks backed by SQLite.
In demo mode: bookmarks are associated with persona_id (no auth needed).
In real mode: bookmarks are tied to the authenticated user_id.
"""
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.database import BookmarkModel
from app.schemas.responses import BookmarkEntry, BookmarkListResponse


class BookmarkService:

    @staticmethod
    def list_bookmarks(db: Session, user_id: str | None = None, persona_id: str | None = None) -> BookmarkListResponse:
        """Return all bookmarks for a user (real mode) or persona (demo mode)."""
        query = db.query(BookmarkModel)
        if user_id:
            query = query.filter(BookmarkModel.user_id == user_id)
        elif persona_id:
            query = query.filter(BookmarkModel.persona_id == persona_id)
        else:
            return BookmarkListResponse(bookmarks=[], total=0)

        rows = query.order_by(BookmarkModel.created_at.desc()).all()
        bookmarks = [
            BookmarkEntry(
                id=row.id,
                variant_id=row.variant_id,
                rs_id=row.rs_id,
                gene=row.gene,
                chromosome=row.chromosome,
                position=row.position,
                notes=row.notes,
                created_at=row.created_at.isoformat() if row.created_at else "",
            )
            for row in rows
        ]
        return BookmarkListResponse(bookmarks=bookmarks, total=len(bookmarks))

    @staticmethod
    def toggle_bookmark(
        db: Session,
        variant_id: str,
        user_id: str | None = None,
        persona_id: str | None = None,
        rs_id: str | None = None,
        gene: str | None = None,
        chromosome: str | None = None,
        position: int | None = None,
    ) -> dict:
        """Toggle a bookmark. Returns {bookmarked: bool, variant_id: str}."""
        # Build filter
        query = db.query(BookmarkModel).filter(BookmarkModel.variant_id == variant_id)
        if user_id:
            query = query.filter(BookmarkModel.user_id == user_id)
        elif persona_id:
            query = query.filter(BookmarkModel.persona_id == persona_id)

        existing = query.first()
        if existing:
            db.delete(existing)
            db.commit()
            return {"variant_id": variant_id, "bookmarked": False}
        else:
            bm = BookmarkModel(
                user_id=user_id or "demo",
                variant_id=variant_id,
                persona_id=persona_id,
                rs_id=rs_id,
                gene=gene,
                chromosome=chromosome,
                position=position,
                created_at=datetime.now(timezone.utc),
            )
            db.add(bm)
            db.commit()
            return {"variant_id": variant_id, "bookmarked": True}

    @staticmethod
    def is_bookmarked(db: Session, variant_id: str, user_id: str | None = None, persona_id: str | None = None) -> bool:
        query = db.query(BookmarkModel).filter(BookmarkModel.variant_id == variant_id)
        if user_id:
            query = query.filter(BookmarkModel.user_id == user_id)
        elif persona_id:
            query = query.filter(BookmarkModel.persona_id == persona_id)
        return query.first() is not None

    @staticmethod
    def get_bookmarked_ids(db: Session, user_id: str | None = None, persona_id: str | None = None) -> set[str]:
        query = db.query(BookmarkModel.variant_id)
        if user_id:
            query = query.filter(BookmarkModel.user_id == user_id)
        elif persona_id:
            query = query.filter(BookmarkModel.persona_id == persona_id)
        return {row.variant_id for row in query.all()}
