"""
REAL MODE NETWORK ROUTER
Builds a real regulatory network graph from user's actual variants.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db, GenomeDataModel, VariantModel
from app.core.security import get_current_user, TokenData

router = APIRouter(prefix="/real/network", tags=["real-network"])


@router.get("/graph")
async def get_real_network_graph(
    user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Build a real regulatory network graph from the user's variants.
    Nodes = genes and regulatory elements from user's actual variant set.
    Edges = regulatory connections inferred from co-location and element type.
    Returns D3-compatible { nodes: [...], links: [...] }
    """
    gd = db.query(GenomeDataModel).filter(GenomeDataModel.user_id == user.user_id).first()
    if not gd:
        raise HTTPException(404, "No genome data")

    variants = db.query(VariantModel).filter(
        VariantModel.genome_data_id == gd.id,
        VariantModel.impact_score > 5
    ).order_by(VariantModel.impact_score.desc()).limit(100).all()

    if not variants:
        return {"nodes": [], "links": []}

    nodes = []
    links = []
    seen_nodes = set()

    element_colors = {
        "Promoter": "#8b5cf6",
        "Enhancer": "#0ae8d2",
        "CTCF Binding Site": "#f59e0b",
        "TF Binding Site": "#10b981",
        "Open Chromatin": "#3b82f6",
        "Intergenic": "#6b7d9c",
    }

    sig_colors = {
        "Pathogenic": "#ef4444",
        "Likely pathogenic": "#f97316",
        "Risk factor": "#f59e0b",
        "Uncertain significance": "#6b7d9c",
        "Benign": "#10b981",
    }

    for v in variants:
        gene = v.gene_name or "Unknown"
        if gene not in seen_nodes and gene != "Unknown":
            sig = v.clinical_significance or ""
            color = "#6b7d9c"
            for sig_key, sig_color in sig_colors.items():
                if sig_key.lower() in sig.lower():
                    color = sig_color
                    break
            nodes.append({
                "id": gene,
                "label": gene,
                "type": "gene",
                "color": color,
                "size": max(5, int((v.impact_score or 0) / 10)),
                "clinical_significance": sig,
                "condition": v.condition,
            })
            seen_nodes.add(gene)

        reg_id = f"{v.regulatory_element_type}_{v.chromosome}_{v.position}"
        if reg_id not in seen_nodes:
            nodes.append({
                "id": reg_id,
                "label": v.regulatory_element_type or "Regulatory",
                "type": "regulatory",
                "color": element_colors.get(v.regulatory_element_type, "#6b7d9c"),
                "size": 6,
                "rsid": v.rsid,
                "chromosome": v.chromosome,
                "position": v.position,
            })
            seen_nodes.add(reg_id)

        if gene != "Unknown":
            links.append({
                "source": gene,
                "target": reg_id,
                "type": "regulatory",
                "strength": round((v.impact_score or 0) / 100, 2),
            })

    # Add gene-gene links for nearby genes on same chromosome
    gene_variants = {v.gene_name: v for v in variants if v.gene_name and v.gene_name != "Unknown"}
    gene_list = list(gene_variants.keys())
    for i, g1 in enumerate(gene_list):
        for g2 in gene_list[i+1:min(i+4, len(gene_list))]:
            v1, v2 = gene_variants[g1], gene_variants[g2]
            if v1.chromosome == v2.chromosome and abs((v1.position or 0) - (v2.position or 0)) < 500000:
                if g1 in seen_nodes and g2 in seen_nodes:
                    links.append({
                        "source": g1,
                        "target": g2,
                        "type": "proximity",
                        "strength": 0.3,
                    })

    return {"nodes": nodes, "links": links, "node_count": len(nodes), "link_count": len(links)}
