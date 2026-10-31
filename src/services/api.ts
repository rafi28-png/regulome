// ============================================
// ReguloMe — API Client
// ============================================

import { AUTH_TOKEN_STORAGE_KEY, readStorageItem, writeStorageItem } from '@/lib/storage';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

function getToken(): string | null {
  return readStorageItem(AUTH_TOKEN_STORAGE_KEY);
}

async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const t = getToken();
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...(init.headers || {}),
    },
  });
}

async function handleResponse<T>(resp: Response): Promise<T> {
  if (!resp.ok) {
    let msg = `Request failed (${resp.status})`;
    try { msg = (await resp.json()).detail || msg; } catch {}
    throw new Error(msg);
  }
  return resp.json() as Promise<T>;
}

// ─── Legacy ApiClient class (with seamless browser-side fallback when offline) ──

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = readStorageItem(AUTH_TOKEN_STORAGE_KEY);
  }

  setToken(token: string | null) {
    this.token = token;
    writeStorageItem(AUTH_TOKEN_STORAGE_KEY, token);
  }

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (this.token) {
      requestHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `API error: ${response.status}`);
      }

      return response.json();
    } catch (err) {
      // If backend server is not running (e.g., static GitHub Pages deployment),
      // provide seamless local browser authentication and status handling
      const isNetworkErr = err instanceof TypeError || (err instanceof Error && /fetch|network/i.test(err.message));
      if (isNetworkErr) {
        if (endpoint === '/auth/login' || endpoint === '/auth/signup') {
          const payload = (body || {}) as Record<string, string>;
          const email = (payload.email || 'researcher@regulome.bio').trim();
          const name = (payload.name || email.split('@')[0] || 'Researcher').trim();
          const token = `local_jwt_${btoa(email).replace(/=/g, '')}_${Date.now()}`;
          return {
            access_token: token,
            token_type: 'bearer',
            user_id: `usr_${btoa(email).slice(0, 10)}`,
            name,
            email,
          } as unknown as T;
        }
        if (endpoint === '/upload/status') {
          const hasLocal = readStorageItem('regulome:has-uploaded-data') === 'true';
          return { has_data: hasLocal } as unknown as T;
        }
      }
      throw err;
    }
  }

  get<T>(endpoint: string) { return this.request<T>(endpoint); }
  post<T>(endpoint: string, body: unknown) { return this.request<T>(endpoint, { method: 'POST', body }); }
  put<T>(endpoint: string, body: unknown) { return this.request<T>(endpoint, { method: 'PUT', body }); }
  delete<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'DELETE' }); }
}

export const api = new ApiClient(`${API_BASE}`);
export default api;

// ─── Standalone functions (Real Mode) ────────────────────────────────────────

// Auth
export async function apiSignup(name: string, email: string, password: string) {
  return api.post<{ access_token: string; user_id: string; name: string; email: string }>('/auth/signup', {
    name,
    email,
    password,
  });
}

export async function apiLogin(email: string, password: string) {
  return api.post<{ access_token: string; user_id: string; name: string; email: string }>('/auth/login', {
    email,
    password,
  });
}

