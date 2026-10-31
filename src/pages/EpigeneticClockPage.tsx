import { motion } from 'framer-motion';
import {
  Clock,
  TrendingDown,
  Activity,
  Brain,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  GlassCard, EvidenceBadge,
  ContentCardSkeleton, ChartSkeleton, StatCardSkeleton, TableSkeleton,
  ErrorState
} from '@/components/ui';
import { useRegulatoryProfile } from '@/hooks/useRegulatoryProfile';

/* =============================================
   ReguloMe — Epigenetic Clock  (GOD-MODE)
   ============================================= */

const ease = [0.22, 0.61, 0.36, 1] as [number, number, number, number];
const stagger = {
  container: { initial: {}, animate: { transition: { staggerChildren: 0.09 } } },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
  },
};

/* ─── Large Biological Age Gauge ─── */
function AgeGauge() {
  const { profile } = useRegulatoryProfile();
  const { chronologicalAge, biologicalAge, ageDelta, percentile } = profile.clock.subjectProfile;
  const size = 220;
  const sw = 10;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const progress = Math.min(biologicalAge / chronologicalAge, 1.15);
  const offset = circ - progress * circ;
  const half = size / 2;

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Outer glow */}
        <circle cx={half} cy={half} r={r + 8} fill="none" stroke="#0ae8d2" strokeWidth={1} strokeOpacity={0.05} />
        <circle cx={half} cy={half} r={r + 14} fill="none" stroke="#0ae8d2" strokeWidth={0.5} strokeOpacity={0.03} />
        {/* Track */}
        <circle cx={half} cy={half} r={r} fill="none" stroke="rgba(56,78,122,0.1)" strokeWidth={sw} />
        {/* Progress */}
        <motion.circle
          cx={half} cy={half} r={r} fill="none"
          stroke="url(#ageGaugeGrad)" strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease, delay: 0.3 }}
          style={{ filter: 'drop-shadow(0 0 12px rgba(10,232,210,0.3))' }}
        />
        {/* Tick marks */}
        {Array.from({ length: 60 }).map((_, i) => {
          const angle = (i / 60) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const x1 = half + (r + 18) * Math.cos(rad);
          const y1 = half + (r + 18) * Math.sin(rad);
          const x2 = half + (r + (i % 5 === 0 ? 24 : 21)) * Math.cos(rad);
          const y2 = half + (r + (i % 5 === 0 ? 24 : 21)) * Math.sin(rad);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(56,78,122,0.15)" strokeWidth={i % 5 === 0 ? 1.5 : 0.5}
            />
          );
        })}
        <defs>
          <linearGradient id="ageGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ae8d2" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#0ae8d2" stopOpacity={0.6} />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: size, height: size,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5, ease }}
          style={{ textAlign: 'center' }}
        >
          <p style={{ fontSize: 10, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Biological Age</p>
          <p style={{ fontSize: 48, fontWeight: 800, background: 'linear-gradient(135deg, #0ae8d2, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
            {biologicalAge}
          </p>
          <p style={{ fontSize: 13, color: '#8899b8', marginTop: 4 }}>
            vs <span style={{ fontWeight: 700, color: '#e8edf5' }}>{chronologicalAge}</span> chrono
          </p>
        </motion.div>
      </div>

      {/* Delta badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        style={{
          marginTop: 18,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', borderRadius: 12,
          background: ageDelta < 0 ? 'rgba(10,232,210,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${ageDelta < 0 ? 'rgba(10,232,210,0.2)' : 'rgba(239,68,68,0.2)'}`,
        }}
      >
        <TrendingDown size={16} color={ageDelta < 0 ? '#0ae8d2' : '#ef4444'} />
        <span style={{ fontSize: 15, fontWeight: 700, color: ageDelta < 0 ? '#0ae8d2' : '#ef4444' }}>
          {ageDelta > 0 ? '+' : ''}{ageDelta} years
        </span>
        <span style={{ fontSize: 12, color: '#6b7d9c', margin: '0 4px' }}>·</span>
        <span style={{ fontSize: 12, color: '#8899b8' }}>Top {100 - percentile}%</span>
      </motion.div>
    </div>
  );
}

/* ─── Trend Chart ─── */
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(5,8,16,0.92)', border: '1px solid rgba(56,78,122,0.4)',
        borderRadius: 12, padding: '12px 18px', backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)', minWidth: 160
      }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: '#e8edf5', marginBottom: 12, borderBottom: '1px solid rgba(56,78,122,0.3)', paddingBottom: 6 }}>
          Chronological Age: <span style={{ color: '#0ae8d2' }}>{label}</span>
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.stroke || entry.color, boxShadow: `0 0 8px ${entry.stroke || entry.color}` }} />
                <span style={{ fontSize: 11, color: '#8899b8', fontWeight: 600 }}>{entry.name}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#e8edf5', fontFamily: 'monospace' }}>
                {entry.value.toFixed(1)} yr
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

