"""
ReguloMe — Persona Service
Business logic for demo persona management.
Demo data will be populated in Part 5 (Synthetic Demo Data Engine).
"""
from app.core.exceptions import PersonaNotFoundError
from app.schemas.responses import DemoPersona


# Placeholder persona registry — Part 5 will generate full synthetic data
_DEMO_PERSONAS: dict[str, DemoPersona] = {
    "inflammatory": DemoPersona(
        id="inflammatory",
        name="Aria Vasquez",
        label="Inflammatory Immune-Skewed",
        description="Chronic inflammation with heightened immune activation. Multiple regulatory variants affecting NF-κB, JAK-STAT, and TNF-α pathways.",
        profile_type="Inflammatory Immune-Skewed",
        age=38,
        variant_count=247,
        color="#ef4444",
        icon="🔥",
    ),
    "longevity": DemoPersona(
        id="longevity",
        name="Dr. Kenji Nakamura",
        label="Longevity-Optimized",
        description="Favorable regulatory architecture for longevity. FOXO3, SIRT1, and TERT-associated enhancers show protective alleles with optimized telomere maintenance.",
        profile_type="Longevity-Optimized",
        age=62,
        variant_count=189,
        color="#22c55e",
        icon="🧬",
    ),
    "cardiometabolic": DemoPersona(
        id="cardiometabolic",
        name="Marcus Chen",
        label="Cardiometabolic-Risk",
        description="Elevated cardiometabolic regulatory burden. Disrupted enhancers affecting lipid metabolism, vascular tone, and glucose sensing pathways.",
        profile_type="Cardiometabolic-Risk",
        age=45,
        variant_count=312,
        color="#f59e0b",
        icon="❤️",
    ),
    "neuroinflammation": DemoPersona(
        id="neuroinflammation",
        name="Sofia Lindqvist",
        label="Neuroinflammation-Sensitive",
        description="Susceptibility to neuroinflammatory cascades. Regulatory variants impacting microglial activation, blood-brain barrier integrity, and neuroimmune crosstalk.",
        profile_type="Neuroinflammation-Sensitive",
        age=34,
        variant_count=278,
        color="#a855f7",
        icon="🧠",
    ),
    "athletic": DemoPersona(
        id="athletic",
        name="Jamal Williams",
        label="Athletic Recovery/Performance",
        description="Optimized for athletic performance with recovery modifiers. PPARGC1A, ACE, and ACTN3 regulatory regions show performance-associated variants.",
        profile_type="Athletic Recovery/Performance",
        age=28,
        variant_count=156,
        color="#06b6d4",
        icon="🏃",
    ),
    "aging": DemoPersona(
        id="aging",
        name="Dr. Elena Kowalski",
        label="Regulatory Aging Acceleration",
        description="Accelerated epigenetic aging with regulatory clock divergence. DNA methylation patterns suggest 8+ year regulatory age acceleration.",
        profile_type="Regulatory Aging Acceleration",
        age=55,
        variant_count=334,
        color="#ec4899",
        icon="⏳",
    ),
}


class PersonaService:
    """Service layer for demo persona operations."""

    @staticmethod
    def list_all() -> list[DemoPersona]:
        """Return all demo personas."""
        return list(_DEMO_PERSONAS.values())

    @staticmethod
    def get_by_id(persona_id: str) -> DemoPersona:
        """Get a specific persona by ID. Raises PersonaNotFoundError if not found."""
        persona = _DEMO_PERSONAS.get(persona_id)
        if persona is None:
            raise PersonaNotFoundError(persona_id)
        return persona

    @staticmethod
    def exists(persona_id: str) -> bool:
        """Check if a persona exists."""
        return persona_id in _DEMO_PERSONAS

    @staticmethod
    def get_ids() -> list[str]:
        """Return all persona IDs."""
        return list(_DEMO_PERSONAS.keys())