// Upload — IMPORTANT: no Content-Type override, browser sets it for FormData
export async function apiUploadGenome(file: File): Promise<any> {
  const t = getToken();
  if (!t) throw new Error('Not authenticated');
  const formData = new FormData();
  formData.append('file', file);
  const resp = await fetch(`${API_BASE}/upload/genome`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}` },
    body: formData,
  });
  return handleResponse(resp);
}

export async function apiGetUploadStatus(): Promise<any> {
  try {
    const resp = await authFetch('/upload/status');
    if (!resp.ok) return { has_data: readStorageItem('regulome:has-uploaded-data') === 'true' };
    return resp.json();
  } catch {
    return { has_data: readStorageItem('regulome:has-uploaded-data') === 'true' };
  }
}

// Dashboard (Real Mode)
export async function apiGetRealDashboard(): Promise<any> {
  return handleResponse(await authFetch('/real/dashboard/summary'));
}

// Variants (Real Mode)
export async function apiGetRealVariants(params: {
  page?: number; per_page?: number; search?: string;
  significance?: string; impact?: string; sort_by?: string;
}): Promise<any> {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); });
  return handleResponse(await authFetch(`/real/variants/?${q}`));
}

export async function apiGetRealVariantDetail(rsid: string): Promise<any> {
  return handleResponse(await authFetch(`/real/variants/${rsid}`));
}

export async function apiExportRealVariants(format: 'json' | 'csv'): Promise<Blob> {
  const t = getToken();
  const resp = await fetch(`${API_BASE}/real/variants/export?format=${format}`, {
    headers: t ? { Authorization: `Bearer ${t}` } : {},
  });
  if (!resp.ok) throw new Error('Export failed');
  return resp.blob();
}

// Expression (Real Mode)
export async function apiGetRealExpressionHeatmap(): Promise<any> {
  return handleResponse(await authFetch('/real/expression/heatmap'));
}

// Network (Real Mode)
export async function apiGetRealNetworkGraph(): Promise<any> {
  return handleResponse(await authFetch('/real/network/graph'));
}

// Diseases (Real Mode)
export async function apiGetRealDiseaseRiskProfile(): Promise<any> {
  return handleResponse(await authFetch('/real/diseases/risk-profile'));
}

// Settings
export async function apiSetNcbiKey(api_key: string): Promise<any> {
  try {
    return await handleResponse(await authFetch('/settings/ncbi-key', {
      method: 'POST', body: JSON.stringify({ api_key }),
    }));
  } catch {
    writeStorageItem('regulome:ncbi-api-key', api_key);
    return { status: 'saved_locally', ncbi_key_configured: Boolean(api_key) };
  }
}

export async function apiGetSettingsStatus(): Promise<any> {
  try { return await handleResponse(await authFetch('/settings/status')); }
  catch { return { ncbi_key_configured: Boolean(readStorageItem('regulome:ncbi-api-key')) }; }
}

// Research Workbench — Live genomics queries (with direct CORS Ensembl + MyVariant.info fallback)
export async function apiLookupVariant(rsid: string): Promise<any> {
  const cleanRsid = rsid.trim();
  try {
    const resp = await fetch(`${API_BASE}/genomics/variant/${cleanRsid}`);
    if (resp.ok) return await resp.json();
  } catch {
    // Backend offline — query Ensembl REST + MyVariant.info directly from browser
  }

  const [ensVarResp, ensVepResp, myVarResp] = await Promise.allSettled([
    fetch(`https://rest.ensembl.org/variation/human/${cleanRsid}?content-type=application/json`),
    fetch(`https://rest.ensembl.org/vep/human/id/${cleanRsid}?content-type=application/json&regulatory=1`),
    fetch(`https://myvariant.info/v1/variant/${cleanRsid}?fields=dbsnp,clinvar,cadd,gnomad_genome`),
  ]);

  let ensVar: any = null;
  let ensVep: any = null;
  let myVar: any = null;

  if (ensVarResp.status === 'fulfilled' && ensVarResp.value.ok) {
    ensVar = await ensVarResp.value.json();
  }
  if (ensVepResp.status === 'fulfilled' && ensVepResp.value.ok) {
    const arr = await ensVepResp.value.json();
    ensVep = Array.isArray(arr) ? arr[0] : null;
  }
  if (myVarResp.status === 'fulfilled' && myVarResp.value.ok) {
    const mv = await myVarResp.value.json();
    myVar = Array.isArray(mv) ? mv[0] : mv;
  }

  if (!ensVar && !ensVep && (!myVar || myVar.notfound)) {
    throw new Error(`Variant ${cleanRsid} not found in Ensembl or MyVariant.info`);
  }

  const mapping = ensVar?.mappings?.[0] || {};
  const alleleStr = mapping.allele_string || (ensVep?.allele_string) || 'G/A';
  const [refAllele, altAllele] = alleleStr.split('/');
  const tcList = ensVep?.transcript_consequences || [];
  const geneSymbol = tcList.find((t: any) => t.gene_symbol)?.gene_symbol
    || myVar?.dbsnp?.gene?.symbol
    || 'Intergenic';
  const regFeatures = (ensVep?.regulatory_feature_consequences || []).map((r: any) => ({
    biotype: r.biotype || 'regulatory_region',
    regulatory_feature_id: r.regulatory_feature_id || 'ENSR0000',
    consequence_terms: r.consequence_terms || [],
  }));
  const rcv = myVar?.clinvar?.rcv;
  const clinSig = Array.isArray(rcv) ? rcv[0]?.clinical_significance : rcv?.clinical_significance;

  return {
    rsid: cleanRsid,
    source: 'Ensembl GRCh38 + MyVariant.info Live API',
    ensembl: {
      chromosome: mapping.seq_region_name || ensVep?.seq_region_name || 'Unknown',
      position: mapping.start || ensVep?.start || 0,
      ref_allele: refAllele || 'N',
      alt_allele: altAllele || 'N',
      most_severe_consequence: ensVep?.most_severe_consequence || ensVar?.most_severe_consequence || 'regulatory_region_variant',
      minor_allele_freq: ensVar?.MAF ?? myVar?.gnomad_genome?.af?.af ?? null,
      clinical_significance: ensVar?.clinical_significance || (clinSig ? [clinSig] : []),
      genes: geneSymbol !== 'Intergenic' ? [geneSymbol] : [],
    },
    vep: {
      regulatory_features: regFeatures,
      transcript_consequences: tcList.slice(0, 5),
    },
    clinvar: {
      clinical_significance: clinSig || (ensVar?.clinical_significance?.[0]) || 'Functional polymorphism',
      gene: geneSymbol,
      cadd_phred: myVar?.cadd?.phred ?? null,
    },
  };
}

