import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dna, Mail, Lock, ArrowRight, Eye, EyeOff, LockKeyhole, Activity, Sparkles, HeartPulse, Zap, Terminal } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import api from '@/services/api';

interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  name: string;
  email: string;
}

// ── Animated left panel ──
const STATS = [
  { label: 'Regulatory Variants', value: '2,847', color: '#0ae8d2' },
  { label: 'Epigenetic Markers', value: '14,200+', color: '#8b5cf6' },
  { label: 'Disease Associations', value: '38', color: '#f59e0b' },
  { label: 'Clock Accuracy', value: '94.2%', color: '#10b981' },
];

const FEATURES = [
  { icon: Activity, label: 'Variant Explorer', color: '#0ae8d2' },
  { icon: Sparkles, label: 'Epigenetic Clock', color: '#8b5cf6' },
  { icon: HeartPulse, label: 'Disease Hub', color: '#ef4444' },
  { icon: Zap, label: 'Twin Simulator', color: '#f59e0b' },
];

const TERMINAL_LINES = [
  { prefix: '>', text: 'Loading regulatory variant database...', color: '#0ae8d2' },
  { prefix: '✓', text: 'ENCODE tissue tracks: 928 loaded', color: '#10b981' },
  { prefix: '✓', text: 'Epigenetic clock calibrated (r²=0.94)', color: '#10b981' },
  { prefix: '~', text: 'Scanning chromatin accessibility...', color: '#8b5cf6' },
];

