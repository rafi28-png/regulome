"""
GNOMAD SERVICE — Population Allele Frequencies
Queries gnomAD (Genome Aggregation Database) for each variant.
gnomAD has sequenced 125,000+ human genomes.

What it tells us:
  - How COMMON or RARE is this variant in real human populations?
  - What percentage of African / European / Asian / South Asian people carry it?
  - Is this a novel variant (never seen before)?

This is crucial for interpreting clinical significance:
  - Common variant (AF > 1%) → likely benign
  - Rare variant (AF < 0.1%) → could be disease-causing
  - Novel (AF = 0) → potentially significant, possibly de novo

Free GraphQL API. No key needed.
API: https://gnomad.broadinstitute.org/api
"""

import asyncio
import httpx
from typing import List, Dict, Optional

GNOMAD_API = "https://gnomad.broadinstitute.org/api"

GNOMAD_QUERY = """
query VariantFrequency($variantId: String!) {
  variant(variantId: $variantId, dataset: gnomad_r4) {
    variantId
    exome {
      ac
      an
      af
      populations {
        id
        ac
        an
        af
      }
    }
    genome {
      ac
      an
      af
      populations {
        id
        ac
        an
        af
      }
    }
  }
}
"""


def _rsid_to_variant_id(rsid: str, chromosome: str, position: int,
                         ref: str, alt: str) -> str:
    """Convert rsID + position to gnomAD variant ID format: chrom-pos-ref-alt"""
    chrom = chromosome.replace("chr", "").replace("Chr", "")
    return f"{chrom}-{position}-{ref}-{alt}"


def _classify_rarity(af: float) -> str:
    if af == 0.0:
        return "Novel"
    elif af < 0.0001:
        return "Ultra-rare (<0.01%)"
    elif af < 0.001:
        return "Very rare (<0.1%)"
    elif af < 0.01:
        return "Rare (<1%)"
    elif af < 0.05:
        return "Low frequency (<5%)"
    else:
        return "Common (≥5%)"


def _empty_gnomad() -> Dict:
    return {
        "af_global": 0.0, "af_afr": 0.0, "af_amr": 0.0,
        "af_asj": 0.0, "af_eas": 0.0, "af_fin": 0.0,
        "af_nfe": 0.0, "af_sas": 0.0,
        "rarity_label": "No data",
        "gnomad_found": False,
    }


async def get_gnomad_frequency(
    chromosome: str,
    position: int,
    ref: str,
    alt: str,
    client: httpx.AsyncClient,
) -> Dict:
    if not chromosome or not position or not ref or not alt or ref == alt:
        return _empty_gnomad()

    variant_id = _rsid_to_variant_id("", chromosome, position, ref, alt)

    try:
        resp = await client.post(
            GNOMAD_API,
            json={"query": GNOMAD_QUERY, "variables": {"variantId": variant_id}},
            headers={"Content-Type": "application/json"},
            timeout=15.0,
        )
        if resp.status_code != 200:
            return _empty_gnomad()

        data = resp.json()
        variant = data.get("data", {}).get("variant")
        if not variant:
            return _empty_gnomad()

        # Prefer genome data, fall back to exome
        freq_data = variant.get("genome") or variant.get("exome")
        if not freq_data:
            return _empty_gnomad()

        af_global = freq_data.get("af", 0.0) or 0.0

        # Population frequencies
        pop_af = {}
        for pop in freq_data.get("populations", []):
            pop_id = pop.get("id", "").lower()
            pop_af[pop_id] = pop.get("af", 0.0) or 0.0

        return {
            "af_global": round(af_global, 6),
            "af_afr": round(pop_af.get("afr", 0.0), 6),
            "af_amr": round(pop_af.get("amr", 0.0), 6),
            "af_asj": round(pop_af.get("asj", 0.0), 6),
            "af_eas": round(pop_af.get("eas", 0.0), 6),
            "af_fin": round(pop_af.get("fin", 0.0), 6),
            "af_nfe": round(pop_af.get("nfe", 0.0), 6),
            "af_sas": round(pop_af.get("sas", 0.0), 6),
            "rarity_label": _classify_rarity(af_global),
            "gnomad_found": True,
        }
    except Exception:
        return _empty_gnomad()


async def batch_annotate_gnomad(variants: List[Dict]) -> List[Dict]:
    """Add population frequency data to all variants."""
    sem = asyncio.Semaphore(3)

    async def one(v: Dict, client: httpx.AsyncClient) -> Dict:
        async with sem:
            data = await get_gnomad_frequency(
                v.get("chromosome", ""),
                v.get("position", 0),
                v.get("ref_allele", ""),
                v.get("alt_allele", ""),
                client,
            )
            await asyncio.sleep(0.15)
            return {**v, **data}

    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(*[one(v, client) for v in variants])
    return list(results)
