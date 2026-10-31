"""
ReguloMe — Simulator Service
Regulatory Twin Simulator — scenario-based what-if analysis.
Full synthetic data will be enriched in Part 5.
"""
from app.services.persona_service import PersonaService
from app.schemas.responses import SimulatorResponse, SimulationScenario, SimulationResult

# Baseline results per persona (current lifestyle state)
_BASELINES: dict[str, dict] = {
    "inflammatory": dict(
        pathway_support={"NF-κB Signaling": 32.5, "JAK-STAT": 28.1, "TNF-α Cascade": 25.8,
                         "FOXO3 Pathway": 41.2, "Autophagy": 35.0, "AMPK": 38.5},
        regulatory_burden=78.5,
        tissue_trends={"immune": 0.85, "spleen": 0.72, "liver": 0.45, "lung": 0.38, "brain": 0.31},
        age_trend=1.35,  # years/year acceleration
        network_balance=0.42,
    ),
    "longevity": dict(
        pathway_support={"FOXO3": 82.1, "SIRT1": 78.5, "Telomere Maintenance": 75.2,
                         "Autophagy": 71.8, "NAD+ Metabolism": 68.4, "mTOR Balance": 65.0},
        regulatory_burden=12.8,
        tissue_trends={"liver": 0.22, "muscle": 0.18, "brain": 0.15, "stem_cells": 0.12},
        age_trend=-1.15,
        network_balance=0.88,
    ),
    "cardiometabolic": dict(
        pathway_support={"Lipid Metabolism": 22.4, "Vascular Tone": 28.6, "Insulin Signaling": 35.1,
                         "AMPK": 32.8, "eNOS": 30.2, "Hepatic Export": 25.5},
        regulatory_burden=88.4,
        tissue_trends={"heart": 0.88, "aorta": 0.82, "liver": 0.75, "adipose": 0.62},
        age_trend=1.57,
        network_balance=0.35,
    ),
    "neuroinflammation": dict(
        pathway_support={"Microglial Homeostasis": 28.3, "BBB Integrity": 35.1, "BDNF": 42.5,
                         "Glymphatic Clearance": 38.7, "Complement Regulation": 31.2},
        regulatory_burden=81.7,
        tissue_trends={"brain": 0.82, "microglia": 0.78, "hippocampus": 0.71, "cortex": 0.65},
        age_trend=1.18,
        network_balance=0.38,
    ),
    "athletic": dict(
        pathway_support={"PPARGC1A": 88.2, "Mitochondrial Biogenesis": 85.1, "mTOR": 72.4,
                         "Recovery": 68.5, "Cardiac Output": 82.3, "VO2max Support": 79.1},
        regulatory_burden=18.5,
        tissue_trends={"muscle": 0.15, "heart": 0.12, "vasculature": 0.10, "lung": 0.08},
        age_trend=-0.95,
        network_balance=0.91,
    ),
    "aging": dict(
        pathway_support={"Telomere Maintenance": 18.5, "SIRT1": 22.3, "DNA Repair": 28.7,
                         "Autophagy": 25.1, "Senescence Clearance": 15.8, "NAD+ Metabolism": 20.4},
        regulatory_burden=89.6,
        tissue_trends={"stem_cells": 0.92, "bone_marrow": 0.85, "skin": 0.78, "liver": 0.72, "brain": 0.68},
        age_trend=2.15,
        network_balance=0.28,
    ),
}

# Default optimized scenario
_DEFAULT_SCENARIO = SimulationScenario(
    id="default_optimized",
    label="Optimized Lifestyle",
    adjustments={
        "sleep": 0.25,        # 25% improvement
        "diet": 0.30,         # 30% improvement
        "exercise": 0.20,     # 20% improvement
        "stress": -0.35,      # 35% reduction
        "fasting": 0.15,      # 15% improvement
        "recovery": 0.20,     # 20% improvement
    },
)


def _simulate_result(baseline: dict, adjustments: dict[str, float]) -> SimulationResult:
    """Apply scenario adjustments to baseline to produce simulated results."""
    # Calculate overall improvement factor
    improvement = sum(abs(v) for v in adjustments.values()) / len(adjustments) if adjustments else 0.0

    # Apply improvement to pathway support
    simulated_pathways = {}
    for pathway, score in baseline["pathway_support"].items():
        delta = (100.0 - score) * improvement * 0.6  # Move 60% toward ceiling per unit improvement
        simulated_pathways[pathway] = min(100.0, round(score + delta, 1))

    # Reduce regulatory burden
    simulated_burden = max(0.0, round(baseline["regulatory_burden"] * (1.0 - improvement * 0.4), 1))

    # Improve tissue trends (lower = better)
    simulated_tissues = {
        tissue: round(max(0.0, trend * (1.0 - improvement * 0.3)), 2)
        for tissue, trend in baseline["tissue_trends"].items()
    }

    # Improve age trend
    simulated_age_trend = round(baseline["age_trend"] - improvement * 1.5, 2)

    # Improve network balance
    simulated_balance = round(min(1.0, baseline["network_balance"] + improvement * 0.2), 2)

    return SimulationResult(
        pathway_support=simulated_pathways,
        regulatory_burden=simulated_burden,
        tissue_trends=simulated_tissues,
        age_trend=simulated_age_trend,
        network_balance=simulated_balance,
    )


class SimulatorService:
    """Regulatory Twin Simulator — what-if analysis."""

    @staticmethod
    def get_default(persona_id: str) -> SimulatorResponse:
        PersonaService.get_by_id(persona_id)  # validates existence

        baseline_data = _BASELINES.get(persona_id)
        if baseline_data is None:
            # Fallback
            baseline_data = dict(
                pathway_support={"Default": 50.0},
                regulatory_burden=50.0,
                tissue_trends={"primary": 0.5},
                age_trend=0.5,
                network_balance=0.5,
            )

        baseline_result = SimulationResult(**baseline_data)
        simulated_result = _simulate_result(baseline_data, _DEFAULT_SCENARIO.adjustments)

        return SimulatorResponse(
            scenario=_DEFAULT_SCENARIO,
            baseline=baseline_result,
            simulated=simulated_result,
        )

    @staticmethod
    def simulate(persona_id: str, scenario: SimulationScenario) -> SimulatorResponse:
        PersonaService.get_by_id(persona_id)

        baseline_data = _BASELINES.get(persona_id)
        if baseline_data is None:
            baseline_data = dict(
                pathway_support={"Default": 50.0},
                regulatory_burden=50.0,
                tissue_trends={"primary": 0.5},
                age_trend=0.5,
                network_balance=0.5,
            )

        baseline_result = SimulationResult(**baseline_data)
        simulated_result = _simulate_result(baseline_data, scenario.adjustments)

        return SimulatorResponse(
            scenario=scenario,
            baseline=baseline_result,
            simulated=simulated_result,
        )
