import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse,
  Search,
  X,
  Shield,
  Zap,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Layers,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import {
  GlassCard,
  EvidenceBadge,
  Input,
  StatCardSkeleton,
  ChartSkeleton,
  ContentCardSkeleton,
  TableSkeleton,
  ErrorState,
} from '@/components/ui';
import { useRegulatoryProfile } from '@/hooks/useRegulatoryProfile';
import {
  type DiseaseDomain,
  type DiseaseVariantLink,
} from '@/data/diseaseHubData';

/* =============================================
   ReguloMe — Disease Hub  (GOD-MODE DESIGN)
   ============================================= */

const ease = [0.22, 0.61, 0.36, 1] as [number, number, number, number];

const stagger = {
  container: { initial: {}, animate: { transition: { staggerChildren: 0.09 } } },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
  },
};

const riskColors: Record<string, string> = {
  low: '#10b981', moderate: '#f59e0b', elevated: '#f97316', high: '#ef4444',
};

/* ──────────────────────────────────────────────
   ANIMATED BURDEN RING  (premium SVG gauge)
   ────────────────────────────────────────────── */
function BurdenRing({
  score, color, size = 96, strokeWidth = 7, delay = 0,
}: { score: number; color: string; size?: number; strokeWidth?: number; delay?: number }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const half = size / 2;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* ambient glow ring */}
        <circle cx={half} cy={half} r={r + 4} fill="none" stroke={color} strokeWidth={1} strokeOpacity={0.06} />
        {/* track */}
        <circle cx={half} cy={half} r={r} fill="none" stroke="rgba(56,78,122,0.12)" strokeWidth={strokeWidth} />
        {/* progress */}
        <motion.circle
          cx={half} cy={half} r={r} fill="none"
          stroke={`url(#grad-${color.replace('#', '')})`}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, delay, ease }}
          style={{ filter: `drop-shadow(0 0 8px ${color}50)` }}
        />
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`}>
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity={0.5} />
          </linearGradient>
        </defs>
      </svg>
      {/* centered score */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.5, duration: 0.4 }}
          style={{ fontSize: size * 0.26, fontWeight: 800, color: '#e8edf5', lineHeight: 1 }}
        >
          {score}
        </motion.span>
        <span style={{ fontSize: 8, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 2 }}>
          burden
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   HERO SECTION  (with floating orbs)
   ────────────────────────────────────────────── */
function HeroSection() {
  const { profile } = useRegulatoryProfile();
  const diseaseStats = profile.diseases.stats;
  return (
    <motion.div variants={stagger.item}>
      <div style={{
        position: 'relative', overflow: 'hidden',
        padding: '48px 44px',
        borderRadius: 28,
        background: 'linear-gradient(135deg, rgba(17,24,39,0.8), rgba(10,14,26,0.9))',
        border: '1px solid rgba(56,78,122,0.18)',
        backdropFilter: 'blur(24px)',
      }}>
        {/* floating orbs */}
        <motion.div
          animate={{ y: [0, -15, 0], x: [0, 8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -50, right: 60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 65%)', filter: 'blur(40px)' }}
        />
        <motion.div
          animate={{ y: [0, 12, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{ position: 'absolute', bottom: -30, left: 40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)', filter: 'blur(35px)' }}
        />
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{ position: 'absolute', top: 20, left: '40%', width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,232,210,0.05) 0%, transparent 65%)', filter: 'blur(30px)' }}
        />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.2 }}
            style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(139,92,246,0.15))',
              border: '1px solid rgba(239,68,68,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(239,68,68,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <HeartPulse size={28} color="#ef4444" />
          </motion.div>
          <div>
            <h1 style={{
              fontSize: 42, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #e8edf5 30%, #8899b8 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Disease Hub
            </h1>
            <p style={{ fontSize: 16, color: '#8899b8', marginTop: 8, lineHeight: 1.5, maxWidth: 520 }}>
              Explore disease–variant connections and regulatory burden across 6 clinical domains
            </p>
          </div>
        </div>

        {/* Inline stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginTop: 36, position: 'relative' }}>
          {[
            { label: 'Disease Domains', value: diseaseStats.totalDomains, icon: <HeartPulse size={14} />, color: '#ef4444' },
            { label: 'Risk Variants', value: diseaseStats.totalVariants, icon: <Zap size={14} />, color: '#0ae8d2' },
            { label: 'Linked Genes', value: diseaseStats.totalGenes, icon: <BarChart3 size={14} />, color: '#8b5cf6' },
            { label: 'Avg Burden', value: `${diseaseStats.avgBurden}%`, icon: <AlertTriangle size={14} />, color: '#f59e0b' },
            { label: 'Total Studies', value: diseaseStats.totalStudies.toLocaleString(), icon: <Layers size={14} />, color: '#3b82f6' },
            { label: 'Elevated Risk', value: diseaseStats.highRiskDomains, icon: <Shield size={14} />, color: '#f97316' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
              style={{
                padding: '18px 12px', textAlign: 'center', borderRadius: 14,
                background: 'rgba(10,14,26,0.5)', border: '1px solid rgba(56,78,122,0.15)',
              }}
            >
              <div style={{ color: s.color, opacity: 0.5, marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
              <p style={{ fontSize: 8, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   DOMAIN CARD  (spacious + clean)
   ────────────────────────────────────────────── */
function DomainCard({
  domain, index, isActive, onClick,
}: { domain: DiseaseDomain; index: number; isActive: boolean; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.09, duration: 0.55 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      style={{
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
        padding: '32px 28px',
        background: isActive ? `${domain.color}06` : 'rgba(17,24,39,0.45)',
        border: `1px solid ${isActive ? `${domain.color}35` : 'rgba(56,78,122,0.18)'}`,
        borderRadius: 22,
        backdropFilter: 'blur(16px)',
        transition: 'border-color 0.3s, background 0.3s',
      }}
    >
      {/* Top accent */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isActive ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: domain.accentGradient,
          transformOrigin: 'left',
        }}
      />

      {/* Glow */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 120, height: 120, borderRadius: '50%',
        background: `radial-gradient(circle, ${domain.color}${isActive ? '0d' : '04'} 0%, transparent 70%)`,
        filter: 'blur(25px)', transition: 'background 0.3s',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, position: 'relative' }}>
        {/* Left content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 30 }}>{domain.icon}</span>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5', letterSpacing: '-0.01em', marginBottom: 4 }}>{domain.name}</h3>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                background: `${riskColors[domain.riskLevel]}12`,
                border: `1px solid ${riskColors[domain.riskLevel]}25`,
                color: riskColors[domain.riskLevel],
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                {domain.riskLevel} risk
              </span>
            </div>
          </div>

          {/* Stats row — clean badges */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
            {[
              { n: domain.variantCount, l: 'variants' },
              { n: domain.geneCount, l: 'genes' },
              { n: domain.studyCount, l: 'studies' },
            ].map((s) => (
              <div key={s.l}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5', lineHeight: 1 }}>{s.n}</span>
                <span style={{ fontSize: 9, color: '#6b7d9c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginLeft: 4 }}>{s.l}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, color: '#8899b8', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: isActive ? 10 : 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden', transition: 'max-height 0.3s' }}>
            {domain.description}
          </p>
        </div>

        {/* Burden Ring */}
        <BurdenRing score={domain.burdenScore} color={domain.color} delay={0.15 + index * 0.08} />
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   RADAR PANEL  (refined)
   ────────────────────────────────────────────── */
function RadarPanel({ domain }: { domain: DiseaseDomain }) {
  return (
    <motion.div
      key={domain.id}
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -8 }}
      transition={{ duration: 0.4, ease }}
    >
      <GlassCard padding="xl" glow="teal" hover={false} animate={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
          <span style={{ fontSize: 26 }}>{domain.icon}</span>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#e8edf5', letterSpacing: '-0.01em' }}>{domain.name}</h3>
            <p style={{ fontSize: 12, color: '#6b7d9c' }}>Regulatory Profile</p>
          </div>
        </div>

        <div style={{ height: 300, marginTop: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={domain.categories} outerRadius="72%">
              <PolarGrid stroke="rgba(56,78,122,0.18)" strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: '#8899b8', fontSize: 11, fontWeight: 600 }} />
              <Radar dataKey="value" stroke={domain.color} fill={domain.color} fillOpacity={0.12} strokeWidth={2.5} dot={{ r: 3, fill: domain.color, strokeWidth: 0 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Key metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 4 }}>
          {[
            { label: 'Prevalence', value: domain.prevalence, color: domain.color },
            { label: 'Heritability', value: `${domain.heritability}%`, color: '#8b5cf6' },
            { label: 'Regulatory %', value: `${domain.regulatoryContribution}%`, color: '#0ae8d2' },
          ].map((m) => (
            <div key={m.label} style={{
              textAlign: 'center', padding: '16px 8px', borderRadius: 14,
              background: 'rgba(10,14,26,0.45)', border: '1px solid rgba(56,78,122,0.12)',
            }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: m.color, lineHeight: 1, marginBottom: 4 }}>{m.value}</p>
              <p style={{ fontSize: 8, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{m.label}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   RISK VARIANT TABLE  (premium rows)
   ────────────────────────────────────────────── */
function RiskVariantTable({ links }: { links: DiseaseVariantLink[] }) {
  const maxRR = 4;

  return (
    <GlassCard padding="xl" hover={false} animate={false}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <Zap size={18} color="#f59e0b" />
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5' }}>Key Risk Variants</h3>
      </div>
      <p style={{ fontSize: 13, color: '#8899b8', marginBottom: 22 }}>
        Odds ratios from validated population studies
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {links.slice(0, 8).map((link, i) => {
          const barW = Math.min((link.riskRatio / maxRR) * 100, 100);
          const barColor =
            link.riskRatio >= 2.5 ? 'linear-gradient(90deg,#ef4444,#f97316)' :
            link.riskRatio >= 1.5 ? 'linear-gradient(90deg,#f59e0b,#eab308)' :
                                    'linear-gradient(90deg,#0ae8d2,#06b6d4)';

          return (
            <motion.div
              key={`${link.disease}-${link.variant}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + i * 0.05, duration: 0.4 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 18px', borderRadius: 14,
                background: 'rgba(17,24,39,0.45)',
                border: '1px solid rgba(56,78,122,0.12)',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(56,78,122,0.35)';
                e.currentTarget.style.background = 'rgba(17,24,39,0.65)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(56,78,122,0.12)';
                e.currentTarget.style.background = 'rgba(17,24,39,0.45)';
              }}
            >
              {/* Domain pill */}
              <span style={{ fontSize: 11, fontWeight: 600, color: '#8899b8', minWidth: 80 }}>{link.disease}</span>

              {/* rsID */}
              <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#0ae8d2', minWidth: 80 }}>{link.variant}</span>

              {/* Gene */}
              <span style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', minWidth: 56 }}>{link.gene}</span>

              {/* Bar */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 7, borderRadius: 999, background: 'rgba(10,14,26,0.5)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barW}%` }}
                    transition={{ duration: 0.9, delay: 0.15 + i * 0.05, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: 999, background: barColor }}
                  />
                </div>
                <span style={{ fontSize: 15, fontWeight: 800, fontFamily: 'monospace', color: '#e8edf5', minWidth: 46, textAlign: 'right' }}>
                  {link.riskRatio.toFixed(2)}×
                </span>
              </div>

              {/* Evidence */}
              <EvidenceBadge level={link.evidenceLevel} />
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}

