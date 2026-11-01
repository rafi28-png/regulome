import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Dna,
  Activity,
  Network,
  Globe,
  Map,
  HeartPulse,
  Clock,
  FlaskConical,
  Target,
  BookOpen,
  Wrench,
  FileText,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '@/context/AppContext';

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={18} />,
  Dna: <Dna size={18} />,
  Activity: <Activity size={18} />,
  Network: <Network size={18} />,
  Globe: <Globe size={18} />,
  Map: <Map size={18} />,
  HeartPulse: <HeartPulse size={18} />,
  Clock: <Clock size={18} />,
  FlaskConical: <FlaskConical size={18} />,
  Target: <Target size={18} />,
  BookOpen: <BookOpen size={18} />,
  Wrench: <Wrench size={18} />,
  FileText: <FileText size={18} />,
  Upload: <Upload size={18} />,
  Settings: <Settings size={18} />,
};

interface NavItem {
  path: string;
  label: string;
  icon: string;
  section: string;
}

const navItems: NavItem[] = [
  { path: '/app/data-studio', label: 'Data Studio', icon: 'Upload', section: 'Core' },
  { path: '/app/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', section: 'Core' },
  { path: '/app/variants', label: 'Variant Explorer', icon: 'Dna', section: 'Core' },
  { path: '/app/expression', label: 'Gene Expression', icon: 'Activity', section: 'Core' },
  { path: '/app/network', label: 'Network Atlas', icon: 'Network', section: 'Visualization' },
  { path: '/app/genome-3d', label: '3D Genome', icon: 'Globe', section: 'Visualization' },
  { path: '/app/atlas', label: 'Hotspot Atlas', icon: 'Map', section: 'Visualization' },
  { path: '/app/diseases', label: 'Disease Hub', icon: 'HeartPulse', section: 'Analysis' },
  { path: '/app/epigenetic-clock', label: 'Epigenetic Clock', icon: 'Clock', section: 'Analysis' },
  { path: '/app/simulator', label: 'Twin Simulator', icon: 'FlaskConical', section: 'Analysis' },
  { path: '/app/optimization', label: 'Optimization', icon: 'Target', section: 'Lifestyle' },
  { path: '/app/evidence', label: 'Evidence Studio', icon: 'BookOpen', section: 'Research' },
  { path: '/app/workbench', label: 'Workbench', icon: 'Wrench', section: 'Research' },
  { path: '/app/reports', label: 'Reports', icon: 'FileText', section: 'Research' },
  { path: '/app/settings', label: 'Settings', icon: 'Settings', section: 'Research' },
];

const UNLOCKED_BEFORE_UPLOAD = new Set(['/app/data-studio', '/app/workbench', '/app/settings']);

// Group items by section
function groupBySection(items: NavItem[]): Record<string, NavItem[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);
}

