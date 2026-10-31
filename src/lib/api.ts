/**
 * ReguloMe — HTTP API Client
 * Handles auth token injection, error parsing, and base URL config.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

function getToken(): string | null {
  try {
    return localStorage.getItem('rg_auth_token');
  } catch {
    return null;
  }
}

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...buildHeaders(),
      ...(options?.headers as Record<string, string> | undefined),
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error ${response.status}: ${errorBody}`);
  }

  return response.json();
}

export async function postApi<T>(endpoint: string, body: unknown): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function deleteApi<T>(endpoint: string): Promise<T> {
  return fetchApi<T>(endpoint, { method: 'DELETE' });
}

/** Check if the backend is reachable */
export async function pingBackend(): Promise<boolean> {
  try {
    const resp = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    return resp.ok;
  } catch {
    return false;
  }
}

export const API_BASE_URL = API_BASE;
