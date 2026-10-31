"""
ReguloMe — Variant Service
Business logic for regulatory variant listing, detail, and bookmarking.
Full synthetic data will be enriched in Part 5 (Synthetic Demo Data Engine).
"""
from app.core.exceptions import PersonaNotFoundError, VariantNotFoundError
from app.core.dependencies import PaginationParams, VariantFilterParams
from app.services.persona_service import PersonaService
from app.schemas.responses import (
    RegulatoryVariant,
    VariantListResponse,
    ConfidenceScore,
    EvidenceLevel,
    RegulatoryElementType,
)

# ──────────────────────────────────────────────────────
# Placeholder variant data per persona (skeleton — Part 5 will generate full datasets)
# ──────────────────────────────────────────────────────

_VARIANT_BANK: dict[str, list[dict]] = {
    "inflammatory": [
        dict(id="var_001", chromosome="chr6", position=32611467, ref_allele="G", alt_allele="A",
             rs_id="rs9271366", element_type="enhancer", affected_tfs=["NF-κB", "STAT3"],
             predicted_effect="gain", linked_genes=["HLA-DRB1", "HLA-DQB1"],
             tissues=["immune", "spleen", "lymph_node"],
             confidence=0.92, evidence="validated", priority=94.5),
        dict(id="var_002", chromosome="chr1", position=206773552, ref_allele="C", alt_allele="T",
             rs_id="rs2476601", element_type="promoter", affected_tfs=["IRF4", "PU.1"],
             predicted_effect="loss", linked_genes=["PTPN22"],
             tissues=["immune", "thymus"],
             confidence=0.88, evidence="validated", priority=89.2),
        dict(id="var_003", chromosome="chr17", position=44221630, ref_allele="T", alt_allele="C",
             rs_id="rs7216389", element_type="enhancer", affected_tfs=["GATA3"],
             predicted_effect="gain", linked_genes=["ORMDL3", "GSDMB"],
             tissues=["lung", "immune"],
             confidence=0.79, evidence="literature", priority=76.8),
        dict(id="var_004", chromosome="chr2", position=204733868, ref_allele="A", alt_allele="G",
             rs_id="rs10497813", element_type="tfbs", affected_tfs=["AP-1", "JUN"],
             predicted_effect="gain", linked_genes=["ICOS", "CTLA4"],
             tissues=["immune", "spleen"],
             confidence=0.71, evidence="literature", priority=68.4),
        dict(id="var_005", chromosome="chr12", position=111884608, ref_allele="G", alt_allele="A",
             rs_id="rs3184504", element_type="enhancer", affected_tfs=["SPI1"],
             predicted_effect="loss", linked_genes=["SH2B3", "ATXN2"],
             tissues=["blood", "bone_marrow"],
             confidence=0.85, evidence="validated", priority=82.1),
    ],
    "longevity": [
        dict(id="var_010", chromosome="chr6", position=108985784, ref_allele="C", alt_allele="T",
             rs_id="rs2802292", element_type="enhancer", affected_tfs=["FOXO3", "SIRT1"],
             predicted_effect="gain", linked_genes=["FOXO3"],
             tissues=["liver", "muscle", "brain"],
             confidence=0.95, evidence="validated", priority=97.3),
        dict(id="var_011", chromosome="chr5", position=1279790, ref_allele="A", alt_allele="G",
             rs_id="rs2736100", element_type="promoter", affected_tfs=["MYC", "SP1"],
             predicted_effect="gain", linked_genes=["TERT"],
             tissues=["stem_cells", "bone_marrow"],
             confidence=0.91, evidence="validated", priority=93.1),
        dict(id="var_012", chromosome="chr10", position=69644427, ref_allele="T", alt_allele="C",
             rs_id="rs4746720", element_type="enhancer", affected_tfs=["SIRT1"],
             predicted_effect="gain", linked_genes=["SIRT1"],
             tissues=["liver", "adipose", "brain"],
             confidence=0.82, evidence="literature", priority=80.5),
    ],
    "cardiometabolic": [
        dict(id="var_020", chromosome="chr9", position=22125503, ref_allele="C", alt_allele="G",
             rs_id="rs1333049", element_type="enhancer", affected_tfs=["GATA4", "MEF2C"],
             predicted_effect="loss", linked_genes=["CDKN2A", "CDKN2B"],
             tissues=["heart", "aorta", "coronary_artery"],
             confidence=0.94, evidence="validated", priority=96.2),
        dict(id="var_021", chromosome="chr1", position=109821060, ref_allele="G", alt_allele="A",
             rs_id="rs646776", element_type="promoter", affected_tfs=["HNF4A", "SREBP2"],
             predicted_effect="gain", linked_genes=["SORT1", "CELSR2"],
             tissues=["liver", "adipose"],
             confidence=0.89, evidence="validated", priority=88.7),
        dict(id="var_022", chromosome="chr19", position=45416178, ref_allele="T", alt_allele="C",
             rs_id="rs429358", element_type="tfbs", affected_tfs=["CEBPB"],
             predicted_effect="loss", linked_genes=["APOE"],
             tissues=["liver", "brain", "vasculature"],
             confidence=0.96, evidence="validated", priority=98.1),
    ],
    "neuroinflammation": [
        dict(id="var_030", chromosome="chr6", position=32681049, ref_allele="C", alt_allele="T",
             rs_id="rs9275596", element_type="enhancer", affected_tfs=["NF-κB", "IRF5"],
             predicted_effect="gain", linked_genes=["HLA-DQB1"],
             tissues=["brain", "microglia", "immune"],
             confidence=0.87, evidence="validated", priority=86.3),
        dict(id="var_031", chromosome="chr7", position=28170419, ref_allele="A", alt_allele="G",
             rs_id="rs1799945", element_type="promoter", affected_tfs=["USF1"],
             predicted_effect="loss", linked_genes=["JAZF1"],
             tissues=["brain", "cortex"],
             confidence=0.73, evidence="literature", priority=71.9),
        dict(id="var_032", chromosome="chr17", position=46681768, ref_allele="G", alt_allele="A",
             rs_id="rs8070723", element_type="enhancer", affected_tfs=["REST", "CTCF"],
             predicted_effect="loss", linked_genes=["MAPT", "KANSL1"],
             tissues=["brain", "hippocampus", "cortex"],
             confidence=0.91, evidence="validated", priority=92.4),
    ],
    "athletic": [
        dict(id="var_040", chromosome="chr4", position=23815662, ref_allele="C", alt_allele="T",
             rs_id="rs8192678", element_type="enhancer", affected_tfs=["MEF2A", "PGC1A"],
             predicted_effect="gain", linked_genes=["PPARGC1A"],
             tissues=["muscle", "heart", "mitochondria"],
             confidence=0.88, evidence="validated", priority=90.1),
        dict(id="var_041", chromosome="chr11", position=66560624, ref_allele="C", alt_allele="T",
             rs_id="rs1815739", element_type="promoter", affected_tfs=["MYOD1"],
             predicted_effect="loss", linked_genes=["ACTN3"],
             tissues=["muscle", "fast_twitch_fibers"],
             confidence=0.93, evidence="validated", priority=91.7),
        dict(id="var_042", chromosome="chr17", position=63488529, ref_allele="A", alt_allele="G",
             rs_id="rs4343", element_type="tfbs", affected_tfs=["SP1", "CREB"],
             predicted_effect="gain", linked_genes=["ACE"],
             tissues=["heart", "vasculature", "lung"],
             confidence=0.80, evidence="literature", priority=78.5),
    ],
    "aging": [
        dict(id="var_050", chromosome="chr5", position=1279790, ref_allele="G", alt_allele="A",
             rs_id="rs2736100", element_type="promoter", affected_tfs=["MYC", "SP1"],
             predicted_effect="loss", linked_genes=["TERT"],
             tissues=["stem_cells", "bone_marrow", "skin"],
             confidence=0.94, evidence="validated", priority=96.8),
        dict(id="var_051", chromosome="chr10", position=69644427, ref_allele="C", alt_allele="T",
             rs_id="rs4746720", element_type="enhancer", affected_tfs=["SIRT1"],
             predicted_effect="loss", linked_genes=["SIRT1"],
             tissues=["liver", "adipose", "brain"],
             confidence=0.86, evidence="validated", priority=85.2),
        dict(id="var_052", chromosome="chr1", position=226023730, ref_allele="T", alt_allele="C",
             rs_id="rs11240572", element_type="enhancer", affected_tfs=["TP53", "E2F1"],
             predicted_effect="gain", linked_genes=["PARP1"],
             tissues=["all_tissues"],
             confidence=0.77, evidence="literature", priority=74.6),
        dict(id="var_053", chromosome="chr3", position=64711925, ref_allele="A", alt_allele="G",
             rs_id="rs12637801", element_type="silencer", affected_tfs=["DNMT3A"],
             predicted_effect="loss", linked_genes=["ADAMTS9"],
             tissues=["adipose", "liver"],
             confidence=0.69, evidence="predicted", priority=65.3),
    ],
}

