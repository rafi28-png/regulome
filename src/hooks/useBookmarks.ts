/**
 * ReguloMe — useBookmarks hook
 *
 * Persistent bookmarks:
 *  - DEMO mode: stored in localStorage (survives page refresh, no auth needed)
 *  - REAL mode: stored in SQLite via API (survives across devices with login)
 */

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { fetchApi } from '@/lib/api';

const DEMO_BOOKMARKS_KEY = 'regulome:bookmarks';
const REAL_BOOKMARKS_KEY = 'regulome:real-bookmarks';

function readStoredBookmarks(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const ids = JSON.parse(raw) as string[];
    return new Set(ids);
  } catch {
    return new Set();
  }
}

function writeStoredBookmarks(key: string, ids: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
  } catch {
    // ignore storage errors
  }
}

interface UseBookmarksReturn {
  bookmarks: Set<string>;
  isBookmarked: (variantId: string) => boolean;
  toggleBookmark: (variantId: string, meta?: BookmarkMeta) => Promise<void>;
  count: number;
}

interface BookmarkMeta {
  rs_id?: string;
  gene?: string;
  chromosome?: string;
  position?: number;
  persona_id?: string;
}

export function useBookmarks(initialBookmarkedIds?: string[]): UseBookmarksReturn {
  const { mode, currentPersona } = useApp();
  const isDemo = mode === 'demo';
  const storageKey = isDemo ? DEMO_BOOKMARKS_KEY : REAL_BOOKMARKS_KEY;

  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    const stored = readStoredBookmarks(storageKey);
    if (isDemo && initialBookmarkedIds) {
      initialBookmarkedIds.forEach(id => stored.add(id));
    }
    return stored;
  });

  // Sync when switching between Demo and Real mode
  useEffect(() => {
    const stored = readStoredBookmarks(storageKey);
    if (isDemo && initialBookmarkedIds) {
      initialBookmarkedIds.forEach(id => stored.add(id));
    }
    setBookmarks(stored);

    if (!isDemo) {
      fetchApi<{ bookmarks: { variant_id: string }[] }>('/bookmarks/')
        .then(resp => {
          const merged = new Set([...stored, ...resp.bookmarks.map(b => b.variant_id)]);
          writeStoredBookmarks(REAL_BOOKMARKS_KEY, merged);
          setBookmarks(merged);
        })
        .catch(() => {
          // Backend offline — keep localStorage bookmarks
        });
    }
  }, [isDemo, storageKey, initialBookmarkedIds]);

  const toggleBookmark = useCallback(async (variantId: string, meta?: BookmarkMeta) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(variantId)) {
        next.delete(variantId);
      } else {
        next.add(variantId);
      }
      writeStoredBookmarks(storageKey, next);
      return next;
    });

    if (!isDemo) {
      try {
        const params = new URLSearchParams();
        if (currentPersona?.id) params.set('persona_id', currentPersona.id);
        if (meta?.rs_id) params.set('rs_id', meta.rs_id);
        if (meta?.gene) params.set('gene', meta.gene);
        if (meta?.chromosome) params.set('chromosome', meta.chromosome);
        if (meta?.position) params.set('position', String(meta.position));

        await fetchApi(`/bookmarks/${variantId}?${params.toString()}`, { method: 'POST' });
      } catch {
        // Backend offline — bookmark is already persisted in localStorage
      }
    }
  }, [isDemo, storageKey, currentPersona]);

  const isBookmarked = useCallback((id: string) => bookmarks.has(id), [bookmarks]);

  return { bookmarks, isBookmarked, toggleBookmark, count: bookmarks.size };
}
