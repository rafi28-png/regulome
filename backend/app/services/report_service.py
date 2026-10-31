"""
ReguloMe — Report Service
Report generation and retrieval for multiple report types.
Full synthetic data will be enriched in Part 5.
"""
from datetime import datetime
from app.services.persona_service import PersonaService
from app.core.exceptions import ReguloMeError

# Report type definitions
_REPORT_TYPES = {
    "summary": {
        "title": "Personal Regulatory Genome Summary",
        "sections": ["Executive Summary", "Key Findings", "Top Regulatory Variants",
                      "Tissue Impact Overview", "Lifestyle Recommendations", "Next Steps"],
    },
    "research": {
        "title": "Research-Grade Regulatory Analysis",
        "sections": ["Methods & Pipeline", "Variant Classification", "Regulatory Element Analysis",
                      "Gene Expression Impact", "Network Topology", "Statistical Summary",
                      "Evidence Grades", "Raw Data Tables", "References"],
    },
    "clinician": {
        "title": "Clinical Regulatory Summary",
        "sections": ["Patient Overview", "Clinically Relevant Findings", "Actionable Variants",
                      "Risk Assessment", "Pharmacogenomic Considerations",
                      "Recommended Follow-up", "Limitations & Disclaimers"],
    },
    "pathway": {
        "title": "Pathway-Centric Regulatory Report",
        "sections": ["Pathway Burden Overview", "Per-Pathway Analysis", "Cross-Pathway Interactions",
                      "Tissue-Pathway Mapping", "Intervention Targets", "Optimization Potential"],
    },
}

# Per-persona report content (skeleton summaries — Part 5 will generate rich content)
_REPORT_CONTENT: dict[str, dict[str, dict]] = {
    "inflammatory": {
        "summary": {
            "executive_summary": "Your regulatory genome shows a significant inflammatory bias. 247 regulatory variants were analyzed, with 18 high-impact variants disrupting key inflammatory pathways including NF-κB, JAK-STAT, and TNF-α cascades. Your regulatory age is 5.1 years above chronological age, suggesting accelerated epigenetic aging driven by inflammatory burden.",
            "key_findings": [
                "18 high-impact variants in inflammatory regulatory regions",
                "HLA-DRB1/DQB1 enhancer gains driving immune hyperactivation",
                "PTPN22 promoter loss associated with autoimmune susceptibility",
                "Regulatory age acceleration of +5.1 years",
                "Primary tissue impact: immune cells, spleen, lymph nodes",
            ],
            "recommendations": [
                "Prioritize anti-inflammatory dietary interventions (omega-3, polyphenols)",
                "Optimize sleep architecture for immune regulation",
                "Consider cold exposure for NF-κB modulation",
                "Regular moderate exercise for systemic inflammation reduction",
            ],
        },
        "research": {
            "methods": "Regulatory variant analysis using ENCODE, Roadmap Epigenomics, and JASPAR databases. Variant impact predicted via DeepSEA and Enformer models. Confidence scoring combines experimental evidence, literature support, and computational predictions.",
            "variant_summary": "247 variants mapped to regulatory elements. 18 classified as high-impact (priority > 75). Element types: 12 enhancers, 3 promoters, 2 TFBS, 1 silencer.",
            "statistics": {"total_variants": 247, "high_impact": 18, "pathways_affected": 8, "tissues_impacted": 5},
        },
        "clinician": {
            "overview": "38-year-old individual with inflammatory immune-skewed regulatory profile. No immediate clinical action required, but findings suggest elevated baseline inflammatory signaling that may inform preventive strategies.",
            "actionable": ["HLA region regulatory variants — consider HLA typing if autoimmune symptoms develop", "Monitor inflammatory markers (CRP, IL-6) annually"],
            "limitations": "This analysis is for research and informational purposes only. Regulatory variant impact predictions carry uncertainty. Clinical decisions should not be based solely on this report.",
        },
        "pathway": {
            "overview": "Primary pathway disruption in NF-κB signaling (regulatory burden: 78.5/100), followed by JAK-STAT and TNF-α cascades. Cross-pathway interaction between NF-κB and FOXO3 suggests inflammatory interference with longevity pathways.",
            "top_pathways": ["NF-κB Signaling", "JAK-STAT", "TNF-α Cascade", "Antigen Presentation"],
        },
    },
}


class ReportService:
    """Report generation and retrieval."""

    @staticmethod
    def list_reports(persona_id: str) -> dict:
        PersonaService.get_by_id(persona_id)  # validates existence

        reports = []
        for report_type, meta in _REPORT_TYPES.items():
            reports.append({
                "id": f"{persona_id}_{report_type}",
                "persona_id": persona_id,
                "report_type": report_type,
                "title": meta["title"],
                "generated_at": datetime.now().isoformat(),
                "sections": meta["sections"],
            })

        return {"reports": reports}

    @staticmethod
    def get_report(persona_id: str, report_type: str) -> dict:
        PersonaService.get_by_id(persona_id)

        if report_type not in _REPORT_TYPES:
            raise ReguloMeError(
                message=f"Invalid report type '{report_type}'. Valid types: {list(_REPORT_TYPES.keys())}",
                code="INVALID_REPORT_TYPE",
                status_code=400,
            )

        meta = _REPORT_TYPES[report_type]
        content = _REPORT_CONTENT.get(persona_id, {}).get(report_type, {})

        return {
            "id": f"{persona_id}_{report_type}",
            "persona_id": persona_id,
            "report_type": report_type,
            "title": meta["title"],
            "sections": meta["sections"],
            "generated_at": datetime.now().isoformat(),
            "content": content if content else {
                "message": "Full report content will be generated with the Synthetic Demo Data Engine (Part 5).",
                "status": "skeleton",
            },
        }
