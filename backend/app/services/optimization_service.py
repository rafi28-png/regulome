"""
ReguloMe — Optimization Studio Service
Habit tracking, goals, streaks, and pathway support data.
Full synthetic data will be enriched in Part 5.
"""
from app.services.persona_service import PersonaService
from app.schemas.responses import OptimizationResponse, HabitEntry, OptimizationGoal

# Per-persona optimization data
_OPTIMIZATION_DATA: dict[str, dict] = {
    "inflammatory": dict(
        habits=[
            dict(id="h_001", date="2026-03-28", category="diet", label="Anti-inflammatory meal",
                 value=1.0, unit="meal", pathways=["NF-κB Signaling", "TNF-α Cascade"]),
            dict(id="h_002", date="2026-03-28", category="supplement", label="Omega-3 (EPA/DHA)",
                 value=3000, unit="mg", pathways=["TNF-α Cascade", "Resolvin Signaling"]),
            dict(id="h_003", date="2026-03-28", category="sleep", label="Sleep Quality",
                 value=7.5, unit="hours", pathways=["FOXO3 Pathway", "Cortisol Regulation"]),
            dict(id="h_004", date="2026-03-28", category="exercise", label="Zone 2 Cardio",
                 value=45, unit="min", pathways=["AMPK", "Mitochondrial Biogenesis"]),
            dict(id="h_005", date="2026-03-28", category="cold_exposure", label="Cold Shower",
                 value=3, unit="min", pathways=["Norepinephrine", "BAT Activation"]),
            dict(id="h_006", date="2026-03-27", category="fasting", label="Time-Restricted Eating",
                 value=16, unit="hours", pathways=["Autophagy", "AMPK", "SIRT1"]),
            dict(id="h_007", date="2026-03-27", category="stress", label="Meditation",
                 value=20, unit="min", pathways=["Cortisol Regulation", "Telomere Maintenance"]),
        ],
        goals=[
            dict(id="g_001", label="Reduce NF-κB Activation",
                 pathways=["NF-κB Signaling", "TNF-α Cascade"],
                 current=34.5, target=60.0, streak=8),
            dict(id="g_002", label="Optimize Sleep Architecture",
                 pathways=["FOXO3 Pathway", "Circadian Clock"],
                 current=52.0, target=80.0, streak=14),
            dict(id="g_003", label="Enhance Omega-3 Index",
                 pathways=["Resolvin Signaling", "Anti-inflammatory"],
                 current=68.0, target=85.0, streak=21),
        ],
        weekly_score=62.5,
        total_streak=14,
    ),
    "longevity": dict(
        habits=[
            dict(id="h_010", date="2026-03-28", category="fasting", label="24h Fast",
                 value=24, unit="hours", pathways=["Autophagy", "FOXO3", "SIRT1"]),
            dict(id="h_011", date="2026-03-28", category="exercise", label="Resistance Training",
                 value=60, unit="min", pathways=["mTOR", "Muscle Protein Synthesis"]),
            dict(id="h_012", date="2026-03-28", category="supplement", label="NMN",
                 value=500, unit="mg", pathways=["NAD+ Metabolism", "SIRT1"]),
            dict(id="h_013", date="2026-03-28", category="sleep", label="Deep Sleep",
                 value=8.2, unit="hours", pathways=["Growth Hormone", "Glymphatic Clearance"]),
        ],
        goals=[
            dict(id="g_010", label="Maximize FOXO3 Pathway Support",
                 pathways=["FOXO3", "Insulin Signaling"],
                 current=82.0, target=95.0, streak=45),
            dict(id="g_011", label="Maintain Telomere Length",
                 pathways=["Telomere Maintenance", "TERT"],
                 current=78.5, target=90.0, streak=32),
        ],
        weekly_score=85.2,
        total_streak=45,
    ),
    "cardiometabolic": dict(
        habits=[
            dict(id="h_020", date="2026-03-28", category="diet", label="Mediterranean Diet Adherence",
                 value=0.8, unit="score", pathways=["Lipid Metabolism", "Anti-inflammatory"]),
            dict(id="h_021", date="2026-03-28", category="exercise", label="Zone 2 Cardio",
                 value=40, unit="min", pathways=["Cardiac Output", "AMPK"]),
            dict(id="h_022", date="2026-03-28", category="supplement", label="Omega-3",
                 value=4000, unit="mg", pathways=["Lipid Transport", "Anti-inflammatory"]),
        ],
        goals=[
            dict(id="g_020", label="Improve Lipid Regulatory Balance",
                 pathways=["Lipid Metabolism", "SORT1 Pathway"],
                 current=28.0, target=70.0, streak=5),
            dict(id="g_021", label="Cardiovascular Fitness",
                 pathways=["eNOS", "Vascular Tone"],
                 current=42.0, target=75.0, streak=12),
        ],
        weekly_score=48.3,
        total_streak=12,
    ),
    "neuroinflammation": dict(
        habits=[
            dict(id="h_030", date="2026-03-28", category="diet", label="MIND Diet Meal",
                 value=1.0, unit="meal", pathways=["Neuroprotection", "Anti-inflammatory"]),
            dict(id="h_031", date="2026-03-28", category="supplement", label="DHA",
                 value=2000, unit="mg", pathways=["Neuronal Membrane", "Resolvin"]),
            dict(id="h_032", date="2026-03-28", category="exercise", label="Aerobic Exercise",
                 value=35, unit="min", pathways=["BDNF", "Neurogenesis"]),
            dict(id="h_033", date="2026-03-28", category="sleep", label="Sleep Quality",
                 value=7.8, unit="hours", pathways=["Glymphatic Clearance", "Microglial Homeostasis"]),
        ],
        goals=[
            dict(id="g_030", label="Reduce Neuroinflammatory Signaling",
                 pathways=["Microglial Activation", "NF-κB (CNS)"],
                 current=32.0, target=65.0, streak=9),
            dict(id="g_031", label="Optimize BDNF Levels",
                 pathways=["BDNF", "Neurogenesis", "Synaptic Plasticity"],
                 current=55.0, target=80.0, streak=18),
        ],
        weekly_score=58.7,
        total_streak=18,
    ),
    "athletic": dict(
        habits=[
            dict(id="h_040", date="2026-03-28", category="exercise", label="HIIT Session",
                 value=45, unit="min", pathways=["PPARGC1A", "Mitochondrial Biogenesis"]),
            dict(id="h_041", date="2026-03-28", category="diet", label="Post-Workout Protein",
                 value=40, unit="g", pathways=["mTOR", "Muscle Protein Synthesis"]),
            dict(id="h_042", date="2026-03-28", category="sleep", label="Recovery Sleep",
                 value=9.0, unit="hours", pathways=["Growth Hormone", "Tissue Repair"]),
            dict(id="h_043", date="2026-03-28", category="cold_exposure", label="Ice Bath",
                 value=10, unit="min", pathways=["Norepinephrine", "Recovery", "BAT"]),
            dict(id="h_044", date="2026-03-28", category="supplement", label="Creatine",
                 value=5, unit="g", pathways=["ATP Regeneration", "Phosphocreatine"]),
        ],
        goals=[
            dict(id="g_040", label="Peak Mitochondrial Density",
                 pathways=["PPARGC1A", "Mitochondrial Biogenesis"],
                 current=88.0, target=95.0, streak=60),
            dict(id="g_041", label="Recovery Optimization",
                 pathways=["Tissue Repair", "Inflammation Resolution"],
                 current=76.0, target=90.0, streak=28),
        ],
        weekly_score=91.4,
        total_streak=60,
    ),
    "aging": dict(
        habits=[
            dict(id="h_050", date="2026-03-28", category="supplement", label="NMN + Resveratrol",
                 value=1, unit="dose", pathways=["NAD+ Metabolism", "SIRT1"]),
            dict(id="h_051", date="2026-03-28", category="fasting", label="Fasting-Mimicking",
                 value=1, unit="day", pathways=["Autophagy", "Senescence Clearance"]),
            dict(id="h_052", date="2026-03-28", category="exercise", label="Walking",
                 value=30, unit="min", pathways=["AMPK", "Cardiovascular"]),
        ],
        goals=[
            dict(id="g_050", label="Slow Epigenetic Acceleration",
                 pathways=["DNA Methylation", "Telomere Maintenance", "SIRT1"],
                 current=22.0, target=60.0, streak=7),
            dict(id="g_051", label="Improve Sirtuin Pathway",
                 pathways=["SIRT1", "NAD+ Metabolism"],
                 current=31.0, target=70.0, streak=14),
        ],
        weekly_score=38.1,
        total_streak=14,
    ),
}


class OptimizationService:
    """Self-optimization studio data — habits, goals, streaks."""

    @staticmethod
    def get_data(persona_id: str) -> OptimizationResponse:
        PersonaService.get_by_id(persona_id)  # validates existence

        data = _OPTIMIZATION_DATA.get(persona_id)
        if data is None:
            return OptimizationResponse(habits=[], goals=[], weekly_score=0.0, total_streak=0)

        habits = [
            HabitEntry(
                id=h["id"], date=h["date"], category=h["category"],
                label=h["label"], value=h["value"], unit=h["unit"],
                pathway_support=h["pathways"],
            )
            for h in data["habits"]
        ]
        goals = [
            OptimizationGoal(
                id=g["id"], label=g["label"],
                target_pathways=g["pathways"],
                current_score=g["current"],
                target_score=g["target"],
                streak=g["streak"],
            )
            for g in data["goals"]
        ]

        return OptimizationResponse(
            habits=habits,
            goals=goals,
            weekly_score=data["weekly_score"],
            total_streak=data["total_streak"],
        )
