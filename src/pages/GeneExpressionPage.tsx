import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Search,
  X,
  Flame,
  BarChart3,
  TrendingUp,
  ChevronRight,
  Layers,
  Dna,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  GlassCard,
  Input,
  StatCardSkeleton,
  ChartSkeleton,
  TableSkeleton,
  ErrorState,
} from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import {
  tissues,
  geneSummaries,
  tissueSummaries,
  expressionMatrix,
  expressionStats,
  getGeneExpression,
  type GeneSummary,
} from '@/data/geneExpressionData';

/* =============================================
   ReguloMe — Gene Expression  (GOD-MODE)
   ============================================= */

const ease = [0.22, 0.61, 0.36, 1] as [number, number, number, number];

const stagger = {
  container: {
    initial: {},
    animate: { transition: { staggerChildren: 0.09 } },
  },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
  },
};

// ── Heatmap cell color ──
function heatmapColor(value: number): string {
  if (value >= 80) return 'rgba(239,68,68,0.85)';   // strong red
  if (value >= 60) return 'rgba(245,158,11,0.75)';   // amber
  if (value >= 40) return 'rgba(10,232,210,0.6)';    // teal
  if (value >= 20) return 'rgba(59,130,246,0.45)';   // blue
  return 'rgba(56,78,122,0.2)';                       // dim
}

function deviationColor(dev: number): string {
  if (dev >= 30) return '#ef4444';
  if (dev >= 15) return '#f59e0b';
  if (dev >= 0) return '#0ae8d2';
  if (dev >= -15) return '#3b82f6';
  return '#6b7d9c';
}

const categoryColors: Record<string, string> = {
  oncogene: '#ef4444',
  tumor_suppressor: '#f59e0b',
  metabolism: '#0ae8d2',
  immune: '#10b981',
  neural: '#8b5cf6',
  structural: '#3b82f6',
};

const categoryLabels: Record<string, string> = {
  oncogene: 'Oncogene',
  tumor_suppressor: 'Tumor Suppressor',
  metabolism: 'Metabolism',
  immune: 'Immune',
  neural: 'Neural',
  structural: 'Structural',
};

// ── Sort config ──
type SortField = 'gene' | 'avgExpression' | 'maxDeviation' | 'hotspotCount';
type SortDir = 'asc' | 'desc';

function SortButton({
  label,
  field,
  sortField,
  sortDir,
  onSort,
}: {
  label: string;
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
}) {
  const active = sortField === field;

  return (
    <button
      onClick={() => onSort(field)}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
        color: active ? '#0ae8d2' : '#6b7d9c',
        transition: 'color 0.15s',
      }}
    >
      {label}
      {active ? (sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : <ArrowUpDown size={8} style={{ opacity: 0.4 }} />}
    </button>
  );
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────── */