function AgeTrendChart() {
  const { profile } = useRegulatoryProfile();
  const ageTrendData = profile.clock.ageTrendData;
  return (
    <GlassCard padding="xl" hover={false} animate={false}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <Activity size={18} color="#0ae8d2" />
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5' }}>Age Trajectory</h3>
      </div>
      <p style={{ fontSize: 12, color: '#8899b8', marginBottom: 20 }}>Chronological vs biological age over time</p>

      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={ageTrendData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="bioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ae8d2" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0ae8d2" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="methylGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,78,122,0.12)" />
            <XAxis dataKey="age" tick={{ fill: '#6b7d9c', fontSize: 11 }} axisLine={{ stroke: 'rgba(56,78,122,0.15)' }} label={{ value: 'Chronological Age', position: 'insideBottom', offset: -2, fill: '#6b7d9c', fontSize: 10 }} />
            <YAxis tick={{ fill: '#6b7d9c', fontSize: 11 }} axisLine={{ stroke: 'rgba(56,78,122,0.15)' }} />
            <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(56,78,122,0.25)', strokeWidth: 1, strokeDasharray: '4 4' }} />
            {/* Reference line: chronological = biological */}
            <ReferenceLine segment={[{ x: 20, y: 20 }, { x: 34, y: 34 }]} stroke="rgba(56,78,122,0.25)" strokeDasharray="6 4" label={{ value: '1:1', fill: '#6b7d9c', fontSize: 10 }} />
            <Area type="monotone" dataKey="methylAge" name="Methylation Age" stroke="#8b5cf6" fill="url(#methylGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="bioAge" name="Biological Age" stroke="#0ae8d2" fill="url(#bioGrad)" strokeWidth={2.5} dot={{ r: 3, fill: '#0ae8d2', strokeWidth: 0 }} />
            <Area type="monotone" dataKey="regulatoryAge" name="Regulatory Age" stroke="#f59e0b" fill="none" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 24, marginTop: 16, justifyContent: 'center' }}>
        {[
          { color: '#0ae8d2', label: 'Biological Age', dash: false },
          { color: '#8b5cf6', label: 'Methylation Age', dash: false },
          { color: '#f59e0b', label: 'Regulatory Age', dash: true },
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 16, height: 2, background: l.color, borderRadius: 99, ...(l.dash ? { borderTop: `2px dashed ${l.color}`, background: 'transparent' } : {}) }} />
            <span style={{ fontSize: 10, color: '#8899b8', fontWeight: 600 }}>{l.label}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ─── Clock Models Panel ─── */
