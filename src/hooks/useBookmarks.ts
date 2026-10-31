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

function readDemoBookmarks(): Set<string> {
  try {
    const raw = localStorage.getItem(DEMO_BOOKMARKS_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw) as string[];
    return new Set(ids);
  } catch {
    return new Set();
  }
}

function writeDemoBookmarks(ids: Set<string>) {
  try {
    localStorage.setItem(DEMO_BOOKMARKS_KEY, JSON.stringify([...ids]));
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

  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    if (isDemo) {
      const stored = readDemoBookmarks();
      // Merge with any pre-bookmarked items from static data
      if (initialBookmarkedIds) {
        initialBookmarkedIds.forEach(id => stored.add(id));
      }
      return stored;
    }
    return new Set<string>();
  });

  // On mount in real mode: fetch bookmarks from API
  useEffect(() => {
    if (!isDemo) {
      fetchApi<{ bookmarks: { variant_id: string }[] }>('/bookmarks/')
        .then(resp => {
          const ids = new Set(resp.bookmarks.map(b => b.variant_id));
          setBookmarks(ids);
        })
        .catch(() => {
          // Backend not reachable — start with empty
          setBookmarks(new Set());
        });
    }
  }, [isDemo]);

  const toggleBookmark = useCallback(async (variantId: string, meta?: BookmarkMeta) => {
    if (isDemo) {
      // Demo mode: persist to localStorage
      setBookmarks(prev => {
        const next = new Set(prev);
        if (next.has(variantId)) {
          next.delete(variantId);
        } else {
          next.add(variantId);
        }
        writeDemoBookmarks(next);
        return next;
      });
    } else {
      // Real mode: call backend, toggle optimistically
      setBookmarks(prev => {
        const next = new Set(prev);
        if (next.has(variantId)) next.delete(variantId);
        else next.add(variantId);
        return next;
      });
      try {
        const params = new URLSearchParams();
        if (currentPersona?.id) params.set('persona_id', currentPersona.id);
        if (meta?.rs_id) params.set('rs_id', meta.rs_id);
        if (meta?.gene) params.set('gene', meta.gene);
        if (meta?.chromosome) params.set('chromosome', meta.chromosome);
        if (meta?.position) params.set('position', String(meta.position));

        await fetchApi(`/bookmarks/${variantId}?${params.toString()}`, { method: 'POST' });
      } catch (err) {
        // Revert optimistic update if API fails
        console.error('Bookmark toggle failed:', err);
        setBookmarks(prev => {
          const next = new Set(prev);
          if (next.has(variantId)) next.delete(variantId);
          else next.add(variantId);
          return next;
        });
      }
    }
  }, [isDemo, currentPersona]);

  const isBookmarked = useCallback((id: string) => bookmarks.has(id), [bookmarks]);

  return { bookmarks, isBookmarked, toggleBookmark, count: bookmarks.size };
}