// ── God-Mode Hero Section ──
function HeroSection() {
  const stats = [
    { label: 'Genes Tracked', value: expressionStats.totalGenes, color: '#e8edf5', icon: <Dna size={14} /> },
    { label: 'Tissues', value: expressionStats.totalTissues, color: '#8b5cf6', icon: <Layers size={14} /> },
    { label: 'Hotspots', value: expressionStats.totalHotspots, color: '#ef4444', icon: <Flame size={14} /> },
    { label: 'Avg |Deviation|', value: `${expressionStats.avgDeviation}%`, color: '#f59e0b', icon: <TrendingUp size={14} /> },
    { label: 'Top Dysregulated', value: expressionStats.topDysregulatedGene, color: '#0ae8d2', icon: <BarChart3 size={14} /> },
  ];

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      padding: '48px 44px', borderRadius: 28,
      background: 'linear-gradient(135deg, rgba(17,24,39,0.8), rgba(10,14,26,0.9))',
      border: '1px solid rgba(56,78,122,0.18)',
      backdropFilter: 'blur(24px)',
    }}>
      {/* Floating orbs */}
      <motion.div
        animate={{ y: [0, -14, 0], x: [0, 8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: -50, right: 80, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)', filter: 'blur(40px)' }}
      />
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{ position: 'absolute', bottom: -30, left: 60, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,232,210,0.06) 0%, transparent 65%)', filter: 'blur(35px)' }}
      />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36 }}>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.15 }}
          style={{
            width: 60, height: 60, borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(10,232,210,0.2), rgba(139,92,246,0.15))',
            border: '1px solid rgba(10,232,210,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(10,232,210,0.08)',
          }}
        >
          <Activity size={28} color="#0ae8d2" />
        </motion.div>
        <div>
          <h1 style={{
            fontSize: 42, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #e8edf5 30%, #8899b8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Gene Expression
          </h1>
          <p style={{ fontSize: 15, color: '#8899b8', marginTop: 8, maxWidth: 520 }}>
            Explore tissue-specific expression landscapes and identify regulatory hotspot clusters
          </p>
        </div>
      </div>

      {/* Inline stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, position: 'relative' }}>
        {stats.map((s, i) => (
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
  );
}

// ── Heatmap Grid ──
function ExpressionHeatmap({
  genes,
  selectedGene,
  onSelectGene,
}: {
  genes: GeneSummary[];
  selectedGene: string | null;
  onSelectGene: (gene: string) => void;
}) {
  return (
    <GlassCard padding="xl" hover={false} animate={false}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <BarChart3 size={18} color="#0ae8d2" />
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e8edf5' }}>Expression Heatmap</h3>
      </div>
      <p style={{ fontSize: 13, color: '#8899b8', marginBottom: 24 }}>
        Click a gene row to explore its expression profile across tissues
      </p>

      <div className="overflow-x-auto" style={{ marginRight: -8 }}>
        <div style={{ minWidth: 820 }}>
          {/* Tissue header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '100px repeat(10, 1fr)',
            gap: 3,
            marginBottom: 6,
            paddingRight: 8,
          }}>
            <span />
            {tissues.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 9, fontWeight: 700, color: '#6b7d9c',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  textAlign: 'center', padding: '6px 2px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Gene rows */}
          {genes.map((gene, gi) => {
            const isSelected = selectedGene === gene.gene;
            const entries = expressionMatrix.filter((e) => e.gene === gene.gene);

            return (
              <motion.div
                key={gene.gene}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.03 }}
                onClick={() => onSelectGene(gene.gene)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px repeat(10, 1fr)',
                  gap: 3,
                  padding: '2px 8px 2px 0',
                  marginBottom: 3,
                  cursor: 'pointer',
                  borderRadius: 8,
                  background: isSelected ? 'rgba(10,232,210,0.06)' : 'transparent',
                  border: isSelected ? '1px solid rgba(10,232,210,0.2)' : '1px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {/* Gene label */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 4px', minWidth: 0,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: categoryColors[gene.category] || '#6b7d9c',
                  }} />
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: isSelected ? '#0ae8d2' : '#e8edf5',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    transition: 'color 0.15s',
                  }}>
                    {gene.gene}
                  </span>
                </div>

                {/* Heatmap cells */}
                {tissues.map((t) => {
                  const entry = entries.find((e) => e.tissue === t);
                  const val = entry?.expressionLevel || 0;
                  const isHot = entry?.isHotspot || false;

                  return (
                    <div
                      key={t}
                      title={`${gene.gene} in ${t}: ${val} (${entry?.foldChange}×)`}
                      style={{
                        position: 'relative',
                        background: heatmapColor(val),
                        borderRadius: 4,
                        height: 36,
                        overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'transform 0.1s, box-shadow 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.08)';
                        e.currentTarget.style.boxShadow = '0 0 12px rgba(10,232,210,0.3)';
                        e.currentTarget.style.zIndex = '10';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.zIndex = '1';
                      }}
                    >
                      <span style={{
                        fontSize: 10, fontWeight: 700, fontFamily: 'monospace',
                        color: val >= 60 ? '#fff' : val >= 30 ? '#e8edf5' : '#8899b8',
                      }}>
                        {val}
                      </span>
                      {isHot && (
                        <div style={{
                          position: 'absolute', top: 2, right: 2,
                          width: 6, height: 6, borderRadius: '50%',
                          background: '#ef4444',
                          boxShadow: '0 0 6px rgba(239,68,68,0.6)',
                        }} />
                      )}
                    </div>
                  );
                })}
              </motion.div>
            );
          })}

          {/* Color legend */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            marginTop: 20, paddingTop: 16,
            borderTop: '1px solid rgba(56,78,122,0.15)',
          }}>
            <span style={{ fontSize: 10, color: '#6b7d9c', fontWeight: 600 }}>Expression:</span>
            {[
              { label: 'Low (0-19)', color: 'rgba(56,78,122,0.2)' },
              { label: '20-39', color: 'rgba(59,130,246,0.45)' },
              { label: '40-59', color: 'rgba(10,232,210,0.6)' },
              { label: '60-79', color: 'rgba(245,158,11,0.75)' },
              { label: 'High (80+)', color: 'rgba(239,68,68,0.85)' },
            ].map((l) => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 16, height: 10, borderRadius: 2, background: l.color }} />
                <span style={{ fontSize: 10, color: '#6b7d9c' }}>{l.label}</span>
              </div>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 4px rgba(239,68,68,0.5)' }} />
              <span style={{ fontSize: 10, color: '#6b7d9c' }}>Hotspot</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ── Gene Detail Panel ──
