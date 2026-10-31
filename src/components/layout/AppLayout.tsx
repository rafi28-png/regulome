import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CommandPalette from './CommandPalette';
import BottomNav from './BottomNav';

/**
 * AppLayout — Main application shell with sidebar + topbar + content area.
 * Both demo and real mode render the same pages — no blocking gates.
 */
export default function AppLayout() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const main = mainRef.current;

    const handleScroll = () => {
      const mainScroll = main?.scrollTop ?? 0;
      setShowScrollTop(Math.max(mainScroll, window.scrollY) > 320);
    };

    handleScroll();
    main?.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      main?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const scrollToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div
        className="flex bg-rg-bg-primary"
        style={{ minHeight: '100dvh' }}
      >
        {/* Sidebar */}
        <Sidebar />

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <Topbar />

          <main
            ref={mainRef}
            className="flex-1 min-h-0 overflow-y-auto"
            style={{
              paddingLeft: 'clamp(16px, 4vw, 48px)',
              paddingRight: 'clamp(16px, 4vw, 48px)',
              paddingTop: 'clamp(20px, 4vw, 64px)',
              paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Bottom nav (mobile/tablet only) */}
      <BottomNav />

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            type="button"
            onClick={scrollToTop}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed right-4 bottom-[calc(84px+env(safe-area-inset-bottom))] z-50 flex items-center gap-2 rounded-lg border border-rg-teal-500/30 bg-rg-bg-card/95 px-3 py-2 text-sm font-semibold text-rg-teal-300 shadow-elevated backdrop-blur-xl transition-colors hover:bg-rg-bg-hover hover:text-rg-teal-200 lg:right-8 lg:bottom-8"
            aria-label="Back to top"
          >
            <ArrowUp size={16} />
            <span className="hidden sm:inline">Top</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Global overlays */}
      <CommandPalette />
    </>
  );
}
