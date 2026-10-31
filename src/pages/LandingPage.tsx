import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Dna,
  ArrowRight,
  Activity,
  Microscope,
  Clock,
  LogIn,
  ChevronRight,
  Terminal,
  HeartPulse,
  Zap,
  Shield,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useApp } from '@/context/AppContext';

const shellStyle = {
  width: 'min(calc(100% - 24px), 1360px)',
  marginInline: 'auto',
};

/* =============================================
   ReguloMe — Premium Landing Page
   ============================================= */

// ── Navbar ──
function LandingNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-rg-bg-primary/90 backdrop-blur-lg border-b border-rg-border" style={{ height: 72 }}>
      <div className="h-full flex items-center justify-between" style={shellStyle}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-rg-teal-500 to-rg-purple-600 flex items-center justify-center shadow-glow-teal">
            <Dna className="text-white" size={18} />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-rg-text-primary">
            Regulo<span className="text-rg-teal-400">Me</span>
          </span>
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-rg-text-muted">
          <a href="#features" className="hover:text-rg-text-primary transition-colors duration-200">Features</a>
          <a href="#personas" className="hover:text-rg-text-primary transition-colors duration-200">Personas</a>
          <a href="#cta" className="hover:text-rg-text-primary transition-colors duration-200">Get Started</a>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <Link to="/login" className="hidden sm:inline text-sm font-medium text-rg-text-secondary hover:text-rg-text-primary transition-colors">
            Sign In
          </Link>
          <Link to="/signup" className="sm:hidden">
            <div className="w-10 h-10 rounded-lg bg-rg-teal-500 text-rg-bg-primary flex items-center justify-center shadow-glow-teal">
              <ArrowRight size={16} />
            </div>
          </Link>
          <Link to="/signup" className="hidden sm:block">
            <Button variant="primary" size="sm" iconRight={<ArrowRight size={14} />}>
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ── Footer ──
function Footer() {
  return (
    <footer className="border-t border-rg-border bg-rg-bg-secondary/30">
      <div className="py-16 text-center" style={shellStyle}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Dna size={16} className="text-rg-teal-500" />
          <span className="font-semibold text-rg-text-secondary text-sm">ReguloMe</span>
        </div>
        <p className="text-sm text-rg-text-muted">© 2026 ReguloMe Platform · Open-source regulatory genomics</p>
      </div>
    </footer>
  );
}

// ── Feature Card ──
function FeatureCard({
  icon,
  title,
  description,
  accentColor,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: 'teal' | 'purple' | 'neutral';
  delay: number;
}) {
  const bgMap = {
    teal: 'bg-rg-teal-500/10 border-rg-teal-500/20',
    purple: 'bg-rg-purple-500/10 border-rg-purple-500/20',
    neutral: 'bg-rg-bg-hover border-rg-border',
  };
  const glowMap = {
    teal: 'hover:shadow-[0_0_40px_rgba(0,204,184,0.12)]',
    purple: 'hover:shadow-[0_0_40px_rgba(139,92,246,0.12)]',
    neutral: 'hover:shadow-card',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay }}
      className="relative group"
    >
      {/* Animated gradient border */}
      <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, rgba(0,204,184,0.3), rgba(139,92,246,0.3), rgba(0,204,184,0.3))', backgroundSize: '200% 200%', animation: 'shimmer 3s linear infinite' }} />
      <div className={`relative glass-panel p-8 lg:p-10 transition-all duration-300 hover:-translate-y-2 ${glowMap[accentColor]} rounded-2xl`}>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-7 border ${bgMap[accentColor]}`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-rg-text-primary mb-3">{title}</h3>
        <p className="text-rg-text-secondary leading-relaxed text-[15px]">{description}</p>
      </div>
    </motion.div>
  );
}

// ── Persona Row Item ──
function PersonaItem({ name, delay }: { name: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-3 py-2.5"
    >
      <div className="w-6 h-6 rounded bg-rg-teal-500/10 border border-rg-teal-500/20 flex items-center justify-center shrink-0">
        <Dna size={10} className="text-rg-teal-400" />
      </div>
      <span className="text-[15px] font-medium text-rg-text-primary">{name}</span>
    </motion.div>
  );
}

// ── Main Page ──
function PersonaPreviewCard({
  icon,
  title,
  subtitle,
  score,
  colorClass,
  barWidth = '66%',
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  score: string;
  colorClass: string;
  barWidth?: string;
}) {
  return (
    <div className="bg-rg-bg-primary/90 rounded-xl border border-rg-border p-6 shadow-card min-h-[154px]">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorClass}`}>
          {icon}
        </div>
        <span className="text-[11px] font-mono text-rg-text-muted">{score}</span>
      </div>
      <div className="text-[15px] font-bold text-rg-text-primary leading-relaxed">{title}</div>
      <div className="text-sm text-rg-text-muted mt-2 leading-relaxed">{subtitle}</div>
      <div className="mt-5 h-1.5 rounded-full bg-rg-bg-hover overflow-hidden">
        <div
          className="h-full rounded-full bg-linear-to-r from-rg-teal-500 to-rg-purple-500"
          style={{ width: barWidth }}
        />
      </div>
    </div>
  );
}

