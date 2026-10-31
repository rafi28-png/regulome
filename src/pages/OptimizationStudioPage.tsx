import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Moon,
  Utensils,
  Dumbbell,
  Brain,
  Pill,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ArrowRight,
  Activity,
  Shield,
  Flame,
  BarChart3,
  Sparkles,
  Plus,
  X,
  Cpu,
  BookOpen,
  Check,
  ThumbsDown,
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { GlassCard, Badge, StatCardSkeleton, ChartSkeleton, TableSkeleton, ErrorState } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import {
  protocols,
  interventions,
  pathwayStatuses,
  weeklyAdherence,
  optimizationStats,
  type Protocol,
  type Intervention,
  type PathwayStatus,
} from '@/data/optimizationData';

/* =============================================
   ReguloMe — Self-Optimization Studio
   ============================================= */

const stagger = {
  container: { initial: {}, animate: { transition: { staggerChildren: 0.07 } } },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
  },
};

// ── Category icons / colors ──────────────────────
const categoryMeta: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  sleep:           { icon: <Moon size={16} />,      color: '#8b5cf6', label: 'Sleep'           },
  nutrition:       { icon: <Utensils size={16} />,  color: '#10b981', label: 'Nutrition'       },
  exercise:        { icon: <Dumbbell size={16} />,  color: '#0ae8d2', label: 'Exercise'        },
  stress:          { icon: <Brain size={16} />,     color: '#f59e0b', label: 'Stress'          },
  supplementation: { icon: <Pill size={16} />,      color: '#3b82f6', label: 'Supplements'     },
  fasting:         { icon: <Clock size={16} />,     color: '#ec4899', label: 'Fasting'         },
};

const priorityStyles = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   label: 'Critical'  },
  high:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  label: 'High'      },
  medium:   { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)',  label: 'Medium'    },
  low:      { color: '#6b7d9c', bg: 'rgba(107,125,156,0.1)', border: 'rgba(107,125,156,0.25)', label: 'Low'       },
};

const pathwayStatusMeta = {
  optimal:           { color: '#10b981', icon: <CheckCircle2 size={14} />, label: 'Optimal'         },
  improving:         { color: '#0ae8d2', icon: <TrendingUp   size={14} />, label: 'Improving'       },
  'needs-attention': { color: '#f59e0b', icon: <AlertTriangle size={14} />,label: 'Needs attention' },
  critical:          { color: '#ef4444', icon: <XCircle      size={14} />, label: 'Critical'        },
};

const evidenceColors = { validated: '#10b981', literature: '#3b82f6', predicted: '#f59e0b' };

// ── Overall score ring ───────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#0ae8d2' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ position: 'relative', width: 132, height: 132 }}>
      <svg width="132" height="132" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="66" cy="66" r={r} fill="none" stroke="rgba(56,78,122,0.2)" strokeWidth="10" />
        <motion.circle
          cx="66" cy="66" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ae8d2" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 30, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 10, color: '#6b7d9c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>OPT. SCORE</span>
      </div>
    </div>
  );
}

