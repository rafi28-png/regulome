"""
ReguloMe — Public Genomics API Client
Wraps 4 free, no-API-key public databases:

  1. Ensembl REST API  — variant annotation, gene info, VEP consequences
     https://rest.ensembl.org
  
  2. NCBI ClinVar API — clinical significance of variants
     https://eutils.ncbi.nlm.nih.gov/entrez/eutils
  
  3. GTEx Portal API  — gene expression across 54 human tissues
     https://gtexportal.org/api/v2
  
  4. Open Targets API — disease–gene associations (GraphQL)
     https://api.platform.opentargets.org/api/v4/graphql

All responses are cached in SQLite (default: 24h TTL) to avoid hammering APIs.
"""
import json
import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import Any

import httpx
from sqlalchemy.orm import Session

from app.core.database import CacheModel

logger = logging.getLogger("regulome.genomics")

# ── Constants ────────────────────────────────────────────────────────────────
ENSEMBL_BASE = "https://rest.ensembl.org"
NCBI_EUTILS  = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
GTEX_BASE    = "https://gtexportal.org/api/v2"
OT_GRAPHQL   = "https://api.platform.opentargets.org/api/v4/graphql"

CACHE_TTL_HOURS = 24

_HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json",
}

# ── Cache helpers ─────────────────────────────────────────────────────────────

def _cache_get(db: Session, key: str) -> dict | None:
    """Return cached JSON dict if present and not expired."""
    row = db.query(CacheModel).filter(CacheModel.cache_key == key).first()
    if row is None:
        return None
    now = datetime.now(timezone.utc)
    if row.expires_at and row.expires_at.replace(tzinfo=timezone.utc) < now:
        db.delete(row)
        db.commit()
        return None
    try:
        return json.loads(row.response_json)
    except Exception:
        return None


def _cache_set(db: Session, key: str, data: dict, source: str, ttl_hours: int = CACHE_TTL_HOURS):
    """Store or update a cache entry."""
    expires = datetime.now(timezone.utc) + timedelta(hours=ttl_hours)
    row = db.query(CacheModel).filter(CacheModel.cache_key == key).first()
    if row:
        row.response_json = json.dumps(data)
        row.fetched_at = datetime.now(timezone.utc)
        row.expires_at = expires
    else:
        row = CacheModel(
            cache_key=key,
            response_json=json.dumps(data),
            source=source,
            expires_at=expires,
        )
        db.add(row)
    db.commit()


# ── Ensembl ───────────────────────────────────────────────────────────────────

async def fetch_ensembl_variant(rsid: str, db: Session) -> dict:
    """
    Fetch variant annotation from Ensembl REST API.
    Returns allele, consequence, most severe annotation, MAF, etc.
    """
    cache_key = f"ensembl:variant:{rsid}"
    cached = _cache_get(db, cache_key)
    if cached:
        logger.debug(f"[Ensembl] cache hit: {rsid}")
        return cached

    url = f"{ENSEMBL_BASE}/variation/human/{rsid}"
    params = {"content-type": "application/json", "pops": 1, "phenotypes": 1}

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(url, params=params, headers=_HEADERS)
            resp.raise_for_status()
            data = resp.json()
            _cache_set(db, cache_key, data, "ensembl")
            logger.info(f"[Ensembl] fetched: {rsid}")
            return data
        except httpx.HTTPStatusError as e:
            logger.warning(f"[Ensembl] HTTP {e.response.status_code} for {rsid}")
            return {"error": str(e), "rsid": rsid}
        except Exception as e:
            logger.error(f"[Ensembl] error for {rsid}: {e}")
            return {"error": str(e), "rsid": rsid}


async def fetch_ensembl_vep(rsid: str, db: Session) -> list[dict]:
    """
    Run Variant Effect Predictor (VEP) for a given rsID.
    Returns predicted functional consequences per transcript.
    """
    cache_key = f"ensembl:vep:{rsid}"
    cached = _cache_get(db, cache_key)
    if cached:
        return cached

    url = f"{ENSEMBL_BASE}/vep/human/id/{rsid}"
    params = {"content-type": "application/json", "regulatory": 1, "motiffeatures": 1}

    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            resp = await client.get(url, params=params, headers=_HEADERS)
            resp.raise_for_status()
            data = resp.json()
            _cache_set(db, cache_key, data, "ensembl_vep")
            logger.info(f"[Ensembl VEP] fetched: {rsid}")
            return data
        except Exception as e:
            logger.error(f"[Ensembl VEP] error for {rsid}: {e}")
            return []


async def fetch_ensembl_gene(gene_name: str, db: Session) -> dict:
    """
    Look up gene info (stable ID, biotype, chromosome, description).
    """
    cache_key = f"ensembl:gene:{gene_name.upper()}"
    cached = _cache_get(db, cache_key)
    if cached:
        return cached

    url = f"{ENSEMBL_BASE}/lookup/symbol/homo_sapiens/{gene_name}"
    params = {"content-type": "application/json", "expand": 1}

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(url, params=params, headers=_HEADERS)
            resp.raise_for_status()
            data = resp.json()
            _cache_set(db, cache_key, data, "ensembl_gene")
            logger.info(f"[Ensembl] gene fetched: {gene_name}")
            return data
        except Exception as e:
            logger.error(f"[Ensembl] gene error for {gene_name}: {e}")
            return {"error": str(e), "gene": gene_name}


