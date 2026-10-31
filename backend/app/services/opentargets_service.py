"""
OPEN TARGETS SERVICE — Disease Association Scores
Queries the Open Targets Platform GraphQL API.

Open Targets aggregates evidence from:
  - ClinVar, GWAS Catalog, UniProt, Gene2Phenotype,
    ChEMBL, PheWAS, SysBio, CRISPRa/i screens

For each gene in the user's variant set, we get:
  - Which diseases have the strongest evidence association
  - An overall association score (0-1)
  - Evidence category breakdown

Free GraphQL API. No key needed.
API: https://api.platform.opentargets.org/api/v4/graphql
"""

import asyncio
import httpx
from typing import List, Dict, Optional

OT_API = "https://api.platform.opentargets.org/api/v4/graphql"

OT_QUERY = """
query DiseaseAssociations($geneSymbol: String!, $size: Int!) {
  search(queryString: $geneSymbol, entityNames: ["target"]) {
    hits {
      id
      object {
        ... on Target {
          id
          approvedSymbol
          associatedDiseases(orderByScore: "score", page: { index: 0, size: $size }) {
            rows {
              disease {
                id
                name
              }
              score
            }
          }
        }
      }
    }
  }
}
"""


def _empty_ot() -> Dict:
    return {
        "top_disease": "No data",
        "top_disease_score": 0.0,
        "disease_associations": [],
        "ot_found": False,
    }


async def get_disease_associations(
    gene_symbol: str,
    client: httpx.AsyncClient,
    top_n: int = 5
) -> Dict:
    if not gene_symbol or gene_symbol == "Unknown":
        return _empty_ot()
    try:
        resp = await client.post(
            OT_API,
            json={"query": OT_QUERY, "variables": {"geneSymbol": gene_symbol, "size": top_n}},
            headers={"Content-Type": "application/json"},
            timeout=15.0,
        )
        if resp.status_code != 200:
            return _empty_ot()

        data = resp.json()
        hits = data.get("data", {}).get("search", {}).get("hits", [])
        if not hits:
            return _empty_ot()

        # Find the target matching the gene symbol
        target = None
        for hit in hits:
            obj = hit.get("object", {})
            if obj.get("approvedSymbol", "").upper() == gene_symbol.upper():
                target = obj
                break
        if not target:
            target = hits[0].get("object", {})

        rows = target.get("associatedDiseases", {}).get("rows", [])
        if not rows:
            return _empty_ot()

        associations = []
        for row in rows[:top_n]:
            disease_name = row.get("disease", {}).get("name", "Unknown")
            score = row.get("score", 0.0)
            associations.append({"disease": disease_name, "score": round(score, 4)})

        top = associations[0] if associations else {"disease": "No data", "score": 0.0}
        return {
            "top_disease": top["disease"],
            "top_disease_score": top["score"],
            "disease_associations": associations,
            "ot_found": True,
        }
    except Exception:
        return _empty_ot()


async def batch_annotate_opentargets(variants: List[Dict]) -> List[Dict]:
    """Add disease association data to all variants. Deduplicates by gene."""
    gene_cache: Dict[str, Dict] = {}
    unique_genes = list({v.get("gene_name", "") for v in variants if v.get("gene_name", "") and v.get("gene_name") != "Unknown"})

    sem = asyncio.Semaphore(4)

    async def fetch_gene(gene: str, client: httpx.AsyncClient):
        async with sem:
            result = await get_disease_associations(gene, client)
            gene_cache[gene] = result
            await asyncio.sleep(0.1)

    async with httpx.AsyncClient() as client:
        await asyncio.gather(*[fetch_gene(g, client) for g in unique_genes])

    result_variants = []
    for v in variants:
        gene = v.get("gene_name", "")
        ot_data = gene_cache.get(gene, _empty_ot())
        result_variants.append({
            **v,
            "top_disease": ot_data["top_disease"],
            "top_disease_score": ot_data["top_disease_score"],
        })
    return result_variants