const sectionColors: Record<string, string> = {
  Core: 'text-rg-teal-400',
  Visualization: 'text-rg-purple-400',
  Analysis: 'text-rg-warning',
  Lifestyle: 'text-rg-success',
  Research: 'text-rg-info',
};

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar, sidebarOpen, setSidebarOpen, currentPersona, mode, userName, hasUploadedData } = useApp();

  const grouped = groupBySection(navItems);

  const isActive = (path: string) => {
    if (path === '/app/dashboard') {
      return location.pathname === '/app' || location.pathname === '/app/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleNav = (path: string) => {
    navigate(path);
    setSidebarOpen(false); // close mobile sidebar
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={clsx(
        'flex items-center gap-3 px-4 h-16 border-b border-rg-border shrink-0',
        sidebarCollapsed && 'justify-center px-2'
      )}>
        <motion.div
          whileHover={{ rotate: 10 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="text-2xl cursor-pointer"
          onClick={() => navigate('/')}
        >
          🧬
        </motion.div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="text-lg font-bold gradient-text whitespace-nowrap overflow-hidden"
            >
              ReguloMe
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Mode & identity indicator */}
      <div
        className={clsx('mx-3 mt-4 overflow-hidden transition-all duration-300', sidebarCollapsed ? 'p-2' : '')}
        style={{
          borderRadius: 12,
          border: mode === 'demo'
            ? '1px solid rgba(0,204,184,0.25)'
            : '1px solid rgba(139,92,246,0.25)',
          background: mode === 'demo'
            ? 'linear-gradient(135deg, rgba(0,204,184,0.08) 0%, rgba(139,92,246,0.05) 100%)'
            : 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(10,232,210,0.05) 100%)',
        }}
      >
        <AnimatePresence>
          {!sidebarCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ padding: '12px 14px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span className={clsx(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border',
                  mode === 'demo'
                    ? 'border-rg-teal-500/25 bg-rg-teal-500/10 text-rg-teal-300'
                    : 'border-rg-purple-500/25 bg-rg-purple-500/10 text-rg-purple-300'
                )}>
                  <Dna size={16} />
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: mode === 'demo' ? '#0ae8d2' : '#a78bfa' }}>
                  {mode === 'demo' ? 'Demo Mode' : 'Real Mode'}
                </span>
              </div>
              {mode === 'real' ? (
                <>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#e8edf5', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {userName || 'Authenticated User'}
                  </p>
                  <p style={{ fontSize: 11, color: hasUploadedData ? '#10b981' : '#f59e0b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                    {hasUploadedData ? '✓ Real Genome Active' : 'Step 1: Load DNA in Studio'}
                  </p>
                </>
              ) : currentPersona ? (
                <>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#e8edf5', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentPersona.name}
                  </p>
                  <p style={{ fontSize: 11, color: '#6b7d9c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentPersona.label}
                  </p>
                </>
              ) : null}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', justifyContent: 'center', padding: 8 }}
            >
              <span
                className={clsx(
                  'flex h-9 w-9 items-center justify-center rounded-md border',
                  mode === 'demo'
                    ? 'border-rg-teal-500/25 bg-rg-teal-500/10 text-rg-teal-300'
                    : 'border-rg-purple-500/25 bg-rg-purple-500/10 text-rg-purple-300'
                )}
                title={mode === 'real' && userName ? userName : currentPersona?.name ?? 'Guest'}
              >
                <Dna size={17} />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto"
        style={{ paddingTop: 28, paddingBottom: 28, paddingLeft: sidebarCollapsed ? 8 : 20, paddingRight: sidebarCollapsed ? 8 : 20 }}
      >
        {Object.entries(grouped).map(([section, items]) => (
          <div key={section} style={{ marginBottom: 26 }}>
            {/* Section label */}
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12, paddingLeft: 8 }}
                  className={sectionColors[section] || 'text-rg-text-muted'}
                >
                  {section}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((item) => {
                const active = isActive(item.path);
                const lockedInReal = mode === 'real' && !hasUploadedData && !UNLOCKED_BEFORE_UPLOAD.has(item.path);
                return (
                  <motion.button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ paddingTop: 9, paddingBottom: 9, paddingLeft: sidebarCollapsed ? 10 : 12, paddingRight: sidebarCollapsed ? 10 : 12 }}
                    className={clsx(
                      'w-full flex items-center gap-3 rounded-lg transition-all duration-200 relative group cursor-pointer',
                      sidebarCollapsed && 'justify-center',
                      active
                        ? 'bg-rg-teal-500/12 text-rg-teal-400'
                        : lockedInReal
                          ? 'text-rg-text-muted/60 hover:bg-rg-bg-hover'
                          : 'text-rg-text-secondary hover:bg-rg-bg-hover hover:text-rg-text-primary'
                    )}
                    title={
                      lockedInReal
                        ? `${item.label} — Load or build a genome in Data Studio first`
                        : sidebarCollapsed
                          ? item.label
                          : undefined
                    }
                  >
                    {/* Active indicator */}
                    {active && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-rg-teal-500 rounded-r"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}

                    <span className={clsx(active && 'text-rg-teal-400')}>
                      {iconMap[item.icon]}
                    </span>

                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="text-sm font-medium whitespace-nowrap overflow-hidden flex-1 text-left"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {!sidebarCollapsed && item.path === '/app/data-studio' && mode === 'real' && !hasUploadedData && (
                      <span className="rounded bg-rg-teal-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rg-teal-300">
                        START
                      </span>
                    )}

                    {!sidebarCollapsed && lockedInReal && (
                      <span className="text-[10px] text-rg-text-muted" title="Requires genome data">
                        🔒
                      </span>
                    )}

                    {/* Collapsed tooltip */}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-rg-bg-card border border-rg-border rounded-lg text-xs text-rg-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-elevated">
                        {item.label}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-rg-border p-3 shrink-0">
        {/* Collapse toggle (desktop only) */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex items-center justify-center w-full gap-2 px-3 py-2 rounded-lg text-rg-text-muted hover:bg-rg-bg-hover hover:text-rg-text-primary transition-all text-sm"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Version badge */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-1.5 mt-2"
            >
              <Sparkles size={10} className="text-rg-purple-400" />
              <span className="text-[10px] text-rg-text-muted font-mono">v0.1.0-alpha</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:sticky lg:top-0 lg:flex flex-col bg-rg-bg-secondary border-r border-rg-border overflow-hidden z-30 shrink-0"
        style={{ height: '100dvh' }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[240px] bg-rg-bg-secondary border-r border-rg-border z-50 lg:hidden overflow-hidden"
              style={{ height: '100dvh' }}
            >
              {/* Close button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-rg-bg-hover text-rg-text-muted hover:text-rg-text-primary transition-colors z-10"
              >
                <X size={16} />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
