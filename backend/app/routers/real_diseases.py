"""
REAL MODE DISEASES ROUTER
Computes real disease risk profile from user's annotated variants.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db, GenomeDataModel, VariantModel
from app.core.security import get_current_user, TokenData

router = APIRouter(prefix="/real/diseases", tags=["real-diseases"])

DISEASE_CATEGORIES = {
    "Cardiovascular": ["heart", "cardiac", "coronary", "atherosclerosis", "hypertension", "stroke", "arrhythmia"],
    "Neurological": ["alzheimer", "parkinson", "neurolog", "dementia", "epilepsy", "autism", "schizophrenia", "bipolar"],
    "Metabolic": ["diabetes", "metabolic", "obesity", "lipid", "cholesterol", "insulin", "thyroid"],
    "Immune": ["immune", "autoimmune", "lupus", "rheumatoid", "inflammatory", "crohn", "colitis"],
    "Cancer": ["cancer", "tumor", "carcinoma", "leukemia", "lymphoma", "melanoma", "neoplasm"],
    "Musculoskeletal": ["muscle", "bone", "joint", "osteoporosis", "arthritis", "dystrophy"],
    "Rare": ["syndrome", "rare", "congenital", "hereditary", "familial"],
}


@router.get("/risk-profile")
async def get_real_disease_risk_profile(
    user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Compute real disease risk profile from user's annotated variants.
    Groups variants by disease category and computes category risk scores.
    """
    gd = db.query(GenomeDataModel).filter(GenomeDataModel.user_id == user.user_id).first()
    if not gd:
        raise HTTPException(404, "No genome data")

    variants = db.query(VariantModel).filter(VariantModel.genome_data_id == gd.id).all()

    # Categorize each variant by disease system
    category_variants = {cat: [] for cat in DISEASE_CATEGORIES}
    category_variants["Other"] = []

    for v in variants:
        condition = (v.condition or "").lower()
        top_disease = (v.top_disease or "").lower()
        search_text = condition + " " + top_disease

        matched = False
        for cat, keywords in DISEASE_CATEGORIES.items():
            if any(kw in search_text for kw in keywords):
                category_variants[cat].append(v)
                matched = True
                break
        if not matched and (v.condition or v.top_disease):
            category_variants["Other"].append(v)

    results = []
    for cat, cat_variants in category_variants.items():
        if not cat_variants:
            continue

        pathogenic = sum(1 for v in cat_variants if "pathogenic" in (v.clinical_significance or "").lower())
        likely_path = sum(1 for v in cat_variants if "likely pathogenic" in (v.clinical_significance or "").lower())
        risk_factor = sum(1 for v in cat_variants if "risk factor" in (v.clinical_significance or "").lower())
        high_impact = sum(1 for v in cat_variants if v.impact == "HIGH")
        avg_score = sum(v.impact_score or 0 for v in cat_variants) / len(cat_variants)

        raw_risk = (pathogenic * 20 + likely_path * 12 + risk_factor * 6 + high_impact * 3 + avg_score * 0.2)
        risk_score = min(round(raw_risk, 1), 100.0)

        if risk_score >= 50:
            risk_level = "High"
        elif risk_score >= 20:
            risk_level = "Moderate"
        elif risk_score > 0:
            risk_level = "Low"
        else:
            risk_level = "Minimal"

        conditions = list({v.condition for v in cat_variants if v.condition and v.condition not in ("No data", "Not specified")})[:5]
        top_genes = list({v.gene_name for v in cat_variants if v.gene_name and v.gene_name != "Unknown"})[:8]

        results.append({
            "category": cat,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "variant_count": len(cat_variants),
            "pathogenic_count": pathogenic,
            "conditions": conditions,
            "top_genes": top_genes,
        })

    results.sort(key=lambda x: -x["risk_score"])
    return {"categories": results, "total_variants_analyzed": len(variants)}
