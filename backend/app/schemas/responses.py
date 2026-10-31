"""
ReguloMe — Pydantic Response/Request Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


# === Enums ===
class EvidenceLevel(str, Enum):
    VALIDATED = "validated"
    LITERATURE = "literature"
    PREDICTED = "predicted"
    INFERRED = "inferred"


class RegulatoryElementType(str, Enum):
    ENHANCER = "enhancer"
    PROMOTER = "promoter"
    SILENCER = "silencer"
    INSULATOR = "insulator"
    TFBS = "tfbs"
    CTCF_SITE = "ctcf_site"
    SUPER_ENHANCER = "super_enhancer"
    LCR = "locus_control_region"


class DiseaseDomain(str, Enum):
    CARDIOVASCULAR = "cardiovascular"
    INFLAMMATORY = "inflammatory"
    AUTOIMMUNE = "autoimmune"
    METABOLIC = "metabolic"
    NEURODEGENERATIVE = "neurodegenerative"
    CANCER = "cancer"
    ENDOCRINE = "endocrine"
    HEPATIC = "hepatic"
    IMMUNE = "immune"
    HEMATOLOGIC = "hematologic"
    MITOCHONDRIAL = "mitochondrial"
    LONGEVITY = "longevity"


class AppMode(str, Enum):
    DEMO = "demo"
    REAL = "real"


# === Confidence ===
class ConfidenceScore(BaseModel):
    value: float = Field(ge=0, le=1)
    level: EvidenceLevel
    label: str


# === Persona ===
class DemoPersona(BaseModel):
    id: str
    name: str
    label: str
    description: str
    profile_type: str
    age: int
    genome_build: str = "GRCh38"
    variant_count: int
    color: str
    icon: str


# === Variant ===
class RegulatoryVariant(BaseModel):
    id: str
    chromosome: str
    position: int
    ref_allele: str
    alt_allele: str
    rs_id: Optional[str] = None
    element_type: RegulatoryElementType
    affected_tfs: list[str]
    predicted_effect: str  # gain | loss | neutral
    linked_genes: list[str]
    tissues: list[str]
    confidence_score: ConfidenceScore
    priority_score: float = Field(ge=0, le=100)
    evidence_level: EvidenceLevel
    bookmarked: bool = False


class VariantListResponse(BaseModel):
    variants: list[RegulatoryVariant]
    total: int
    page: int = 1
    page_size: int = 50


# === Gene Expression ===
class GeneExpressionEntry(BaseModel):
    gene: str
    tissue: str
    expression_level: float
    deviation_from_baseline: float
    affected_by_variants: list[str]
    is_hotspot: bool


class GeneExpressionResponse(BaseModel):
    entries: list[GeneExpressionEntry]
    total_genes: int
    total_tissues: int


# === Network ===
class NetworkNode(BaseModel):
    id: str
    label: str
    type: str  # transcription_factor, enhancer, promoter, gene, pathway, tissue, disease
    size: float
    color: Optional[str] = None


class NetworkEdge(BaseModel):
    source: str
    target: str
    weight: float = Field(ge=0, le=1)
    type: str  # regulates, activates, represses, associated, interacts


class NetworkGraphResponse(BaseModel):
    nodes: list[NetworkNode]
    edges: list[NetworkEdge]


# === Disease ===
class DiseaseSystemEntry(BaseModel):
    domain: DiseaseDomain
    label: str
    description: str
    variant_count: int
    disrupted_pathways: list[str]
    affected_tissues: list[str]
    regulatory_burden: float = Field(ge=0, le=100)
    expression_shifts: int
    evidence_grade: EvidenceLevel
    support_strategies: list[str]
    risk_level: str  # low, moderate, elevated, high
    icon: str


class DiseaseHubResponse(BaseModel):
    domains: list[DiseaseSystemEntry]


# === Epigenetic Clock ===
class AgeHistoryPoint(BaseModel):
    date: str
    epigenetic_age: float
    regulatory_age: float


class EpigeneticAgeResponse(BaseModel):
    chronological_age: float
    epigenetic_age: float
    regulatory_methylation_age: float
    trend: str  # accelerating, stable, decelerating
    is_estimated: bool
    history_points: list[AgeHistoryPoint]


# === Optimization ===
class HabitEntry(BaseModel):
    id: str
    date: str
    category: str
    label: str
    value: float
    unit: str
    pathway_support: list[str]


class OptimizationGoal(BaseModel):
    id: str
    label: str
    target_pathways: list[str]
    current_score: float
    target_score: float
    streak: int


class OptimizationResponse(BaseModel):
    habits: list[HabitEntry]
    goals: list[OptimizationGoal]
    weekly_score: float
    total_streak: int


# === Simulator ===
class SimulationScenario(BaseModel):
    id: str
    label: str
    adjustments: dict[str, float]


class SimulationResult(BaseModel):
    pathway_support: dict[str, float]
    regulatory_burden: float
    tissue_trends: dict[str, float]
    age_trend: float
    network_balance: float


class SimulatorResponse(BaseModel):
    scenario: SimulationScenario
    baseline: SimulationResult
    simulated: SimulationResult


# === Dashboard ===
class TissueHighlight(BaseModel):
    tissue: str
    impact_score: float
    trend: str


class HabitSnapshot(BaseModel):
    total_streak: int
    weekly_score: float
    top_habit: str


class DashboardResponse(BaseModel):
    regulatory_age: EpigeneticAgeResponse
    top_variants: list[RegulatoryVariant]
    tissue_highlights: list[TissueHighlight]
    disease_systems: list[DiseaseSystemEntry]
    habit_snapshot: HabitSnapshot
    weekly_report_summary: str


# === Auth ===
class SignupRequest(BaseModel):
    email: str
    password: str
    name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    email: str


# === Health ===
class HealthResponse(BaseModel):
    status: str
    version: str
    mode: str
    demo_personas_available: int


# === Bookmarks ===
class BookmarkEntry(BaseModel):
    id: int
    variant_id: str
    rs_id: Optional[str] = None
    gene: Optional[str] = None
    chromosome: Optional[str] = None
    position: Optional[int] = None
    notes: Optional[str] = None
    created_at: str


class BookmarkListResponse(BaseModel):
    bookmarks: list[BookmarkEntry]
    total: int


# === Real Variant Annotation ===
class ClinVarResult(BaseModel):
    rsid: str
    clinical_significance: str = "Unknown"
    review_status: str = ""
    conditions: list[str] = []
    last_evaluated: str = ""
    accession: str = ""
    error: Optional[str] = None


class EnsemblVariantResult(BaseModel):
    rsid: str
    most_severe_consequence: Optional[str] = None
    ambiguity: Optional[str] = None
    minor_allele: Optional[str] = None
    minor_allele_freq: Optional[float] = None
    maf_allele: Optional[str] = None
    mappings: list[dict] = []
    phenotypes: list[dict] = []
    error: Optional[str] = None


class OpenTargetsDiseaseAssoc(BaseModel):
    disease_id: str
    disease_name: str
    therapeutic_areas: list[str]
    overall_score: float
    genetic_evidence: float
    clinical_evidence: float


class OpenTargetsResult(BaseModel):
    gene: str
    ensembl_id: Optional[str] = None
    approved_name: Optional[str] = None
    associations: list[OpenTargetsDiseaseAssoc] = []
    total: int = 0
    error: Optional[str] = None


class GTExTissueExpression(BaseModel):
    tissue: str
    tissue_label: str
    median_tpm: float
    unit: str = "TPM"


class FullVariantAnnotation(BaseModel):
    """Combined annotation from all public APIs."""
    rsid: str
    ensembl: dict = {}
    clinvar: ClinVarResult
    vep_consequences: list[dict] = []
    source: str = "real"


# === Analysis History ===
class HistoryEntry(BaseModel):
    id: int
    query_type: str
    query_input: str
    result_count: int
    source: str
    created_at: str


class HistoryResponse(BaseModel):
    history: list[HistoryEntry]
    total: int
