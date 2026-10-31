import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Menu,
  Bell,
  Command,
  ChevronDown,
  X,
  LogIn,
  LogOut,
  UserCircle,
  FlaskConical,
  Dna,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '@/context/AppContext';

// Map paths to page titles
const pageTitles: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/dashboard': 'Dashboard',
  '/app/variants': 'Variant Explorer',
  '/app/expression': 'Gene Expression Landscape',
  '/app/network': 'Regulatory Network Atlas',
  '/app/genome-3d': '3D Genome Explorer',
  '/app/atlas': 'Hotspot Atlas',
  '/app/diseases': 'Disease & Systems Biology Hub',
  '/app/epigenetic-clock': 'Epigenetic & Regulatory Clock',
  '/app/simulator': 'Regulatory Twin Simulator',
  '/app/optimization': 'Self-Optimization Studio',
  '/app/evidence': 'Evidence Studio',
  '/app/workbench': 'Research Workbench',
  '/app/reports': 'Report Center',
  '/app/design-system': 'Design System',
};

// Demo notifications
const DEMO_NOTIFICATIONS = [
  {
    id: 1,
    icon: <AlertCircle size={14} />,
    iconColor: '#ef4444',
    title: 'High-impact variant detected',
    body: 'rs429358 (APOE ε4) flagged — Alzheimer risk modifier',
    time: '2 min ago',
    unread: true,
  },
  {
    id: 2,
    icon: <CheckCircle2 size={14} />,
    iconColor: '#10b981',
    title: 'Epigenetic clock analysis complete',
    body: 'Biological age estimated at 34.2 yrs (−3.8 from chronological)',
    time: '18 min ago',
    unread: true,
  },
  {
    id: 3,
    icon: <Info size={14} />,
    iconColor: '#8b5cf6',
    title: 'GTEx expression data refreshed',
    body: 'FOXO3 tissue expression updated across 54 tissue types',
    time: '1 hr ago',
    unread: false,
  },
  {
    id: 4,
    icon: <Dna size={14} />,
    iconColor: '#0ae8d2',
    title: 'New eQTL associations indexed',
    body: '128 new significant eQTLs added for chr6 regulatory region',
    time: '3 hrs ago',
    unread: false,
  },
];

