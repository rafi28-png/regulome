import { useEffect } from 'react';

/**
 * useViewportZoom — Auto-scales the entire app proportionally with window size.
 *
 * Targets 1440px as the "design width" (100% zoom).
 * When the window is narrower, the whole page zooms out to fit.
 * When the window is wider (e.g. 4K), it zooms in slightly.
 *
 * Clamps between MIN_ZOOM and MAX_ZOOM to prevent extreme scaling.
 */
const DESIGN_WIDTH = 1440;   // px — the width everything is designed for
const MIN_ZOOM     = 0.42;   // never shrink below 42% (ultra-narrow windows)
const MAX_ZOOM     = 1.6;    // never blow up beyond 160% (very large monitors)

export function useViewportZoom() {
  useEffect(() => {
    const applyZoom = () => {
      const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, window.innerWidth / DESIGN_WIDTH));
      document.body.style.zoom = zoom.toString();
      // Prevent body-level scrollbar that appears when zoom < 1
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    };

    applyZoom();

    window.addEventListener('resize', applyZoom);
    return () => {
      window.removeEventListener('resize', applyZoom);
      document.body.style.zoom = '1'; // restore on unmount
    };
  }, []);
}