function ClockModelsPanel() {
  const { profile } = useRegulatoryProfile();
  const clockModels = profile.clock.clockModels;
  return (
    <GlassCard padding="xl" hover={false} animate={false}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <Clock size={18} color="#8b5cf6" />
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5' }}>Clock Models</h3>
      </div>
      <p style={{ fontSize: 12, color: '#8899b8', marginBottom: 20 }}>Predictions from 5 validated epigenetic clocks</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {clockModels.map((cm, i) => (
          <motion.div
            key={cm.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 18px', borderRadius: 14,
              background: 'rgba(17,24,39,0.45)',
              border: '1px solid rgba(56,78,122,0.12)',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${cm.color}30`)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(56,78,122,0.12)')}
          >
            {/* Color dot */}
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: cm.color, boxShadow: `0 0 8px ${cm.color}40`, flexShrink: 0 }} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5' }}>{cm.name}</span>
                <span style={{ fontSize: 10, color: '#6b7d9c' }}>{cm.author} ({cm.year})</span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <span style={{ fontSize: 10, color: '#6b7d9c' }}>{cm.cpgCount} CpGs</span>
                <span style={{ fontSize: 10, color: '#6b7d9c' }}>{cm.accuracy}</span>
              </div>
            </div>

            {/* Prediction */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: cm.color, lineHeight: 1 }}>
                {cm.id === 'dunedinpace' ? cm.prediction.toFixed(2) : cm.prediction.toFixed(1)}
              </p>
              <p style={{
                fontSize: 10, fontWeight: 700, marginTop: 2,
                color: cm.deviation < 0 ? '#0ae8d2' : cm.deviation > 0 ? '#ef4444' : '#6b7d9c',
              }}>
                {cm.deviation > 0 ? '+' : ''}{cm.id === 'dunedinpace' ? cm.deviation.toFixed(2) : cm.deviation.toFixed(1)}{cm.id === 'dunedinpace' ? ' pace' : ' yr'}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ─── Organ Age Cards ─── */
function OrganAgeGrid() {
  const { profile } = useRegulatoryProfile();
  const organAges = profile.clock.organAges;
  return (
    <motion.div variants={stagger.item}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <Brain size={16} color="#8b5cf6" />
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5' }}>Organ-Specific Age</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {organAges.map((o, i) => (
          <motion.div
            key={o.organ}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            style={{
              position: 'relative', overflow: 'hidden',
              padding: '24px 20px', borderRadius: 18,
              background: 'rgba(17,24,39,0.5)',
              border: '1px solid rgba(56,78,122,0.15)',
              backdropFilter: 'blur(12px)',
              cursor: 'default',
            }}
          >
            {/* Glow */}
            <div style={{
              position: 'absolute', top: -25, right: -25, width: 80, height: 80,
              borderRadius: '50%', background: `radial-gradient(circle, ${o.color}08 0%, transparent 70%)`,
              filter: 'blur(20px)',
            }} />

            <div style={{ position: 'relative' }}>
              <span style={{ fontSize: 28 }}>{o.icon}</span>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', marginTop: 10, marginBottom: 12 }}>{o.organ}</h4>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: o.color, lineHeight: 1 }}>{o.bioAge}</span>
                <span style={{ fontSize: 11, color: '#6b7d9c' }}>yr</span>
              </div>

              <span style={{
                fontSize: 11, fontWeight: 700,
                color: o.delta <= 0 ? '#0ae8d2' : '#ef4444',
              }}>
                {o.delta > 0 ? '+' : ''}{o.delta.toFixed(1)} yr
              </span>

              <p style={{ fontSize: 10, color: '#6b7d9c', lineHeight: 1.5, marginTop: 10 }}>{o.riskFactor}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Intervention Targets ─── */
function InterventionsPanel() {
  const { profile } = useRegulatoryProfile();
  const interventionTargets = profile.clock.interventionTargets;
  return (
    <GlassCard padding="xl" hover={false} animate={false}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <Sparkles size={18} color="#f59e0b" />
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5' }}>Rejuvenation Targets</h3>
      </div>
      <p style={{ fontSize: 12, color: '#8899b8', marginBottom: 22 }}>Methylation sites with highest longevity intervention potential</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {interventionTargets.map((t, i) => {
          const direction = t.optimalMethyl > t.currentMethyl ? '↑' : '↓';

          return (
            <motion.div
              key={t.gene}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + i * 0.06 }}
              style={{
                padding: '18px 20px', borderRadius: 16,
                background: 'rgba(17,24,39,0.45)',
                border: '1px solid rgba(56,78,122,0.12)',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(56,78,122,0.35)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(56,78,122,0.12)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#e8edf5' }}>{t.gene}</span>
                <span style={{ fontSize: 10, color: '#6b7d9c', fontWeight: 600 }}>· {t.pathway}</span>
                <div style={{ marginLeft: 'auto' }}>
                  <EvidenceBadge level={t.evidenceLevel} />
                </div>
              </div>

              {/* Methylation bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ flex: 1, position: 'relative', height: 8, borderRadius: 999, background: 'rgba(10,14,26,0.5)' }}>
                  {/* Optimal marker */}
                  <div style={{
                    position: 'absolute', top: -3, left: `${t.optimalMethyl}%`, width: 2, height: 14,
                    background: '#0ae8d2', borderRadius: 999, transform: 'translateX(-50%)',
                  }} />
                  {/* Current fill */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${t.currentMethyl}%` }}
                    transition={{ duration: 0.8, delay: 0.15 + i * 0.06 }}
                    style={{
                      height: '100%', borderRadius: 999,
                      background: t.impactScore >= 80
                        ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                        : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                    }}
                  />
                </div>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#8899b8', minWidth: 55 }}>
                  {t.currentMethyl}% {direction} {t.optimalMethyl}%
                </span>
                <span style={{
                  fontSize: 14, fontWeight: 800, fontFamily: 'monospace',
                  color: t.impactScore >= 80 ? '#f59e0b' : '#3b82f6', minWidth: 30,
                }}>
                  {t.impactScore}
                </span>
              </div>

              <p style={{ fontSize: 11, color: '#8899b8', lineHeight: 1.55 }}>{t.description}</p>
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
export default function EpigeneticClockPage() {
  const { profile, isLoading, error, refresh } = useRegulatoryProfile();
  const clockStats = profile.clock.stats;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, width: '100%' }}>
        <ContentCardSkeleton />
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
          <GlassCard padding="xl"><ChartSkeleton height="400px" /></GlassCard>
          <GlassCard padding="xl"><TableSkeleton rows={5} /></GlassCard>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
           {Array.from({length: 4}).map((_, i) => <StatCardSkeleton key={i} />)}
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
      {/* ── Hero ── */}
      <motion.div variants={stagger.item}>
        <div style={{
          position: 'relative', overflow: 'hidden',
          padding: '48px 44px',
          borderRadius: 28,
          background: 'linear-gradient(135deg, rgba(17,24,39,0.8), rgba(10,14,26,0.9))',
          border: '1px solid rgba(56,78,122,0.18)',
          backdropFilter: 'blur(24px)',
        }}>
          {/* Floating orbs */}
          <motion.div
            animate={{ y: [0, -12, 0], x: [0, 6, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: -40, right: 80, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,232,210,0.06) 0%, transparent 65%)', filter: 'blur(40px)' }}
          />
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            style={{ position: 'absolute', bottom: -30, left: 60, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 65%)', filter: 'blur(35px)' }}
          />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 48 }}>
            {/* Gauge */}
            <AgeGauge />

            {/* Right side */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, ease, delay: 0.15 }}
                  style={{
                    width: 56, height: 56, borderRadius: 18,
                    background: 'linear-gradient(135deg, rgba(10,232,210,0.2), rgba(139,92,246,0.15))',
                    border: '1px solid rgba(10,232,210,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(10,232,210,0.08)',
                  }}
                >
                  <Clock size={26} color="#0ae8d2" />
                </motion.div>
                <div>
                  <h1 style={{
                    fontSize: 38, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em',
                    background: 'linear-gradient(135deg, #e8edf5 30%, #8899b8 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    Epigenetic Clock
                  </h1>
                  <p style={{ fontSize: 15, color: '#8899b8', marginTop: 6 }}>
                    Biological age estimation from DNA methylation patterns
                  </p>
                </div>
              </div>

              {/* Mini stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 24 }}>
                {[
                  { label: 'Models Used', value: clockStats.modelsUsed, color: '#8b5cf6' },
                  { label: 'CpG Sites', value: clockStats.cpgTracked, color: '#0ae8d2' },
                  { label: 'Organs', value: clockStats.organsProfiled, color: '#f59e0b' },
                  { label: 'Targets', value: clockStats.interventions, color: '#ef4444' },
                ].map((s) => (
                  <div key={s.label} style={{
                    padding: '14px 10px', textAlign: 'center', borderRadius: 12,
                    background: 'rgba(10,14,26,0.45)', border: '1px solid rgba(56,78,122,0.12)',
                  }}>
                    <p style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
                    <p style={{ fontSize: 8, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Trend + Clock Models ── */}
      <motion.div variants={stagger.item} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
        <AgeTrendChart />
        <ClockModelsPanel />
      </motion.div>

      {/* ── Organ Ages ── */}
      <OrganAgeGrid />

      {/* ── Interventions ── */}
      <motion.div variants={stagger.item}>
        <InterventionsPanel />
      </motion.div>
    </motion.div>
  );
}