function LeftPanel() {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(155deg, #050810 0%, #080d1c 40%, #0b1020 70%, #060a16 100%)',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '52px 52px 44px',
      minHeight: '100vh',
    }}>
      {/* Background grid */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05,
        backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.4) 1px, transparent 0)',
        backgroundSize: '32px 32px', pointerEvents: 'none' }} />

      {/* Large ambient orbs */}
      <motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '10%', left: '-15%', width: 600, height: 600,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,232,210,0.09) 0%, transparent 65%)',
          filter: 'blur(80px)', pointerEvents: 'none' }} />
      <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        style={{ position: 'absolute', bottom: '0%', right: '-10%', width: 560, height: 560,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 65%)',
          filter: 'blur(80px)', pointerEvents: 'none' }} />

      {/* Floating particles */}
      {[...Array(10)].map((_, i) => (
        <motion.div key={i}
          animate={{ y: [0, -(60 + i * 18), 0], x: [0, i % 2 === 0 ? 12 : -12, 0], opacity: [0.1, 0.45, 0.1] }}
          transition={{ duration: 6 + i * 1.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
          style={{ position: 'absolute', borderRadius: '50%',
            width: 2 + (i % 3), height: 2 + (i % 3),
            background: i % 3 === 0 ? 'rgba(10,232,210,0.8)' : i % 3 === 1 ? 'rgba(139,92,246,0.8)' : 'rgba(245,158,11,0.6)',
            left: `${8 + i * 9}%`, top: `${20 + (i % 5) * 13}%`,
            boxShadow: i % 2 === 0 ? '0 0 10px rgba(10,232,210,0.6)' : '0 0 10px rgba(139,92,246,0.6)',
            pointerEvents: 'none' }} />
      ))}

      {/* ── TOP: Logo ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14,
          background: 'linear-gradient(135deg, #0ae8d2, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 28px rgba(10,232,210,0.4)' }}>
          <Dna size={22} color="#fff" />
        </div>
        <span style={{ fontSize: 24, fontWeight: 900, color: '#e8edf5', letterSpacing: '-0.03em' }}>
          Regulo<span style={{ color: '#0ae8d2' }}>Me</span>
        </span>
      </motion.div>

      {/* ── MIDDLE: Hero visual + headline ── */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 0' }}>
        {/* Central hero orb */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
          {/* Outer ring */}
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%',
              border: '1px solid rgba(10,232,210,0.15)',
              boxShadow: '0 0 40px rgba(10,232,210,0.08) inset' }} />
          {/* Middle ring */}
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%',
              border: '1px dashed rgba(139,92,246,0.2)' }} />
          {/* Inner ring */}
          <motion.div animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', width: 148, height: 148, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(10,232,210,0.12) 0%, rgba(139,92,246,0.06) 50%, transparent 75%)',
              border: '1px solid rgba(10,232,210,0.25)',
              boxShadow: '0 0 60px rgba(10,232,210,0.2), 0 0 30px rgba(139,92,246,0.15) inset' }} />
          {/* Orbiting dot on outer ring */}
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%' }}>
            <div style={{ position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)',
              width: 8, height: 8, borderRadius: '50%',
              background: '#0ae8d2', boxShadow: '0 0 16px rgba(10,232,210,0.9)' }} />
          </motion.div>
          {/* Orbiting dot on middle ring */}
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%' }}>
            <div style={{ position: 'absolute', top: -3, left: '50%', transform: 'translateX(-50%)',
              width: 6, height: 6, borderRadius: '50%',
              background: '#8b5cf6', boxShadow: '0 0 12px rgba(139,92,246,0.9)' }} />
          </motion.div>
          {/* Core icon */}
          <motion.div animate={{ scale: [1, 1.08, 1], rotate: [0, 5, 0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(10,232,210,0.2), rgba(139,92,246,0.15))',
              border: '1px solid rgba(10,232,210,0.35)',
              boxShadow: '0 0 40px rgba(10,232,210,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Dna size={34} color="#0ae8d2" style={{ filter: 'drop-shadow(0 0 12px rgba(10,232,210,0.8))' }} />
          </motion.div>
        </div>

        {/* Headline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
          style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.12, letterSpacing: '-0.04em', marginBottom: 14 }}>
            <span style={{ background: 'linear-gradient(135deg, #e8edf5 30%, #a5c5e8 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Decode the Dark Matter
            </span>
            <br />
            <span style={{ background: 'linear-gradient(135deg, #0ae8d2, #8b5cf6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              of Your DNA.
            </span>
          </h1>
          <p style={{ fontSize: 14, color: '#6b80a0', lineHeight: 1.75, maxWidth: 380, margin: '0 auto' }}>
            Tissue-specific regulatory networks, live variant data, and your personal epigenetic timeline.
          </p>
        </motion.div>

        {/* Feature pills — centered */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 36 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.07 }}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 999,
                background: `${f.color}10`, border: `1px solid ${f.color}28`,
                color: f.color, fontSize: 11, fontWeight: 700, letterSpacing: '0.01em' }}>
              <f.icon size={12} />
              {f.label}
            </motion.div>
          ))}
        </motion.div>

        {/* Stats grid */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.06 }}
              style={{ padding: '14px 18px', borderRadius: 14,
                background: `linear-gradient(135deg, ${s.color}08, ${s.color}04)`,
                border: `1px solid ${s.color}22`, backdropFilter: 'blur(12px)' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color, fontFamily: 'monospace',
                textShadow: `0 0 18px ${s.color}55` }}>{s.value}</div>
              <div style={{ fontSize: 9, color: '#5a6d8c', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.07em', marginTop: 4 }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── BOTTOM: Terminal strip ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
        style={{ position: 'relative', zIndex: 1,
          borderRadius: 14, overflow: 'hidden',
          background: 'rgba(5,8,16,0.7)', border: '1px solid rgba(10,232,210,0.12)',
          backdropFilter: 'blur(16px)' }}>
        {/* Terminal header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
          borderBottom: '1px solid rgba(56,78,122,0.2)', background: 'rgba(255,255,255,0.02)' }}>
          <Terminal size={12} color="#0ae8d2" />
          <span style={{ fontSize: 10, color: '#0ae8d2', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.05em' }}>
            REGULOME · LIVE FEED
          </span>
          <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', marginLeft: 'auto' }} />
        </div>
        {/* Terminal lines */}
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TERMINAL_LINES.map((line, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.15 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'monospace', fontSize: 11 }}>
              <span style={{ color: line.color, fontWeight: 700, width: 14, flexShrink: 0 }}>{line.prefix}</span>
              <span style={{ color: '#8899b8' }}>{line.text}</span>
            </motion.div>
          ))}
          {/* Blinking cursor */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'monospace', fontSize: 11 }}>
            <span style={{ color: '#0ae8d2', fontWeight: 700, width: 14 }}>_</span>
            <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.9, repeat: Infinity }}
              style={{ width: 7, height: 13, background: '#0ae8d2', borderRadius: 2 }} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCurrentPersona, setIsAuthenticated, setMode, setUserIdentity, setHasUploadedData } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isRealModeGate = searchParams.get('reason') === 'real-mode';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      api.setToken(response.access_token);
      setIsAuthenticated(true);
      setUserIdentity(response.name, response.email);
      setMode('real');
      // Check if user already has genome data from a previous session
      try {
        const statusResp = await api.get<{ has_data: boolean }>('/upload/status');
        if (statusResp.has_data) {
          setHasUploadedData(true);
          navigate('/app/dashboard');
        } else {
          setHasUploadedData(false);
          navigate('/app/data-studio');
        }
      } catch {
        // Backend down or error — default to dashboard
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in right now.');
    } finally {
      setLoading(false);
    }
  };

  const enterDemoMode = () => {
    api.setToken(null);
    setIsAuthenticated(false);
    setMode('demo');
    navigate('/app/dashboard');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh',
      background: '#050810', fontFamily: 'Inter, system-ui, sans-serif' }}
      className="max-lg:grid-cols-1">

      {/* ── Left visual panel ── */}
      <div className="hidden lg:block">
        <LeftPanel />
      </div>

      {/* ── Right form panel ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 32px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #080c18, #0a0e1a)' }}>

        {/* Subtle bg glow */}
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(10,232,210,0.05), transparent 65%)',
          filter: 'blur(60px)', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(135deg, #0ae8d2, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Dna size={18} color="#fff" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#e8edf5' }}>
              Regulo<span style={{ color: '#0ae8d2' }}>Me</span>
            </span>
          </div>

          {/* Real mode banner */}
          <AnimatePresence>
            {isRealModeGate && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', gap: 12, padding: '14px 18px', borderRadius: 14, marginBottom: 24,
                  background: 'rgba(10,232,210,0.07)', border: '1px solid rgba(10,232,210,0.2)' }}>
                <LockKeyhole size={16} color="#0ae8d2" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0ae8d2', marginBottom: 3 }}>
                    Sign in to unlock Real Mode
                  </p>
                  <p style={{ fontSize: 11, color: '#8899b8', lineHeight: 1.5 }}>
                    Live genomic data sources require a verified account.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#e8edf5', letterSpacing: '-0.03em', marginBottom: 8 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: '#6b7d9c' }}>Sign in to continue your research.</p>
          </div>

          {/* Social buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {[
              { label: 'Google', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#e8edf5" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#e8edf5" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#e8edf5" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#e8edf5" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )},
              { label: 'GitHub', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#e8edf5">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              )},
            ].map(btn => (
              <motion.button key={btn.label} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  height: 44, borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(56,78,122,0.35)',
                  color: '#c4cfe8', transition: 'all 0.15s' }}>
                {btn.icon} {btn.label}
              </motion.button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(56,78,122,0.3)' }} />
            <span style={{ fontSize: 11, color: '#4a5568', fontWeight: 600, letterSpacing: '0.05em' }}>OR CONTINUE WITH EMAIL</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(56,78,122,0.3)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#8899b8', letterSpacing: '0.04em',
                textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#4a5568" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{ width: '100%', padding: '13px 16px 13px 44px', borderRadius: 12, fontSize: 14,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(56,78,122,0.35)',
                    color: '#e8edf5', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(10,232,210,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(56,78,122,0.35)'} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#8899b8', letterSpacing: '0.04em',
                textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#4a5568" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  style={{ width: '100%', padding: '13px 44px 13px 44px', borderRadius: 12, fontSize: 14,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(56,78,122,0.35)',
                    color: '#e8edf5', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(10,232,210,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(56,78,122,0.35)'} />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#4a5568', display: 'flex' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember / forgot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#8899b8' }}>
                <input type="checkbox" style={{ accentColor: '#0ae8d2', width: 14, height: 14 }} />
                Remember me
              </label>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: '#0ae8d2', fontWeight: 600 }}>
                Forgot password?
              </button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ padding: '12px 16px', borderRadius: 12, fontSize: 13,
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.02, y: -1 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                height: 50, borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? 'rgba(56,78,122,0.4)' : 'linear-gradient(135deg, #0ae8d2, #06b6d4)',
                color: loading ? '#6b7d9c' : '#050810', border: 'none',
                boxShadow: loading ? 'none' : '0 0 32px rgba(10,232,210,0.35)',
                transition: 'all 0.2s' }}>
              {loading ? (
                <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          {/* Demo mode link */}
          <div style={{ marginTop: 20, padding: '14px 18px', borderRadius: 14,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(56,78,122,0.2)', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#6b7d9c', margin: 0 }}>
              No account?{' '}
              <button type="button" onClick={enterDemoMode}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                  color: '#0ae8d2', fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Terminal size={12} /> Try Demo Mode
              </button>
              {' '}with synthetic personas.
            </p>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#4a5568', marginTop: 16 }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#0ae8d2', fontWeight: 700, textDecoration: 'none' }}>
              Create one free →
            </Link>
          </p>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #4a5568; }
      `}</style>
    </div>
  );
}
