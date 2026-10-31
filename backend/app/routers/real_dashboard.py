"""
REAL MODE DASHBOARD ROUTER
Returns real user data from SQLite (uploaded genome results).
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db, GenomeDataModel, VariantModel
from app.core.security import get_current_user, TokenData

router = APIRouter(prefix="/real/dashboard", tags=["real-dashboard"])


@router.get("/summary")
async def real_dashboard_summary(
    user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    gd = db.query(GenomeDataModel).filter(GenomeDataModel.user_id == user.user_id).first()

    if not gd or not gd.processing_complete:
        return {"has_data": False}

    variants = db.query(VariantModel).filter(VariantModel.genome_data_id == gd.id).all()

    # Impact distribution
    impact_dist = {}
    for v in variants:
        k = v.impact or "MODIFIER"
        impact_dist[k] = impact_dist.get(k, 0) + 1

    # Significance breakdown
    sig_counts = {}
    for v in variants:
        k = v.clinical_significance or "Not provided"
        sig_counts[k] = sig_counts.get(k, 0) + 1

    # Regulatory element breakdown
    reg_counts = {}
    for v in variants:
        k = v.regulatory_element_type or "Unknown"
        reg_counts[k] = reg_counts.get(k, 0) + 1
    top_reg = sorted(reg_counts.items(), key=lambda x: -x[1])[:8]

    # Rarity distribution
    rarity_dist = {}
    for v in variants:
        k = v.rarity_label or "No data"
        rarity_dist[k] = rarity_dist.get(k, 0) + 1

    # Top 10 highest impact variants
    top_variants = sorted(variants, key=lambda v: v.impact_score or 0, reverse=True)[:10]

    # Chromosome distribution
    chrom_dist = {}
    for v in variants:
        c = v.chromosome or "Unknown"
        chrom_dist[c] = chrom_dist.get(c, 0) + 1

    return {
        "has_data": True,
        "user_name": user.email,
        "filename": gd.filename,
        "file_type": gd.file_type,
        "upload_date": gd.upload_date.isoformat() if gd.upload_date else None,
        "stats": {
            "total_variants": len(variants),
            "pathogenic_count": gd.total_pathogenic,
            "likely_pathogenic_count": gd.total_likely_pathogenic,
            "high_impact_count": gd.high_impact_count,
            "unique_genes": gd.unique_genes_count,
            "regulatory_age_score": gd.regulatory_age_score,
            "overall_risk_score": gd.overall_risk_score,
        },
        "impact_distribution": impact_dist,
        "significance_breakdown": sig_counts,
        "regulatory_elements": [{"element": k, "count": c} for k, c in top_reg],
        "rarity_distribution": rarity_dist,
        "chromosome_distribution": chrom_dist,
        "top_variants": [
            {
                "rsid": v.rsid,
                "gene_name": v.gene_name,
                "chromosome": v.chromosome,
                "clinical_significance": v.clinical_significance,
                "regulatory_element_type": v.regulatory_element_type,
                "impact": v.impact,
                "impact_score": v.impact_score,
                "condition": v.condition,
                "rarity_label": v.rarity_label,
                "top_disease": v.top_disease,
                "top_tissue": v.top_tissue,
            }
            for v in top_variants
        ],
    }