// Overlay click-outside hook
function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onClose]);
}

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, setMode, isAuthenticated, userName, userEmail, logout, setSidebarOpen, setCommandPaletteOpen, currentPersona } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(notifRef, () => setNotifOpen(false));
  useClickOutside(userMenuRef, () => setUserMenuOpen(false));

  const unreadCount = notifications.filter(n => n.unread).length;
  const pageTitle = pageTitles[location.pathname] || 'ReguloMe';

  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, unread: false })));

  const handleModeToggle = () => {
    if (mode === 'demo') {
      // Switching to real mode: if already logged in, just switch. Otherwise go to login.
      if (isAuthenticated) {
        setMode('real');
      } else {
        navigate('/login?reason=real-mode');
      }
    } else {
      // Switching back to demo is always allowed
      setMode('demo');
    }
  };

  const handleSignOut = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/');
  };

  const personaInitial = (mode === 'real' && userName) ? userName[0] : currentPersona?.name?.[0] ?? 'U';
  const personaName = (mode === 'real' && userName) ? userName : currentPersona?.name ?? 'Guest';

  return (
    <header
      style={{
        height: 56,
        borderBottom: '1px solid rgba(56,78,122,0.25)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 'clamp(16px, 4vw, 48px)',
        paddingRight: 'clamp(12px, 3vw, 24px)',
        background: 'rgba(13,17,33,0.7)',
        backdropFilter: 'blur(20px)',
        flexShrink: 0,
        zIndex: 20,
        position: 'relative',
      }}
    >
      {/* Left: Mobile menu + Page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-rg-bg-hover text-rg-text-muted hover:text-rg-text-primary transition-colors"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 4, height: 22, borderRadius: 999, background: 'linear-gradient(180deg, #0ae8d2, #8b5cf6)', flexShrink: 0 }} />
          <motion.h1
            key={pageTitle}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5', letterSpacing: '-0.02em', lineHeight: 1 }}
          >
            {pageTitle}
          </motion.h1>
        </div>
      </div>

      {/* Center: Search trigger */}
      <div className="flex-1 flex justify-center px-4">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-lg bg-rg-bg-tertiary border border-rg-border-light hover:border-rg-border text-rg-text-muted hover:text-rg-text-secondary transition-all w-full max-w-md text-sm"
        >
          <Search size={14} />
          <span className="flex-1 text-left">Search genes, variants, pathways...</span>
          <kbd className="hidden lg:inline-flex items-center justify-center gap-0.5 px-1.5 rounded bg-rg-bg-hover border border-rg-border text-[10px] font-mono text-rg-text-muted h-5 opacity-80">
            <Command size={10} className="mt-px" /><span>K</span>
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile search */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="md:hidden p-2 rounded-lg hover:bg-rg-bg-hover text-rg-text-muted hover:text-rg-text-primary transition-colors"
        >
          <Search size={18} />
        </button>

        {/* Mode toggle */}
        <button
          onClick={handleModeToggle}
          className={clsx(
            'hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-all border',
            mode === 'demo'
              ? 'bg-rg-teal-500/10 text-rg-teal-400 border-rg-teal-500/20 hover:bg-rg-teal-500/20'
              : 'bg-rg-purple-500/10 text-rg-purple-400 border-rg-purple-500/20 hover:bg-rg-purple-500/20'
          )}
          title={mode === 'demo' ? 'Switch to Real Mode (requires login)' : 'Switch to Demo Mode'}
        >
          <span className={clsx(
            'w-1.5 h-1.5 rounded-full',
            mode === 'demo' ? 'bg-rg-teal-400' : 'bg-rg-purple-400'
          )} />
          {mode === 'demo' ? 'DEMO' : 'REAL'}
        </button>

        {/* ── Notifications ── */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setNotifOpen(o => !o); setUserMenuOpen(false); }}
            className="relative p-2 rounded-lg hover:bg-rg-bg-hover text-rg-text-muted hover:text-rg-text-primary transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 16, height: 16, borderRadius: '50%',
                background: '#ef4444', color: '#fff',
                fontSize: 9, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 340, borderRadius: 16,
                  background: 'rgba(13,17,33,0.97)',
                  border: '1px solid rgba(56,78,122,0.35)',
                  backdropFilter: 'blur(24px)',
                  boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
                  zIndex: 100, overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(56,78,122,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5' }}>Notifications</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{ fontSize: 11, color: '#0ae8d2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        Mark all read
                      </button>
                    )}
                    <button onClick={() => setNotifOpen(false)} style={{ color: '#6b7d9c', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Notification list */}
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{
                      padding: '12px 18px',
                      borderBottom: '1px solid rgba(56,78,122,0.1)',
                      background: n.unread ? 'rgba(10,232,210,0.03)' : 'transparent',
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                    }}>
                      <span style={{ color: n.iconColor, flexShrink: 0, marginTop: 2 }}>{n.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#e8edf5' }}>{n.title}</span>
                          {n.unread && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0ae8d2', flexShrink: 0 }} />}
                        </div>
                        <p style={{ fontSize: 11, color: '#8899b8', lineHeight: 1.4, margin: 0 }}>{n.body}</p>
                        <span style={{ fontSize: 10, color: '#4a5568', marginTop: 4, display: 'block' }}>{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── User Menu ── */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setUserMenuOpen(o => !o); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-rg-bg-hover transition-colors"
            title="Account menu"
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #0ae8d2, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12, fontWeight: 800, flexShrink: 0,
            }}>
              {personaInitial}
            </div>
            <ChevronDown size={14} className="text-rg-text-muted hidden sm:block" />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 240, borderRadius: 16,
                  background: 'rgba(13,17,33,0.97)',
                  border: '1px solid rgba(56,78,122,0.35)',
                  backdropFilter: 'blur(24px)',
                  boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
                  zIndex: 100, overflow: 'hidden',
                }}
              >
                {/* Identity block */}
                <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(56,78,122,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0ae8d2, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 14, fontWeight: 800, flexShrink: 0,
                    }}>
                      {personaInitial}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5' }}>{personaName}</div>
                      {mode === 'real' && userEmail && (
                        <div style={{ fontSize: 11, color: '#6b7d9c', marginTop: 1 }}>{userEmail}</div>
                      )}
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3,
                        padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                        background: mode === 'demo' ? 'rgba(10,232,210,0.1)' : 'rgba(139,92,246,0.1)',
                        color: mode === 'demo' ? '#0ae8d2' : '#a78bfa',
                        border: `1px solid ${mode === 'demo' ? 'rgba(10,232,210,0.2)' : 'rgba(139,92,246,0.2)'}`,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                        {mode === 'demo' ? 'DEMO MODE' : 'REAL MODE'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div style={{ padding: '8px 0' }}>
                  <button
                    onClick={() => { setUserMenuOpen(false); setCommandPaletteOpen(true); }}
                    style={{ width: '100%', padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, color: '#c4cfe8', fontSize: 13, textAlign: 'left' }}
                    className="hover:bg-rg-bg-hover transition-colors"
                  >
                    <Search size={14} color="#6b7d9c" />
                    Command Palette
                    <kbd style={{ marginLeft: 'auto', fontSize: 10, color: '#4a5568', fontFamily: 'monospace' }}>⌘K</kbd>
                  </button>

                  <button
                    onClick={() => { setUserMenuOpen(false); handleModeToggle(); }}
                    style={{ width: '100%', padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, color: '#c4cfe8', fontSize: 13, textAlign: 'left' }}
                    className="hover:bg-rg-bg-hover transition-colors"
                  >
                    <FlaskConical size={14} color="#6b7d9c" />
                    {mode === 'demo' ? 'Switch to Real Mode' : 'Switch to Demo Mode'}
                  </button>

                  <div style={{ margin: '8px 0', borderTop: '1px solid rgba(56,78,122,0.15)' }} />

                  {mode === 'demo' ? (
                    <>
                      <button
                        onClick={() => { setUserMenuOpen(false); navigate('/login'); }}
                        style={{ width: '100%', padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, color: '#c4cfe8', fontSize: 13, textAlign: 'left' }}
                        className="hover:bg-rg-bg-hover transition-colors"
                      >
                        <LogIn size={14} color="#0ae8d2" />
                        Sign In
                      </button>
                      <button
                        onClick={() => { setUserMenuOpen(false); navigate('/signup'); }}
                        style={{ width: '100%', padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, color: '#0ae8d2', fontSize: 13, fontWeight: 700, textAlign: 'left' }}
                        className="hover:bg-rg-bg-hover transition-colors"
                      >
                        <UserCircle size={14} color="#0ae8d2" />
                        Create Account
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleSignOut}
                      style={{ width: '100%', padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, color: '#ef4444', fontSize: 13, textAlign: 'left' }}
                      className="hover:bg-rg-bg-hover transition-colors"
                    >
                      <LogOut size={14} color="#ef4444" />
                      Sign Out
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
