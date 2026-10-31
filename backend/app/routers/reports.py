"""
ReguloMe — Reports Router
Report generation and retrieval endpoints.
"""
from fastapi import APIRouter
from typing import Optional
from pydantic import BaseModel

from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["reports"])


class ReportMetadata(BaseModel):
    id: str
    persona_id: str
    report_type: str  # summary, research, clinician, pathway
    title: str
    generated_at: str
    sections: list[str]


class ReportListResponse(BaseModel):
    reports: list[ReportMetadata]


@router.get("/{persona_id}", response_model=ReportListResponse)
async def list_reports(persona_id: str):
    """List available reports for a persona."""
    return ReportService.list_reports(persona_id)


@router.get("/{persona_id}/{report_type}")
async def get_report(persona_id: str, report_type: str):
    """
    Get a specific report.
    Report types: summary, research, clinician, pathway
    """
    return ReportService.get_report(persona_id, report_type)
