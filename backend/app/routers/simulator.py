"""
ReguloMe — Simulator Router
Regulatory Twin Simulator endpoints — scenario-based what-if analysis.
"""
from fastapi import APIRouter
from typing import Optional

from app.schemas.responses import SimulatorResponse, SimulationScenario
from app.services.simulator_service import SimulatorService

router = APIRouter(prefix="/simulator", tags=["simulator"])


@router.get("/{persona_id}", response_model=SimulatorResponse)
async def get_default_simulation(persona_id: str):
    """
    Get baseline vs. default scenario simulation for a persona.
    Returns the current state and a simulated 'optimized lifestyle' scenario.
    """
    return SimulatorService.get_default(persona_id)


@router.post("/{persona_id}/simulate", response_model=SimulatorResponse)
async def run_simulation(persona_id: str, scenario: SimulationScenario):
    """
    Run a custom what-if simulation with user-defined adjustments.
    Adjustments: sleep, diet, fasting, stress, exercise, recovery, etc.
    Returns baseline vs. simulated results.
    """
    return SimulatorService.simulate(persona_id, scenario)