# Bookmarks are stored in memory (placeholder — will use database in real mode)
_BOOKMARKS: dict[str, set[str]] = {}

EVIDENCE_MAP = {
    "validated": EvidenceLevel.VALIDATED,
    "literature": EvidenceLevel.LITERATURE,
    "predicted": EvidenceLevel.PREDICTED,
    "inferred": EvidenceLevel.INFERRED,
}

ELEMENT_MAP = {
    "enhancer": RegulatoryElementType.ENHANCER,
    "promoter": RegulatoryElementType.PROMOTER,
    "silencer": RegulatoryElementType.SILENCER,
    "insulator": RegulatoryElementType.INSULATOR,
    "tfbs": RegulatoryElementType.TFBS,
    "ctcf_site": RegulatoryElementType.CTCF_SITE,
    "super_enhancer": RegulatoryElementType.SUPER_ENHANCER,
    "locus_control_region": RegulatoryElementType.LCR,
}

CONFIDENCE_LABELS = {
    (0.9, 1.0): "Very High",
    (0.8, 0.9): "High",
    (0.7, 0.8): "Moderate",
    (0.5, 0.7): "Low",
    (0.0, 0.5): "Very Low",
}


def _confidence_label(value: float) -> str:
    for (lo, hi), label in CONFIDENCE_LABELS.items():
        if lo <= value <= hi:
            return label
    return "Unknown"