/* ──────────────────────────────────────────────
   CROSS-DOMAIN PATHWAYS  (premium connections)
   ────────────────────────────────────────────── */
/* ──────────────────────────────────────────────
   CROSS-DOMAIN PATHWAYS  (god-mode premium connections)
   ────────────────────────────────────────────── */
function PathwayConnectionsPanel() {
  const { profile } = useRegulatoryProfile();
  const diseaseDomains = profile.diseases.domains;
  const pathwayConnections = profile.diseases.pathwayConnections;
  return (
    <GlassCard padding="xl" hover={false} animate={false}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <TrendingUp size={18} color="#8b5cf6" />
        </motion.div>
        <div>
          <h3 style={{ fontSize: 24, fontWeight: 800, color: '#e8edf5', letterSpacing: '-0.02em' }}>Cross-Domain Pathways</h3>
          <p style={{ fontSize: 13, color: '#8899b8' }}>Shared regulatory pathways linking disease domains</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 32 }}>
        {[...pathwayConnections].sort((a, b) => b.strength - a.strength).map((conn, i) => {
          const from = diseaseDomains.find((d) => d.id === conn.from);
          const to = diseaseDomains.find((d) => d.id === conn.to);
          if (!from || !to) return null;

          return (
            <motion.div
              key={`${conn.from}-${conn.to}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              style={{
                position: 'relative', overflow: 'hidden',
                padding: '24px 28px', borderRadius: 20,
                background: 'rgba(17,24,39,0.45)',
                border: '1px solid rgba(56,78,122,0.15)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                backdropFilter: 'blur(12px)',
                display: 'flex', flexDirection: 'column', gap: 20,
              }}
            >
              {/* Background ambient glow */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0.08, background: `linear-gradient(135deg, ${from.color}, ${to.color})`, filter: 'blur(30px)' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
                {/* From domain */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${from.color}20`, border: `1px solid ${from.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: `0 0 15px ${from.color}30` }}>
                    {from.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 9, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Origin</p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#e8edf5' }}>{from.name}</p>
                  </div>
                </div>

                {/* SVG Animated Connector */}
                <div style={{ flex: 1, position: 'relative', height: 44, margin: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="100%" height="44" style={{ position: 'absolute', top: 0, left: 0 }}>
                    {/* Track line */}
                    <line x1="0" y1="22" x2="100%" y2="22" stroke="rgba(56,78,122,0.2)" strokeWidth="2" strokeDasharray="4 4" />
                    {/* Animated gradient beam */}
                    <motion.line
                      x1="0" y1="22" x2="100%" y2="22"
                      stroke={`url(#grad-beam-${i})`}
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: '0 200', strokeDashoffset: 0 }}
                      animate={{ strokeDasharray: '60 200', strokeDashoffset: -200 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                    <defs>
                      <linearGradient id={`grad-beam-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={from.color} stopOpacity="0" />
                        <stop offset="50%" stopColor={to.color} stopOpacity="1" />
                        <stop offset="100%" stopColor={to.color} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Central pathway badge */}
                  <div style={{
                    position: 'relative', background: 'rgba(10,14,26,0.9)', padding: '6px 14px',
                    borderRadius: 999, border: '1px solid rgba(56,78,122,0.4)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 2,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', boxShadow: '0 0 8px #8b5cf6' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#e8edf5', letterSpacing: '0.02em' }}>{conn.sharedPathway}</span>
                  </div>
                </div>

                {/* To domain */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'right' }}>
                  <div>
                    <p style={{ fontSize: 9, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Target</p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#e8edf5' }}>{to.name}</p>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${to.color}20`, border: `1px solid ${to.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: `0 0 15px ${to.color}30` }}>
                    {to.icon}
                  </div>
                </div>
              </div>

              {/* Stats Footer */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, zIndex: 1, borderTop: '1px solid rgba(56,78,122,0.15)', paddingTop: 16 }}>
                <div>
                  <p style={{ fontSize: 9, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Shared Genes</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5', fontFamily: 'monospace' }}>{conn.sharedGenes}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 9, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Crosstalk Strength</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <div style={{ width: 40, height: 4, borderRadius: 999, background: 'rgba(56,78,122,0.2)', overflow: 'hidden' }}>
                      <div style={{ width: `${(conn.strength / 100) * 100}%`, height: '100%', background: '#8b5cf6' }} />
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#c3cedf' }}>{conn.strength}%</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 9, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Joint Risk</p>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#ef4444' }}>Elevated</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}

/* ──────────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────────── */
export default function DiseaseHubPage() {
  const { profile, isLoading, error, refresh } = useRegulatoryProfile();
  const diseaseDomains = profile.diseases.domains;
  const diseaseVariantLinks = profile.diseases.variantLinks;
  const [selectedDomain, setSelectedDomain] = useState<string>('inflammatory');
  const [searchQuery, setSearchQuery] = useState('');

  const activeDomain = useMemo(
    () => diseaseDomains.find((d) => d.id === selectedDomain) || diseaseDomains[0],
    [diseaseDomains, selectedDomain]
  );

  const filteredLinks = useMemo(() => {
    let links = diseaseVariantLinks;
    if (selectedDomain) {
      const name = activeDomain.name;
      links = links.filter((l) => l.disease === name);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      links = links.filter((l) =>
        l.disease.toLowerCase().includes(q) || l.variant.toLowerCase().includes(q) ||
        l.gene.toLowerCase().includes(q) || l.mechanism.toLowerCase().includes(q)
      );
    }
    return links.length > 0 ? links : diseaseVariantLinks;
  }, [diseaseVariantLinks, selectedDomain, activeDomain, searchQuery]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, width: '100%' }}>
        <ContentCardSkeleton />
        <div className="grid gap-4 md:grid-cols-2">
           <ContentCardSkeleton /><ContentCardSkeleton />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 20 }}>
            <GlassCard padding="xl"><ChartSkeleton height="400px" /></GlassCard>
            <GlassCard padding="xl"><TableSkeleton rows={8} /></GlassCard>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px 0' }}>
        <ErrorState message={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      style={{ display: 'flex', flexDirection: 'column', gap: 40, width: '100%' }}
    >
      {/* Hero */}
      <HeroSection />

      {/* Domain Cards */}
      <motion.div variants={stagger.item}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <Shield size={14} color="#6b7d9c" />
          <p style={{ fontSize: 10, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            Disease Domains — Click to explore
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
          {diseaseDomains.map((d, i) => (
            <DomainCard key={d.id} domain={d} index={i} isActive={selectedDomain === d.id} onClick={() => setSelectedDomain(d.id)} />
          ))}
        </div>
      </motion.div>

      {/* Radar + Risk Variants */}
      <motion.div variants={stagger.item} style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 20 }}>
        <AnimatePresence mode="wait">
          <RadarPanel domain={activeDomain} />
        </AnimatePresence>
        <RiskVariantTable links={filteredLinks} />
      </motion.div>

      {/* Search */}
      <motion.div variants={stagger.item}>
        <Input
          placeholder="Search variants, genes, mechanisms across all domains..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search size={18} />}
          iconRight={searchQuery ? (
            <button onClick={() => setSearchQuery('')} className="text-rg-text-muted hover:text-rg-text-primary transition-colors cursor-pointer"><X size={14} /></button>
          ) : undefined}
        />
      </motion.div>

      {/* Cross-Domain Pathways */}
      <motion.div variants={stagger.item}>
        <PathwayConnectionsPanel />
      </motion.div>
    </motion.div>
  );
}
