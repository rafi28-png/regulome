"""
ENSEMBL SERVICE
Queries Ensembl VEP and regulatory feature API.
No API key required. Free forever.
Docs: https://rest.ensembl.org
"""

import asyncio
import httpx
from typing import List, Dict

ENSEMBL = "https://rest.ensembl.org"
HDRS = {"Accept": "application/json"}

BIOTYPE_MAP = {
    "enhancer": "Enhancer",
    "promoter": "Promoter",
    "promoter_flanking_region": "Promoter Flanking",
    "CTCF_binding_site": "CTCF Binding Site",
    "TF_binding_site": "TF Binding Site",
    "open_chromatin_region": "Open Chromatin",
    "transcribed_unprocessed_pseudogene": "Pseudogene Region",
}

IMPACT_RANK = {"HIGH": 4, "MODERATE": 3, "LOW": 2, "MODIFIER": 1}


def _empty_ensembl() -> Dict:
    return {
        "regulatory_element_type": "Intergenic",
        "consequence": "intergenic_variant",
        "impact": "MODIFIER",
        "biotype": "",
        "ensembl_found": False,
    }


async def get_ensembl_vep(rsid: str, client: httpx.AsyncClient) -> Dict:
    try:
        resp = await client.get(
            f"{ENSEMBL}/vep/human/id/{rsid}",
            headers=HDRS,
            params={"regulatory": 1},
            timeout=15.0,
        )
        if resp.status_code == 429:
            await asyncio.sleep(2.5)
            resp = await client.get(
                f"{ENSEMBL}/vep/human/id/{rsid}",
                headers=HDRS,
                params={"regulatory": 1},
                timeout=15.0,
            )
        if resp.status_code != 200 or not resp.json():
            return _empty_ensembl()

        data = resp.json()
        if not isinstance(data, list) or not data:
            return _empty_ensembl()

        vep = data[0]
        reg_type = "Intergenic"
        consequence = "intergenic_variant"
        impact = "MODIFIER"
        biotype = ""

        # Regulatory feature consequences
        reg_cons = vep.get("regulatory_feature_consequences", [])
        if reg_cons:
            rc = reg_cons[0]
            biotype = rc.get("biotype", "")
            reg_type = BIOTYPE_MAP.get(biotype, biotype.replace("_", " ").title() if biotype else "Intergenic")
            terms = rc.get("consequence_terms", [])
            if terms:
                consequence = terms[0]

        # Transcript consequences for impact
        for tc in vep.get("transcript_consequences", []):
            tc_impact = tc.get("impact", "MODIFIER")
            if IMPACT_RANK.get(tc_impact, 0) > IMPACT_RANK.get(impact, 0):
                impact = tc_impact

        most_severe = vep.get("most_severe_consequence", consequence)
        return {
            "regulatory_element_type": reg_type,
            "consequence": most_severe,
            "impact": impact,
            "biotype": biotype,
            "ensembl_found": True,
        }
    except Exception:
        return _empty_ensembl()


async def batch_annotate_ensembl(variants: List[Dict]) -> List[Dict]:
    sem = asyncio.Semaphore(3)

    async def one(v: Dict, client: httpx.AsyncClient) -> Dict:
        async with sem:
            rsid = v.get("rsid", "")
            if not rsid.startswith("rs"):
                return {**v, **_empty_ensembl()}
            data = await get_ensembl_vep(rsid, client)
            await asyncio.sleep(0.1)
            return {**v, **data}

    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(*[one(v, client) for v in variants])
    return list(results)
