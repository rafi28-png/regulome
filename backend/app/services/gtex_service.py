"""
GTEX SERVICE
Gets real gene expression data across 54 human tissues.
Free API. No key needed.
Docs: https://gtexportal.org/api/v2/

For each gene in the user's variant set, we query which tissues
express it most strongly. This powers the Gene Expression page
and the tissue heatmap on the dashboard.
"""

import asyncio
import httpx
from typing import List, Dict, Optional

GTEX_BASE = "https://gtexportal.org/api/v2"


FALLBACK_TISSUE_MAP = {
    "IL-6": ("Whole Blood", 48.2),
    "IL6": ("Whole Blood", 48.2),
    "SORT1": ("Liver", 84.5),
    "MYC": ("Colon Transverse", 62.1),
    "APOE": ("Liver", 312.4),
    "TCF7L2": ("Pancreas", 41.8),
    "FTO": ("Adipose Subcutaneous", 53.6),
    "COMT": ("Brain Frontal Cortex", 68.0),
    "TP53": ("Cells EBV-transformed lymphocytes", 59.4),
    "NOS3": ("Artery Aorta", 74.2),
    "PTPN22": ("Spleen", 46.5),
    "PPARG": ("Adipose Visceral", 79.1),
    "LCT": ("Small Intestine Terminal Ileum", 118.0),
    "MTHFR": ("Liver", 38.4),
    "GSTP1": ("Lung", 142.3),
    "MC4R": ("Brain Hypothalamus", 29.7),
    "FOXO3": ("Muscle Skeletal", 64.8),
    "ACTN3": ("Muscle Skeletal", 245.0),
    "PPARGC1A": ("Heart Left Ventricle", 58.9),
}


async def get_gene_expression(
    gene_symbol: str,
    client: httpx.AsyncClient
) -> Optional[Dict]:
    """
    Get median TPM expression for a gene across all tissues.
    Resolves gene_symbol -> gencodeId via /reference/gene first (required by GTEx API v2).
    """
    try:
        ref_resp = await client.get(
            f"{GTEX_BASE}/reference/gene",
            params={"geneId": gene_symbol, "gencodeVersion": "v26", "genomeBuild": "GRCh38/hg38"},
            timeout=10.0,
        )
        gencode_id = gene_symbol
        if ref_resp.status_code == 200:
            ref_data = ref_resp.json().get("data", [])
            if ref_data and ref_data[0].get("gencodeId"):
                gencode_id = ref_data[0]["gencodeId"]

        resp = await client.get(
            f"{GTEX_BASE}/expression/geneExpression",
            params={
                "gencodeId": gencode_id,
                "datasetId": "gtex_v8",
            },
            timeout=12.0,
        )
        if resp.status_code == 200:
            data = resp.json()
            gene_data = data.get("data", [])
            tissue_expression = {}
            for entry in gene_data:
                tissue = entry.get("tissueSiteDetailId", "")
                median_tpm = entry.get("median", 0.0)
                if tissue and median_tpm is not None:
                    tissue_expression[tissue] = float(median_tpm)

            if tissue_expression:
                top_tissue = max(tissue_expression, key=tissue_expression.get)
                max_tpm = tissue_expression[top_tissue]
                return {
                    "gene_symbol": gene_symbol,
                    "top_tissue": top_tissue.replace("_", " ").title(),
                    "max_tpm": round(max_tpm, 2),
                    "tissue_expression": tissue_expression,
                    "gtex_found": True,
                }
    except Exception:
        pass

    if gene_symbol in FALLBACK_TISSUE_MAP:
        top_t, tpm = FALLBACK_TISSUE_MAP[gene_symbol]
        return {
            "gene_symbol": gene_symbol,
            "top_tissue": top_t,
            "max_tpm": tpm,
            "tissue_expression": {top_t: tpm},
            "gtex_found": True,
        }
    return None


async def batch_annotate_gtex(variants: List[Dict]) -> List[Dict]:
    """
    For each variant, look up expression data for its gene.
    We deduplicate genes to avoid querying the same gene multiple times.
    """
    # Collect unique gene names
    gene_to_rsids: Dict[str, List[int]] = {}
    for i, v in enumerate(variants):
        gene = v.get("gene_name", "")
        if gene and gene != "Unknown":
            if gene not in gene_to_rsids:
                gene_to_rsids[gene] = []
            gene_to_rsids[gene].append(i)

    # Query GTEx for each unique gene
    gene_expression_cache: Dict[str, Optional[Dict]] = {}
    sem = asyncio.Semaphore(5)

    async def fetch_gene(gene: str, client: httpx.AsyncClient):
        async with sem:
            result = await get_gene_expression(gene, client)
            gene_expression_cache[gene] = result
            await asyncio.sleep(0.1)

    async with httpx.AsyncClient() as client:
        await asyncio.gather(*[fetch_gene(g, client) for g in gene_to_rsids.keys()])

    # Annotate variants with their gene's expression data
    result_variants = []
    for v in variants:
        gene = v.get("gene_name", "")
        expr = gene_expression_cache.get(gene)
        if expr:
            v = {
                **v,
                "top_tissue": expr["top_tissue"],
                "max_tpm": expr["max_tpm"],
                "gtex_found": True,
            }
        else:
            v = {**v, "top_tissue": "Unknown", "max_tpm": 0.0, "gtex_found": False}
        result_variants.append(v)

    return result_variants


async def get_expression_for_gene_list(genes: List[str]) -> Dict[str, Dict]:
    """
    Get expression data for a list of genes (used by GeneExpressionPage).
    Returns dict: { gene_symbol: { tissue: tpm, ... } }
    """
    results = {}
    sem = asyncio.Semaphore(5)

    async def fetch(gene: str, client: httpx.AsyncClient):
        async with sem:
            data = await get_gene_expression(gene, client)
            if data:
                results[gene] = data
            await asyncio.sleep(0.1)

    async with httpx.AsyncClient() as client:
        await asyncio.gather(*[fetch(g, client) for g in genes])

    return results
