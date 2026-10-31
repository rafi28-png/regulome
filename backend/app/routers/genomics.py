"""
ReguloMe — Genomics Annotation Router
Real-mode endpoints that call public genomics APIs.
All endpoints cache results to SQLite (24h TTL).
"""
from fastapi import APIRouter, Depends, Path, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db, AnalysisHistoryModel
from app.core.security import TokenData, get_current_user_optional
from app.services.genomics_api import (
    fetch_ensembl_variant,
    fetch_ensembl_vep,
    fetch_ensembl_gene,
    fetch_clinvar_significance,
    fetch_gtex_expression,
    fetch_open_targets_diseases,
    fetch_full_variant_annotation,
)
from datetime import datetime, timezone

router = APIRouter(prefix="/annotate", tags=["genomics"])


def _record_history(db: Session, user: Optional[TokenData], query_type: str, query_input: str, result_count: int, source: str):
    """Save a query to analysis history (only for authenticated users)."""
    if user:
        entry = AnalysisHistoryModel(
            user_id=user.user_id,
            query_type=query_type,
            query_input=query_input,
            result_count=result_count,
            source=source,
            created_at=datetime.now(timezone.utc),
        )
        db.add(entry)
        db.commit()


# ── Variant annotation (Ensembl + ClinVar + VEP) ─────────────────────────────

@router.get("/variant/{rsid}")
async def annotate_variant(
    rsid: str = Path(..., description="rsID e.g. rs9271366"),
    db: Session = Depends(get_db),
    user: Optional[TokenData] = Depends(get_current_user_optional),
):
    """
    Full variant annotation from:
    - Ensembl (alleles, mappings, phenotypes, MAF)
    - ClinVar  (clinical significance, conditions)
    - VEP      (predicted functional consequences)
    
    Results are cached 24h so repeat queries are instant.
    """
    result = await fetch_full_variant_annotation(rsid, db)
    _record_history(db, user, "variant_annotation", rsid, 1, "ensembl+clinvar")
    return result


@router.get("/variant/{rsid}/clinvar")
async def get_clinvar(
    rsid: str,
    db: Session = Depends(get_db),
    user: Optional[TokenData] = Depends(get_current_user_optional),
):
    """Clinical significance from ClinVar for a given rsID."""
    result = await fetch_clinvar_significance(rsid, db)
    _record_history(db, user, "clinvar_lookup", rsid, 1, "clinvar")
    return result


@router.get("/variant/{rsid}/vep")
async def get_vep(
    rsid: str,
    db: Session = Depends(get_db),
):
    """VEP (Variant Effect Predictor) consequences from Ensembl."""
    return await fetch_ensembl_vep(rsid, db)


# ── Gene info & expression ────────────────────────────────────────────────────

@router.get("/gene/{gene_symbol}")
async def annotate_gene(
    gene_symbol: str = Path(..., description="HGNC gene symbol e.g. FOXO3"),
    db: Session = Depends(get_db),
    user: Optional[TokenData] = Depends(get_current_user_optional),
):
    """Gene information from Ensembl (ID, biotype, chromosome, description)."""
    result = await fetch_ensembl_gene(gene_symbol, db)
    _record_history(db, user, "gene_lookup", gene_symbol, 1, "ensembl")
    return result


@router.get("/gene/{gene_symbol}/expression")
async def get_gtex_expression(
    gene_symbol: str,
    db: Session = Depends(get_db),
    user: Optional[TokenData] = Depends(get_current_user_optional),
):
    """
    Real gene expression across 54 human tissues from GTEx v10.
    Returns median TPM per tissue.
    """
    result = await fetch_gtex_expression(gene_symbol, db)
    _record_history(db, user, "gtex_expression", gene_symbol, len(result), "gtex")
    return {"gene": gene_symbol, "tissues": result, "total": len(result), "source": "GTEx v10"}


@router.get("/gene/{gene_symbol}/diseases")
async def get_disease_associations(
    gene_symbol: str,
    size: int = Query(15, ge=1, le=50, description="Number of disease associations to return"),
    db: Session = Depends(get_db),
    user: Optional[TokenData] = Depends(get_current_user_optional),
):
    """
    Disease–gene associations from Open Targets Platform.
    Returns top diseases by evidence score, with genetic + clinical evidence breakdown.
    """
    result = await fetch_open_targets_diseases(gene_symbol, db, size=size)
    _record_history(db, user, "disease_associations", gene_symbol, result.get("total", 0), "opentargets")
    return result


# ── Analysis history ──────────────────────────────────────────────────────────

@router.get("/history")
async def get_history(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    user: Optional[TokenData] = Depends(get_current_user_optional),
):
    """Get the current user's query history."""
    if not user:
        return {"history": [], "total": 0}
    rows = (
        db.query(AnalysisHistoryModel)
        .filter(AnalysisHistoryModel.user_id == user.user_id)
        .order_by(AnalysisHistoryModel.created_at.desc())
        .limit(limit)
        .all()
    )
    history = [
        {
            "id": r.id,
            "query_type": r.query_type,
            "query_input": r.query_input,
            "result_count": r.result_count,
            "source": r.source,
            "created_at": r.created_at.isoformat() if r.created_at else "",
        }
        for r in rows
    ]
    return {"history": history, "total": len(history)}
