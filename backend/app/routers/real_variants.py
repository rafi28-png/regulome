"""
REAL MODE VARIANTS ROUTER
Returns real variants from user's uploaded genome (SQLite).
Supports pagination, search, filtering, and export.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db, GenomeDataModel, VariantModel
from app.core.security import get_current_user, TokenData

router = APIRouter(prefix="/real/variants", tags=["real-variants"])


@router.get("/")
async def list_real_variants(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    limit: Optional[int] = Query(None, ge=1, le=200),
    search: Optional[str] = Query(None),
    significance: Optional[str] = Query(None),
    impact: Optional[str] = Query(None),
    regulatory_type: Optional[str] = Query(None),
    sort_by: str = Query("impact_score"),
    user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    effective_per_page = limit or per_page
    gd = db.query(GenomeDataModel).filter(GenomeDataModel.user_id == user.user_id).first()
    if not gd:
        return {
            "variants": [],
            "items": [],
            "total": 0,
            "page": page,
            "per_page": effective_per_page,
            "total_pages": 0,
            "pages": 0,
        }

    q = db.query(VariantModel).filter(VariantModel.genome_data_id == gd.id)

    if search:
        s = f"%{search}%"
        q = q.filter(
            VariantModel.rsid.ilike(s) | VariantModel.gene_name.ilike(s) | VariantModel.condition.ilike(s)
        )
    if significance:
        q = q.filter(VariantModel.clinical_significance.ilike(f"%{significance}%"))
    if impact:
        q = q.filter(VariantModel.impact == impact.upper())
    if regulatory_type:
        q = q.filter(VariantModel.regulatory_element_type.ilike(f"%{regulatory_type}%"))

    if sort_by == "impact_score":
        q = q.order_by(VariantModel.impact_score.desc())
    elif sort_by == "position":
        q = q.order_by(VariantModel.chromosome, VariantModel.position)
    elif sort_by == "gene":
        q = q.order_by(VariantModel.gene_name)
    else:
        q = q.order_by(VariantModel.impact_score.desc())

    total = q.count()
    rows = q.offset((page - 1) * effective_per_page).limit(effective_per_page).all()
    serialized = [_row(v) for v in rows]
    total_pages = -(-total // effective_per_page) if effective_per_page else 1

    return {
        "variants": serialized,
        "items": serialized,
        "total": total,
        "page": page,
        "per_page": effective_per_page,
        "total_pages": total_pages,
        "pages": total_pages,
    }


@router.get("/export")
async def export_real_variants(
    format: str = Query("json"),
    user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Export all variants as JSON or CSV."""
    from fastapi.responses import StreamingResponse
    import io, csv

    gd = db.query(GenomeDataModel).filter(GenomeDataModel.user_id == user.user_id).first()
    if not gd:
        raise HTTPException(404, "No genome data found")

    variants = db.query(VariantModel).filter(
        VariantModel.genome_data_id == gd.id
    ).order_by(VariantModel.impact_score.desc()).all()

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "rsid", "chromosome", "position", "genotype",
            "gene_name", "clinical_significance", "condition",
            "regulatory_element_type", "impact", "impact_score",
            "rarity_label", "af_global", "top_disease", "top_tissue"
        ])
        for v in variants:
            writer.writerow([
                v.rsid, v.chromosome, v.position, v.genotype,
                v.gene_name, v.clinical_significance, v.condition,
                v.regulatory_element_type, v.impact, v.impact_score,
                v.rarity_label, v.af_global, v.top_disease, v.top_tissue
            ])
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=regulome_variants.csv"}
        )
    else:
        import json
        data = [_row(v) for v in variants]
        return StreamingResponse(
            iter([json.dumps(data, indent=2)]),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=regulome_variants.json"}
        )


@router.get("/{rsid}")
async def get_real_variant(
    rsid: str,
    user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    gd = db.query(GenomeDataModel).filter(GenomeDataModel.user_id == user.user_id).first()
    if not gd:
        raise HTTPException(404, "No genome data found")
    v = db.query(VariantModel).filter(
        VariantModel.genome_data_id == gd.id,
        VariantModel.rsid == rsid
    ).first()
    if not v:
        raise HTTPException(404, f"{rsid} not found")
    return {
        **_row(v),
        "ref_allele": v.ref_allele,
        "alt_allele": v.alt_allele,
        "review_status": v.review_status,
        "biotype": v.biotype,
        "af_afr": v.af_afr, "af_amr": v.af_amr, "af_asj": v.af_asj,
        "af_eas": v.af_eas, "af_fin": v.af_fin, "af_nfe": v.af_nfe, "af_sas": v.af_sas,
        "top_disease_score": v.top_disease_score,
        "max_tpm": v.max_tpm,
        "ensembl_link": f"https://www.ensembl.org/Homo_sapiens/Variation/Summary?v={v.rsid}",
        "clinvar_link": f"https://www.ncbi.nlm.nih.gov/clinvar/?term={v.rsid}[rs]",
        "gnomad_link": f"https://gnomad.broadinstitute.org/variant/{(v.chromosome or '').replace('chr', '')}-{v.position}-{v.ref_allele}-{v.alt_allele}",
    }


def _row(v) -> dict:
    return {
        "rsid": v.rsid,
        "chromosome": v.chromosome,
        "position": v.position,
        "genotype": v.genotype,
        "gene_name": v.gene_name,
        "clinical_significance": v.clinical_significance,
        "condition": v.condition,
        "regulatory_element_type": v.regulatory_element_type,
        "consequence": v.consequence,
        "impact": v.impact,
        "impact_score": v.impact_score,
        "top_tissue": v.top_tissue,
        "af_global": v.af_global,
        "rarity_label": v.rarity_label,
        "top_disease": v.top_disease,
    }
