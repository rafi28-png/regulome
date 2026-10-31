"""
ReguloMe — Gene Expression Router
Gene × Tissue expression landscape endpoints.
"""
from fastapi import APIRouter

from app.schemas.responses import GeneExpressionResponse
from app.services.expression_service import ExpressionService

router = APIRouter(prefix="/expression", tags=["expression"])


@router.get("/{persona_id}", response_model=GeneExpressionResponse)
async def get_expression_landscape(persona_id: str):
    """
    Get gene expression landscape for a persona.
    Returns gene × tissue matrix with baseline deviation and variant impact flags.
    """
    return ExpressionService.get_landscape(persona_id)