# ── ClinVar (NCBI) ────────────────────────────────────────────────────────────

async def fetch_clinvar_significance(rsid: str, db: Session) -> dict:
    """
    Fetch clinical significance for an rsID from NCBI ClinVar.
    Uses the E-utilities esearch + esummary pipeline.
    """
    cache_key = f"clinvar:{rsid}"
    cached = _cache_get(db, cache_key)
    if cached:
        logger.debug(f"[ClinVar] cache hit: {rsid}")
        return cached

    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            # Step 1: Search ClinVar for the rsID
            search_url = f"{NCBI_EUTILS}/esearch.fcgi"
            search_params = {
                "db": "clinvar",
                "term": f"{rsid}[RS]",
                "retmode": "json",
                "retmax": "5",
            }
            search_resp = await client.get(search_url, params=search_params)
            search_resp.raise_for_status()
            search_data = search_resp.json()

            ids = search_data.get("esearchresult", {}).get("idlist", [])
            if not ids:
                result = {"rsid": rsid, "clinical_significance": "not_found", "conditions": [], "review_status": ""}
                _cache_set(db, cache_key, result, "clinvar")
                return result

            # Step 2: Fetch summaries for the found IDs
            summary_url = f"{NCBI_EUTILS}/esummary.fcgi"
            summary_params = {
                "db": "clinvar",
                "id": ",".join(ids[:3]),
                "retmode": "json",
            }
            sum_resp = await client.get(summary_url, params=summary_params)
            sum_resp.raise_for_status()
            sum_data = sum_resp.json()

            # Extract the most relevant entry
            result_docs = sum_data.get("result", {})
            uid_list = result_docs.get("uids", [])
            if not uid_list:
                result = {"rsid": rsid, "clinical_significance": "not_found", "conditions": [], "review_status": ""}
            else:
                doc = result_docs[uid_list[0]]
                sig = doc.get("clinical_significance", {})
                result = {
                    "rsid": rsid,
                    "clinvar_id": uid_list[0],
                    "clinical_significance": sig.get("description", "Unknown"),
                    "review_status": sig.get("review_status", ""),
                    "conditions": [
                        c.get("trait_name", "") 
                        for c in doc.get("trait_set", [])
                        if c.get("trait_name")
                    ],
                    "last_evaluated": sig.get("last_evaluated", ""),
                    "accession": doc.get("accession", ""),
                    "gene_sort": doc.get("gene_sort", ""),
                    "chromosome_sort": doc.get("chromosome_sort", ""),
                }

            _cache_set(db, cache_key, result, "clinvar")
            logger.info(f"[ClinVar] fetched: {rsid} → {result.get('clinical_significance')}")
            return result

        except Exception as e:
            logger.error(f"[ClinVar] error for {rsid}: {e}")
            return {"rsid": rsid, "error": str(e), "clinical_significance": "error", "conditions": []}


# ── GTEx ──────────────────────────────────────────────────────────────────────

async def fetch_gtex_expression(gene_name: str, db: Session) -> list[dict]:
    """
    Fetch median gene expression (TPM) across 54 tissues from GTEx v10.
    Returns list of {tissue, median_tpm, tissue_site_detail}.
    """
    cache_key = f"gtex:expression:{gene_name.upper()}"
    cached = _cache_get(db, cache_key)
    if cached:
        logger.debug(f"[GTEx] cache hit: {gene_name}")
        return cached

    url = f"{GTEX_BASE}/expression/geneExpression"
    params = {
        "gencodeId": gene_name,  # GTEx also accepts HGNC symbols via lookup
        "datasetId": "gtex_v10",
    }

    # GTEx requires Ensembl gene ID — first get it
    gene_info_url = f"{GTEX_BASE}/reference/gene"
    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            # Lookup gene to get Ensembl ID
            lookup_resp = await client.get(
                gene_info_url,
                params={"geneSymbol": gene_name, "datasetId": "gtex_v10"},
            )
            lookup_resp.raise_for_status()
            lookup_data = lookup_resp.json()
            genes = lookup_data.get("data", [])
            if not genes:
                return []

            ensembl_id = genes[0].get("gencodeId", "")
            if not ensembl_id:
                return []

            # Fetch expression data
            expr_resp = await client.get(
                url,
                params={"gencodeId": ensembl_id, "datasetId": "gtex_v10"},
            )
            expr_resp.raise_for_status()
            expr_data = expr_resp.json()

            results = []
            for entry in expr_data.get("data", []):
                results.append({
                    "tissue": entry.get("tissueSiteDetailId", ""),
                    "tissue_label": entry.get("tissueSiteDetail", ""),
                    "median_tpm": entry.get("median", 0.0),
                    "unit": "TPM",
                    "n_samples": entry.get("datasetId", ""),
                })

            _cache_set(db, cache_key, results, "gtex")
            logger.info(f"[GTEx] fetched: {gene_name} — {len(results)} tissues")
            return results

        except httpx.HTTPStatusError as e:
            logger.warning(f"[GTEx] HTTP {e.response.status_code} for {gene_name}")
            return []
        except Exception as e:
            logger.error(f"[GTEx] error for {gene_name}: {e}")
            return []


