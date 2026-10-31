"""
ReguloMe — Disease Hub Service
Disease & systems biology domain data for each persona.
Full synthetic data will be enriched in Part 5.
"""
from app.services.persona_service import PersonaService
from app.schemas.responses import DiseaseHubResponse, DiseaseSystemEntry, EvidenceLevel, DiseaseDomain

# Per-persona disease domain data (skeleton — Part 5 will generate full 12-domain profiles)
_DISEASE_DATA: dict[str, list[dict]] = {
    "inflammatory": [
        dict(domain="inflammatory", label="Inflammatory & Immune", description="Heightened inflammatory signaling with regulatory impact on NF-κB and JAK-STAT cascades.",
             variant_count=18, pathways=["NF-κB Signaling", "JAK-STAT", "TNF-α Cascade"],
             tissues=["immune", "spleen"], burden=78.5, shifts=12, evidence="validated",
             strategies=["Anti-inflammatory diet", "Omega-3 supplementation", "Sleep optimization", "Cold exposure"],
             risk="elevated", icon="🔥"),
        dict(domain="autoimmune", label="Autoimmune Susceptibility", description="Elevated risk of autoimmune dysregulation via HLA and PTPN22 regulatory disruptions.",
             variant_count=11, pathways=["Antigen Presentation", "T-Cell Receptor", "Co-stimulatory Signaling"],
             tissues=["thymus", "immune", "gut"], burden=62.3, shifts=8, evidence="validated",
             strategies=["Gut microbiome support", "Vitamin D optimization", "Stress reduction"],
             risk="elevated", icon="🛡️"),
        dict(domain="metabolic", label="Metabolic Balance", description="Mild metabolic regulatory imbalance affecting glucose sensing and lipid metabolism.",
             variant_count=6, pathways=["Insulin Signaling", "AMPK Pathway"],
             tissues=["liver", "adipose", "pancreas"], burden=38.1, shifts=4, evidence="literature",
             strategies=["Time-restricted eating", "Regular exercise", "Fiber-rich diet"],
             risk="low", icon="⚡"),
        dict(domain="cardiovascular", label="Cardiovascular System", description="Low cardiovascular regulatory burden with normal vascular tone regulation.",
             variant_count=4, pathways=["eNOS Signaling", "Renin-Angiotensin"],
             tissues=["heart", "vasculature"], burden=22.7, shifts=2, evidence="predicted",
             strategies=["Aerobic exercise", "Mediterranean diet"],
             risk="low", icon="❤️"),
    ],
    "longevity": [
        dict(domain="longevity", label="Longevity & Aging", description="Protective regulatory architecture with favorable FOXO3, SIRT1, and telomere maintenance alleles.",
             variant_count=14, pathways=["FOXO Longevity", "Sirtuin Signaling", "Telomere Maintenance"],
             tissues=["liver", "muscle", "brain", "stem_cells"], burden=12.8, shifts=8, evidence="validated",
             strategies=["Caloric restriction mimetics", "NAD+ precursors", "Exercise", "Meditation"],
             risk="low", icon="🧬"),
        dict(domain="mitochondrial", label="Mitochondrial Function", description="Enhanced mitochondrial biogenesis and oxidative phosphorylation capacity.",
             variant_count=7, pathways=["Oxidative Phosphorylation", "Mitochondrial Biogenesis"],
             tissues=["muscle", "brain", "heart"], burden=15.2, shifts=5, evidence="literature",
             strategies=["CoQ10 supplementation", "Cold exposure", "High-intensity training"],
             risk="low", icon="⚡"),
    ],
    "cardiometabolic": [
        dict(domain="cardiovascular", label="Cardiovascular System", description="Significant cardiovascular regulatory burden with disrupted enhancers at the 9p21 locus and APOE region.",
             variant_count=22, pathways=["Lipid Metabolism", "Vascular Tone", "Atherosclerosis"],
             tissues=["heart", "aorta", "coronary_artery", "liver"], burden=88.4, shifts=16, evidence="validated",
             strategies=["Mediterranean diet", "Omega-3 fatty acids", "Statin consultation", "Regular cardiovascular exercise"],
             risk="high", icon="❤️"),
        dict(domain="metabolic", label="Metabolic Syndrome", description="Disrupted glucose sensing and lipid transport regulatory elements.",
             variant_count=15, pathways=["Insulin Signaling", "AMPK", "PPAR"],
             tissues=["liver", "adipose", "pancreas"], burden=72.1, shifts=11, evidence="validated",
             strategies=["Time-restricted eating", "Low glycemic diet", "Resistance training"],
             risk="elevated", icon="⚡"),
        dict(domain="hepatic", label="Hepatic Function", description="Elevated hepatic regulatory impact via SORT1 and APOE variants.",
             variant_count=8, pathways=["Hepatic Lipid Export", "Bile Acid Metabolism"],
             tissues=["liver"], burden=55.3, shifts=6, evidence="literature",
             strategies=["Choline supplementation", "Milk thistle", "Limit alcohol"],
             risk="moderate", icon="🫁"),
    ],
    "neuroinflammation": [
        dict(domain="neurodegenerative", label="Neurodegenerative Risk", description="Regulatory variants impacting microglial activation, tau processing, and neuroimmune crosstalk.",
             variant_count=19, pathways=["Microglial Activation", "Tau Processing", "Blood-Brain Barrier"],
             tissues=["brain", "microglia", "hippocampus", "cortex"], burden=81.7, shifts=14, evidence="validated",
             strategies=["DHA/EPA supplementation", "Mediterranean-MIND diet", "Aerobic exercise", "Quality sleep"],
             risk="high", icon="🧠"),
        dict(domain="inflammatory", label="Neuroinflammation", description="Heightened neuroinflammatory signaling via HLA and MAPT regulatory disruption.",
             variant_count=12, pathways=["NF-κB (CNS)", "Complement Cascade", "Cytokine Signaling"],
             tissues=["brain", "immune", "microglia"], burden=68.9, shifts=9, evidence="validated",
             strategies=["Anti-inflammatory diet", "Curcumin supplementation", "Stress management"],
             risk="elevated", icon="🔥"),
    ],
    "athletic": [
        dict(domain="mitochondrial", label="Mitochondrial Performance", description="Optimized mitochondrial biogenesis via PPARGC1A enhancer variants.",
             variant_count=8, pathways=["Mitochondrial Biogenesis", "Oxidative Phosphorylation", "Fatty Acid Oxidation"],
             tissues=["muscle", "heart"], burden=18.5, shifts=6, evidence="validated",
             strategies=["Endurance training", "Altitude training", "NAD+ precursors"],
             risk="low", icon="⚡"),
        dict(domain="cardiovascular", label="Cardiovascular Performance", description="ACE regulatory variant supporting cardiovascular endurance.",
             variant_count=5, pathways=["Angiotensin Regulation", "eNOS", "Cardiac Output"],
             tissues=["heart", "vasculature", "lung"], burden=14.2, shifts=4, evidence="literature",
             strategies=["Zone 2 training", "Beetroot juice", "Adequate hydration"],
             risk="low", icon="❤️"),
    ],
    "aging": [
        dict(domain="longevity", label="Accelerated Aging", description="Regulatory clock divergence with 8+ year acceleration. Telomere and sirtuin pathways compromised.",
             variant_count=24, pathways=["Telomere Maintenance", "Sirtuin Signaling", "DNA Repair", "Senescence"],
             tissues=["stem_cells", "bone_marrow", "skin", "liver", "brain"], burden=89.6, shifts=18, evidence="validated",
             strategies=["NAD+ precursors", "Caloric restriction", "Senolytics consultation", "Regular exercise", "Sleep optimization"],
             risk="high", icon="⏳"),
        dict(domain="mitochondrial", label="Mitochondrial Decline", description="Reduced mitochondrial efficiency with SIRT1 pathway disruption.",
             variant_count=10, pathways=["Mitochondrial Biogenesis", "NAD+ Metabolism"],
             tissues=["liver", "brain", "muscle"], burden=71.3, shifts=8, evidence="validated",
             strategies=["CoQ10", "PQQ", "Resveratrol", "Cold exposure"],
             risk="elevated", icon="⚡"),
        dict(domain="inflammatory", label="Inflammaging", description="Low-grade chronic inflammation associated with epigenetic aging acceleration.",
             variant_count=9, pathways=["NF-κB", "Senescence-Associated Secretory Phenotype"],
             tissues=["immune", "adipose"], burden=58.4, shifts=7, evidence="literature",
             strategies=["Fasting mimicking diet", "Polyphenol-rich foods", "Exercise"],
             risk="moderate", icon="🔥"),
    ],
}

