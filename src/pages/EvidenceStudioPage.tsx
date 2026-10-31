import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  ExternalLink,
  ChevronDown,
  SlidersHorizontal,
  X,
  BarChart3,
  Database,
  FileText,
  Cpu,
  ArrowUpDown,
} from 'lucide-react';
import {
  GlassCard,
  Badge,
  EvidenceBadge,
  Input,
  Button,
  TableSkeleton,
  ErrorState,
} from '@/components/ui';
import { useRegulatoryProfile } from '@/hooks/useRegulatoryProfile';
import {
  evidenceSources,
  evidenceFilterOptions,
  type EvidenceRecord,
} from '@/data/evidenceData';
import type { EvidenceLevel, RegulatoryElementType } from '@/types';

/* =============================================
   ReguloMe — Evidence Studio (GOD-MODE)
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

// ── Source type icons ──
const sourceTypeIcons: Record<string, React.ReactNode> = {
  database: <Database size={12} />,
  publication: <FileText size={12} />,
  consortium: <BarChart3 size={12} />,
  computational: <Cpu size={12} />,
};

// ── Evidence level color map ──
const levelColors: Record<EvidenceLevel, string> = {
  validated: '#10b981',
  literature: '#3b82f6',
  predicted: '#f59e0b',
  inferred: '#8b5cf6',
};

// ── God-Mode Hero Section ──
function HeroSection({ showFilters, setShowFilters, activeFilterCount }: {
  showFilters: boolean; setShowFilters: (v: boolean) => void;
  activeFilterCount: number;
}) {
  const { profile } = useRegulatoryProfile();
  const recs = profile.evidence.records;
  const stats = [
    { label: 'Total Records', value: recs.length.toLocaleString(), color: '#e8edf5' },
    { label: 'Validated', value: recs.filter((r) => r.evidenceLevel === 'validated').length, color: levelColors.validated },
    { label: 'Literature', value: recs.filter((r) => r.evidenceLevel === 'literature').length, color: levelColors.literature },
    { label: 'Predicted', value: recs.filter((r) => r.evidenceLevel === 'predicted').length, color: levelColors.predicted },
    { label: 'Inferred', value: recs.filter((r) => r.evidenceLevel === 'inferred').length, color: levelColors.inferred },
  ];

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      padding: '48px 44px', borderRadius: 28,
      background: 'linear-gradient(135deg, rgba(17,24,39,0.8), rgba(10,14,26,0.9))',
      border: '1px solid rgba(56,78,122,0.18)',
      backdropFilter: 'blur(24px)',
    }}>
      <motion.div
        animate={{ y: [0, -18, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: -50, right: 60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%)', filter: 'blur(45px)' }}
      />
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{ position: 'absolute', bottom: -20, left: 40, width: 170, height: 170, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 65%)', filter: 'blur(35px)' }}
      />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.15 }}
            style={{
              width: 60, height: 60, borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.15))',
              border: '1px solid rgba(59,130,246,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(59,130,246,0.08)',
            }}
          >
            <BookOpen size={28} color="#3b82f6" />
          </motion.div>
          <div>
            <h1 style={{
              fontSize: 42, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #e8edf5 30%, #8899b8 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Evidence Studio
            </h1>
            <p style={{ fontSize: 15, color: '#8899b8', marginTop: 8, maxWidth: 520 }}>
              Explore provenance, confidence levels, and source attributions for regulatory variants
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button variant={showFilters ? 'primary' : 'secondary'} size="sm" icon={<SlidersHorizontal size={14} />} onClick={() => setShowFilters(!showFilters)} glow={showFilters}>
            Filters{activeFilterCount > 0 && <span style={{ marginLeft: 6, width: 18, height: 18, borderRadius: '50%', background: '#3b82f6', color: '#e8edf5', fontSize: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{activeFilterCount}</span>}
          </Button>
        </div>
      </div>

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
            <p style={{ fontSize: 8, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Filter Pill ──
function FilterPill({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
        active
          ? 'bg-rg-teal-500/15 border border-rg-teal-500/30 text-rg-teal-400'
          : 'bg-rg-bg-tertiary border border-rg-border text-rg-text-secondary hover:text-rg-text-primary hover:bg-rg-bg-hover'
      }`}
      style={active && color ? { borderColor: `${color}40`, background: `${color}15`, color } : undefined}
    >
      {label}
    </motion.button>
  );
}

// ── Source Badge ──
function SourceBadge({ sourceId }: { sourceId: string }) {
  const source = evidenceSources.find((s) => s.id === sourceId);
  if (!source) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rg-bg-tertiary border border-rg-border text-[10px] font-medium text-rg-text-secondary">
      {sourceTypeIcons[source.type]}
      {source.name}
    </span>
  );
}

// ── Expandable Evidence Card ──
function EvidenceCard({ record, index }: { record: EvidenceRecord; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const effectColors = {
    gain: '#0ae8d2',
    loss: '#8b5cf6',
    neutral: '#6b7d9c',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      layout
    >
      <GlassCard
        padding="none"
        hover={false}
        animate={false}
        className="overflow-hidden transition-all duration-300"
      >
        {/* Main row */}
        <div
          className="flex items-center gap-4 p-4 cursor-pointer hover:bg-rg-bg-hover/30 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          {/* Confidence indicator */}
          <div className="relative shrink-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold border"
              style={{
                background: `${levelColors[record.evidenceLevel]}12`,
                borderColor: `${levelColors[record.evidenceLevel]}30`,
                color: levelColors[record.evidenceLevel],
              }}
            >
              {Math.round(record.confidenceScore * 100)}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-mono font-semibold text-rg-teal-400">{record.rsId}</span>
              <span className="text-sm font-medium text-rg-text-primary">{record.gene}</span>
              <Badge variant="default" size="sm">
                {record.elementType}
              </Badge>
              <span
                className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded"
                style={{
                  color: effectColors[record.effect],
                  background: `${effectColors[record.effect]}15`,
                }}
              >
                {record.effect.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-rg-text-muted mt-1 truncate max-w-xl">{record.summary}</p>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col items-end">
              <EvidenceBadge level={record.evidenceLevel} />
              <span className="text-[10px] text-rg-text-muted mt-1">
                {record.tissue} · {record.chromosome}
              </span>
            </div>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-rg-text-muted"
            >
              <ChevronDown size={16} />
            </motion.div>
          </div>
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
              <div style={{ borderTop: '1px solid rgba(56,78,122,0.2)', padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 28, background: 'rgba(10,14,26,0.4)' }}>

                {/* Evidence Summary */}
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                    Evidence Summary
                  </h4>
                  <p style={{ fontSize: 14, color: '#c4cfdf', lineHeight: 1.7 }}>{record.summary}</p>
                </div>

                {/* Metadata grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  {[
                    { label: 'Position', value: `${record.chromosome}:${record.position.toLocaleString()}`, mono: true },
                    { label: 'Publications', value: record.publicationCount.toLocaleString(), mono: false },
                    { label: 'Last Updated', value: record.lastUpdated, mono: true },
                  ].map(({ label, value, mono }) => (
                    <div key={label} style={{ background: 'rgba(30,42,66,0.5)', borderRadius: 12, padding: '16px 18px', border: '1px solid rgba(56,78,122,0.2)' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{label}</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#e8edf5', fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</p>
                    </div>
                  ))}
                  {/* Confidence bar */}
                  <div style={{ background: 'rgba(30,42,66,0.5)', borderRadius: 12, padding: '16px 18px', border: '1px solid rgba(56,78,122,0.2)' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Confidence</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'rgba(10,14,26,0.6)', overflow: 'hidden' }}>
                        <div style={{ width: `${record.confidenceScore * 100}%`, height: '100%', borderRadius: 999, background: levelColors[record.evidenceLevel] }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'monospace', color: levelColors[record.evidenceLevel], flexShrink: 0 }}>
                        {(record.confidenceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sources */}
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                    Data Sources
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {record.sources.map((sid) => (
                      <SourceBadge key={sid} sourceId={sid} />
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                    Tags
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {record.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: '6px 14px', borderRadius: 999,
                          background: 'rgba(56,78,122,0.15)', border: '1px solid rgba(56,78,122,0.25)',
                          fontSize: 12, color: '#8899b8', fontWeight: 500,
                        }}
                      >
                        {tag}
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

// ── Main Evidence Studio Page ──
export default function EvidenceStudioPage() {
  const { profile, isLoading, error, refresh } = useRegulatoryProfile();
  const evidenceRecords = profile.evidence.records;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'All' | EvidenceLevel>('All');
  const [selectedTissue, setSelectedTissue] = useState('All');
  const [selectedElement, setSelectedElement] = useState<'All' | RegulatoryElementType>('All');
  const [selectedEffect, setSelectedEffect] = useState<'All' | 'gain' | 'loss' | 'neutral'>('All');
  const [sortBy, setSortBy] = useState<'confidence' | 'publications' | 'date'>('confidence');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search records
  const filteredRecords = useMemo(() => {
    let records = [...evidenceRecords];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      records = records.filter(
        (r) =>
          r.rsId.toLowerCase().includes(q) ||
          r.gene.toLowerCase().includes(q) ||
          r.tissue.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Filters
    if (selectedLevel !== 'All') {
      records = records.filter((r) => r.evidenceLevel === selectedLevel);
    }
    if (selectedTissue !== 'All') {
      records = records.filter((r) => r.tissue === selectedTissue);
    }
    if (selectedElement !== 'All') {
      records = records.filter((r) => r.elementType === selectedElement);
    }
    if (selectedEffect !== 'All') {
      records = records.filter((r) => r.effect === selectedEffect);
    }

    // Sort
    records.sort((a, b) => {
      if (sortBy === 'confidence') return b.confidenceScore - a.confidenceScore;
      if (sortBy === 'publications') return b.publicationCount - a.publicationCount;
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });

    return records;
  }, [evidenceRecords, searchQuery, selectedLevel, selectedTissue, selectedElement, selectedEffect, sortBy]);

  const activeFilterCount = [selectedLevel, selectedTissue, selectedElement, selectedEffect].filter(
    (f) => f !== 'All'
  ).length;

  const clearFilters = () => {
    setSelectedLevel('All');
    setSelectedTissue('All');
    setSelectedElement('All');
    setSelectedEffect('All');
    setSearchQuery('');
  };

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
        <HeroSection
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          activeFilterCount={activeFilterCount}
        />
      </motion.div>

      {/* ── Search Bar ── */}
      <motion.div variants={stagger.item}>
        <Input
          placeholder="Search by rsID, gene, tissue, or keyword (e.g. rs1800795, IL-6, inflammatory)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search size={16} />}
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

      {/* ── Filters ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <GlassCard padding="none" hover={false} animate={false}>
              <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>

                {/* Evidence Level */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Evidence Level</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {evidenceFilterOptions.evidenceLevels.map((level) => (
                      <FilterPill
                        key={level}
                        label={level === 'All' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                        active={selectedLevel === level}
                        onClick={() => setSelectedLevel(level)}
                        color={level !== 'All' ? levelColors[level as EvidenceLevel] : undefined}
                      />
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(56,78,122,0.2)' }} />

                {/* Tissue */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Tissue</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {evidenceFilterOptions.tissues.map((tissue) => (
                      <FilterPill
                        key={tissue}
                        label={tissue}
                        active={selectedTissue === tissue}
                        onClick={() => setSelectedTissue(tissue)}
                      />
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(56,78,122,0.2)' }} />

                {/* Element Type + Effect side by side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Element Type</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {evidenceFilterOptions.elementTypes.map((el) => (
                        <FilterPill
                          key={el}
                          label={el === 'All' ? 'All Types' : el.charAt(0).toUpperCase() + el.slice(1)}
                          active={selectedElement === el}
                          onClick={() => setSelectedElement(el)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Effect</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {evidenceFilterOptions.effects.map((ef) => (
                        <FilterPill
                          key={ef}
                          label={ef === 'All' ? 'All Effects' : ef.charAt(0).toUpperCase() + ef.slice(1)}
                          active={selectedEffect === ef}
                          onClick={() => setSelectedEffect(ef)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear filters */}
                {activeFilterCount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
                    <Button variant="ghost" size="xs" onClick={clearFilters} icon={<X size={12} />}>
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sort + Results header ── */}
      <motion.div variants={stagger.item} className="flex items-center justify-between">
        <p className="text-sm text-rg-text-secondary">
          <span className="font-medium text-rg-text-primary">{filteredRecords.length}</span>{' '}
          evidence records
          {activeFilterCount > 0 && (
            <span className="text-rg-text-muted"> (filtered)</span>
          )}
        </p>
        <div className="flex items-center gap-1.5">
          <ArrowUpDown size={12} className="text-rg-text-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'confidence' | 'publications' | 'date')}
            className="bg-rg-bg-tertiary border border-rg-border rounded-lg px-2 py-1 text-xs text-rg-text-secondary focus:outline-none focus:border-rg-teal-500/30"
          >
            <option value="confidence">Confidence</option>
            <option value="publications">Publications</option>
            <option value="date">Last Updated</option>
          </select>
        </div>
      </motion.div>

      {/* ── Evidence Cards ── */}
      {isLoading ? (
        <motion.div variants={stagger.item} className="w-full">
            <GlassCard padding="xl">
                <TableSkeleton rows={6} />
            </GlassCard>
        </motion.div>
      ) : (
      <motion.div variants={stagger.item} className="space-y-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record, i) => (
            <EvidenceCard key={record.id} record={record} index={i} />
          ))
        ) : (
          <GlassCard padding="xl" hover={false} className="text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-rg-text-primary mb-2">No records found</h3>
            <p className="text-sm text-rg-text-secondary mb-4">
              Try adjusting your search query or filters.
            </p>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear all filters
            </Button>
          </GlassCard>
        )}
      </motion.div>
      )}

      {/* ── Sources Reference ── */}
      <motion.div variants={stagger.item}>
        <GlassCard padding="lg" hover={false}>
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e8edf5', marginBottom: 4 }}>Data Sources</h3>
            <p style={{ fontSize: 13, color: '#8899b8' }}>Curated regulatory evidence from validated databases and publications</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {evidenceSources.map((source) => (
              <div
                key={source.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-rg-bg-tertiary border border-rg-border hover:border-rg-teal-500/20 transition-colors group"
              >
                <span className="text-lg">{source.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-rg-text-primary truncate">{source.name}</p>
                  <p className="text-[10px] text-rg-text-muted capitalize">{source.type}</p>
                </div>
                {source.url && (
                  <ExternalLink size={12} className="text-rg-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