# ── Open Targets ──────────────────────────────────────────────────────────────

_OT_DISEASE_QUERY = """
query DiseaseAssociations($geneId: String!, $size: Int!) {
  target(ensemblId: $geneId) {
    id
    approvedSymbol
    approvedName
    associatedDiseases(page: { index: 0, size: $size }) {
      count
      rows {
        disease {
          id
          name
          therapeuticAreas {
            name
          }
        }
        score
        datatypeScores {
          componentId
          score
        }
      }
    }
  }
}
"""

async def fetch_open_targets_diseases(gene_symbol: str, db: Session, size: int = 15) -> dict:
    """
    Fetch top disease associations for a gene from Open Targets Platform.
    First resolves gene symbol → Ensembl ID, then queries disease associations.
    """
    cache_key = f"opentargets:diseases:{gene_symbol.upper()}"
    cached = _cache_get(db, cache_key)
    if cached:
        logger.debug(f"[OpenTargets] cache hit: {gene_symbol}")
        return cached

    # Step 1: resolve gene symbol to Ensembl ID
    search_query = """
    query GeneSearch($q: String!) {
      search(queryString: $q, entityNames: ["target"], page: { index: 0, size: 1 }) {
        hits {
          id
          object {
            ... on Target {
              id
              approvedSymbol
              approvedName
            }
          }
        }
      }
    }
    """

    async with httpx.AsyncClient(timeout=25.0) as client:
        try:
            # Search for gene
            search_resp = await client.post(
                OT_GRAPHQL,
                json={"query": search_query, "variables": {"q": gene_symbol}},
                headers=_HEADERS,
            )
            search_resp.raise_for_status()
            search_data = search_resp.json()

            hits = search_data.get("data", {}).get("search", {}).get("hits", [])
            if not hits:
                result = {"gene": gene_symbol, "ensembl_id": None, "associations": [], "total": 0}
                _cache_set(db, cache_key, result, "opentargets")
                return result

            ensembl_id = hits[0]["id"]
            approved_name = hits[0].get("object", {}).get("approvedName", gene_symbol)

            # Fetch disease associations
            disease_resp = await client.post(
                OT_GRAPHQL,
                json={"query": _OT_DISEASE_QUERY, "variables": {"geneId": ensembl_id, "size": size}},
                headers=_HEADERS,
            )
            disease_resp.raise_for_status()
            disease_data = disease_resp.json()

            target = disease_data.get("data", {}).get("target", {})
            assoc_data = target.get("associatedDiseases", {})
            rows = assoc_data.get("rows", [])

            associations = []
            for row in rows:
                disease = row.get("disease", {})
                therapeutic_areas = [ta["name"] for ta in disease.get("therapeuticAreas", [])]
                associations.append({
                    "disease_id": disease.get("id", ""),
                    "disease_name": disease.get("name", ""),
                    "therapeutic_areas": therapeutic_areas,
                    "overall_score": round(row.get("score", 0) * 100, 1),
                    "genetic_evidence": next(
                        (round(d["score"] * 100, 1) for d in row.get("datatypeScores", []) if d["componentId"] == "genetic_association"),
                        0.0
                    ),
                    "clinical_evidence": next(
                        (round(d["score"] * 100, 1) for d in row.get("datatypeScores", []) if d["componentId"] == "clinical_trial"),
                        0.0
                    ),
                })

            result = {
                "gene": gene_symbol,
                "ensembl_id": ensembl_id,
                "approved_name": approved_name,
                "associations": associations,
                "total": assoc_data.get("count", len(associations)),
            }
            _cache_set(db, cache_key, result, "opentargets")
            logger.info(f"[OpenTargets] fetched: {gene_symbol} — {len(associations)} disease associations")
            return result

        except httpx.HTTPStatusError as e:
            logger.warning(f"[OpenTargets] HTTP {e.response.status_code} for {gene_symbol}")
            return {"gene": gene_symbol, "associations": [], "total": 0, "error": str(e)}
        except Exception as e:
            logger.error(f"[OpenTargets] error for {gene_symbol}: {e}")
            return {"gene": gene_symbol, "associations": [], "total": 0, "error": str(e)}


# ── Composite lookup ──────────────────────────────────────────────────────────

async def fetch_full_variant_annotation(rsid: str, db: Session) -> dict:
    """
    Fetch complete real annotation for a variant by rsID.
    Runs Ensembl + ClinVar in parallel, then returns merged result.
    """
    ensembl_task = fetch_ensembl_variant(rsid, db)
    clinvar_task  = fetch_clinvar_significance(rsid, db)
    vep_task      = fetch_ensembl_vep(rsid, db)

    ensembl, clinvar, vep = await asyncio.gather(ensembl_task, clinvar_task, vep_task)

    return {
        "rsid": rsid,
        "ensembl": ensembl,
        "clinvar": clinvar,
        "vep": vep,
    }
