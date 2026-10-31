"""
REAL MODE EXPRESSION ROUTER
Returns real GTEx tissue expression heatmap for user's genes.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db, GenomeDataModel, VariantModel
from app.core.security import get_current_user, TokenData
from app.services.gtex_service import get_expression_for_gene_list

router = APIRouter(prefix="/real/expression", tags=["real-expression"])


@router.get("/heatmap")
async def get_real_expression_heatmap(
    user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns tissue expression matrix for all genes in user's variant set.
    Returns: { genes: [...], tissues: [...], matrix: [[tpm values]] }
    """
    gd = db.query(GenomeDataModel).filter(GenomeDataModel.user_id == user.user_id).first()
    if not gd:
        raise HTTPException(404, "No genome data")

    variants = db.query(VariantModel).filter(VariantModel.genome_data_id == gd.id).all()
    unique_genes = list({
        v.gene_name for v in variants
        if v.gene_name and v.gene_name not in ("Unknown", "")
    })[:30]

    if not unique_genes:
        return {"genes": [], "tissues": [], "matrix": []}

    expression_data = await get_expression_for_gene_list(unique_genes)

    # Build unified tissue list
    all_tissues: set = set()
    for gene_data in expression_data.values():
        all_tissues.update(gene_data.get("tissue_expression", {}).keys())
    tissues = sorted(list(all_tissues))[:20]

    # Build matrix
    matrix = []
    genes_with_data = []
    for gene in unique_genes:
        gene_data = expression_data.get(gene)
        if gene_data and gene_data.get("tissue_expression"):
            te = gene_data["tissue_expression"]
            row = [te.get(t, 0.0) for t in tissues]
            matrix.append(row)
            genes_with_data.append(gene)

    return {
        "genes": genes_with_data,
        "tissues": [t.replace("_", " ").title() for t in tissues],
        "matrix": matrix,
    }
