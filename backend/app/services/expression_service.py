"""
ReguloMe — Gene Expression Service
Gene × Tissue expression landscape with baseline deviations and variant impact flags.
Full synthetic data will be enriched in Part 5.
"""
from app.services.persona_service import PersonaService
from app.schemas.responses import GeneExpressionEntry, GeneExpressionResponse

# Per-persona expression landscape data (skeleton — Part 5 will generate biologically coherent full sets)
_EXPRESSION_DATA: dict[str, list[dict]] = {
    "inflammatory": [
        dict(gene="TNF", tissue="Immune Cells", expression=8.7, deviation=3.2, variants=["var_001"], hotspot=True),
        dict(gene="IL6", tissue="Immune Cells", expression=7.9, deviation=2.8, variants=["var_001", "var_004"], hotspot=True),
        dict(gene="IL1B", tissue="Immune Cells", expression=7.5, deviation=2.4, variants=["var_003"], hotspot=True),
        dict(gene="NFKB1", tissue="Immune Cells", expression=6.8, deviation=1.9, variants=["var_001"], hotspot=False),
        dict(gene="STAT3", tissue="Immune Cells", expression=6.5, deviation=1.6, variants=["var_001"], hotspot=False),
        dict(gene="TNF", tissue="Liver", expression=4.2, deviation=0.8, variants=["var_001"], hotspot=False),
        dict(gene="PTPN22", tissue="Thymus", expression=5.8, deviation=-1.5, variants=["var_002"], hotspot=False),
        dict(gene="HLA-DRB1", tissue="Spleen", expression=9.1, deviation=3.8, variants=["var_001"], hotspot=True),
        dict(gene="ORMDL3", tissue="Lung", expression=6.3, deviation=1.4, variants=["var_003"], hotspot=False),
        dict(gene="SH2B3", tissue="Blood", expression=4.1, deviation=-2.1, variants=["var_005"], hotspot=False),
        dict(gene="IL6", tissue="Liver", expression=5.1, deviation=1.2, variants=["var_004"], hotspot=False),
        dict(gene="NFKB1", tissue="Spleen", expression=5.9, deviation=1.1, variants=["var_001"], hotspot=False),
    ],
    "longevity": [
        dict(gene="FOXO3", tissue="Liver", expression=7.8, deviation=2.5, variants=["var_010"], hotspot=True),
        dict(gene="FOXO3", tissue="Muscle", expression=6.9, deviation=1.8, variants=["var_010"], hotspot=True),
        dict(gene="FOXO3", tissue="Brain", expression=6.2, deviation=1.3, variants=["var_010"], hotspot=False),
        dict(gene="TERT", tissue="Stem Cells", expression=8.4, deviation=3.1, variants=["var_011"], hotspot=True),
        dict(gene="SIRT1", tissue="Liver", expression=7.1, deviation=2.0, variants=["var_012"], hotspot=True),
        dict(gene="SIRT1", tissue="Adipose", expression=5.8, deviation=1.2, variants=["var_012"], hotspot=False),
        dict(gene="SIRT1", tissue="Brain", expression=6.5, deviation=1.6, variants=["var_012"], hotspot=False),
        dict(gene="TERT", tissue="Bone Marrow", expression=7.2, deviation=2.3, variants=["var_011"], hotspot=True),
    ],
    "cardiometabolic": [
        dict(gene="CDKN2A", tissue="Heart", expression=3.2, deviation=-2.8, variants=["var_020"], hotspot=True),
        dict(gene="CDKN2B", tissue="Aorta", expression=3.5, deviation=-2.4, variants=["var_020"], hotspot=True),
        dict(gene="SORT1", tissue="Liver", expression=8.1, deviation=3.5, variants=["var_021"], hotspot=True),
        dict(gene="CELSR2", tissue="Liver", expression=6.7, deviation=1.9, variants=["var_021"], hotspot=False),
        dict(gene="APOE", tissue="Liver", expression=4.8, deviation=-1.8, variants=["var_022"], hotspot=True),
        dict(gene="APOE", tissue="Brain", expression=5.2, deviation=-1.2, variants=["var_022"], hotspot=False),
        dict(gene="APOE", tissue="Vasculature", expression=4.1, deviation=-2.3, variants=["var_022"], hotspot=True),
    ],
    "neuroinflammation": [
        dict(gene="HLA-DQB1", tissue="Brain", expression=7.6, deviation=2.8, variants=["var_030"], hotspot=True),
        dict(gene="HLA-DQB1", tissue="Microglia", expression=8.9, deviation=4.1, variants=["var_030"], hotspot=True),
        dict(gene="MAPT", tissue="Brain", expression=4.5, deviation=-2.0, variants=["var_032"], hotspot=True),
        dict(gene="KANSL1", tissue="Hippocampus", expression=5.1, deviation=-1.4, variants=["var_032"], hotspot=False),
        dict(gene="MAPT", tissue="Cortex", expression=4.8, deviation=-1.7, variants=["var_032"], hotspot=True),
        dict(gene="JAZF1", tissue="Brain", expression=5.5, deviation=-0.9, variants=["var_031"], hotspot=False),
    ],
    "athletic": [
        dict(gene="PPARGC1A", tissue="Muscle", expression=9.2, deviation=3.8, variants=["var_040"], hotspot=True),
        dict(gene="PPARGC1A", tissue="Heart", expression=7.8, deviation=2.4, variants=["var_040"], hotspot=True),
        dict(gene="ACTN3", tissue="Muscle", expression=3.9, deviation=-2.6, variants=["var_041"], hotspot=True),
        dict(gene="ACE", tissue="Heart", expression=6.8, deviation=1.5, variants=["var_042"], hotspot=False),
        dict(gene="ACE", tissue="Vasculature", expression=7.1, deviation=1.8, variants=["var_042"], hotspot=False),
        dict(gene="ACE", tissue="Lung", expression=6.2, deviation=0.9, variants=["var_042"], hotspot=False),
    ],
    "aging": [
        dict(gene="TERT", tissue="Stem Cells", expression=2.8, deviation=-3.5, variants=["var_050"], hotspot=True),
        dict(gene="TERT", tissue="Bone Marrow", expression=3.1, deviation=-3.1, variants=["var_050"], hotspot=True),
        dict(gene="SIRT1", tissue="Liver", expression=3.9, deviation=-2.4, variants=["var_051"], hotspot=True),
        dict(gene="SIRT1", tissue="Adipose", expression=3.5, deviation=-2.8, variants=["var_051"], hotspot=True),
        dict(gene="PARP1", tissue="All Tissues", expression=7.8, deviation=2.1, variants=["var_052"], hotspot=False),
        dict(gene="ADAMTS9", tissue="Adipose", expression=4.2, deviation=-1.5, variants=["var_053"], hotspot=False),
        dict(gene="SIRT1", tissue="Brain", expression=4.1, deviation=-2.1, variants=["var_051"], hotspot=True),
        dict(gene="TERT", tissue="Skin", expression=2.5, deviation=-3.8, variants=["var_050"], hotspot=True),
    ],
}


class ExpressionService:
    """Gene expression landscape data for demo personas."""

    @staticmethod
    def get_landscape(persona_id: str) -> GeneExpressionResponse:
        PersonaService.get_by_id(persona_id)  # validates existence

        raw = _EXPRESSION_DATA.get(persona_id, [])
        entries = [
            GeneExpressionEntry(
                gene=e["gene"],
                tissue=e["tissue"],
                expression_level=e["expression"],
                deviation_from_baseline=e["deviation"],
                affected_by_variants=e["variants"],
                is_hotspot=e["hotspot"],
            )
            for e in raw
        ]

        unique_genes = len(set(e["gene"] for e in raw))
        unique_tissues = len(set(e["tissue"] for e in raw))

        return GeneExpressionResponse(
            entries=entries,
            total_genes=unique_genes,
            total_tissues=unique_tissues,
        )
