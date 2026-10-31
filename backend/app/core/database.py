"""
ReguloMe — SQLite Database Engine
Uses SQLAlchemy with SQLite (zero-install, file-based persistence).
The database file lives at ./regulome.db beside the backend directory.
"""
import os
from pathlib import Path
from sqlalchemy import (
    create_engine,
    Column,
    String,
    Float,
    Boolean,
    DateTime,
    Text,
    Integer,
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from datetime import datetime, timezone

# ── DB path ─────────────────────────────────────────────────────────────────
# Store the database file at the project root (one level above /backend)
_HERE = Path(__file__).resolve().parent.parent.parent.parent  # e:\regulome
DB_PATH = os.environ.get("DATABASE_PATH", str(_HERE / "regulome.db"))
DATABASE_URL = f"sqlite:///{DB_PATH}"

# ── Engine ───────────────────────────────────────────────────────────────────
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # Required for SQLite + FastAPI
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── Models ───────────────────────────────────────────────────────────────────

class UserModel(Base):
    __tablename__ = "users"

    user_id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_login = Column(DateTime, nullable=True)


class BookmarkModel(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, index=True, nullable=False)
    variant_id = Column(String, index=True, nullable=False)
    persona_id = Column(String, nullable=True)           # demo persona context
    rs_id = Column(String, nullable=True)                # e.g. rs9271366
    gene = Column(String, nullable=True)
    chromosome = Column(String, nullable=True)
    position = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class GenomeDataModel(Base):
    """One record per user — their uploaded genome results"""
    __tablename__ = "genome_data"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, index=True, nullable=False, unique=True)
    filename = Column(String, nullable=True)
    file_type = Column(String, nullable=True)          # vcf / 23andme / ancestry
    total_variants_in_file = Column(Integer, default=0)
    variants_processed = Column(Integer, default=0)
    upload_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    processing_complete = Column(Boolean, default=False)
    # Summary statistics (precomputed for fast dashboard loads)
    total_pathogenic = Column(Integer, default=0)
    total_likely_pathogenic = Column(Integer, default=0)
    total_benign = Column(Integer, default=0)
    total_uncertain = Column(Integer, default=0)
    total_risk_factor = Column(Integer, default=0)
    high_impact_count = Column(Integer, default=0)
    unique_genes_count = Column(Integer, default=0)
    regulatory_age_score = Column(Float, default=0.0)
    overall_risk_score = Column(Float, default=0.0)


class VariantModel(Base):
    """Every annotated variant from the user's genome file"""
    __tablename__ = "real_variants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    genome_data_id = Column(Integer, index=True, nullable=False)
    # From VCF / 23andMe file
    rsid = Column(String, index=True)
    chromosome = Column(String)
    position = Column(Integer)
    ref_allele = Column(String)
    alt_allele = Column(String)
    genotype = Column(String)
    # From ClinVar API
    gene_name = Column(String)
    clinical_significance = Column(String)
    condition = Column(Text)
    review_status = Column(String)
    clinvar_id = Column(String)
    # From Ensembl API
    regulatory_element_type = Column(String)
    consequence = Column(String)
    impact = Column(String)
    biotype = Column(String)
    # From GTEx API
    top_tissue = Column(String)
    max_tpm = Column(Float, default=0.0)
    # From gnomAD API (population frequency)
    af_global = Column(Float, default=0.0)
    af_afr = Column(Float, default=0.0)
    af_amr = Column(Float, default=0.0)
    af_asj = Column(Float, default=0.0)
    af_eas = Column(Float, default=0.0)
    af_fin = Column(Float, default=0.0)
    af_nfe = Column(Float, default=0.0)
    af_sas = Column(Float, default=0.0)
    rarity_label = Column(String)
    # From Open Targets API
    top_disease = Column(String)
    top_disease_score = Column(Float, default=0.0)
    # Computed by ReguloMe scoring engine
    impact_score = Column(Float, default=0.0)


class AnalysisHistoryModel(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, index=True, nullable=False)
    query_type = Column(String, nullable=False)          # "variant_search", "gene_lookup", "disease_query"
    query_input = Column(Text, nullable=False)           # the raw search term
    result_count = Column(Integer, default=0)
    source = Column(String, nullable=True)               # "ensembl", "clinvar", "gtex", "open_targets", "demo"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class CacheModel(Base):
    __tablename__ = "api_cache"

    cache_key = Column(String, primary_key=True)         # e.g. "ensembl:rs9271366"
    response_json = Column(Text, nullable=False)
    source = Column(String, nullable=False)
    fetched_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=True)


# ── Helpers ──────────────────────────────────────────────────────────────────

def get_db() -> Session:
    """FastAPI dependency — yields a DB session and closes it after request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables (idempotent — safe to call on every startup)."""
    Base.metadata.create_all(bind=engine)
    print(f"  [DB] SQLite database initialised at: {DB_PATH}")
