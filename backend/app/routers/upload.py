"""
UPLOAD ROUTER
This is what makes Real Mode real.
Receives user's genome file, runs the full 6-API annotation pipeline,
saves everything to SQLite, and returns real results.
"""

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db, GenomeDataModel, VariantModel, UserModel
from app.core.security import get_current_user, get_current_user_optional, TokenData
from app.core.config import settings
from app.services.vcf_parser import parse_genome_file
from app.services.clinvar_service import batch_annotate_clinvar
from app.services.ensembl_service import batch_annotate_ensembl
from app.services.gtex_service import batch_annotate_gtex
from app.services.gnomad_service import batch_annotate_gnomad
from app.services.opentargets_service import batch_annotate_opentargets
from app.services.scoring_service import score_all_variants, compute_summary_statistics

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/genome")
async def upload_genome(
    file: UploadFile = File(...),
    user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    The main upload endpoint.
    Accepts: .vcf .vcf.gz .txt (23andMe, AncestryDNA)
    Runs full annotation pipeline.
    Saves to database.
    Returns real results.

    IMPORTANT: Do NOT set Content-Type header when calling this endpoint.
    The browser sets it automatically for FormData.
    """
    filename = file.filename or "genome_file"
    if not any(filename.endswith(ext) for ext in [".vcf", ".txt", ".gz"]):
        raise HTTPException(400, "Unsupported file type. Upload .vcf, .vcf.gz, or 23andMe/AncestryDNA .txt")

    # Read file
    try:
        raw = await file.read()
        if filename.endswith(".gz"):
            import gzip
            raw = gzip.decompress(raw)
        content = raw.decode("utf-8", errors="ignore")
    except Exception as e:
        raise HTTPException(400, f"Could not read file: {e}")

    if not content.strip():
        raise HTTPException(400, "File is empty")

    max_variants = getattr(settings, 'MAX_VARIANTS', 100)

    # Parse genome file
    parsed = parse_genome_file(content, max_variants=max_variants)
    raw_variants = parsed["variants"]
    if not raw_variants:
        raise HTTPException(400, "No valid genetic variants found in this file. Check the file format.")

    # Delete old data for this user (fresh upload replaces old)
    old = db.query(GenomeDataModel).filter(GenomeDataModel.user_id == user.user_id).first()
    if old:
        db.query(VariantModel).filter(VariantModel.genome_data_id == old.id).delete()
        db.delete(old)
        db.commit()

    # Create new genome data record
    gd = GenomeDataModel(
        user_id=user.user_id,
        filename=filename,
        file_type=parsed["file_type"],
        total_variants_in_file=parsed["total_variants_in_file"],
        variants_processed=len(raw_variants),
        processing_complete=False,
    )
    db.add(gd)
    db.commit()
    db.refresh(gd)

    # === ANNOTATION PIPELINE ===
    # Step 1: ClinVar annotation
    v1 = await batch_annotate_clinvar(raw_variants)
    # Step 2: Ensembl regulatory annotation
    v2 = await batch_annotate_ensembl(v1)
    # Step 3: GTEx tissue expression
    v3 = await batch_annotate_gtex(v2)
    # Step 4: gnomAD population frequency
    v4 = await batch_annotate_gnomad(v3)
    # Step 5: Open Targets disease associations
    v5 = await batch_annotate_opentargets(v4)
    # Step 6: ReguloMe impact scoring
    final = score_all_variants(v5)

    # Save variants to database
    db_variants = []
    for v in final:
        db_variants.append(VariantModel(
            genome_data_id=gd.id,
            rsid=v.get("rsid", ""),
            chromosome=v.get("chromosome", ""),
            position=v.get("position", 0),
            ref_allele=v.get("ref_allele", ""),
            alt_allele=v.get("alt_allele", ""),
            genotype=v.get("genotype", ""),
            gene_name=v.get("gene_name", "Unknown"),
            clinical_significance=v.get("clinical_significance", "Not provided"),
            condition=v.get("condition", ""),
            review_status=v.get("review_status", ""),
            clinvar_id=v.get("clinvar_id"),
            regulatory_element_type=v.get("regulatory_element_type", "Unknown"),
            consequence=v.get("consequence", ""),
            impact=v.get("impact", "MODIFIER"),
            biotype=v.get("biotype", ""),
            top_tissue=v.get("top_tissue", ""),
            max_tpm=v.get("max_tpm", 0.0),
            af_global=v.get("af_global", 0.0),
            af_afr=v.get("af_afr", 0.0),
            af_amr=v.get("af_amr", 0.0),
            af_asj=v.get("af_asj", 0.0),
            af_eas=v.get("af_eas", 0.0),
            af_fin=v.get("af_fin", 0.0),
            af_nfe=v.get("af_nfe", 0.0),
            af_sas=v.get("af_sas", 0.0),
            rarity_label=v.get("rarity_label", "No data"),
            top_disease=v.get("top_disease", "No data"),
            top_disease_score=v.get("top_disease_score", 0.0),
            impact_score=v.get("impact_score", 0.0),
        ))
    db.bulk_save_objects(db_variants)

    # Compute and save summary stats
    stats = compute_summary_statistics(final)
    gd.total_pathogenic = stats["total_pathogenic"]
    gd.total_likely_pathogenic = stats["total_likely_pathogenic"]
    gd.total_benign = stats["total_benign"]
    gd.total_uncertain = stats["total_uncertain"]
    gd.total_risk_factor = stats["total_risk_factor"]
    gd.high_impact_count = stats["high_impact_count"]
    gd.unique_genes_count = stats["unique_genes_count"]
    gd.regulatory_age_score = stats["regulatory_age_score"]
    gd.overall_risk_score = stats["overall_risk_score"]
    gd.processing_complete = True
    db.commit()

    return {
        "success": True,
        "genome_data_id": gd.id,
        "file_type": parsed["file_type"],
        "total_variants_in_file": parsed["total_variants_in_file"],
        "variants_processed": len(final),
        "summary": stats,
        "top_variants": [_vdict(v) for v in sorted(final, key=lambda x: x.get("impact_score", 0), reverse=True)[:20]],
    }


@router.get("/status")
async def upload_status(
    user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Check if user has processed genome data."""
    gd = db.query(GenomeDataModel).filter(GenomeDataModel.user_id == user.user_id).first()
    if not gd:
        return {"has_data": False}
    return {
        "has_data": True,
        "genome_data_id": gd.id,
        "filename": gd.filename,
        "file_type": gd.file_type,
        "variants_processed": gd.variants_processed,
        "upload_date": gd.upload_date.isoformat() if gd.upload_date else None,
        "processing_complete": gd.processing_complete,
    }


def _vdict(v: dict) -> dict:
    return {
        "rsid": v.get("rsid"),
        "chromosome": v.get("chromosome"),
        "position": v.get("position"),
        "genotype": v.get("genotype"),
        "gene_name": v.get("gene_name"),
        "clinical_significance": v.get("clinical_significance"),
        "condition": v.get("condition"),
        "regulatory_element_type": v.get("regulatory_element_type"),
        "impact": v.get("impact"),
        "impact_score": v.get("impact_score"),
        "rarity_label": v.get("rarity_label"),
        "top_disease": v.get("top_disease"),
        "top_tissue": v.get("top_tissue"),
    }