function GeneDetailPanel({ gene }: { gene: string }) {
  const info = geneSummaries.find((g) => g.gene === gene);
  const entries = getGeneExpression(gene).sort((a, b) => b.expressionLevel - a.expressionLevel);

  if (!info) return null;

  const chartData = entries.map((e) => ({
    tissue: e.tissue,
    expression: e.expressionLevel,
    deviation: e.deviation,
    fold: e.foldChange,
    isHotspot: e.isHotspot,
  }));

  return (
    <motion.div
      key={gene}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
    >
      <GlassCard padding="xl" glow="teal" hover={false} animate={false}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Dna size={18} color="#0ae8d2" />
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#e8edf5' }}>{info.gene}</h3>
              <span style={{
                fontSize: 10, padding: '3px 10px', borderRadius: 6,
                background: `${categoryColors[info.category]}15`,
                border: `1px solid ${categoryColors[info.category]}30`,
                color: categoryColors[info.category],
                fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {categoryLabels[info.category]}
              </span>
            </div>
            <p style={{ fontSize: 14, color: '#8899b8' }}>
              {info.fullName} · <span style={{ fontFamily: 'monospace', color: '#6b7d9c' }}>{info.chromosome}</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'Avg Expression', value: info.avgExpression, color: '#0ae8d2' },
              { label: 'Max Deviation', value: `${info.maxDeviation}%`, color: '#f59e0b' },
              { label: 'Hotspots', value: info.hotspotCount, color: '#ef4444' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center', minWidth: 80 }}>
                <p style={{ fontSize: 9, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="18%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,78,122,0.12)" />
              <XAxis dataKey="tissue" tick={{ fill: '#c3cedf', fontSize: 11 }} axisLine={{ stroke: 'rgba(56,78,122,0.2)' }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#6b7d9c', fontSize: 11 }} axisLine={false} tickLine={false} />
              <RechartsTooltip
                cursor={{ fill: 'rgba(56,78,122,0.1)' }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload[0]) return null;
                  const d = payload[0].payload as { tissue: string; expression: number; deviation: number; fold: number; isHotspot: boolean };
                  return (
                    <div style={{
                      background: 'rgba(5,8,16,0.92)', border: '1px solid rgba(56,78,122,0.4)',
                      borderRadius: 12, padding: '12px 18px', backdropFilter: 'blur(16px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.6)', minWidth: 160
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid rgba(56,78,122,0.3)', paddingBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#e8edf5' }}>Tissue</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: d.isHotspot ? '#ef4444' : '#0ae8d2' }}>{d.tissue} {d.isHotspot && '🔥'}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                          <span style={{ fontSize: 11, color: '#8899b8', fontWeight: 600 }}>Expression</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: '#e8edf5', fontFamily: 'monospace' }}>
                            {d.expression.toFixed(2)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                          <span style={{ fontSize: 11, color: '#8899b8', fontWeight: 600 }}>Fold Change</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: '#e8edf5', fontFamily: 'monospace' }}>
                            {d.fold.toFixed(1)}×
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                          <span style={{ fontSize: 11, color: '#8899b8', fontWeight: 600 }}>Deviation</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: d.deviation > 0 ? '#ef4444' : '#0ae8d2', fontFamily: 'monospace' }}>
                            {d.deviation > 0 ? '+' : ''}{d.deviation.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="expression" radius={[6, 6, 0, 0]} maxBarSize={42}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.isHotspot ? '#ef4444' : entry.expression >= 60 ? '#0ae8d2' : '#3b82f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Linked variants */}
        {info.linkedVariants.length > 0 && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(56,78,122,0.15)' }}>
            <span style={{ fontSize: 10, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Linked Variants:
            </span>
            <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#0ae8d2', marginLeft: 10 }}>
              {info.linkedVariants.join(', ')}
            </span>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

// ── Top Dysregulated Genes Table ──
function TopGenesTable({
  genes,
  sortField,
  sortDir,
  onSort,
  onSelectGene,
}: {
  genes: GeneSummary[];
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
  onSelectGene: (gene: string) => void;
}) {
  return (
    <GlassCard padding="xl" hover={false} animate={false}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Layers size={18} color="#8b5cf6" />
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e8edf5' }}>Gene Rankings</h3>
      </div>
      <p style={{ fontSize: 13, color: '#8899b8', marginBottom: 20 }}>
        Sorted by regulatory dysregulation metrics
      </p>

      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 100px 110px 80px 100px 90px 32px',
        gap: 10, alignItems: 'center',
        padding: '8px 12px',
        borderBottom: '1px solid rgba(56,78,122,0.3)',
        marginBottom: 4,
      }}>
        <SortButton label="Gene" field="gene" sortField={sortField} sortDir={sortDir} onSort={onSort} />
        <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Category</span>
        <SortButton label="Avg Expr" field="avgExpression" sortField={sortField} sortDir={sortDir} onSort={onSort} />
        <SortButton label="Dev" field="maxDeviation" sortField={sortField} sortDir={sortDir} onSort={onSort} />
        <SortButton label="Hotspots" field="hotspotCount" sortField={sortField} sortDir={sortDir} onSort={onSort} />
        <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Top Tissue</span>
        <span />
      </div>

      {/* Rows */}
      {genes.map((g, i) => (
        <motion.div
          key={g.gene}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          onClick={() => onSelectGene(g.gene)}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 100px 110px 80px 100px 90px 32px',
            gap: 10, alignItems: 'center',
            padding: '14px 12px',
            borderBottom: i < genes.length - 1 ? '1px solid rgba(56,78,122,0.1)' : 'none',
            cursor: 'pointer', transition: 'background 0.15s',
            borderRadius: 8,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(30,42,66,0.5)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5' }}>{g.gene}</span>
            <span style={{ fontSize: 11, color: '#6b7d9c', marginLeft: 8 }}>{g.chromosome}</span>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
            background: `${categoryColors[g.category]}12`,
            color: categoryColors[g.category],
            textAlign: 'center',
          }}>
            {categoryLabels[g.category]}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 5, borderRadius: 999, background: 'rgba(10,14,26,0.6)', overflow: 'hidden' }}>
              <div style={{ width: `${g.avgExpression}%`, height: '100%', borderRadius: 999, background: '#0ae8d2' }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: '#e8edf5', minWidth: 24, textAlign: 'right' }}>{g.avgExpression}</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: deviationColor(g.maxDeviation), textAlign: 'center' }}>
            {g.maxDeviation}%
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            {g.hotspotCount > 0 && <Flame size={12} color="#ef4444" />}
            <span style={{ fontSize: 13, fontWeight: 700, color: g.hotspotCount > 0 ? '#ef4444' : '#6b7d9c' }}>{g.hotspotCount}</span>
          </div>
          <span style={{ fontSize: 12, color: '#8899b8' }}>{g.topTissue}</span>
          <ChevronRight size={14} color="#384e7a" />
        </motion.div>
      ))}
    </GlassCard>
  );
}

