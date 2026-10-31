import { motion } from 'framer-motion';
import {
  Activity,
  Dna,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  ArrowRight,
  ChevronRight,
  Shield,
} from 'lucide-react';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { GlassCard, StatCard, Badge, EvidenceBadge, Button, StatCardSkeleton, ChartSkeleton, TableSkeleton, ErrorState } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiGetRealDashboard } from '@/services/api';
import {
  dashboardStats,
  variantImpactData,
  tissueImpactData,
  diseaseRiskData,
  ageTrendData,
  recentActivity,
  topVariants,
} from '@/data/dashboardData';


/* =============================================
   ReguloMe — Dashboard Command Center (GOD-MODE)
   ============================================= */

const ease = [0.22, 0.61, 0.36, 1] as [number, number, number, number];

/** Extract the first meaningful name token, skipping honorific titles. */
const HONORIFICS = new Set(['dr.', 'prof.', 'mr.', 'mrs.', 'ms.', 'sir', 'dr', 'prof', 'mr', 'mrs', 'ms']);
function getFirstName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts.find((p) => !HONORIFICS.has(p.toLowerCase().replace(',', '')));
  return first ?? parts[0] ?? fullName;
}

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

// ── Variant Impact Bar Chart ──
function VariantImpactChart() {
  const data = variantImpactData.map((d) => ({
    name: d.element,
    Gain: d.gain,
    Loss: d.loss,
  }));

  return (
    <GlassCard padding="xl" glow="teal" hover={false} className="col-span-full lg:col-span-1">
      {/* Card header */}
      <div style={{ marginBottom: 24 }}>
        {/* Legend top-right */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: '#8899b8' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#0ae8d2', display: 'inline-block' }} />
              Gain
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#8b5cf6', display: 'inline-block' }} />
              Loss
            </span>
          </div>
        </div>
        {/* Centred title + subtitle */}
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e8edf5', marginBottom: 4 }}>Variant Impact by Element</h3>
          <p style={{ fontSize: 13, color: '#8899b8' }}>Gain vs loss of function across regulatory elements</p>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 78, 122, 0.15)" />
            <XAxis dataKey="name" tick={{ fill: '#6b7d9c', fontSize: 11 }} axisLine={{ stroke: 'rgba(56, 78, 122, 0.2)' }} tickLine={false} />
            <YAxis tick={{ fill: '#6b7d9c', fontSize: 11 }} axisLine={false} tickLine={false} />
            <RechartsTooltip contentStyle={{ background: '#151c2e', border: '1px solid rgba(56, 78, 122, 0.3)', borderRadius: 8, fontSize: 12, color: '#e8edf5' }} />
            <Bar dataKey="Gain" fill="#0ae8d2" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Loss" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

// ── Age Trend Area Chart ──
function AgeTrendChart() {
  return (
    <GlassCard padding="xl" glow="purple" hover={false} className="col-span-full lg:col-span-1">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <Badge variant="warning" size="sm">
            <TrendingUp size={10} />
            Accelerating
          </Badge>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e8edf5', marginBottom: 4 }}>Regulatory Age Trend</h3>
          <p style={{ fontSize: 13, color: '#8899b8' }}>Epigenetic vs chronological age over 8 months</p>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={ageTrendData}>
            <defs>
              <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ae8d2" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ae8d2" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 78, 122, 0.15)" />
            <XAxis dataKey="month" tick={{ fill: '#6b7d9c', fontSize: 11 }} axisLine={{ stroke: 'rgba(56, 78, 122, 0.2)' }} tickLine={false} />
            <YAxis domain={[37, 43]} tick={{ fill: '#6b7d9c', fontSize: 11 }} axisLine={false} tickLine={false} />
            <RechartsTooltip contentStyle={{ background: '#151c2e', border: '1px solid rgba(56, 78, 122, 0.3)', borderRadius: 8, fontSize: 12, color: '#e8edf5' }} />
            <Area type="monotone" dataKey="epigeneticAge" stroke="#0ae8d2" strokeWidth={2} fill="url(#gradTeal)" name="Epigenetic Age" />
            <Area type="monotone" dataKey="regulatoryAge" stroke="#8b5cf6" strokeWidth={2} fill="url(#gradPurple)" name="Regulatory Age" />
            <Area type="monotone" dataKey="chronological" stroke="#6b7d9c" strokeWidth={1.5} strokeDasharray="5 5" fill="none" name="Chronological" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

// ── Tissue Impact Heatmap ──
function TissueHeatmap() {
  return (
    <GlassCard padding="xl" hover={false} className="col-span-full lg:col-span-1">
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e8edf5', marginBottom: 4 }}>Tissue Impact Map</h3>
        <p style={{ fontSize: 13, color: '#8899b8' }}>Regulatory burden across 12 tissue types</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {tissueImpactData.map((t, i) => (
          <motion.div
            key={t.tissue}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
          >
            <div
              style={{
                borderRadius: 12,
                border: '1px solid rgba(56,78,122,0.25)',
                padding: '14px 12px',
                textAlign: 'center',
                background: `${t.riskColor}${Math.round(t.impactScore * 0.15 + 5).toString(16).padStart(2, '0')}`,
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, color: '#e8edf5', marginBottom: 4 }}>{t.tissue}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: t.riskColor, lineHeight: 1.1 }}>{t.impactScore}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 4 }}>
                {t.trend === 'up' ? (
                  <TrendingUp size={10} className="text-rg-error" />
                ) : t.trend === 'down' ? (
                  <TrendingDown size={10} className="text-rg-success" />
                ) : (
                  <Minus size={10} className="text-rg-text-muted" />
                )}
                <span style={{ fontSize: 11, color: '#6b7d9c' }}>{t.affectedVariants}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Disease Risk Bars ──
function DiseaseRiskPanel() {
  const navigate = useNavigate();

  return (
    <GlassCard padding="xl" hover={false} className="col-span-full lg:col-span-1">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <button
            onClick={() => navigate('/app/diseases')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 10,
              background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
              color: '#a78bff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.1)')}
          >
            Full Report <ChevronRight size={14} />
          </button>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e8edf5', marginBottom: 4 }}>Disease Risk Profile</h3>
          <p style={{ fontSize: 13, color: '#8899b8' }}>Regulatory burden by disease domain</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {diseaseRiskData.map((d, i) => (
          <motion.div
            key={d.domain}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{ display: 'flex', alignItems: 'center', gap: 14 }}
          >
            <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{d.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#e8edf5' }}>{d.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: d.color }}>{d.riskScore}%</span>
              </div>
              <div style={{ width: '100%', height: 6, borderRadius: 999, background: 'rgba(10,14,26,0.6)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${d.riskScore}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.06, ease: 'easeOut' }}
                  style={{ height: '100%', borderRadius: 999, background: d.color }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Top Variants Table ──
function TopVariantsPanel() {
  const navigate = useNavigate();
  const effectColors = { gain: '#0ae8d2', loss: '#8b5cf6', neutral: '#6b7d9c' };

  return (
    <GlassCard padding="xl" hover={false} className="col-span-full overflow-hidden">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <button
            onClick={() => navigate('/app/variants')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(0,204,184,0.12), rgba(139,92,246,0.08))',
              border: '1px solid rgba(0,204,184,0.3)',
              color: '#0ae8d2', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,204,184,0.22), rgba(139,92,246,0.14))')}
            onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,204,184,0.12), rgba(139,92,246,0.08))')}
          >
            View All <ArrowRight size={14} />
          </button>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e8edf5', marginBottom: 4 }}>Top Priority Variants</h3>
          <p style={{ fontSize: 13, color: '#8899b8' }}>Highest regulatory impact variants for this persona</p>
        </div>
      </div>

      {/* Table — horizontal scroll on small screens */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div style={{ minWidth: 640 }}>
      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '140px 1fr 100px 70px 160px 70px',
        gap: 12,
        padding: '10px 16px',
        borderBottom: '1px solid rgba(56,78,122,0.3)',
        marginBottom: 4,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7d9c' }}>Variant</span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7d9c' }}>Gene · Tissue</span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7d9c', textAlign: 'center' }}>Element</span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7d9c', textAlign: 'center' }}>Effect</span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7d9c' }}>Evidence</span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7d9c', textAlign: 'right' }}>Score</span>
      </div>

      {/* Table rows */}
      {topVariants.map((v, i) => (
        <motion.div
          key={v.rsId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          style={{
            display: 'grid',
            gridTemplateColumns: '140px 1fr 100px 70px 160px 70px',
            gap: 12,
            alignItems: 'center',
            padding: '14px 16px',
            borderBottom: i < topVariants.length - 1 ? '1px solid rgba(56,78,122,0.15)' : 'none',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          whileHover={{ backgroundColor: 'rgba(30,42,66,0.5)' }}
        >
          <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: '#0ae8d2' }}>{v.rsId}</span>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#e8edf5' }}>{v.gene}</span>
            <span style={{ fontSize: 12, color: '#6b7d9c', marginLeft: 8 }}>· {v.tissue}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Badge variant="default" size="sm">{v.elementType}</Badge>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: effectColors[v.effect] }}>
              {v.effect.toUpperCase()}
            </span>
          </div>
          <EvidenceBadge level={v.evidenceLevel} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5' }}>{v.priorityScore}</span>
            <div style={{ width: 32, height: 6, borderRadius: 999, background: 'rgba(10,14,26,0.6)', overflow: 'hidden' }}>
              <div style={{ width: `${v.priorityScore}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#0ae8d2,#8b5cf6)' }} />
            </div>
          </div>
        </motion.div>
      ))}
      </div>
      </div>
    </GlassCard>
  );
}

// ── Activity Feed ──
function ActivityFeed() {
  return (
    <GlassCard padding="xl" hover={false} className="col-span-full lg:col-span-1">
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e8edf5', marginBottom: 4 }}>Recent Activity</h3>
        <p style={{ fontSize: 13, color: '#8899b8' }}>Latest events and alerts</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {recentActivity.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              display: 'flex',
              gap: 16,
              padding: '18px 0',
              borderBottom: i < recentActivity.length - 1 ? '1px solid rgba(56,78,122,0.15)' : 'none',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 18,
                background: `${item.accentColor}15`,
                border: `1px solid ${item.accentColor}25`,
              }}
            >
              {item.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#e8edf5', marginBottom: 5 }}>{item.title}</p>
              <p style={{ fontSize: 12, color: '#8899b8', lineHeight: 1.5, marginBottom: 6 }}>{item.description}</p>
              <span style={{ fontSize: 11, color: '#6b7d9c', fontFamily: 'monospace' }}>{item.timestamp}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}


export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentPersona, mode, userName, hasUploadedData } = useApp();
  const [realData, setRealData] = useState<any>(null);
  const [realLoading, setRealLoading] = useState(false);

  // Fetch real user data when in real mode and data is available
  useEffect(() => {
    if (mode === 'real' && hasUploadedData) {
      setRealLoading(true);
      apiGetRealDashboard()
        .then(d => { if (d?.has_data) setRealData(d); })
        .catch(() => {})
        .finally(() => setRealLoading(false));
    }
  }, [mode, hasUploadedData]);

  // Dashboard uses static seed data; the /dashboard/{id} backend endpoint isn't implemented.
  // Only attempt the API call in demo mode (where useApi skips the network anyway).
  const apiEndpoint = mode === 'demo' && currentPersona ? `/dashboard/${currentPersona.id}` : null;
  const { isLoading, error, refetch, data: _apiData } = useApi(apiEndpoint);

  const stats = dashboardStats;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, width: '100%' }}>
        <div className="grid gap-4 lg:grid-cols-4">
           {Array.from({length: 4}).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
           <GlassCard padding="xl"><ChartSkeleton height="350px" /></GlassCard>
           <GlassCard padding="xl"><ChartSkeleton height="350px" /></GlassCard>
        </div>
        <GlassCard padding="xl">
          <TableSkeleton rows={5} />
        </GlassCard>
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

  // If in real mode and no data uploaded, block the dashboard
  if (mode === 'real' && !hasUploadedData) {
    return (
      <div className="flex h-full min-h-[70vh] flex-col items-center justify-center">
        <GlassCard padding="xl" className="max-w-xl text-center flex flex-col items-center border border-rg-purple-500/30">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rg-purple-500/10 border border-rg-purple-500/20">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rg-purple-400">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <h2 className="mb-3 text-3xl font-bold text-rg-text-primary">Ready for your genome</h2>
          <p className="mb-8 text-rg-text-secondary leading-relaxed">
            Your authenticated workspace is set up. Head over to the Data Studio to upload your VCF or raw genomic data and let our analysis pipeline populate your dashboard.
          </p>
          <Button
            variant="primary"
            size="lg"
            glow
            onClick={() => navigate('/app/data-studio')}
            iconRight={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
          >
            Go to Data Studio
          </Button>
        </GlassCard>
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
      {/* ── God-Mode Hero ── */}
      <motion.div variants={stagger.item}>
        <div style={{
          position: 'relative', overflow: 'hidden',
          padding: '48px 44px', borderRadius: 28,
          background: mode === 'real'
            ? 'linear-gradient(135deg, rgba(25,16,48,0.85), rgba(14,10,30,0.92))'
            : 'linear-gradient(135deg, rgba(17,24,39,0.8), rgba(10,14,26,0.9))',
          border: mode === 'real'
            ? '1px solid rgba(139,92,246,0.22)'
            : '1px solid rgba(56,78,122,0.18)',
          backdropFilter: 'blur(24px)',
        }}>
          {/* Floating orbs — purple for real, teal for demo */}
          <motion.div
            animate={{ y: [0, -16, 0], x: [0, 10, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: -60, right: 120, width: 220, height: 220, borderRadius: '50%',
              background: mode === 'real'
                ? 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 65%)'
                : 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)',
              filter: 'blur(45px)' }}
          />
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            style={{ position: 'absolute', bottom: -40, left: 80, width: 180, height: 180, borderRadius: '50%',
              background: mode === 'real'
                ? 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 65%)'
                : 'radial-gradient(circle, rgba(10,232,210,0.06) 0%, transparent 65%)',
              filter: 'blur(40px)' }}
          />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
            {/* Left: title block */}
            <div style={{ flex: 1 }}>
              {/* Mode badge */}
              <div style={{ marginBottom: 20 }}>
                {mode === 'real' ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '5px 14px', borderRadius: 999,
                    background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.35)',
                    fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
                    letterSpacing: '0.08em', color: '#a78bfa',
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 8px rgba(167,139,250,0.6)', animation: 'pulse 2s ease-in-out infinite' }} />
                    REAL MODE · LIVE
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 14px', borderRadius: 999,
                    background: 'rgba(0,204,184,0.08)', border: '1px solid rgba(0,204,184,0.25)',
                    fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
                    letterSpacing: '0.08em', color: '#0ae8d2',
                  }}>
                    🎭 DEMO MODE
                  </span>
                )}
              </div>
              <h1 style={{
                fontSize: 48, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 12,
                background: mode === 'real'
                  ? 'linear-gradient(135deg, #e8edf5 20%, #c4b5fd 100%)'
                  : 'linear-gradient(135deg, #e8edf5 30%, #8899b8 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {mode === 'real' && userName
                  ? `Welcome, ${userName.split(' ')[0]}`
                  : currentPersona ? `Welcome, ${getFirstName(currentPersona.name)}` : 'Dashboard'}
              </h1>
              {mode === 'real' ? (
                <p style={{ fontSize: 15, color: '#a78bfa', lineHeight: 1.5 }}>
                  Authenticated workspace · Live API endpoints active · Bookmarks persist to database
                </p>
              ) : currentPersona ? (
                <p style={{ fontSize: 15, color: '#8899b8', lineHeight: 1.5 }}>
                  {currentPersona.label} · {currentPersona.variantCount.toLocaleString()} regulatory variants analysed
                </p>
              ) : null}
            </div>

            {/* Right: Animated regulatory age ring */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{ position: 'relative', width: 130, height: 130 }}>
                <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(56,78,122,0.15)" strokeWidth="9" />
                  <circle
                    cx="65" cy="65" r="54"
                    fill="none"
                    stroke="url(#ringGrad)"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 54 * (stats.regulatoryAge.value / 60)} ${2 * Math.PI * 54}`}
                    style={{ filter: 'drop-shadow(0 0 12px rgba(10,232,210,0.5))', transition: 'stroke-dasharray 1.2s ease' }}
                  />
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0ae8d2" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 30, fontWeight: 900, color: '#0ae8d2', lineHeight: 1 }}>{stats.regulatoryAge.value}</span>
                  <span style={{ fontSize: 9, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>Reg. Age</span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: '#8899b8', textAlign: 'center' }}>
                Chrono: <span style={{ color: '#e8edf5', fontWeight: 700 }}>{stats.regulatoryAge.chronological}</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Real Mode Feature Strip (only in real mode) ── */}
      {mode === 'real' && (
        <motion.div variants={stagger.item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: '⚡', label: 'Live APIs', desc: 'Ensembl · ClinVar · GTEx', color: '#a78bfa' },
            { icon: '💾', label: 'Persistent Data', desc: 'Bookmarks saved to DB', color: '#c084fc' },
            { icon: '🔒', label: 'Authenticated', desc: `Signed in as ${userName?.split(' ')[0] ?? 'User'}`, color: '#8b5cf6' },
            { icon: '🧬', label: 'Research Workbench', desc: 'Query real genomic data', color: '#7c3aed' },
          ].map((f) => (
            <div key={f.label} style={{
              padding: 14, borderRadius: 16,
              background: 'rgba(139,92,246,0.06)',
              border: '1px solid rgba(139,92,246,0.18)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 20 }}>{f.icon}</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: f.color, marginBottom: 2 }}>{f.label}</p>
                <p style={{ fontSize: 11, color: '#6b7d9c' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Real Mode Stats (only when real data is available) ── */}
      {mode === 'real' && realData && (
        <motion.div variants={stagger.item}>
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a78bfa' }}>
              YOUR REAL GENOMIC DATA
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(139,92,246,0.2)' }} />
            <span style={{ fontSize: 11, color: '#6b7d9c' }}>{realData.filename}</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Variants', value: realData.stats?.total_variants?.toLocaleString() ?? '—', sub: 'Analyzed', color: '#0ae8d2' },
              { label: 'Pathogenic', value: (realData.stats?.pathogenic_count ?? 0) + (realData.stats?.likely_pathogenic_count ?? 0), sub: 'P + LP variants', color: '#ef4444' },
              { label: 'High Impact', value: realData.stats?.high_impact_count ?? 0, sub: 'VEP HIGH impact', color: '#f59e0b' },
              { label: 'Unique Genes', value: realData.stats?.unique_genes ?? 0, sub: 'Genes affected', color: '#8b5cf6' },
            ].map(s => (
              <div key={s.label} style={{
                padding: '16px 18px', borderRadius: 16,
                background: `${s.color}08`,
                border: `1px solid ${s.color}25`,
              }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7d9c', marginBottom: 8 }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: '#6b7d9c', marginTop: 4 }}>{s.sub}</p>
              </div>
            ))}
          </div>
          {realData.top_variants?.length > 0 && (
            <div style={{ marginTop: 16, padding: 16, borderRadius: 16, border: '1px solid rgba(139,92,246,0.18)', background: 'rgba(139,92,246,0.04)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Your Top Priority Variants
              </p>
              <div className="grid gap-2">
                {realData.top_variants.slice(0, 5).map((v: any) => (
                  <div key={v.rsid} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(10,14,26,0.5)' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#0ae8d2', minWidth: 100 }}>{v.rsid}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#e8edf5', flex: 1 }}>{v.gene_name || '—'}</span>
                    <span style={{ fontSize: 11, color: '#8899b8' }}>{v.clinical_significance}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: v.impact === 'HIGH' ? '#ef4444' : v.impact === 'MODERATE' ? '#f59e0b' : '#6b7d9c' }}>{v.impact_score?.toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/app/variants')}
                style={{ marginTop: 12, fontSize: 12, color: '#a78bfa', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                View all variants <ArrowRight size={12} />
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Stats Row ── */}

      <motion.div variants={stagger.item} className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <StatCard
          label="Regulatory Age"
          value={`${stats.regulatoryAge.value} yrs`}
          subtitle={`Chronological: ${stats.regulatoryAge.chronological}`}
          icon={<Clock size={20} />}
          trend={{ value: stats.regulatoryAge.trendValue, label: stats.regulatoryAge.trendLabel }}
          glow="teal"
          delay={0}
          invertTrendColor
        />
        <StatCard
          label="Priority Variants"
          value={stats.topVariantsCount}
          subtitle={`of ${stats.totalVariants.toLocaleString()} total`}
          icon={<Dna size={20} />}
          glow="purple"
          delay={0.05}
        />
        <StatCard
          label="Risk Score"
          value={`${stats.riskScore}/100`}
          subtitle={stats.riskLevel}
          icon={<Shield size={20} />}
          trend={{ value: 5, label: 'vs baseline' }}
          glow="teal"
          delay={0.1}
          invertTrendColor
        />
        <StatCard
          label="High-Impact Tissues"
          value={stats.highImpactTissues}
          subtitle={`${stats.activePathways} active pathways`}
          icon={<Activity size={20} />}
          glow="purple"
          delay={0.15}
        />
      </motion.div>

      {/* ── Charts Row ── */}
      <motion.div variants={stagger.item} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <VariantImpactChart />
        <AgeTrendChart />
      </motion.div>

      {/* ── Middle Row: Heatmap + Disease ── */}
      <motion.div variants={stagger.item} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TissueHeatmap />
        <DiseaseRiskPanel />
      </motion.div>

      {/* ── Top Variants Table ── */}
      <motion.div variants={stagger.item}>
        <TopVariantsPanel />
      </motion.div>

      {/* ── Activity Feed ── */}
      <motion.div variants={stagger.item}>
        <ActivityFeed />
      </motion.div>
    </motion.div>
  );
}
