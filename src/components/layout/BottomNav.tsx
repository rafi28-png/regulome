import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Dna,
  Activity,
  BookOpen,
  MoreHorizontal,
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '@/context/AppContext';

/* =============================================
   ReguloMe — Fixed Bottom Navigation Bar
   Visible on mobile/tablet only (hidden lg+)
   ============================================= */

const bottomNavItems = [
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/variants',  label: 'Variants',  icon: Dna },
  { path: '/app/expression',label: 'Expression',icon: Activity },
  { path: '/app/evidence',  label: 'Evidence',  icon: BookOpen },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setSidebarOpen } = useApp();

  const isActive = (path: string) => {
    if (path === '/app/dashboard') {
      return location.pathname === '/app' || location.pathname === '/app/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch"
      style={{
        minHeight: 64,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(13, 17, 33, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(56, 78, 122, 0.3)',
        boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      {bottomNavItems.map((item) => {
        const active = isActive(item.path);
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={clsx(
              'flex-1 flex flex-col items-center justify-center gap-1 relative transition-all duration-200',
              active ? 'text-rg-teal-400' : 'text-rg-text-muted hover:text-rg-text-secondary'
            )}
          >
            {active && (
              <motion.div
                layoutId="bottom-nav-active"
                className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-rg-teal-500"
                style={{ boxShadow: '0 0 8px rgba(10,232,210,0.8)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {active && (
              <motion.div
                layoutId="bottom-nav-pill"
                className="absolute inset-x-2 inset-y-1.5 rounded-xl bg-rg-teal-500/10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <motion.div
              className="relative z-10"
              animate={{ scale: active ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Icon size={20} />
            </motion.div>
            <span className="relative z-10 text-[10px] font-semibold leading-none tracking-wide">
              {item.label}
            </span>
          </button>
        );
      })}

      {/* More — opens sidebar drawer */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="flex-1 flex flex-col items-center justify-center gap-1 text-rg-text-muted hover:text-rg-text-secondary transition-colors duration-200"
      >
        <MoreHorizontal size={20} />
        <span className="text-[10px] font-semibold leading-none tracking-wide">More</span>
      </button>
    </nav>
  );
}