EVIDENCE_MAP = {
    "validated": EvidenceLevel.VALIDATED,
    "literature": EvidenceLevel.LITERATURE,
    "predicted": EvidenceLevel.PREDICTED,
    "inferred": EvidenceLevel.INFERRED,
}

DOMAIN_MAP = {
    "cardiovascular": DiseaseDomain.CARDIOVASCULAR,
    "inflammatory": DiseaseDomain.INFLAMMATORY,
    "autoimmune": DiseaseDomain.AUTOIMMUNE,
    "metabolic": DiseaseDomain.METABOLIC,
    "neurodegenerative": DiseaseDomain.NEURODEGENERATIVE,
    "cancer": DiseaseDomain.CANCER,
    "endocrine": DiseaseDomain.ENDOCRINE,
    "hepatic": DiseaseDomain.HEPATIC,
    "immune": DiseaseDomain.IMMUNE,
    "hematologic": DiseaseDomain.HEMATOLOGIC,
    "mitochondrial": DiseaseDomain.MITOCHONDRIAL,
    "longevity": DiseaseDomain.LONGEVITY,
}


class DiseaseService:
    """Disease & systems biology hub data."""

    @staticmethod
    def get_hub(persona_id: str) -> DiseaseHubResponse:
        PersonaService.get_by_id(persona_id)  # validates existence

        raw = _DISEASE_DATA.get(persona_id, [])
        domains = [
            DiseaseSystemEntry(
                domain=DOMAIN_MAP.get(d["domain"], DiseaseDomain.INFLAMMATORY),
                label=d["label"],
                description=d["description"],
                variant_count=d["variant_count"],
                disrupted_pathways=d["pathways"],
                affected_tissues=d["tissues"],
                regulatory_burden=d["burden"],
                expression_shifts=d["shifts"],
                evidence_grade=EVIDENCE_MAP.get(d["evidence"], EvidenceLevel.PREDICTED),
                support_strategies=d["strategies"],
                risk_level=d["risk"],
                icon=d["icon"],
            )
            for d in raw
        ]

        return DiseaseHubResponse(domains=domains)