function MobilePreviewCard({
  title,
  eyebrow,
  children,
  accent = 'teal',
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  accent?: 'teal' | 'purple';
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        accent === 'teal'
          ? 'border-rg-teal-500/25 bg-rg-bg-secondary/95'
          : 'border-rg-purple-500/25 bg-rg-bg-secondary/95'
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className={`text-[13px] sm:text-sm font-mono font-semibold ${accent === 'teal' ? 'text-rg-teal-300' : 'text-rg-purple-300'}`}>
          {title}
        </span>
        {eyebrow ? <span className="hidden sm:inline text-[11px] font-mono text-rg-text-muted">{eyebrow}</span> : null}
      </div>
      <div className="rounded-md bg-rg-bg-primary/70 px-3 py-3">
        {children}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { setMode } = useApp();

  const goToDemo = () => { setMode('demo'); navigate('/app/dashboard'); };

  return (
    <div className="relative bg-rg-bg-primary text-rg-text-primary font-sans overflow-x-hidden">
      <LandingNavbar />

      {/* ─── Background Decorations ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Primary gradient orbs */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-0 w-[600px] h-[600px] bg-rg-teal-500/15 rounded-full blur-[180px] -translate-x-1/3 -translate-y-1/3"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-rg-purple-500/10 rounded-full blur-[180px] translate-x-1/3 translate-y-1/3"
        />
        {/* Additional floating orb */}
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-rg-teal-500/5 rounded-full blur-[150px] -translate-x-1/2"
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.25) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* ════════════════════════════════════════════
          SECTION 1 — HERO
          ════════════════════════════════════════════ */}
      <section className="relative z-10" style={{ paddingTop: 128, paddingBottom: 120 }}>
        {/* Aurora sweep behind hero */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px]"
            style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(0,204,184,0.06), transparent, rgba(139,92,246,0.06), transparent)',
              borderRadius: '50%',
              filter: 'blur(80px)',
            }}
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -120 - i * 30, 0],
                x: [0, (i % 2 === 0 ? 20 : -20), 0],
                opacity: [0.15, 0.4, 0.15],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 1.5,
              }}
              className="absolute rounded-full"
              style={{
                width: 3 + i * 0.5,
                height: 3 + i * 0.5,
                background: i % 2 === 0 ? 'rgba(0,204,184,0.5)' : 'rgba(139,92,246,0.5)',
                left: `${15 + i * 14}%`,
                top: `${40 + (i % 3) * 20}%`,
                boxShadow: i % 2 === 0
                  ? '0 0 12px rgba(0,204,184,0.3)'
                  : '0 0 12px rgba(139,92,246,0.3)',
              }}
            />
          ))}
        </div>
        <div style={shellStyle} className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{ maxWidth: 1024, marginInline: 'auto' }}
          >
            {/* Version badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-rg-teal-500/10 border border-rg-teal-500/20 text-rg-teal-400 text-xs font-mono mb-12 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-rg-teal-400 animate-pulse" />
              v0.1.0-alpha - Synthetic Demo Available
            </div>

            {/* Headline with shimmer */}
            <h1 className="text-[2.25rem] sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] sm:leading-[1.15]" style={{ maxWidth: 1024, marginInline: 'auto', marginBottom: 48 }}>
              Decode the{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #00ccb8, #8b5cf6, #00ccb8)',
                  backgroundSize: '200% auto',
                  animation: 'shimmer 4s linear infinite',
                }}
              >
                Dark Matter
              </span>
              <br />
              of Your{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #e8edf5, #00ccb8)' }}>DNA.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[0.95rem] sm:text-xl lg:text-2xl leading-relaxed" style={{ maxWidth: 820, marginInline: 'auto', marginTop: 24, marginBottom: 64, color: '#a8b8d8' }}>
              The world's first interactive regulatory genomics platform.
              Fuse regulatory variants, epigenetic aging, and systems biology
              to optimize your physiological trajectory.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              <Button
                variant="primary"
                size="xl"
                glow
                onClick={() => navigate('/onboarding')}
                iconRight={<ChevronRight size={18} />}
              >
                Configure Virtual Twin
              </Button>
              <Button
                variant="secondary"
                size="xl"
                onClick={goToDemo}
                icon={<Terminal size={18} />}
              >
                Explore Demo Workspace
              </Button>
            </div>

            {/* Live platform stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              style={{ marginTop: 48, display: 'flex', justifyContent: 'center' }}
            >
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 0,
                borderRadius: 14,
                background: 'rgba(10,14,26,0.7)',
                border: '1px solid rgba(56,78,122,0.25)',
                backdropFilter: 'blur(16px)',
                overflow: 'hidden',
              }}>
                {[
                  { value: '2,847', label: 'Regulatory Variants', color: '#0ae8d2' },
                  { value: '14,200+', label: 'Publications Indexed', color: '#8b5cf6' },
                  { value: '38', label: 'Diseases Mapped', color: '#f59e0b' },
                  { value: '94.2%', label: 'Clock Accuracy', color: '#10b981' },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    style={{
                      padding: '14px 24px',
                      borderRight: i < 3 ? '1px solid rgba(56,78,122,0.2)' : 'none',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: stat.color, boxShadow: `0 0 8px ${stat.color}` }} />
                      <span style={{ fontSize: 17, fontWeight: 900, color: stat.color, fontFamily: 'monospace' }}>
                        {stat.value}
                      </span>
                    </div>
                    <p style={{ fontSize: 10, color: '#6b7d9c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Dashboard Preview Mockup — hidden below lg to prevent overflow */}
        <div className="lg:hidden" style={{ ...shellStyle, marginTop: 56 }}>
          <div className="rounded-2xl border border-rg-border bg-rg-bg-card/50 backdrop-blur-xl shadow-elevated p-2">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-rg-border/40">
              <div className="w-3 h-3 rounded-full bg-rg-error/70" />
              <div className="w-3 h-3 rounded-full bg-rg-warning/70" />
              <div className="w-3 h-3 rounded-full bg-rg-success/70" />
              <div className="mx-auto w-44 sm:w-60 h-6 rounded-md bg-rg-bg-primary/60 border border-rg-border flex items-center justify-center">
                <span className="text-[10px] text-rg-text-muted font-mono">app.regulome.io/dashboard</span>
              </div>
            </div>

            <div className="p-3 sm:p-4 space-y-3">
              <MobilePreviewCard title="VCF import" eyebrow="ready" accent="teal">
                <div className="flex items-center gap-2 text-sm font-mono text-rg-text-primary">
                  <Dna size={16} className="text-rg-teal-400 shrink-0" />
                  <span>Variant file connected</span>
                </div>
              </MobilePreviewCard>

              <div className="grid gap-3 sm:grid-cols-2">
                <MobilePreviewCard title="Variant Stack" eyebrow="5 sources" accent="teal">
                  <div className="space-y-3">
                    {[
                      { label: 'GWAS', width: '72%' },
                      { label: 'ClinVar', width: '56%' },
                      { label: 'GTEx', width: '82%' },
                    ].map((item, index) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-rg-text-secondary">{item.label}</span>
                        </div>
                        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-rg-bg-secondary">
                          <motion.div
                            className="h-full rounded-full bg-linear-to-r from-rg-teal-400 to-rg-purple-400"
                            style={{ width: item.width }}
                            animate={{ opacity: [0.55, 1, 0.55] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.18 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </MobilePreviewCard>

                <MobilePreviewCard title="Pathway" eyebrow="live" accent="purple">
                  <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono">
                    <span className="rounded bg-rg-teal-500/18 px-2.5 py-1.5 text-rg-teal-300">SNP</span>
                    <span className="text-rg-text-muted">to</span>
                    <span className="rounded bg-rg-purple-500/18 px-2.5 py-1.5 text-rg-purple-300">TF</span>
                    <span className="text-rg-text-muted">to</span>
                    <span className="rounded bg-rg-teal-500/18 px-2.5 py-1.5 text-rg-teal-300">RNA</span>
                  </div>
                </MobilePreviewCard>
              </div>

              <MobilePreviewCard title="chr12 regulatory locus" eyebrow="rs7312 / FTO enhancer" accent="teal">
                <div className="relative h-10 overflow-hidden rounded-md bg-rg-bg-secondary">
                  <div className="absolute left-4 right-4 top-1/2 h-px bg-rg-border" />
                  {[
                    { left: '8%', width: '16%', color: 'rgba(0,204,184,0.76)' },
                    { left: '31%', width: '12%', color: 'rgba(139,92,246,0.78)' },
                    { left: '52%', width: '24%', color: 'rgba(0,204,184,0.55)' },
                  ].map((track, index) => (
                    <motion.span
                      key={`${track.left}-${track.width}`}
                      className="absolute top-[13px] h-3.5 rounded-full"
                      style={{ left: track.left, width: track.width, background: track.color }}
                      animate={{ opacity: [0.55, 1, 0.55] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}
                    />
                  ))}
                </div>
              </MobilePreviewCard>

              <div className="grid gap-3 sm:grid-cols-2">
                <MobilePreviewCard title="Motif Window" eyebrow="ATAC+" accent="teal">
                  <div className="grid grid-cols-6 gap-1.5 text-center text-sm font-mono font-semibold">
                    {['A', 'T', 'G', 'C', 'C', 'G', 'T', 'A', 'C', 'T', 'G', 'A'].map((base, index) => (
                      <span
                        key={`${base}-${index}`}
                        className={`rounded border px-2 py-1.5 ${
                          index === 4 || index === 5
                            ? 'border-rg-purple-500/35 bg-rg-purple-500/16 text-rg-purple-200'
                            : 'border-rg-teal-500/20 bg-rg-teal-500/10 text-rg-teal-200'
                        }`}
                      >
                        {base}
                      </span>
                    ))}
                  </div>
                </MobilePreviewCard>

                <MobilePreviewCard title="Binding Pocket" eyebrow="affinity 0.82" accent="purple">
                  <div className="relative h-28 rounded-md bg-rg-bg-secondary overflow-hidden">
                    <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-rg-purple-500/35 bg-rg-purple-500/12" />
                    <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-rg-teal-500/35 bg-rg-teal-500/14 flex flex-col items-center justify-center text-center">
                      <span className="text-sm font-bold text-rg-teal-200">FOXO3</span>
                      <span className="text-[10px] font-mono text-rg-text-muted">TF</span>
                    </div>
                  </div>
                </MobilePreviewCard>
              </div>

              <MobilePreviewCard title="Regulatory Impact Map" eyebrow="score 0.91" accent="teal">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { label: 'SNP', detail: 'rs7312' },
                    { label: 'Enhancer', detail: 'active' },
                    { label: 'FOXO3', detail: 'TF bind' },
                    { label: 'Gene', detail: '+18% RNA' },
                  ].map((node, index) => (
                    <motion.div
                      key={node.label}
                      className={`rounded-lg border px-3 py-3 text-center ${index % 2 === 0 ? 'border-rg-teal-500/35 bg-rg-teal-500/14 text-rg-teal-200' : 'border-rg-purple-500/35 bg-rg-purple-500/14 text-rg-purple-200'}`}
                      animate={{ y: [0, index % 2 === 0 ? -2 : 2, 0] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.18 }}
                    >
                      <div className="text-sm font-bold">{node.label}</div>
                      <div className="mt-1 text-[11px] font-mono opacity-80">{node.detail}</div>
                    </motion.div>
                  ))}
                </div>
              </MobilePreviewCard>

              <div className="grid gap-3 sm:grid-cols-2">
                <MobilePreviewCard title="Multi-omic Signal" eyebrow="RNA / ATAC / CpG" accent="purple">
                  <div className="space-y-2">
                    {[
                      { label: 'RNA', color: 'rgba(0,204,184,0.76)', bars: [14, 22, 17, 30, 20, 26] },
                      { label: 'ATAC', color: 'rgba(139,92,246,0.74)', bars: [10, 18, 28, 16, 24, 14] },
                      { label: 'CpG', color: 'rgba(10,232,210,0.6)', bars: [18, 11, 15, 13, 26, 16] },
                    ].map((lane, laneIndex) => (
                      <div key={lane.label} className="grid grid-cols-[42px_1fr] items-end gap-2">
                        <span className="text-[11px] font-mono text-rg-text-secondary">{lane.label}</span>
                        <div className="grid h-8 grid-cols-6 items-end gap-1.5 rounded bg-rg-bg-secondary px-2 py-1.5">
                          {lane.bars.map((height, index) => (
                            <motion.span
                              key={`${lane.label}-${index}`}
                              className="w-full origin-bottom rounded-t-sm"
                              style={{ height, background: lane.color }}
                              animate={{ scaleY: [0.72, 1, 0.72] }}
                              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: laneIndex * 0.28 + index * 0.08 }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </MobilePreviewCard>

                <MobilePreviewCard title="Assay Summary" accent="teal">
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="rounded bg-rg-bg-secondary px-3 py-2.5">
                      <div className="text-rg-text-muted">methyl age</div>
                      <div className="mt-1 text-sm font-bold text-rg-teal-300">-2.4y</div>
                    </div>
                    <div className="rounded bg-rg-bg-secondary px-3 py-2.5">
                      <div className="text-rg-text-muted">eQTL hits</div>
                      <div className="mt-1 text-sm font-bold text-rg-purple-300">128</div>
                    </div>
                    <div className="rounded bg-rg-bg-secondary px-3 py-2.5">
                      <div className="text-rg-text-muted">tissue</div>
                      <div className="mt-1 text-sm font-bold text-rg-teal-300">liver</div>
                    </div>
                    <div className="rounded bg-rg-bg-secondary px-3 py-2.5">
                      <div className="text-rg-text-muted">risk shift</div>
                      <div className="mt-1 text-sm font-bold text-rg-purple-300">+0.18</div>
                    </div>
                  </div>
                </MobilePreviewCard>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: 'easeOut' }}
          style={{ ...shellStyle, marginTop: 80 }}
        >
          <div className="rounded-2xl border border-rg-border bg-rg-bg-card/50 backdrop-blur-xl shadow-elevated p-2">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-rg-border/40">
              <div className="w-3 h-3 rounded-full bg-rg-error/70" />
              <div className="w-3 h-3 rounded-full bg-rg-warning/70" />
              <div className="w-3 h-3 rounded-full bg-rg-success/70" />
              <div className="mx-auto w-60 h-6 rounded-md bg-rg-bg-primary/60 border border-rg-border flex items-center justify-center">
                <span className="text-[10px] text-rg-text-muted font-mono">app.regulome.io/dashboard</span>
              </div>
            </div>
            {/* Mockup body */}
            <div className="grid grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] gap-4 p-4 min-h-[500px]">
              <div className="grid grid-rows-[64px_1fr_126px] gap-4">
                <div className="rounded-lg border border-rg-teal-500/25 bg-rg-bg-secondary px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dna size={17} className="text-rg-teal-400" />
                    <span className="text-sm font-mono font-semibold text-rg-text-primary">VCF import</span>
                  </div>
                  <span className="rounded bg-rg-teal-500/15 px-2.5 py-1.5 text-xs font-mono text-rg-teal-300">ready</span>
                </div>

                <div className="rounded-xl border border-rg-teal-500/25 bg-linear-to-br from-rg-teal-500/14 to-rg-purple-500/10 p-6">
                  <div className="mx-2 mb-4 flex items-center justify-between">
                    <span className="text-sm font-mono font-semibold text-rg-teal-300">Variant Stack</span>
                    <span className="text-xs font-mono text-rg-text-muted">5 sources</span>
                  </div>
                  <div className="mx-2 my-2">
                    {[
                      { label: 'GWAS', value: '72%', width: '72%' },
                      { label: 'ClinVar', value: '56%', width: '56%' },
                      { label: 'GTEx', value: '82%', width: '82%' },
                      { label: 'ENCODE', value: '64%', width: '64%' },
                      { label: 'eQTL', value: '78%', width: '78%' },
                    ].map((item, index) => (
                      <div key={item.label} className="mb-4 last:mb-0">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-rg-text-secondary">{item.label}</span>
                          <span className="text-rg-text-muted">{item.value}</span>
                        </div>
                        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-rg-bg-primary/80">
                          <motion.div
                            className="h-full rounded-full bg-linear-to-r from-rg-teal-400 to-rg-purple-400"
                            style={{ width: item.width }}
                            animate={{ opacity: [0.55, 1, 0.55] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.18 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-rg-purple-500/25 bg-rg-bg-secondary p-6 flex flex-col justify-center">
                  <div className="mx-2 mb-4 flex items-center justify-between">
                    <span className="text-sm font-mono font-semibold text-rg-purple-300">Pathway</span>
                    <span className="text-xs font-mono text-rg-text-muted">live</span>
                  </div>
                  <div className="mx-2 my-2 rounded-md bg-rg-bg-primary/70 px-4 py-4">
                    <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-mono">
                      <span className="rounded bg-rg-teal-500/18 px-2.5 py-1.5 text-rg-teal-300">SNP</span>
                      <span className="text-rg-text-muted">to</span>
                      <span className="rounded bg-rg-purple-500/18 px-2.5 py-1.5 text-rg-purple-300">TF</span>
                      <span className="text-rg-text-muted">to</span>
                      <span className="rounded bg-rg-teal-500/18 px-2.5 py-1.5 text-rg-teal-300">RNA</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl border border-rg-border bg-rg-bg-primary p-5">
                <div
                  className="absolute inset-0 opacity-[0.16]"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(0,204,184,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.18) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />
                <motion.div
                  className="absolute left-0 right-0 h-20 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, transparent, rgba(0,204,184,0.1), transparent)',
                    filter: 'blur(1px)',
                  }}
                  animate={{ y: [-100, 380] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />

                <div className="relative z-10 grid h-full grid-rows-[104px_1fr_154px] gap-4">
                  <div className="rounded-lg border border-rg-teal-500/35 bg-rg-bg-secondary/95 p-6 shadow-[0_0_28px_rgba(0,204,184,0.08)]">
                    <div className="mx-2 mb-4 flex items-center justify-between gap-4 text-sm font-mono">
                      <span className="font-semibold text-rg-teal-300">chr12 regulatory locus</span>
                      <span className="text-rg-text-secondary">rs7312 / FTO enhancer</span>
                    </div>
                    <div className="relative mx-2 my-2 h-10 overflow-hidden rounded-md bg-rg-bg-primary/75">
                      <div className="absolute left-5 right-5 top-1/2 h-px bg-rg-border" />
                      {[
                        { left: '7%', width: '13%', label: 'promoter', color: 'rgba(0,204,184,0.76)' },
                        { left: '26%', width: '8%', label: 'motif', color: 'rgba(139,92,246,0.78)' },
                        { left: '43%', width: '21%', label: 'enhancer', color: 'rgba(0,204,184,0.55)' },
                        { left: '71%', width: '12%', label: 'peak', color: 'rgba(139,92,246,0.62)' },
                      ].map((track, index) => (
                        <motion.span
                          key={track.label}
                          className="absolute top-[13px] h-3.5 rounded-full"
                          style={{ left: track.left, width: track.width, background: track.color }}
                          animate={{ opacity: [0.55, 1, 0.55] }}
                          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}
                        />
                      ))}
                      <motion.span
                        className="absolute inset-y-1 w-px bg-rg-teal-300 shadow-[0_0_12px_rgba(0,204,184,0.7)]"
                        animate={{ left: ['8%', '91%', '8%'] }}
                        transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-[1.02fr_1.28fr_1.05fr] gap-4">
                    <div className="rounded-lg border border-rg-border bg-rg-bg-secondary/90 p-6 flex flex-col">
                      <div className="mx-2 mb-3 flex items-center justify-between">
                        <span className="text-sm font-mono font-semibold text-rg-text-primary">Motif Window</span>
                        <span className="text-xs font-mono text-rg-teal-300">ATAC+</span>
                      </div>
                      <div className="mx-3 my-2 flex-1 flex flex-col justify-center gap-4">
                        <motion.div
                          className="grid grid-cols-6 gap-2 text-center text-base font-mono font-semibold"
                          animate={{ opacity: [0.78, 1, 0.78] }}
                          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          {['A', 'T', 'G', 'C', 'C', 'G', 'T', 'A', 'C', 'T', 'G', 'A'].map((base, index) => (
                            <span
                              key={`${base}-${index}`}
                              className={`rounded border px-2 py-2 ${
                                index === 4 || index === 5
                                  ? 'border-rg-purple-500/35 bg-rg-purple-500/16 text-rg-purple-200'
                                  : 'border-rg-teal-500/20 bg-rg-teal-500/10 text-rg-teal-200'
                              }`}
                            >
                              {base}
                            </span>
                          ))}
                        </motion.div>
                        <div className="rounded bg-rg-bg-primary/70 px-3 py-2 text-xs font-mono text-rg-text-secondary">
                          motif delta: <span className="text-rg-purple-300">-0.18 binding</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-rg-teal-500/30 bg-linear-to-br from-rg-teal-500/12 via-rg-bg-secondary/95 to-rg-purple-500/12 p-6 shadow-[0_0_32px_rgba(0,204,184,0.08)] flex flex-col">
                      <div className="mx-2 mb-3 flex items-center justify-between">
                        <span className="text-sm font-mono font-semibold text-rg-teal-300">Regulatory Impact Map</span>
                        <span className="rounded bg-rg-purple-500/18 px-2.5 py-1.5 text-xs font-mono text-rg-purple-200">score 0.91</span>
                      </div>
                      <div className="mx-3 my-2 flex-1 flex flex-col justify-center gap-4">
                        <div className="grid grid-cols-4 items-center gap-3">
                          {[
                            { label: 'SNP', detail: 'rs7312', color: 'border-rg-teal-500/35 bg-rg-teal-500/14 text-rg-teal-200' },
                            { label: 'Enhancer', detail: 'active', color: 'border-rg-purple-500/35 bg-rg-purple-500/14 text-rg-purple-200' },
                            { label: 'FOXO3', detail: 'TF bind', color: 'border-rg-teal-500/35 bg-rg-teal-500/14 text-rg-teal-200' },
                            { label: 'Gene', detail: '+18% RNA', color: 'border-rg-purple-500/35 bg-rg-purple-500/14 text-rg-purple-200' },
                          ].map((node, index) => (
                            <div key={node.label} className="relative">
                              <motion.div
                                className={`rounded-lg border px-3 py-3 text-center ${node.color}`}
                                animate={{
                                  y: [0, index % 2 === 0 ? -3 : 3, 0],
                                  boxShadow: ['0 0 0 rgba(0,204,184,0)', '0 0 18px rgba(0,204,184,0.12)', '0 0 0 rgba(0,204,184,0)'],
                                }}
                                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.18 }}
                              >
                                <div className="text-sm font-bold">{node.label}</div>
                                <div className="mt-1 text-xs font-mono opacity-80">{node.detail}</div>
                              </motion.div>
                              {index < 3 && (
                                <span className="absolute -right-2 top-1/2 z-10 h-px w-4 bg-rg-teal-400/60 shadow-[0_0_10px_rgba(0,204,184,0.45)]" />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                          <span className="rounded bg-rg-bg-primary/70 px-3 py-2 text-rg-text-secondary">LD: 0.86</span>
                          <span className="rounded bg-rg-bg-primary/70 px-3 py-2 text-rg-text-secondary">tissue: liver</span>
                          <span className="rounded bg-rg-bg-primary/70 px-3 py-2 text-rg-text-secondary">effect: high</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-rg-purple-500/30 bg-rg-bg-secondary/90 p-6 flex flex-col">
                      <div className="mx-2 mb-3 flex items-center justify-between">
                        <span className="text-sm font-mono font-semibold text-rg-purple-300">Binding Pocket</span>
                        <span className="text-xs font-mono text-rg-text-muted">affinity 0.82</span>
                      </div>
                      <div className="mx-2 my-2 flex-1 flex items-center">
                        <div className="relative min-h-[156px] w-full rounded-md bg-rg-bg-primary/70 p-6 overflow-hidden">
                          <motion.div
                            className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-rg-purple-500/35 bg-rg-purple-500/12 shadow-[0_0_28px_rgba(139,92,246,0.12)]"
                            animate={{ scale: [1, 1.04, 1] }}
                            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                          />
                          <motion.div
                            className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-rg-teal-500/35 bg-rg-teal-500/14 flex flex-col items-center justify-center text-center"
                            animate={{ boxShadow: ['0 0 0 rgba(0,204,184,0)', '0 0 20px rgba(0,204,184,0.18)', '0 0 0 rgba(0,204,184,0)'] }}
                            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            <span className="text-sm font-bold text-rg-teal-200">FOXO3</span>
                            <span className="text-[10px] font-mono text-rg-text-muted">TF</span>
                          </motion.div>
                          {[
                            { label: 'H3K27ac', className: 'left-5 top-6', color: 'bg-rg-teal-400' },
                            { label: 'CpG island', className: 'right-5 top-6', color: 'bg-rg-teal-300' },
                            { label: 'POL2', className: 'left-6 bottom-6', color: 'bg-rg-purple-300' },
                            { label: 'motif loss', className: 'right-5 bottom-6', color: 'bg-rg-purple-400' },
                          ].map((node, index) => (
                            <motion.div
                              key={node.label}
                              className={`absolute ${node.className} flex items-center gap-1.5 rounded bg-rg-bg-secondary/85 px-2 py-1.5`}
                              animate={{ opacity: [0.72, 1, 0.72], y: [0, index % 2 === 0 ? -2 : 2, 0] }}
                              transition={{ duration: 3 + index * 0.25, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}
                            >
                              <span className={`h-2.5 w-2.5 rounded-full ${node.color}`} />
                              <span className="text-xs font-mono text-rg-text-secondary">{node.label}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-[1.45fr_1fr] gap-4">
                    <div className="rounded-lg border border-rg-purple-500/30 bg-rg-bg-secondary/95 p-6">
                      <div className="mx-2 mb-3 flex items-center justify-between text-sm font-mono">
                        <span className="font-semibold text-rg-purple-300">Multi-omic Signal</span>
                        <span className="text-rg-text-muted">RNA / ATAC / CpG</span>
                      </div>
                      <div className="mx-2 my-2">
                      {[
                        { label: 'RNA', color: 'rgba(0,204,184,0.76)', bars: [14, 22, 17, 30, 20, 26, 18, 24] },
                        { label: 'ATAC', color: 'rgba(139,92,246,0.74)', bars: [10, 18, 28, 16, 24, 14, 20, 22] },
                        { label: 'CpG', color: 'rgba(10,232,210,0.6)', bars: [18, 11, 15, 13, 26, 16, 22, 14] },
                      ].map((lane, laneIndex) => (
                        <div key={lane.label} className="mb-2.5 last:mb-0 grid grid-cols-[54px_1fr] items-end gap-3">
                          <span className="text-xs font-mono text-rg-text-secondary">{lane.label}</span>
                          <div className="grid h-8 grid-cols-8 items-end gap-2 rounded bg-rg-bg-primary/70 px-3 py-1.5">
                            {lane.bars.map((height, index) => (
                              <motion.span
                                key={`${lane.label}-${index}`}
                                className="w-full origin-bottom rounded-t-sm"
                                style={{ height, background: lane.color }}
                                animate={{ scaleY: [0.72, 1, 0.72] }}
                                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: laneIndex * 0.28 + index * 0.08 }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-rg-teal-500/30 bg-rg-bg-secondary/95 p-6">
                      <div className="mx-2 mb-4 flex items-center justify-between">
                        <span className="text-sm font-mono font-semibold text-rg-teal-300">Assay Summary</span>
                        <BarChart3 size={16} className="text-rg-teal-400" />
                      </div>
                      <div className="mx-2 my-2 grid grid-cols-2 gap-3 text-xs font-mono">
                        <div className="rounded bg-rg-bg-primary/75 px-3 py-2.5">
                          <div className="text-rg-text-muted">methyl age</div>
                          <div className="mt-1 text-base font-bold text-rg-teal-300">-2.4y</div>
                        </div>
                        <div className="rounded bg-rg-bg-primary/75 px-3 py-2.5">
                          <div className="text-rg-text-muted">eQTL hits</div>
                          <div className="mt-1 text-base font-bold text-rg-purple-300">128</div>
                        </div>
                        <div className="rounded bg-rg-bg-primary/75 px-3 py-2.5">
                          <div className="text-rg-text-muted">tissue</div>
                          <div className="mt-1 text-base font-bold text-rg-teal-300">liver</div>
                        </div>
                        <div className="rounded bg-rg-bg-primary/75 px-3 py-2.5">
                          <div className="text-rg-text-muted">risk shift</div>
                          <div className="mt-1 text-base font-bold text-rg-purple-300">+0.18</div>
                        </div>
                      </div>
                    </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        </div>{/* end hidden lg:block */}
      </section>

      {/* Glowing section divider */}
      <div className="relative z-10 flex justify-center" style={{ margin: '-1px 0' }}>
        <div className="h-px w-full max-w-4xl" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,204,184,0.4), rgba(139,92,246,0.4), transparent)' }} />
      </div>

      {/* ════════════════════════════════════════════
          SECTION 2 — FEATURES
          ════════════════════════════════════════════ */}
      <section id="features" className="relative z-10" style={{ paddingTop: 200, paddingBottom: 80 }}>
        <div style={shellStyle}>
          {/* Section header */}
          <div className="text-center" style={{ maxWidth: 896, marginInline: 'auto', marginBottom: 80 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rg-purple-500/10 border border-rg-purple-500/20 text-rg-purple-400 text-xs font-medium mb-8">
                <Zap size={12} />
                Core Capabilities
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold" style={{ marginBottom: 32 }}>
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #e8edf5 30%, #00ccb8 100%)' }}>Beyond Simple</span>{' '}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #00ccb8, #8b5cf6)' }}>Genetics</span>
              </h2>
              <p className="text-lg lg:text-xl text-rg-text-secondary leading-relaxed" style={{ maxWidth: 768, marginInline: 'auto', marginTop: 16, textAlign: 'center' }}>
                We map the 98% of your DNA that acts as the control panel for your health,
                integrating tissue-specific expression networks.
              </p>
            </motion.div>
          </div>

          {/* Cards grid */}
          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard
              icon={<Microscope className="text-rg-teal-400" size={22} />}
              title="Regulatory Variant Impact"
              description="Analyze SNPs across promoters, enhancers, and silencers. See exactly how non-coding changes alter transcription factor binding in real-time."
              accentColor="teal"
              delay={0}
            />
            <FeatureCard
              icon={<Activity className="text-rg-purple-400" size={22} />}
              title="Tissue-Specific Networks"
              description="Visualize multi-omic regulatory cascades. Understand how a single variant impacts your liver, heart, or immune system."
              accentColor="purple"
              delay={0.1}
            />
            <FeatureCard
              icon={<Clock className="text-rg-text-primary" size={22} />}
              title="Epigenetic Acceleration"
              description="Connect your genetic predisposition with biological age markers. Use the Twin Simulator to test lifestyle optimizations iteratively."
              accentColor="neutral"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 3 — STATS BAR
          ════════════════════════════════════════════ */}
      <section className="relative z-10 border-y border-rg-border bg-rg-bg-secondary/30" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div style={shellStyle}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {[
              { value: '38+', label: 'API Endpoints' },
              { value: '6', label: 'Demo Personas' },
              { value: '12', label: 'Analysis Modules' },
              { value: '∞', label: 'Variant Coverage' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-3xl lg:text-4xl font-bold mb-2">
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #0ae8d2, #00ccb8)' }}>{stat.value}</span>
                </div>
                <div className="text-sm" style={{ color: '#8899b8' }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 4 — PERSONAS
          ════════════════════════════════════════════ */}
      <section id="personas" className="relative z-10" style={{ paddingTop: 200, paddingBottom: 200 }}>
        <div style={shellStyle}>
          <div className="grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-10 lg:gap-14 xl:gap-16 items-center">
            {/* Left text */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rg-teal-500/10 border border-rg-teal-500/20 text-rg-teal-400 text-xs font-medium mb-8">
                  <Shield size={12} />
                  Sandbox Mode
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold leading-tight" style={{ marginBottom: 32 }}>
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #e8edf5 20%, #0ae8d2 100%)' }}>Pre-loaded Synthetic</span>{' '}
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #0ae8d2, #8b5cf6)' }}>Personas</span>
                </h2>
                <p className="text-lg text-rg-text-secondary leading-relaxed" style={{ marginTop: 24, marginBottom: 40, lineHeight: 1.8 }}>
                  Not ready to upload a genome? Explore our 6 fully simulated
                  biomolecular personas. From extreme endurance athletes to individuals
                  heavily burdened by cardiometabolic risk, experience the platform's
                  power instantly.
                </p>
              </motion.div>

              <div className="space-y-1" style={{ marginBottom: 48 }}>
                <PersonaItem name="Athlete (Peak Mitochondrial)" delay={0} />
                <PersonaItem name="Inflammatory Immune-Skewed" delay={0.05} />
                <PersonaItem name="Cardiometabolic Risk Profile" delay={0.1} />
                <PersonaItem name="Longevity Optimized" delay={0.15} />
              </div>

              <Button variant="outline" size="lg" onClick={() => navigate('/onboarding')} iconRight={<ArrowRight size={16} />}>
                Explore Personas
              </Button>
            </div>

            {/* Right visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative lg:pl-4"
            >
              <div className="absolute inset-0 bg-linear-to-br from-rg-teal-500/8 to-rg-purple-500/8 blur-[100px] rounded-full" />
              <div
                className="relative glass-panel"
                style={{
                  background: 'linear-gradient(145deg, rgba(21, 28, 46, 0.92), rgba(14, 20, 34, 0.76))',
                  padding: 44,
                }}
              >
                <div className="border-b border-rg-border/60" style={{ paddingBottom: 30, marginBottom: 30 }}>
                  <div>
                    <div className="text-xs font-mono text-rg-teal-400 mb-2">PERSONA MATRIX</div>
                    <div className="text-xl font-bold text-rg-text-primary">Synthetic profile gallery</div>
                    <div className="text-sm text-rg-text-muted mt-2 leading-relaxed">Ready-to-explore regulatory contexts</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                  <PersonaPreviewCard
                    icon={<Activity size={17} className="text-rg-error" />}
                    title="Inflammatory"
                    subtitle="Immune-Skewed"
                    score="247 variants"
                    colorClass="bg-rg-error/15 border-rg-error/25"
                    barWidth="72%"
                  />
                  <PersonaPreviewCard
                    icon={<HeartPulse size={17} className="text-rg-success" />}
                    title="Athletic"
                    subtitle="Peak Mitochondrial"
                    score="182 variants"
                    colorClass="bg-rg-success/15 border-rg-success/25"
                    barWidth="58%"
                  />
                  <PersonaPreviewCard
                    icon={<BarChart3 size={17} className="text-rg-warning" />}
                    title="Cardiometabolic"
                    subtitle="Risk Profile"
                    score="301 variants"
                    colorClass="bg-rg-warning/15 border-rg-warning/25"
                    barWidth="82%"
                  />
                  <PersonaPreviewCard
                    icon={<Zap size={17} className="text-rg-purple-400" />}
                    title="Longevity"
                    subtitle="Optimized"
                    score="156 variants"
                    colorClass="bg-rg-purple-500/15 border-rg-purple-500/25"
                    barWidth="64%"
                  />
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 5 — FINAL CTA
          ════════════════════════════════════════════ */}
      <section id="cta" className="relative z-10" style={{ paddingTop: 160, paddingBottom: 160 }}>
        {/* CTA background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(0,204,184,0.08) 0%, transparent 70%)' }} />
        </div>
        <div className="text-center" style={shellStyle}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
            style={{ maxWidth: 896, marginInline: 'auto' }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold" style={{ marginBottom: 32, textAlign: 'center' }}>
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #e8edf5 30%, #0ae8d2 100%)' }}>Ready to decode</span>{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #0ae8d2, #8b5cf6)' }}>your blueprint?</span>
            </h2>
            <p className="text-lg lg:text-xl leading-relaxed" style={{ maxWidth: 768, marginInline: 'auto', marginBottom: 48, textAlign: 'center', color: '#a8b8d8' }}>
              Start analyzing your regulatory genome or explore our sandbox in Demo Mode.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Button variant="primary" size="xl" glow onClick={() => navigate('/signup')} iconRight={<LogIn size={18} />}>
                Create Free Account
              </Button>
              <Button variant="secondary" size="xl" onClick={goToDemo} icon={<Terminal size={18} />}>
                Try Demo Mode
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
