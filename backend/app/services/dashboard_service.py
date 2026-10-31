"""
ReguloMe — Dashboard Service
Aggregated dashboard data. Full synthetic data in Part 5.
"""
from app.core.exceptions import PersonaNotFoundError
from app.services.persona_service import PersonaService
from app.schemas.responses import (
    DashboardResponse,
    EpigeneticAgeResponse,
    AgeHistoryPoint,
    RegulatoryVariant,
    ConfidenceScore,
    TissueHighlight,
    DiseaseSystemEntry,
    HabitSnapshot,
    EvidenceLevel,
    RegulatoryElementType,
    DiseaseDomain,
)


class DashboardService:
    """Aggregated dashboard data — placeholder with skeleton responses."""

    @staticmethod
    def get_dashboard(persona_id: str) -> DashboardResponse:
        persona = PersonaService.get_by_id(persona_id)  # validates existence

        return DashboardResponse(
            regulatory_age=EpigeneticAgeResponse(
                chronological_age=persona.age,
                epigenetic_age=persona.age + 3.2,
                regulatory_methylation_age=persona.age + 5.1,
                trend="accelerating",
                is_estimated=True,
                history_points=[
                    AgeHistoryPoint(date="2025-01", epigenetic_age=persona.age + 2.0, regulatory_age=persona.age + 4.0),
                    AgeHistoryPoint(date="2025-06", epigenetic_age=persona.age + 2.8, regulatory_age=persona.age + 4.5),
                    AgeHistoryPoint(date="2026-01", epigenetic_age=persona.age + 3.2, regulatory_age=persona.age + 5.1),
                ],
            ),
            top_variants=[
                RegulatoryVariant(
                    id="var_001",
                    chromosome="chr6",
                    position=32611467,
                    ref_allele="G",
                    alt_allele="A",
                    rs_id="rs9271366",
                    element_type=RegulatoryElementType.ENHANCER,
                    affected_tfs=["NF-κB", "STAT3"],
                    predicted_effect="gain",
                    linked_genes=["HLA-DRB1", "HLA-DQB1"],
                    tissues=["immune", "spleen", "lymph_node"],
                    confidence_score=ConfidenceScore(value=0.92, level=EvidenceLevel.VALIDATED, label="High"),
                    priority_score=94.5,
                    evidence_level=EvidenceLevel.VALIDATED,
                ),
            ],
            tissue_highlights=[
                TissueHighlight(tissue="Immune Cells", impact_score=87.3, trend="elevated"),
                TissueHighlight(tissue="Liver", impact_score=62.1, trend="stable"),
                TissueHighlight(tissue="Brain (Cortex)", impact_score=45.8, trend="moderate"),
            ],
            disease_systems=[
                DiseaseSystemEntry(
                    domain=DiseaseDomain.INFLAMMATORY,
                    label="Inflammatory & Immune",
                    description="Heightened inflammatory signaling with regulatory impact on NF-κB and JAK-STAT cascades.",
                    variant_count=18,
                    disrupted_pathways=["NF-κB Signaling", "JAK-STAT", "TNF-α Cascade"],
                    affected_tissues=["immune", "spleen"],
                    regulatory_burden=78.5,
                    expression_shifts=12,
                    evidence_grade=EvidenceLevel.VALIDATED,
                    support_strategies=["Anti-inflammatory diet", "Omega-3 supplementation", "Sleep optimization"],
                    risk_level="elevated",
                    icon="🔥",
                ),
            ],
            habit_snapshot=HabitSnapshot(
                total_streak=14,
                weekly_score=72.5,
                top_habit="Sleep Optimization",
            ),
            weekly_report_summary="Your regulatory profile shows moderate inflammatory activation this week. Sleep quality improvements have positively impacted FOXO3 pathway support.",
        )
