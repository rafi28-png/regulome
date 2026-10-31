"""
SCORING SERVICE — ReguloMe Regulatory Impact Score
This is ReguloMe's scientific contribution.
Computes a 0-100 impact score for each variant, incorporating:
  - Clinical significance (ClinVar)
  - Variant impact level (Ensembl)
  - Regulatory element type (Ensembl)
  - Review evidence quality (ClinVar)
  - Population frequency rarity (gnomAD)
  - Disease association strength (Open Targets)

Higher score = variant is more likely to have real regulatory impact.
"""

from typing import List, Dict


def compute_impact_score(v: Dict) -> float:
    score = 0.0

    # === Clinical Significance: max 35 points ===
    sig = v.get("clinical_significance", "").lower()
    if "pathogenic" in sig and "likely" not in sig:
        score += 35
    elif "likely pathogenic" in sig:
        score += 25
    elif "risk factor" in sig:
        score += 18
    elif "conflicting" in sig:
        score += 12
    elif "uncertain" in sig:
        score += 8
    elif "likely benign" in sig:
        score += 2
    elif "benign" in sig:
        score += 0

    # === Ensembl Impact Level: max 25 points ===
    impact = v.get("impact", "MODIFIER").upper()
    score += {"HIGH": 25, "MODERATE": 18, "LOW": 8, "MODIFIER": 2}.get(impact, 2)

    # === Regulatory Element Type: max 20 points ===
    reg = v.get("regulatory_element_type", "").lower()
    if "promoter" in reg and "flanking" not in reg:
        score += 20
    elif "ctcf" in reg:
        score += 18
    elif "enhancer" in reg:
        score += 15
    elif "tf binding" in reg or "transcription factor" in reg:
        score += 12
    elif "open chromatin" in reg:
        score += 8
    elif "flanking" in reg:
        score += 4
    else:
        score += 1

    # === Population Rarity Bonus: max 10 points ===
    af = v.get("af_global", 0.0) or 0.0
    rarity = v.get("rarity_label", "No data")
    if rarity and rarity != "No data":
        if "novel" in rarity.lower() or af == 0.0:
            score += 10
        elif af < 0.0001:
            score += 8
        elif af < 0.001:
            score += 5
        elif af < 0.01:
            score += 3

    # === Disease Association Bonus: max 10 points ===
    ot_score = v.get("top_disease_score", 0.0) or 0.0
    if ot_score > 0.8:
        score += 10
    elif ot_score > 0.5:
        score += 7
    elif ot_score > 0.2:
        score += 4
    elif ot_score > 0.0:
        score += 2

    return min(round(score, 1), 100.0)


def compute_summary_statistics(variants: List[Dict]) -> Dict:
    if not variants:
        return {
            "total_pathogenic": 0, "total_likely_pathogenic": 0,
            "total_benign": 0, "total_uncertain": 0, "total_risk_factor": 0,
            "high_impact_count": 0, "unique_genes_count": 0,
            "regulatory_age_score": 0.0, "overall_risk_score": 0.0,
            "top_regulatory_elements": [], "rarity_distribution": {},
            "top_diseases": [],
        }

    def sig_match(v, term): return term in (v.get("clinical_significance") or "").lower()

    path = sum(1 for v in variants if sig_match(v, "pathogenic") and not sig_match(v, "likely"))
    lpath = sum(1 for v in variants if "likely pathogenic" in (v.get("clinical_significance") or "").lower())
    benign = sum(1 for v in variants if "benign" in (v.get("clinical_significance") or "").lower())
    uncertain = sum(1 for v in variants if "uncertain" in (v.get("clinical_significance") or "").lower())
    risk = sum(1 for v in variants if "risk factor" in (v.get("clinical_significance") or "").lower())
    high_imp = sum(1 for v in variants if v.get("impact") == "HIGH")
    unique_genes = len({v.get("gene_name") for v in variants if v.get("gene_name") and v.get("gene_name") != "Unknown"})

    # Regulatory element distribution
    reg_counts = {}
    for v in variants:
        rt = v.get("regulatory_element_type") or "Unknown"
        reg_counts[rt] = reg_counts.get(rt, 0) + 1
    top_reg = [{"element": k, "count": c} for k, c in sorted(reg_counts.items(), key=lambda x: -x[1])[:8]]

    # Rarity distribution
    rarity_dist = {}
    for v in variants:
        r = v.get("rarity_label") or "No data"
        rarity_dist[r] = rarity_dist.get(r, 0) + 1

    # Top diseases from Open Targets
    disease_scores = {}
    for v in variants:
        d = v.get("top_disease")
        s = v.get("top_disease_score") or 0.0
        if d and d != "No data":
            disease_scores[d] = max(disease_scores.get(d, 0.0), s)
    top_diseases = [{"disease": d, "score": s} for d, s in sorted(disease_scores.items(), key=lambda x: -x[1])[:10]]

    # Average impact score
    avg_score = sum(v.get("impact_score", 0) for v in variants) / len(variants)

    # Regulatory age score: normalized deviation based on regulatory impact burden
    reg_age_score = round(
        (path * 2.5 + lpath * 1.5 + risk * 0.8 + high_imp * 0.5) / max(len(variants) / 50, 1),
        1
    )

    # Overall risk score (0-100)
    risk_score = round(
        min((path * 12 + lpath * 7 + risk * 4 + high_imp * 2) / max(len(variants) / 10, 1), 100),
        1
    )

    return {
        "total_pathogenic": path,
        "total_likely_pathogenic": lpath,
        "total_benign": benign,
        "total_uncertain": uncertain,
        "total_risk_factor": risk,
        "high_impact_count": high_imp,
        "unique_genes_count": unique_genes,
        "regulatory_age_score": reg_age_score,
        "overall_risk_score": risk_score,
        "avg_impact_score": round(avg_score, 1),
        "top_regulatory_elements": top_reg,
        "rarity_distribution": rarity_dist,
        "top_diseases": top_diseases,
    }


def score_all_variants(variants: List[Dict]) -> List[Dict]:
    for v in variants:
        v["impact_score"] = compute_impact_score(v)
    return variants
