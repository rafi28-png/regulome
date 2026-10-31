"""
ReguloMe — Epigenetic Clock Service
Epigenetic & regulatory age data with trend history.
Full synthetic data will be enriched in Part 5.
"""
from app.services.persona_service import PersonaService
from app.schemas.responses import EpigeneticAgeResponse, AgeHistoryPoint

# Per-persona epigenetic age profiles
_EPIGENETIC_DATA: dict[str, dict] = {
    "inflammatory": dict(
        chrono=38, epi=41.2, reg=43.1, trend="accelerating", estimated=True,
        history=[
            ("2024-06", 39.8, 41.5), ("2025-01", 40.5, 42.3),
            ("2025-06", 40.9, 42.8), ("2026-01", 41.2, 43.1),
        ],
    ),
    "longevity": dict(
        chrono=62, epi=54.8, reg=52.1, trend="decelerating", estimated=True,
        history=[
            ("2024-06", 56.2, 54.0), ("2025-01", 55.6, 53.2),
            ("2025-06", 55.1, 52.6), ("2026-01", 54.8, 52.1),
        ],
    ),
    "cardiometabolic": dict(
        chrono=45, epi=49.7, reg=51.3, trend="accelerating", estimated=True,
        history=[
            ("2024-06", 48.1, 49.5), ("2025-01", 48.9, 50.2),
            ("2025-06", 49.3, 50.8), ("2026-01", 49.7, 51.3),
        ],
    ),
    "neuroinflammation": dict(
        chrono=34, epi=36.5, reg=38.2, trend="accelerating", estimated=True,
        history=[
            ("2024-06", 35.4, 36.8), ("2025-01", 35.9, 37.4),
            ("2025-06", 36.2, 37.8), ("2026-01", 36.5, 38.2),
        ],
    ),
    "athletic": dict(
        chrono=28, epi=25.3, reg=24.1, trend="decelerating", estimated=True,
        history=[
            ("2024-06", 26.1, 25.2), ("2025-01", 25.8, 24.8),
            ("2025-06", 25.5, 24.4), ("2026-01", 25.3, 24.1),
        ],
    ),
    "aging": dict(
        chrono=55, epi=63.2, reg=66.8, trend="accelerating", estimated=True,
        history=[
            ("2024-06", 61.0, 64.1), ("2025-01", 61.8, 65.2),
            ("2025-06", 62.5, 66.0), ("2026-01", 63.2, 66.8),
        ],
    ),
}


class EpigeneticService:
    """Epigenetic & regulatory age data."""

    @staticmethod
    def get_age_data(persona_id: str) -> EpigeneticAgeResponse:
        PersonaService.get_by_id(persona_id)  # validates existence

        data = _EPIGENETIC_DATA.get(persona_id)
        if data is None:
            persona = PersonaService.get_by_id(persona_id)
            # Fallback skeleton
            return EpigeneticAgeResponse(
                chronological_age=persona.age,
                epigenetic_age=persona.age + 2.0,
                regulatory_methylation_age=persona.age + 3.5,
                trend="stable",
                is_estimated=True,
                history_points=[],
            )

        history = [
            AgeHistoryPoint(date=h[0], epigenetic_age=h[1], regulatory_age=h[2])
            for h in data["history"]
        ]

        return EpigeneticAgeResponse(
            chronological_age=data["chrono"],
            epigenetic_age=data["epi"],
            regulatory_methylation_age=data["reg"],
            trend=data["trend"],
            is_estimated=data["estimated"],
            history_points=history,
        )
