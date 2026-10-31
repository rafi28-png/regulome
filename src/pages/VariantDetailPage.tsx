import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Dna,
  Copy,
  ExternalLink,
  BookOpen,
  FlaskConical,
  Activity,
  Network,
  HeartPulse,
  Clock,
  ChevronRight,
  Globe,
  FileText,
  Layers,
  Sparkles,
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
  Badge,
  EvidenceBadge,
  ScoreGauge,
  Button,
  ContentCardSkeleton,
  ChartSkeleton,
  ErrorState,
  Tooltip,
} from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import {
  getVariantDetail,
  getVariantEvidence,
  type VariantDetail,
  type TissueExpressionScore,
  type RegulatoryNetworkNode,
  type RegulatoryNetworkEdge,
  type DiseaseAssociation,
  type PopulationFrequency,
  type RelatedVariant,
  type TimelineEntry,
} from '@/data/variantDetailData';
import type { EvidenceLevel, RegulatoryElementType } from '@/types';

/* =============================================
   ReguloMe — Variant Detail Page
   ============================================= */

// ── Stagger animations ──
const stagger = {
  container: {
    initial: {},
    animate: { transition: { staggerChildren: 0.07 } },
  },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
  },
};

// ── Color maps ──
const effectColors: Record<string, string> = {
  gain: '#0ae8d2',
  loss: '#8b5cf6',
  neutral: '#6b7d9c',
};

const levelColors: Record<EvidenceLevel, string> = {
  validated: '#10b981',
  literature: '#3b82f6',
  predicted: '#f59e0b',
  inferred: '#8b5cf6',
};

const elementTypeLabels: Record<RegulatoryElementType, string> = {
  enhancer: 'Enhancer',
  promoter: 'Promoter',
  silencer: 'Silencer',
  insulator: 'Insulator',
  tfbs: 'TFBS',
  ctcf_site: 'CTCF Site',
  super_enhancer: 'Super Enhancer',
  locus_control_region: 'LCR',
};

const nodeTypeIcons: Record<string, string> = {
  variant: '🧬',
  tf: '🔑',
  gene: '🧪',
  pathway: '⚙️',
  disease: '💔',
};

// ── Tissue bar color ──
function tissueBarColor(score: number): string {
  if (score >= 80) return '#ef4444';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#0ae8d2';
  return '#3b82f6';
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────── */

// ── Not Found ──
function VariantNotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '120px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 56 }}>🔍</div>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: '#e8edf5' }}>Variant Not Found</h2>
      <p style={{ fontSize: 15, color: '#8899b8', maxWidth: 420, lineHeight: 1.6 }}>
        The requested variant does not exist in our database. It may have been removed or the ID is invalid.
      </p>
      <Button variant="teal" size="md" icon={<ArrowLeft size={16} />} onClick={() => navigate('/app/variants')}>
        Back to Explorer
      </Button>
    </div>
  );
}