// ── Tissue Overview Cards ──
function TissueOverview() {
  return (
    <GlassCard padding="xl" hover={false} animate={false}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Activity size={18} color="#f59e0b" />
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e8edf5' }}>Tissue Overview</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {tissueSummaries.map((t, i) => (
          <motion.div
            key={t.tissue}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            style={{
              padding: '16px 12px', textAlign: 'center', borderRadius: 14,
              background: `${t.color}08`, border: `1px solid ${t.color}20`,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${t.color}50`)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${t.color}20`)}
          >
            <span style={{ fontSize: 22, display: 'block', marginBottom: 8 }}>{t.icon}</span>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#e8edf5', marginBottom: 6 }}>{t.tissue}</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: t.color, lineHeight: 1, marginBottom: 6 }}>{t.avgExpression}</p>
            <p style={{ fontSize: 10, color: '#6b7d9c' }}>avg expression</p>
            {t.hotspotCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8 }}>
                <Flame size={10} color="#ef4444" />
                <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 700 }}>{t.hotspotCount} hotspot{t.hotspotCount > 1 ? 's' : ''}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────── */

export default function GeneExpressionPage() {
  const { isLoading, error, refetch, data: _apiData } = useApi('/expression');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGene, setSelectedGene] = useState<string | null>('APOE');
  const [sortField, setSortField] = useState<SortField>('maxDeviation');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  // Filter & sort genes
  const filteredGenes = useMemo(() => {
    let genes = [...geneSummaries];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      genes = genes.filter(
        (g) =>
          g.gene.toLowerCase().includes(q) ||
          g.fullName.toLowerCase().includes(q) ||
          g.chromosome.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.topTissue.toLowerCase().includes(q)
      );
    }
    genes.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'gene') cmp = a.gene.localeCompare(b.gene);
      else cmp = (a[sortField] as number) - (b[sortField] as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return genes;
  }, [searchQuery, sortField, sortDir]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, width: '100%' }}>
        <div className="grid gap-4 md:grid-cols-5">
           {Array.from({length: 5}).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <GlassCard padding="xl"><ChartSkeleton height="400px" /></GlassCard>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: 20 }}>
            <GlassCard padding="xl"><TableSkeleton rows={8} /></GlassCard>
            <GlassCard padding="xl"><TableSkeleton rows={5} /></GlassCard>
        </div>
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

  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      style={{ display: 'flex', flexDirection: 'column', gap: 40, width: '100%' }}
    >
      {/* ── Hero ── */}
      <motion.div variants={stagger.item}>
        <HeroSection />
      </motion.div>

      {/* ── Search ── */}
      <motion.div variants={stagger.item}>
        <Input
          placeholder="Search by gene, tissue, chromosome, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search size={18} />}
          iconRight={
            searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="text-rg-text-muted hover:text-rg-text-primary transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            ) : undefined
          }
        />
      </motion.div>

      {/* ── Heatmap ── */}
      <motion.div variants={stagger.item}>
        <ExpressionHeatmap
          genes={filteredGenes}
          selectedGene={selectedGene}
          onSelectGene={setSelectedGene}
        />
      </motion.div>

      {/* ── Gene Detail Panel (conditional) ── */}
      <AnimatePresence mode="wait">
        {selectedGene && (
          <GeneDetailPanel gene={selectedGene} />
        )}
      </AnimatePresence>

      {/* ── Two-col: Gene Rankings + Tissue Overview ── */}
      <motion.div variants={stagger.item} style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: 20 }}>
        <TopGenesTable
          genes={filteredGenes}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onSelectGene={setSelectedGene}
        />
        <TissueOverview />
      </motion.div>
    </motion.div>
  );
}
