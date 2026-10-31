"""
CLINVAR SERVICE
Queries NCBI ClinVar to get clinical significance for each variant.
Free API. Key optional (but speeds things up).
Docs: https://www.ncbi.nlm.nih.gov/books/NBK25499/
"""

import asyncio
import httpx
from typing import List, Dict
from ..core.config import settings

NCBI_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"


def _key_param() -> str:
    key = getattr(settings, 'NCBI_API_KEY', None)
    return f"&api_key={key}" if key else ""


def _normalize_sig(sig: str) -> str:
    s = sig.lower()
    if "pathogenic" in s and "likely" not in s:
        return "Pathogenic"
    if "likely pathogenic" in s:
        return "Likely pathogenic"
    if "likely benign" in s:
        return "Likely benign"
    if "benign" in s:
        return "Benign"
    if "uncertain" in s or "vus" in s:
        return "Uncertain significance"
    if "conflicting" in s:
        return "Conflicting interpretations"
    if "risk factor" in s:
        return "Risk factor"
    return sig if sig else "Not provided"


def _empty(rsid: str) -> Dict:
    return {
        "gene_name": "Unknown",
        "clinical_significance": "Not in ClinVar",
        "condition": "No data",
        "review_status": "no data",
        "clinvar_id": None,
        "clinvar_found": False,
    }


async def get_clinvar_data(rsid: str, client: httpx.AsyncClient) -> Dict:
    key = _key_param()
    try:
        # Step 1: search ClinVar for this rsID
        search = await client.get(
            f"{NCBI_BASE}/esearch.fcgi?db=clinvar&term={rsid}[rs]&retmode=json&retmax=1{key}",
            timeout=12.0
        )
        if search.status_code != 200:
            return _empty(rsid)
        ids = search.json().get("esearchresult", {}).get("idlist", [])
        if not ids:
            return _empty(rsid)

        cid = ids[0]
        # Step 2: fetch summary for this ClinVar ID
        summ = await client.get(
            f"{NCBI_BASE}/esummary.fcgi?db=clinvar&id={cid}&retmode=json{key}",
            timeout=12.0
        )
        if summ.status_code != 200:
            return _empty(rsid)

        result = summ.json().get("result", {}).get(cid, {})
        if not result:
            return _empty(rsid)

        # Gene name
        gene_name = result.get("gene_sort", "Unknown")
        if "," in gene_name:
            gene_name = gene_name.split(",")[0].strip()

        # Clinical significance
        germ = result.get("germline_classification", {})
        sig_raw = germ.get("description", "") if isinstance(germ, dict) else str(germ)
        sig = _normalize_sig(sig_raw)

        # Condition name
        trait_set = result.get("trait_set", [])
        condition = ""
        if isinstance(trait_set, list) and trait_set:
            condition = trait_set[0].get("trait_name", "")
        elif isinstance(trait_set, dict):
            condition = trait_set.get("trait_name", "")

        return {
            "gene_name": gene_name or "Unknown",
            "clinical_significance": sig,
            "condition": condition or "Not specified",
            "review_status": result.get("review_status", "no assertion"),
            "clinvar_id": cid,
            "clinvar_found": True,
        }
    except Exception:
        return _empty(rsid)


async def batch_annotate_clinvar(variants: List[Dict]) -> List[Dict]:
    """Annotate all variants with ClinVar data. Respects rate limits."""
    ncbi_key = getattr(settings, 'NCBI_API_KEY', None)
    # Delay between requests: 0.12s = ~8/sec (safe under the 10/sec limit with key)
    delay = 0.12 if ncbi_key else 0.4  # 0.4s = ~2.5/sec without key
    sem = asyncio.Semaphore(4 if ncbi_key else 2)

    async def one(v: Dict, client: httpx.AsyncClient) -> Dict:
        async with sem:
            rsid = v.get("rsid", "")
            if not rsid.startswith("rs"):
                return {**v, **_empty(rsid)}
            data = await get_clinvar_data(rsid, client)
            await asyncio.sleep(delay)
            return {**v, **data}

    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(*[one(v, client) for v in variants])
    return list(results)