// ── Adherence bar chart ──────────────────────────
function AdherenceChart() {
  const data = weeklyAdherence.map(d => ({
    day: d.day,
    Sleep: d.sleep,
    Nutrition: d.nutrition,
    Exercise: d.exercise,
    Stress: d.stress,
  }));

  return (
    <GlassCard padding="xl" hover={false} className="col-span-full lg:col-span-2">
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e8edf5', marginBottom: 4 }}>Weekly Adherence</h3>
        <p style={{ fontSize: 13, color: '#8899b8' }}>Protocol completion rate across domains this week</p>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,78,122,0.15)" />
            <XAxis dataKey="day" tick={{ fill: '#6b7d9c', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7d9c', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <RechartsTooltip contentStyle={{ background: '#151c2e', border: '1px solid rgba(56,78,122,0.3)', borderRadius: 8, fontSize: 12, color: '#e8edf5' }} />
            <Bar dataKey="Sleep"     fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Nutrition" fill="#10b981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Exercise"  fill="#0ae8d2" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Stress"    fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12 }}>
        {[['Sleep', '#8b5cf6'], ['Nutrition', '#10b981'], ['Exercise', '#0ae8d2'], ['Stress', '#f59e0b']].map(([label, color]) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8899b8' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: color as string, display: 'inline-block' }} />
            {label}
          </span>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Pathway radar chart (GOD-MODE) ───────────────
const CustomDot = (props: { cx?: number; cy?: number; payload?: { score: number } }) => {
  const { cx = 0, cy = 0, payload } = props;
  const score = payload?.score ?? 0;
  const color = score >= 80 ? '#10b981' : score >= 65 ? '#0ae8d2' : score >= 45 ? '#f59e0b' : '#ef4444';
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="rgba(5,8,16,0.8)" strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={9} fill={`${color}20`} stroke="none" />
    </g>
  );
};

function PathwayRadar() {
  const data = pathwayStatuses.map(p => ({
    pathway: p.name.split(' / ')[0],
    score: p.score,
  }));

  return (
    <GlassCard padding="xl" hover={false}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ae8d2', boxShadow: '0 0 10px #0ae8d2', display: 'inline-block' }} />
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e8edf5' }}>Pathway Balance</h3>
          </div>
          <p style={{ fontSize: 13, color: '#6b7d9c' }}>Optimization coverage across your 6 molecular pathways</p>
        </div>
        <div style={{ padding: '5px 12px', borderRadius: 999, background: 'rgba(10,232,210,0.08)', border: '1px solid rgba(10,232,210,0.2)', fontSize: 11, fontWeight: 700, color: '#0ae8d2', letterSpacing: '0.06em' }}>
          LIVE
        </div>
      </div>

      {/* Radar + mini-list side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Radar */}
        <div style={{ height: 420 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="85%">
              <defs>
                <linearGradient id="radarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ae8d2" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <PolarGrid stroke="rgba(56,78,122,0.2)" />
              <PolarAngleAxis
                dataKey="pathway"
                tick={{ fill: '#8899b8', fontSize: 11, fontWeight: 600 }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#0ae8d2"
                fill="url(#radarGrad)"
                strokeWidth={2.5}
                dot={<CustomDot />}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Pathway status list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
          {pathwayStatuses.map((p, idx) => {
            const meta = pathwayStatusMeta[p.status];
            const pct = (p.score / p.maxScore) * 100;
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.07 }}
                style={{
                  padding: '14px 16px', borderRadius: 12,
                  background: `${meta.color}06`, border: `1px solid ${meta.color}18`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#c3cedf' }}>
                    {p.name.split(' / ')[0]}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: meta.color,
                    background: `${meta.color}12`, padding: '2px 8px',
                    borderRadius: 999, border: `1px solid ${meta.color}25`,
                  }}>
                    {meta.label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 5, borderRadius: 999, background: 'rgba(10,14,26,0.5)', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.9, delay: 0.1 + idx * 0.07 }}
                      style={{ height: '100%', borderRadius: 999, background: meta.color, boxShadow: `0 0 8px ${meta.color}60` }}
                    />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 900, color: meta.color, fontFamily: 'monospace', width: 30, textAlign: 'right', flexShrink: 0 }}>
                    {p.score}
                  </span>
                </div>
                <p style={{ fontSize: 10, color: '#4b5a73', marginTop: 5 }}>
                  {p.variants} variant{p.variants !== 1 ? 's' : ''} · {p.modulators[0]}{p.modulators.length > 1 ? ` +${p.modulators.length - 1} more` : ''}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}


// ── Protocol card ────────────────────────────────
function ProtocolCard({ protocol, index }: { protocol: Protocol; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const meta = categoryMeta[protocol.category];
  const adherenceColor = protocol.adherence >= 85 ? '#10b981' : protocol.adherence >= 65 ? '#0ae8d2' : protocol.adherence >= 45 ? '#f59e0b' : '#ef4444';

  const statusBadge = {
    active:      { color: '#10b981', label: 'Active'      },
    paused:      { color: '#f59e0b', label: 'Paused'      },
    completed:   { color: '#0ae8d2', label: 'Completed'   },
    recommended: { color: '#8b5cf6', label: 'Recommended' },
  }[protocol.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <GlassCard padding="none" hover={false} animate={false} className="overflow-hidden transition-all duration-300">
        {/* Main row */}
        <div
          className="flex items-center gap-4 p-4 cursor-pointer hover:bg-rg-bg-hover/30 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          {/* Category icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30`, color: meta.color }}
          >
            {meta.icon}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-rg-text-primary">{protocol.name}</span>
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                style={{ color: statusBadge.color, background: `${statusBadge.color}15` }}
              >
                {statusBadge.label}
              </span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded"
                style={{ color: meta.color, background: `${meta.color}10` }}
              >
                {meta.label}
              </span>
            </div>
            <p className="text-xs text-rg-text-muted mt-0.5 truncate max-w-lg">{protocol.biomarkerEffect}</p>
          </div>

          {/* Adherence bar */}
          <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
            <span style={{ fontSize: 13, fontWeight: 700, color: adherenceColor, fontFamily: 'monospace' }}>
              {protocol.adherence}%
            </span>
            <div style={{ width: 80, height: 5, borderRadius: 999, background: 'rgba(10,14,26,0.5)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${protocol.adherence}%` }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.05 }}
                style={{ height: '100%', borderRadius: 999, background: adherenceColor }}
              />
            </div>
          </div>

          {/* Impact badge */}
          <div className="hidden md:flex items-center shrink-0">
            <Badge
              variant={protocol.impact === 'high' ? 'success' : protocol.impact === 'medium' ? 'info' : 'default'}
              size="sm"
            >
              {protocol.impact === 'high' ? <Flame size={10} /> : <Activity size={10} />}
              {protocol.impact} impact
            </Badge>
          </div>

          {/* Expand arrow */}
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-rg-text-muted shrink-0">
            <ChevronDown size={16} />
          </motion.div>
        </div>

        {/* Expanded detail */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div style={{ borderTop: '1px solid rgba(56,78,122,0.2)', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20, background: 'rgba(10,14,26,0.4)' }}>
                <p style={{ fontSize: 14, color: '#c4cfdf', lineHeight: 1.7 }}>{protocol.description}</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    { label: 'Started', value: protocol.startedAt },
                    { label: 'Effect', value: protocol.biomarkerEffect },
                    { label: 'Impact', value: `${protocol.impact.toUpperCase()} IMPACT` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: 'rgba(30,42,66,0.5)', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(56,78,122,0.2)' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#e8edf5', fontFamily: label === 'Started' ? 'monospace' : 'inherit' }}>{value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Linked Pathways</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {protocol.linkedPathways.map(p => (
                      <span key={p} style={{ padding: '5px 12px', borderRadius: 999, background: `${meta.color}10`, border: `1px solid ${meta.color}25`, fontSize: 12, color: meta.color, fontWeight: 500 }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}

// ── Intervention card (Smart Recommendations) ───
function InterventionCard({
  item, index, accepted, dismissed, onAccept, onDismiss,
}: {
  item: Intervention;
  index: number;
  accepted: boolean;
  dismissed: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const p = priorityStyles[item.priority];
  const cat = categoryMeta[item.category] ?? categoryMeta.exercise;

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: accepted ? 0.6 : 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      layout
    >
      <GlassCard padding="none" hover={false} animate={false} className="overflow-hidden">
        {/* Top accent bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${p.color}, ${p.color}40)` }} />

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  padding: '3px 8px', borderRadius: 999,
                  color: p.color, background: p.bg, border: `1px solid ${p.border}`,
                }}>
                  {p.label} Priority
                </span>
                <span style={{ fontSize: 10, color: '#6b7d9c', fontFamily: 'monospace', background: 'rgba(56,78,122,0.15)', padding: '2px 8px', borderRadius: 4 }}>
                  {item.gene} · {item.linkedVariant}
                </span>
              </div>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#e8edf5', lineHeight: 1.3 }}>{item.title}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30`, color: cat.color }}>
              {cat.icon}
            </div>
          </div>

          {/* AI Analysis box */}
          <div style={{
            padding: '14px 16px', borderRadius: 10,
            background: 'rgba(10,232,210,0.04)', border: '1px solid rgba(10,232,210,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
              <Cpu size={12} color="#0ae8d2" />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#0ae8d2', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Analysis — Why this is recommended</span>
            </div>
            <p style={{ fontSize: 12, color: '#c3cedf', lineHeight: 1.65 }}>{item.reasoning}</p>
          </div>

          {/* Metrics row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(30,42,66,0.5)', border: '1px solid rgba(56,78,122,0.2)', textAlign: 'center' }}>
              <p style={{ fontSize: 9, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Est. Timeframe</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#e8edf5' }}>{item.timeframe}</p>
            </div>
            <div style={{ padding: '10px 12px', borderRadius: 8, background: `${cat.color}08`, border: `1px solid ${cat.color}20`, textAlign: 'center' }}>
              <p style={{ fontSize: 9, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Expected Gain</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: cat.color }}>{item.expectedGain}</p>
            </div>
            <div style={{ padding: '10px 12px', borderRadius: 8, background: `${evidenceColors[item.evidenceLevel]}08`, border: `1px solid ${evidenceColors[item.evidenceLevel]}20`, textAlign: 'center' }}>
              <p style={{ fontSize: 9, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Evidence Type</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: evidenceColors[item.evidenceLevel] }}>
                {item.evidenceLevel === 'validated' ? 'Clinical' : item.evidenceLevel === 'literature' ? 'Literature' : 'Predicted'}
              </p>
            </div>
          </div>

          {/* Source */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOpen size={11} color="#6b7d9c" />
            <span style={{ fontSize: 11, color: '#6b7d9c' }}>Pathway: <span style={{ color: '#8899b8', fontWeight: 600 }}>{item.pathway}</span></span>
          </div>

          {/* Action buttons */}
          {!accepted ? (
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                onClick={() => { onAccept(); }}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '10px 16px', borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(10,232,210,0.18), rgba(139,92,246,0.12))',
                  border: '1px solid rgba(10,232,210,0.35)',
                  color: '#0ae8d2', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(10,232,210,0.28), rgba(139,92,246,0.18))')}
                onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(10,232,210,0.18), rgba(139,92,246,0.12))')}
              >
                <Check size={14} /> Accept &amp; Add Protocol
              </button>
              <button
                onClick={onDismiss}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#6b7d9c', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#6b7d9c'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
              >
                <ThumbsDown size={13} /> Dismiss
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <CheckCircle2 size={14} color="#10b981" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>Protocol added to your Active Protocols</span>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ── Pathway status panel ─────────────────────────
function PathwayPanel({ item, index }: { item: PathwayStatus; index: number }) {
  const meta = pathwayStatusMeta[item.status];
  const pct = (item.score / item.maxScore) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        padding: '16px 18px',
        borderRadius: 12,
        border: `1px solid ${meta.color}25`,
        background: `${meta.color}06`,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5', marginBottom: 2 }}>{item.name}</p>
          <p style={{ fontSize: 11, color: '#6b7d9c' }}>{item.variants} linked variants</p>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: meta.color, flexShrink: 0 }}>
          {meta.icon} {meta.label}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'rgba(10,14,26,0.5)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, delay: 0.2 + index * 0.05 }}
            style={{ height: '100%', borderRadius: 999, background: meta.color }}
          />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: meta.color, flexShrink: 0 }}>
          {item.score}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {item.modulators.map(m => (
          <span
            key={m}
            style={{
              fontSize: 10, padding: '3px 8px', borderRadius: 999,
              background: 'rgba(30,42,66,0.5)', border: '1px solid rgba(56,78,122,0.2)',
              color: '#8899b8', fontWeight: 500,
            }}
          >
            {m}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main page ────────────────────────────────────
type TabId = 'protocols' | 'recommendations' | 'pathways';

export default function OptimizationStudioPage() {
  // ─ recommendations state lifted here so tab count is reactive ─
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const activeRecommendationCount = interventions.length - dismissedIds.size - acceptedIds.size;

  const { isLoading, error, refetch } = useApi('/optimization');
  const [activeTab, setActiveTab] = useState<TabId>('protocols');
  const [showAddModal, setShowAddModal] = useState(false);
  const [protocolName, setProtocolName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('sleep');
  const [savedMsg, setSavedMsg] = useState(false);
  const s = optimizationStats;

  const openAdd = (name = '', category = 'sleep') => {
    setProtocolName(name);
    setSelectedCategory(category);
    setShowAddModal(true);
  };

  const handleSaveProtocol = () => {
    setSavedMsg(true);
    setTimeout(() => { setSavedMsg(false); setShowAddModal(false); }, 1600);
  };

  const handleAccept = (id: string, title: string, category: string) => {
    setAcceptedIds(prev => new Set(prev).add(id));
    openAdd(title, category);
  };

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id));
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <GlassCard padding="xl"><ChartSkeleton height="260px" /></GlassCard>
          <GlassCard padding="xl"><ChartSkeleton height="260px" /></GlassCard>
        </div>
        <GlassCard padding="xl"><TableSkeleton rows={6} /></GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px 0' }}>
        <ErrorState message={error.message} onRetry={refetch} />
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'protocols',      label: 'Active Protocols',      icon: <Target size={14} />,    count: s.protocolsActive },
    { id: 'recommendations',label: 'Smart Recommendations', icon: <Sparkles size={14} />,  count: activeRecommendationCount > 0 ? activeRecommendationCount : undefined },
    { id: 'pathways',       label: 'Pathway Heatmap',       icon: <BarChart3 size={14} />              },
  ];

  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      style={{ display: 'flex', flexDirection: 'column', gap: 56, width: '100%' }}
    >
      {/* ── Header ── */}
      <motion.div variants={stagger.item} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
        <div>
          <div className="flex items-center" style={{ gap: 16, marginBottom: 20 }}>
            <div
              className="flex items-center justify-center"
              style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, rgba(0,204,184,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(0,204,184,0.2)' }}
            >
              <Target size={24} className="text-rg-teal-400" />
            </div>
            <h1 className="font-bold gradient-text" style={{ fontSize: 38 }}>Self-Optimization Studio</h1>
          </div>
          <p style={{ fontSize: 16, color: '#8899b8', lineHeight: 1.5, maxWidth: 640 }}>
            Personalized lifestyle protocols mapped to your regulatory variants and molecular pathways.
          </p>
        </div>

        {/* Score ring + Add Protocol button */}
        <div className="hidden lg:flex flex-col items-center gap-3 shrink-0">
          <ScoreRing score={s.overallScore} />
          <p style={{ fontSize: 11, color: '#6b7d9c', textAlign: 'center' }}>
            {s.weeklyStreak}d streak · {s.averageAdherence}% avg adherence
          </p>
          <button
            onClick={() => openAdd()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '9px 18px', borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(0,204,184,0.2), rgba(139,92,246,0.15))',
              border: '1px solid rgba(0,204,184,0.35)',
              color: '#0ae8d2', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 0 20px rgba(0,204,184,0.08)',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 28px rgba(0,204,184,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 20px rgba(0,204,184,0.08)')}
          >
            <Plus size={15} /> Add Protocol
          </button>
        </div>
      </motion.div>

      {/* ── Stats row ── */}
      <motion.div variants={stagger.item} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        {[
          { label: 'Opt. Score',        value: s.overallScore,          color: '#0ae8d2', icon: <Target size={18} />    },
          { label: 'Active Protocols',  value: s.protocolsActive,       color: '#10b981', icon: <Shield size={18} />    },
          { label: 'Avg Adherence',     value: `${s.averageAdherence}%`,color: '#8b5cf6', icon: <Activity size={18} />  },
          { label: 'Pathways Improving',value: s.pathwaysImproving,     color: '#f59e0b', icon: <TrendingUp size={18} />},
          { label: 'Day Streak',        value: s.weeklyStreak,          color: '#ec4899', icon: <Flame size={18} />     },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              padding: '20px 16px', textAlign: 'center',
              background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(56,78,122,0.25)',
              borderRadius: 14, backdropFilter: 'blur(12px)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, color: stat.color, opacity: 0.7 }}>
              {stat.icon}
            </div>
            <p style={{ fontSize: 11, color: '#6b7d9c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{stat.label}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Charts row ── */}
      <motion.div variants={stagger.item} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <AdherenceChart />
        <PathwayRadar />
      </motion.div>

      {/* ── Tabs ── */}
      <motion.div variants={stagger.item}>
        {/* Tab bar */}
        <div
          style={{
            display: 'flex', gap: 4, padding: '4px',
            background: 'rgba(17,24,39,0.6)', borderRadius: 12,
            border: '1px solid rgba(56,78,122,0.2)', marginBottom: 28,
            width: 'fit-content',
          }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTab === tab.id ? 'rgba(0,204,184,0.12)' : 'transparent',
                color: activeTab === tab.id ? '#0ae8d2' : '#8899b8',
                border: activeTab === tab.id ? '1px solid rgba(0,204,184,0.25)' : '1px solid transparent',
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  style={{
                    fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999,
                    background: activeTab === tab.id ? 'rgba(0,204,184,0.2)' : 'rgba(107,125,156,0.2)',
                    color: activeTab === tab.id ? '#0ae8d2' : '#6b7d9c',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'protocols' && (
            <motion.div
              key="protocols"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              {protocols.map((p, i) => <ProtocolCard key={p.id} protocol={p} index={i} />)}
            </motion.div>
          )}

          {activeTab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              {/* Explanation banner */}
              <div style={{
                padding: '16px 20px', borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(10,232,210,0.06))',
                border: '1px solid rgba(139,92,246,0.2)',
                display: 'flex', alignItems: 'flex-start', gap: 14,
              }}>
                <div style={{ padding: 8, borderRadius: 8, background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', flexShrink: 0 }}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', marginBottom: 4 }}>How Smart Recommendations work</p>
                  <p style={{ fontSize: 12, color: '#8899b8', lineHeight: 1.65 }}>
                    ReguloMe cross-references your regulatory variant profile (rsIDs) against molecular pathway databases and published literature to surface targeted interventions for <em>your unique genetic makeup</em>.
                    Recommendations are generated locally from your variant data — no external request is made.
                    Click <strong style={{ color: '#0ae8d2' }}>Accept &amp; Add Protocol</strong> to activate it or <strong style={{ color: '#ef4444' }}>Dismiss</strong> to remove it from your list.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {interventions.map((item, i) => (
                  <InterventionCard
                    key={item.id}
                    item={item}
                    index={i}
                    accepted={acceptedIds.has(item.id)}
                    dismissed={dismissedIds.has(item.id)}
                    onAccept={() => handleAccept(item.id, item.title, item.category)}
                    onDismiss={() => handleDismiss(item.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'pathways' && (
            <motion.div
              key="pathways"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}
            >
              {pathwayStatuses.map((item, i) => <PathwayPanel key={item.name} item={item} index={i} />)}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Add Protocol Modal ── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(5,8,16,0.8)', backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: 520, borderRadius: 20,
                background: 'rgba(13,18,30,0.98)', border: '1px solid rgba(0,204,184,0.2)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,204,184,0.05)',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: 3, background: 'linear-gradient(90deg, #0ae8d2, #8b5cf6)' }} />
              <div style={{ padding: '28px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ padding: 10, borderRadius: 10, background: 'rgba(0,204,184,0.12)', color: '#0ae8d2' }}>
                      <Plus size={18} />
                    </div>
                    <div>
                      <p style={{ fontSize: 17, fontWeight: 800, color: '#e8edf5' }}>Add New Protocol</p>
                      <p style={{ fontSize: 12, color: '#6b7d9c', marginTop: 1 }}>Track a new optimization intervention</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAddModal(false)} style={{ padding: 6, borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#6b7d9c', cursor: 'pointer' }}>
                    <X size={14} />
                  </button>
                </div>

                {savedMsg ? (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>Protocol Saved!</p>
                    <p style={{ fontSize: 13, color: '#6b7d9c', marginTop: 6 }}>It will appear in your Active Protocols</p>
                  </motion.div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Protocol name */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Protocol Name</label>
                      <input
                        value={protocolName}
                        onChange={e => setProtocolName(e.target.value)}
                        placeholder="e.g. Cold exposure 3x/week"
                        style={{
                          width: '100%', padding: '12px 14px', borderRadius: 10,
                          background: 'rgba(30,42,66,0.5)', border: '1px solid rgba(56,78,122,0.35)',
                          color: '#e8edf5', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                        }}
                        onFocus={e => (e.target.style.borderColor = 'rgba(0,204,184,0.5)')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(56,78,122,0.35)')}
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>Category</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {Object.entries(categoryMeta).map(([key, meta]) => (
                          <button
                            key={key}
                            onClick={() => setSelectedCategory(key)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                              background: selectedCategory === key ? `${meta.color}18` : 'rgba(30,42,66,0.5)',
                              border: `1px solid ${selectedCategory === key ? `${meta.color}40` : 'rgba(56,78,122,0.25)'}`,
                              color: selectedCategory === key ? meta.color : '#6b7d9c',
                              transition: 'all 0.15s',
                            }}
                          >
                            {meta.icon} {meta.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timeframe */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>Starting</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {['Today', 'This week', 'Next month'].map(opt => (
                          <div key={opt} style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(56,78,122,0.25)', background: 'rgba(30,42,66,0.4)', textAlign: 'center', fontSize: 12, color: '#8899b8', cursor: 'pointer' }}>
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Save button */}
                    <button
                      onClick={handleSaveProtocol}
                      disabled={!protocolName.trim()}
                      style={{
                        width: '100%', padding: '13px', borderRadius: 12,
                        background: protocolName.trim()
                          ? 'linear-gradient(135deg, rgba(0,204,184,0.25), rgba(139,92,246,0.2))'
                          : 'rgba(56,78,122,0.15)',
                        border: `1px solid ${protocolName.trim() ? 'rgba(0,204,184,0.4)' : 'rgba(56,78,122,0.2)'}`,
                        color: protocolName.trim() ? '#0ae8d2' : '#4b5a73',
                        fontSize: 14, fontWeight: 700, cursor: protocolName.trim() ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                      }}
                    >
                      Save Protocol
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