def _build_variant(raw: dict, persona_id: str) -> RegulatoryVariant:
    """Convert a raw dict into a RegulatoryVariant schema."""
    ev = EVIDENCE_MAP.get(raw["evidence"], EvidenceLevel.PREDICTED)
    bookmark_key = f"{persona_id}:{raw['id']}"
    return RegulatoryVariant(
        id=raw["id"],
        chromosome=raw["chromosome"],
        position=raw["position"],
        ref_allele=raw["ref_allele"],
        alt_allele=raw["alt_allele"],
        rs_id=raw.get("rs_id"),
        element_type=ELEMENT_MAP.get(raw["element_type"], RegulatoryElementType.ENHANCER),
        affected_tfs=raw["affected_tfs"],
        predicted_effect=raw["predicted_effect"],
        linked_genes=raw["linked_genes"],
        tissues=raw["tissues"],
        confidence_score=ConfidenceScore(
            value=raw["confidence"],
            level=ev,
            label=_confidence_label(raw["confidence"]),
        ),
        priority_score=raw["priority"],
        evidence_level=ev,
        bookmarked=bookmark_key in _BOOKMARKS.get(persona_id, set()),
    )


class VariantService:
    """Service layer for regulatory variant operations."""

    @staticmethod
    def list_variants(
        persona_id: str,
        pagination: PaginationParams,
        filters: VariantFilterParams,
    ) -> VariantListResponse:
        PersonaService.get_by_id(persona_id)  # validates existence

        raw_variants = _VARIANT_BANK.get(persona_id, [])
        variants = [_build_variant(v, persona_id) for v in raw_variants]

        # Apply filters
        if filters.element_type:
            variants = [v for v in variants if v.element_type.value == filters.element_type]
        if filters.tissue:
            variants = [v for v in variants if filters.tissue in v.tissues]
        if filters.confidence_min is not None:
            variants = [v for v in variants if v.confidence_score.value >= filters.confidence_min]
        if filters.priority_min is not None:
            variants = [v for v in variants if v.priority_score >= filters.priority_min]
        if filters.effect:
            variants = [v for v in variants if v.predicted_effect == filters.effect]
        if filters.search:
            q = filters.search.lower()
            variants = [
                v for v in variants
                if q in v.id.lower()
                or q in (v.rs_id or "").lower()
                or any(q in g.lower() for g in v.linked_genes)
                or any(q in tf.lower() for tf in v.affected_tfs)
                or any(q in t.lower() for t in v.tissues)
            ]

        # Sort
        if filters.sort_by:
            sort_key_map = {
                "priority": lambda v: v.priority_score,
                "confidence": lambda v: v.confidence_score.value,
                "position": lambda v: v.position,
                "chromosome": lambda v: v.chromosome,
            }
            key_fn = sort_key_map.get(filters.sort_by, lambda v: v.priority_score)
            variants.sort(key=key_fn, reverse=(filters.sort_order == "desc"))

        total = len(variants)

        # Paginate
        start = pagination.offset
        end = start + pagination.page_size
        page_variants = variants[start:end]

        return VariantListResponse(
            variants=page_variants,
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
        )

    @staticmethod
    def get_variant(persona_id: str, variant_id: str) -> RegulatoryVariant:
        PersonaService.get_by_id(persona_id)

        raw_variants = _VARIANT_BANK.get(persona_id, [])
        for v in raw_variants:
            if v["id"] == variant_id:
                return _build_variant(v, persona_id)

        raise VariantNotFoundError(variant_id)

    @staticmethod
    def toggle_bookmark(persona_id: str, variant_id: str) -> dict:
        PersonaService.get_by_id(persona_id)

        # Verify variant exists
        raw_variants = _VARIANT_BANK.get(persona_id, [])
        if not any(v["id"] == variant_id for v in raw_variants):
            raise VariantNotFoundError(variant_id)

        if persona_id not in _BOOKMARKS:
            _BOOKMARKS[persona_id] = set()

        bookmark_key = f"{persona_id}:{variant_id}"
        if bookmark_key in _BOOKMARKS[persona_id]:
            _BOOKMARKS[persona_id].discard(bookmark_key)
            return {"variant_id": variant_id, "bookmarked": False}
        else:
            _BOOKMARKS[persona_id].add(bookmark_key)
            return {"variant_id": variant_id, "bookmarked": True}