export async function apiLookupGene(geneSymbol: string): Promise<any> {
  const cleanGene = geneSymbol.trim().toUpperCase();
  try {
    const resp = await fetch(`${API_BASE}/genomics/gene/${cleanGene}`);
    if (resp.ok) return await resp.json();
  } catch {
    // Backend offline — query Ensembl + OpenTargets directly from browser
  }

  const ensResp = await fetch(
    `https://rest.ensembl.org/lookup/symbol/homo_sapiens/${cleanGene}?content-type=application/json;expand=0`
  );
  if (!ensResp.ok) {
    throw new Error(`Gene ${cleanGene} not found in Ensembl GRCh38`);
  }
  const ensData = await ensResp.json();
  const ensemblId = ensData.id;

  let diseases: any[] = [];
  if (ensemblId) {
    try {
      const otQuery = `
        query GeneDiseases($ensemblId: String!) {
          target(ensemblId: $ensemblId) {
            id
            approvedSymbol
            approvedName
            associatedDiseases(page: { index: 0, size: 8 }) {
              rows {
                disease { id name }
                score
              }
            }
          }
        }
      `;
      const otResp = await fetch('https://api.platform.opentargets.org/api/v4/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: otQuery, variables: { ensemblId } }),
      });
      if (otResp.ok) {
        const otJson = await otResp.json();
        const rows = otJson?.data?.target?.associatedDiseases?.rows || [];
        diseases = rows.map((r: any) => ({
          disease_id: r.disease?.id,
          disease_name: r.disease?.name,
          score: Number((r.score || 0).toFixed(3)),
        }));
      }
    } catch {
      // Ignore OpenTargets error if offline
    }
  }

  return {
    symbol: ensData.display_name || cleanGene,
    ensembl_id: ensemblId,
    description: ensData.description || `${cleanGene} human gene`,
    biotype: ensData.biotype || 'protein_coding',
    chromosome: ensData.seq_region_name,
    start: ensData.start,
    end: ensData.end,
    strand: ensData.strand,
    associated_diseases: diseases,
  };
}

// Bookmarks (Real Mode — SQLite backed)
export async function apiGetBookmarks(): Promise<any[]> {
  try { return await handleResponse(await authFetch('/bookmarks/')); } catch { return []; }
}

export async function apiCreateBookmark(rsid: string, label?: string): Promise<any> {
  return handleResponse(await authFetch('/bookmarks/', {
    method: 'POST', body: JSON.stringify({ rsid, label }),
  }));
}

export async function apiDeleteBookmark(id: number): Promise<any> {
  return handleResponse(await authFetch(`/bookmarks/${id}`, { method: 'DELETE' }));
}

// Reports (Real Mode)
export async function apiDownloadReport(): Promise<Blob> {
  const t = getToken();
  const resp = await fetch(`${API_BASE}/real/variants/export?format=json`, {
    headers: t ? { Authorization: `Bearer ${t}` } : {},
  });
  if (!resp.ok) throw new Error('Report generation failed');
  return resp.blob();
}
