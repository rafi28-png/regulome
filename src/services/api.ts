// ============================================
// ReguloMe — API Client
// ============================================

import { AUTH_TOKEN_STORAGE_KEY, readStorageItem, writeStorageItem } from '@/lib/storage';

const API_BASE = 'http://localhost:8000/api/v1';

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

// ─── Legacy ApiClient class (kept for backwards compat) ──────────────────────

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
  return handleResponse<{ access_token: string; user_id: string; name: string; email: string }>(
    await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
  );
}

export async function apiLogin(email: string, password: string) {
  return handleResponse<{ access_token: string; user_id: string; name: string; email: string }>(
    await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  );
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
    if (!resp.ok) return { has_data: false };
    return resp.json();
  } catch {
    return { has_data: false };
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
  return handleResponse(await authFetch('/settings/ncbi-key', {
    method: 'POST', body: JSON.stringify({ api_key }),
  }));
}

export async function apiGetSettingsStatus(): Promise<any> {
  try { return handleResponse(await authFetch('/settings/status')); }
  catch { return { ncbi_key_configured: false }; }
}

// Research Workbench — Live genomics queries (no auth needed)
export async function apiLookupVariant(rsid: string): Promise<any> {
  const resp = await fetch(`${API_BASE}/genomics/variant/${rsid}`);
  return handleResponse(resp);
}

export async function apiLookupGene(geneSymbol: string): Promise<any> {
  const resp = await fetch(`${API_BASE}/genomics/gene/${geneSymbol}`);
  return handleResponse(resp);
}

// Bookmarks (Real Mode — SQLite backed)
export async function apiGetBookmarks(): Promise<any[]> {
  try { return handleResponse(await authFetch('/bookmarks/')); } catch { return []; }
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