// ── Hero Header ──
function HeroHeader({ variant }: { variant: VariantDetail }) {
  const navigate = useNavigate();

  const copyRsId = () => {
    navigator.clipboard.writeText(variant.rsId);
  };

  return (
    <motion.div variants={stagger.item}>
      {/* Back nav */}
      <button
        onClick={() => navigate('/app/variants')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', color: '#8899b8',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          marginBottom: 32, padding: 0,
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#0ae8d2')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#8899b8')}
      >
        <ArrowLeft size={16} />
        Back to Variant Explorer
      </button>

      <GlassCard padding="xl" glow="teal" hover={false} animate={false}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
          {/* Left: Variant identity */}
          <div style={{ flex: 1, minWidth: 280 }}>
            {/* Icon + title row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(10,232,210,0.15), rgba(139,92,246,0.15))',
                border: '1px solid rgba(10,232,210,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Dna size={26} color="#0ae8d2" />
              </div>
              <div>
                <h1 style={{ fontSize: 36, fontWeight: 800, color: '#e8edf5', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                  <button
                    onClick={() => navigate(`/app/workbench?q=${encodeURIComponent(variant.gene)}`)}
                    title="Search this gene in Research Workbench"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit', lineHeight: 'inherit',
                      color: '#e8edf5', display: 'inline-flex', alignItems: 'center', gap: 10,
                      transition: 'color 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#0ae8d2'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#e8edf5'; }}
                  >
                    {variant.gene}
                    <ExternalLink size={18} style={{ opacity: 0.5 }} />
                  </button>
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: '#0ae8d2' }}>
                    {variant.rsId}
                  </span>
                  <button
                    onClick={copyRsId}
                    title="Copy rsID"
                    style={{ background: 'none', border: 'none', color: '#6b7d9c', cursor: 'pointer', padding: 2, transition: 'color 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#e8edf5')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7d9c')}
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Coordinate line */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
              <span style={{
                fontFamily: 'monospace', fontSize: 13, color: '#8899b8',
                background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(56,78,122,0.3)',
                padding: '5px 12px', borderRadius: 8,
              }}>
                {variant.chromosome}:{variant.position.toLocaleString()}
              </span>
              <span style={{
                fontFamily: 'monospace', fontSize: 13, color: '#e8edf5',
                background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(56,78,122,0.3)',
                padding: '5px 12px', borderRadius: 8,
              }}>
                {variant.refAllele} → {variant.altAllele}
              </span>
            </div>

            {/* Badges row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <Badge variant="default" size="sm">
                <Layers size={11} />
                {elementTypeLabels[variant.elementType]}
              </Badge>
              <Tooltip content={
                <div style={{ padding: 4, maxWidth: 200, whiteSpace: 'normal', lineHeight: 1.5 }}>
                  <strong style={{ display: 'block', marginBottom: 4, color: '#e8edf5', fontSize: 13 }}>{variant.effect.toUpperCase()} Mutation</strong>
                  <span style={{ color: '#8899b8', fontSize: 11 }}>
                    {variant.effect === 'gain' ? 'Creates a new regulatory element or strengthens an existing binding site.' :
                     variant.effect === 'loss' ? 'Disrupts an existing regulatory element or weakens transcription factor binding.' :
                     'No significant predicted change to regulatory function based on current models.'}
                  </span>
                </div>
              }>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
                  padding: '4px 12px', borderRadius: 6,
                  color: effectColors[variant.effect],
                  background: `${effectColors[variant.effect]}15`,
                  border: `1px solid ${effectColors[variant.effect]}30`,
                  cursor: 'help',
                }}>
                  {variant.effect.toUpperCase()}
                </span>
              </Tooltip>
              <EvidenceBadge level={variant.evidenceLevel} />
              {variant.tissues.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 6,
                    background: 'rgba(26,32,53,0.8)', border: '1px solid rgba(56,78,122,0.3)',
                    color: '#8899b8',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Priority gauge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <ScoreGauge
              value={variant.priorityScore}
              label="Priority Score"
              size="lg"
              color="gradient"
              delay={0.2}
            />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ── Quick Stats Row ──
function QuickStatsRow({ variant }: { variant: VariantDetail }) {
  const stats = [
    {
      label: 'Confidence',
      value: `${(variant.confidenceScore * 100).toFixed(0)}%`,
      color: variant.confidenceScore >= 0.85 ? '#10b981' : variant.confidenceScore >= 0.7 ? '#f59e0b' : '#ef4444',
      icon: <Sparkles size={18} />,
    },
    {
      label: 'Publications',
      value: variant.publicationCount.toLocaleString(),
      color: '#3b82f6',
      icon: <BookOpen size={18} />,
    },
    {
      label: 'Allele Freq.',
      value: `${(variant.alleleFrequency * 100).toFixed(1)}%`,
      color: '#8b5cf6',
      icon: <Globe size={18} />,
    },
    {
      label: 'Diseases',
      value: variant.diseaseAssociations.length,
      color: '#ef4444',
      icon: <HeartPulse size={18} />,
    },
  ];

  return (
    <motion.div
      variants={stagger.item}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}
    >
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.06 }}
          style={{
            padding: '24px 20px', textAlign: 'center',
            background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(56,78,122,0.25)',
            borderRadius: 16, backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ color: '#6b7d9c', opacity: 0.7, marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
            {s.icon}
          </div>
          <p style={{ fontSize: 10, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{s.label}</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ── Functional Summary ──
function FunctionalSummary({ variant }: { variant: VariantDetail }) {
  return (
    <motion.div variants={stagger.item}>
      <GlassCard padding="xl" hover={false} animate={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <FileText size={18} color="#0ae8d2" />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e8edf5' }}>Functional Summary</h3>
        </div>
        <p style={{ fontSize: 14, color: '#c3cedf', lineHeight: 1.75, marginBottom: 20 }}>
          {variant.functionalSummary}
        </p>
        <div style={{
          padding: 20, borderRadius: 12,
          background: 'rgba(10,14,26,0.5)', border: '1px solid rgba(56,78,122,0.2)',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            Molecular Mechanism
          </p>
          <p style={{ fontSize: 13, color: '#8899b8', lineHeight: 1.7 }}>
            {variant.mechanism}
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ── Evidence & Sources ──
function EvidencePanel({ variant }: { variant: VariantDetail }) {
  const evidence = getVariantEvidence(variant.id);

  return (
    <motion.div variants={stagger.item}>
      <GlassCard padding="xl" hover={false} animate={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <FlaskConical size={18} color="#3b82f6" />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e8edf5' }}>Evidence & Provenance</h3>
        </div>

        {/* Evidence summary */}
        {evidence && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 14, color: '#c3cedf', lineHeight: 1.7, marginBottom: 16 }}>
              {evidence.summary}
            </p>
            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {evidence.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                    background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                    color: '#7cb3f5', textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Confidence bar */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#8899b8' }}>Confidence Score</span>
            <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'monospace', color: levelColors[variant.evidenceLevel] }}>
              {(variant.confidenceScore * 100).toFixed(0)}%
            </span>
          </div>
          <div style={{ width: '100%', height: 8, borderRadius: 999, background: 'rgba(10,14,26,0.6)', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${variant.confidenceScore * 100}%` }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              style={{
                height: '100%', borderRadius: 999,
                background: `linear-gradient(90deg, ${levelColors[variant.evidenceLevel]}, ${levelColors[variant.evidenceLevel]}80)`,
              }}
            />
          </div>
        </div>

        {/* Data sources */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
            Data Sources
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {evidence?.resolvedSources.map((src) => src && (
              <div
                key={src.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(26,32,53,0.6)', border: '1px solid rgba(56,78,122,0.2)',
                }}
              >
                <span style={{ fontSize: 18 }}>{src.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#e8edf5' }}>{src.name}</p>
                  <p style={{ fontSize: 10, color: '#6b7d9c', textTransform: 'capitalize' }}>{src.type}</p>
                </div>
                {src.url && <ExternalLink size={11} color="#6b7d9c" />}
              </div>
            ))}
            {!evidence && (
              <p style={{ fontSize: 13, color: '#6b7d9c', gridColumn: '1 / -1' }}>
                No detailed evidence record available for this variant. Evidence data is based on computational prediction.
              </p>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ── Population Frequencies ──
function PopulationPanel({ frequencies }: { frequencies: PopulationFrequency[] }) {
  const maxFreq = Math.max(...frequencies.map((f) => f.frequency));

  return (
    <motion.div variants={stagger.item}>
      <GlassCard padding="xl" hover={false} animate={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Globe size={18} color="#8b5cf6" />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e8edf5' }}>Population Allele Frequencies</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {frequencies.map((pop, i) => (
            <motion.div
              key={pop.abbrev}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              style={{ display: 'flex', alignItems: 'center', gap: 14 }}
            >
              <span style={{
                fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
                width: 36, color: '#8b5cf6', textAlign: 'center',
              }}>
                {pop.abbrev}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#c3cedf' }}>{pop.population}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: '#e8edf5' }}>
                    {(pop.frequency * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ width: '100%', height: 6, borderRadius: 999, background: 'rgba(10,14,26,0.6)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(pop.frequency / maxFreq) * 100}%` }}
                    transition={{ duration: 0.7, delay: 0.3 + i * 0.06, ease: 'easeOut' }}
                    style={{
                      height: '100%', borderRadius: 999,
                      background: 'linear-gradient(90deg, #8b5cf6, #a78bff)',
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ── Tissue Expression Chart ──
function TissueExpressionChart({ scores }: { scores: TissueExpressionScore[] }) {
  const data = scores
    .sort((a, b) => b.score - a.score)
    .map((s) => ({
      tissue: s.tissue,
      score: s.score,
      foldChange: s.foldChange,
      direction: s.direction,
    }));

  return (
    <motion.div variants={stagger.item}>
      <GlassCard padding="xl" hover={false} animate={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Activity size={18} color="#0ae8d2" />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e8edf5' }}>Tissue Expression Impact</h3>
        </div>
        <p style={{ fontSize: 13, color: '#8899b8', marginBottom: 24 }}>
          Regulatory impact score across affected tissues (0–100)
        </p>
        <div style={{ height: Math.max(220, data.length * 44 + 40) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barCategoryGap="16%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,78,122,0.12)" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: '#6b7d9c', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(56,78,122,0.2)' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="tissue"
                width={85}
                tick={{ fill: '#c3cedf', fontSize: 12, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload[0]) return null;
                  const d = payload[0].payload as { tissue: string; score: number; foldChange: number; direction: string };
                  return (
                    <div style={{
                      background: '#151c2e', border: '1px solid rgba(56,78,122,0.3)',
                      borderRadius: 10, fontSize: 12, color: '#e8edf5', padding: '8px 14px',
                    }}>
                      <p style={{ fontWeight: 600, marginBottom: 4 }}>{d.tissue}</p>
                      <p>Impact: <span style={{ fontWeight: 700 }}>{d.score}</span> ({d.foldChange}× {d.direction === 'up' ? '↑' : d.direction === 'down' ? '↓' : '→'})</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={28}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={tissueBarColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ── Regulatory Network ──
function RegulatoryNetwork({ nodes, edges }: { nodes: RegulatoryNetworkNode[]; edges: RegulatoryNetworkEdge[] }) {
  // Group nodes by type for a layered display
  const grouped = useMemo(() => {
    const order: string[] = ['tf', 'variant', 'gene', 'pathway', 'disease'];
    const groups: Record<string, RegulatoryNetworkNode[]> = {};
    order.forEach((t) => { groups[t] = []; });
    nodes.forEach((n) => {
      if (groups[n.type]) groups[n.type].push(n);
    });
    return order.filter((t) => groups[t].length > 0).map((t) => ({ type: t, items: groups[t] }));
  }, [nodes]);

  const typeLabels: Record<string, string> = {
    tf: 'Transcription Factors',
    variant: 'Variant',
    gene: 'Target Gene',
    pathway: 'Pathways',
    disease: 'Disease Links',
  };

  return (
    <motion.div variants={stagger.item}>
      <GlassCard padding="xl" hover={false} animate={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Network size={18} color="#f59e0b" />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e8edf5' }}>Regulatory Network</h3>
        </div>
        <p style={{ fontSize: 13, color: '#8899b8', marginBottom: 28 }}>
          TF → Variant → Gene → Pathway → Disease interaction map
        </p>

        {/* Layered flow */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
          {grouped.map((group, gi) => (
            <div key={group.type} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minWidth: 110 }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                  {typeLabels[group.type] || group.type}
                </p>
                {group.items.map((node, ni) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + gi * 0.1 + ni * 0.05 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 16px', borderRadius: 12,
                      background: `${node.color}12`,
                      border: `1px solid ${node.color}30`,
                      minWidth: 100, justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{nodeTypeIcons[node.type]}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: node.color, whiteSpace: 'nowrap' }}>
                      {node.label}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Connector arrow between columns */}
              {gi < grouped.length - 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '28px 0' }}>
                  <ChevronRight size={16} color="#384e7a" />
                  <span style={{ fontSize: 9, color: '#6b7d9c', fontWeight: 600 }}>
                    {edges.find((e) =>
                      group.items.some((n) => n.id === e.from) ||
                      group.items.some((n) => n.id === e.to)
                    )?.label || ''}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Edge legend */}
        <div style={{ display: 'flex', gap: 20, marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(56,78,122,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 24, height: 2, background: '#6b7d9c' }} />
            <span style={{ fontSize: 10, color: '#6b7d9c' }}>Direct</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 24, height: 2, borderTop: '2px dashed #6b7d9c' }} />
            <span style={{ fontSize: 10, color: '#6b7d9c' }}>Inferred</span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: '#6b7d9c' }}>
            {nodes.length} nodes · {edges.length} edges
          </span>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ── Disease Associations ──
function DiseaseAssociationsPanel({ associations }: { associations: DiseaseAssociation[] }) {
  const maxRR = Math.max(...associations.map((a) => a.riskRatio));

  return (
    <motion.div variants={stagger.item}>
      <GlassCard padding="xl" hover={false} animate={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <HeartPulse size={18} color="#ef4444" />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e8edf5' }}>Disease Associations</h3>
        </div>
        <p style={{ fontSize: 13, color: '#8899b8', marginBottom: 24 }}>
          Odds ratios and statistical significance from population studies
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {associations.map((assoc, i) => (
            <motion.div
              key={assoc.disease}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              style={{
                padding: '18px 20px', borderRadius: 14,
                background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(56,78,122,0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', marginBottom: 4 }}>
                    {assoc.disease}
                  </p>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                    background: `${assoc.color}15`, color: assoc.color,
                  }}>
                    {assoc.domain}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: assoc.color, lineHeight: 1 }}>
                    {assoc.riskRatio.toFixed(2)}×
                  </p>
                  <p style={{ fontSize: 10, color: '#6b7d9c', marginTop: 2 }}>odds ratio</p>
                </div>
              </div>

              {/* Risk bar */}
              <div style={{ width: '100%', height: 5, borderRadius: 999, background: 'rgba(10,14,26,0.5)', overflow: 'hidden', marginBottom: 10 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(assoc.riskRatio / (maxRR * 1.15)) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.07, ease: 'easeOut' }}
                  style={{ height: '100%', borderRadius: 999, background: assoc.color }}
                />
              </div>

              <div style={{ display: 'flex', gap: 20 }}>
                <span style={{ fontSize: 11, color: '#6b7d9c' }}>
                  p-value: <span style={{ fontFamily: 'monospace', color: '#8899b8' }}>{assoc.pValue}</span>
                </span>
                <span style={{ fontSize: 11, color: '#6b7d9c' }}>
                  Studies: <span style={{ fontWeight: 700, color: '#8899b8' }}>{assoc.populationStudies}</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ── Timeline ──
function TimelinePanel({ entries }: { entries: TimelineEntry[] }) {
  return (
    <motion.div variants={stagger.item}>
      <GlassCard padding="xl" hover={false} animate={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Clock size={18} color="#f59e0b" />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e8edf5' }}>Evidence Timeline</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', paddingLeft: 24 }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: 6, top: 8, bottom: 8, width: 2,
            background: 'linear-gradient(to bottom, rgba(245,158,11,0.4), rgba(56,78,122,0.15))',
            borderRadius: 999,
          }} />

          {entries.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              style={{
                display: 'flex', gap: 16,
                padding: '16px 0',
                borderBottom: i < entries.length - 1 ? '1px solid rgba(56,78,122,0.1)' : 'none',
                position: 'relative',
              }}
            >
              {/* Dot */}
              <div style={{
                position: 'absolute', left: -21, top: 22,
                width: 10, height: 10, borderRadius: '50%',
                background: i === 0 ? '#f59e0b' : '#384e7a',
                border: '2px solid rgba(17,24,39,0.8)',
              }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#e8edf5', marginBottom: 4 }}>{entry.event}</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#6b7d9c' }}>{entry.date}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '1px 8px', borderRadius: 4,
                    background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
                  }}>
                    {entry.source}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ── Related Variants ──
function RelatedVariantsPanel({ variants }: { variants: RelatedVariant[] }) {
  const navigate = useNavigate();

  if (variants.length === 0) return null;

  return (
    <motion.div variants={stagger.item}>
      <GlassCard padding="xl" hover={false} animate={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Dna size={18} color="#8b5cf6" />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e8edf5' }}>Related Variants</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {variants.map((rv, i) => (
            <motion.div
              key={rv.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              onClick={() => navigate(`/app/variants/${rv.id}`)}
              style={{
                padding: '16px 18px', borderRadius: 12, cursor: 'pointer',
                background: 'rgba(26,32,53,0.6)', border: '1px solid rgba(56,78,122,0.2)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)';
                e.currentTarget.style.background = 'rgba(26,32,53,0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(56,78,122,0.2)';
                e.currentTarget.style.background = 'rgba(26,32,53,0.6)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#0ae8d2' }}>
                  {rv.rsId}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 28, height: 4, borderRadius: 999, background: 'rgba(10,14,26,0.6)', overflow: 'hidden' }}>
                    <div style={{ width: `${rv.priorityScore}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#0ae8d2,#8b5cf6)' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: '#e8edf5' }}>
                    {rv.priorityScore}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#e8edf5', marginBottom: 4 }}>{rv.gene}</p>
              <p style={{ fontSize: 11, color: '#6b7d9c' }}>{rv.relation}</p>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────── */

export default function VariantDetailPage() {
  const { variantId } = useParams<{ variantId: string }>();
  const { isLoading, error, refetch, data: _apiData } = useApi(variantId ? `/variants/${variantId}` : null);
  const variant = useMemo(() => getVariantDetail(variantId || ''), [variantId]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, width: '100%' }}>
         <GlassCard padding="xl"><ContentCardSkeleton /></GlassCard>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {Array.from({length: 4}).map((_, i) => <ContentCardSkeleton key={i} />)}
         </div>
         <GlassCard padding="xl"><ChartSkeleton height="300px" /></GlassCard>
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

  if (!variant) {
    return <VariantNotFound />;
  }

  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      style={{ display: 'flex', flexDirection: 'column', gap: 32, width: '100%' }}
    >
      {/* Hero */}
      <HeroHeader variant={variant} />

      {/* Quick Stats */}
      <QuickStatsRow variant={variant} />

      {/* Functional Summary */}
      <FunctionalSummary variant={variant} />

      {/* Evidence & Sources */}
      <EvidencePanel variant={variant} />

      {/* Two-col: Tissue Chart + Population Frequencies */}
      <motion.div variants={stagger.item} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        <TissueExpressionChart scores={variant.tissueExpressionScores} />
        <PopulationPanel frequencies={variant.populationFrequencies} />
      </motion.div>

      {/* Regulatory Network */}
      <RegulatoryNetwork nodes={variant.networkNodes} edges={variant.networkEdges} />

      {/* Two-col: Disease Associations + Timeline */}
      <motion.div variants={stagger.item} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
        <DiseaseAssociationsPanel associations={variant.diseaseAssociations} />
        <TimelinePanel entries={variant.timeline} />
      </motion.div>

      {/* Related Variants */}
      <RelatedVariantsPanel variants={variant.relatedVariants} />
    </motion.div>
  );
}
