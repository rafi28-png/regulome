/**
 * ReguloMe — useApi hook
 *
 * In DEMO mode: bypasses HTTP and returns null data immediately.
 *   Pages then fall back to their static .ts data files.
 *
 * In REAL mode: calls the FastAPI backend and returns live data.
 *   Pages use this data and fall back to static data only if the API fails.
 *
 * This means:
 *   - Demo mode works offline, no backend required.
 *   - Real mode works with the backend running, using real public genomics APIs.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchApi, postApi } from '@/lib/api';
import { useApp } from '@/context/AppContext';

export interface UseApiResponse<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  /** POST to an endpoint and refresh data */
  mutate: (endpoint: string, body?: unknown) => Promise<unknown>;
}

export function useApi<T>(endpoint: string | null): UseApiResponse<T> {
  const { mode } = useApp();
  const isDemo = mode === 'demo';

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!isDemo && !!endpoint);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    // Demo mode: skip the network, pages use static data
    if (!endpoint || isDemo) {
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchApi<T>(endpoint);
      setData(result);
    } catch (err) {
      // Silently handle 404s — these endpoints use static fallback data.
      // Only surface real errors (500s, network failures, etc.)
      const message = err instanceof Error ? err.message : '';
      if (message.includes('404') || message.includes('Not Found')) {
        // Endpoint not implemented on backend — fall back to static data
        setData(null);
      } else {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, isDemo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const mutate = useCallback(async (mutateEndpoint: string, body?: unknown) => {
    try {
      const result = await postApi(mutateEndpoint, body ?? {});
      // Refresh main data after mutation
      await fetchData();
      return result;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Mutation failed');
    }
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData, mutate };
}

/** Convenience: check if we are in real mode and data is actually loaded */
export function useRealData<T>(apiData: T | null, staticFallback: T): { data: T; isFromApi: boolean } {
  return {
    data: apiData ?? staticFallback,
    isFromApi: apiData !== null,
  };
}
