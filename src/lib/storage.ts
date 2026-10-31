export const MODE_STORAGE_KEY = 'regulome:workspace-mode';
export const PERSONA_STORAGE_KEY = 'regulome:demo-persona';
export const AUTH_TOKEN_STORAGE_KEY = 'rg_auth_token';  // must match lib/api.ts getToken()

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readStorageItem(key: string): string | null {
  if (!canUseStorage()) return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorageItem(key: string, value: string | null) {
  if (!canUseStorage()) return;

  try {
    if (value === null) {
      window.localStorage.removeItem(key);
      return;
    }

    window.localStorage.setItem(key, value);
  } catch {
    // Storage is optional in restricted browser contexts.
  }
}
