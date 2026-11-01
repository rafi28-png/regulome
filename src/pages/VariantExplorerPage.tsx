import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Dna,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Copy,
  ArrowRight,
  Download,
  UploadCloud,
} from 'lucide-react';
import {
  GlassCard,
  Badge,
  EvidenceBadge,
  Input,
  Button,
} from '@/components/ui';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useApp } from '@/context/AppContext';
import { useRegulatoryProfile } from '@/hooks/useRegulatoryProfile';
import { apiExportRealVariants } from '@/services/api';
import {
  variantFilterOptions,
  type VariantExplorerEntry,
} from '@/data/variantData';
import type { EvidenceLevel, RegulatoryElementType } from '@/types';

/* =============================================
   ReguloMe — Variant Explorer (GOD-MODE)
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
  ctcf_site: 'CTCF',
  super_enhancer: 'Super Enh.',
  locus_control_region: 'LCR',
};

// ── Sort config ──
type SortField = 'priorityScore' | 'confidenceScore' | 'publicationCount' | 'gene' | 'chromosome';
type SortDir = 'asc' | 'desc';

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
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      style={{
        padding: '7px 16px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        border: active
          ? `1px solid ${color ? color + '50' : 'rgba(0,204,184,0.4)'}`
          : '1px solid rgba(56,78,122,0.3)',
        background: active
          ? color ? `${color}18` : 'rgba(0,204,184,0.12)'
          : 'rgba(26,32,53,0.6)',
        color: active
          ? color || '#0ae8d2'
          : '#8899b8',
        boxShadow: active ? `0 0 12px ${color ? color + '20' : 'rgba(0,204,184,0.15)'}` : 'none',
      }}
    >
      {label}
    </motion.button>
  );
}

// ── God-Mode Hero Section ──
function HeroSection({
  variants,
  liveBookmarkCount,
  showBookmarkedOnly,
  setShowBookmarkedOnly,
  showFilters,
  setShowFilters,
  activeFilterCount,
  exporting,
  onExport,
}: {
  variants: VariantExplorerEntry[];
  liveBookmarkCount: number;
  showBookmarkedOnly: boolean;
  setShowBookmarkedOnly: (v: boolean) => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  activeFilterCount: number;
  exporting: boolean;
  onExport: (fmt: 'csv' | 'json') => void;
}) {
  const highPriority = variants.filter((v) => v.priorityScore >= 85).length;
  const gainCount = variants.filter((v) => v.effect === 'gain').length;
  const lossCount = variants.filter((v) => v.effect === 'loss').length;

  const stats = [
    { label: 'Total Variants', value: variants.length.toLocaleString(), color: '#e8edf5' },
    { label: 'High Priority', value: highPriority.toLocaleString(), color: '#0ae8d2' },
    { label: 'Gain-of-Function', value: gainCount.toLocaleString(), color: effectColors.gain },
    { label: 'Loss-of-Function', value: lossCount.toLocaleString(), color: effectColors.loss },
    { label: 'Bookmarked', value: liveBookmarkCount, color: '#f59e0b' },
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
        animate={{ y: [0, -14, 0], x: [0, 8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: -50, right: 80, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)', filter: 'blur(40px)' }}
      />
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{ position: 'absolute', bottom: -30, left: 60, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,232,210,0.06) 0%, transparent 65%)', filter: 'blur(35px)' }}
      />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, marginBottom: 36, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
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
            <Dna size={28} color="#0ae8d2" />
          </motion.div>
          <div>
            <h1 style={{
              fontSize: 42, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #e8edf5 30%, #8899b8 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Variant Explorer
            </h1>
            <p style={{ fontSize: 15, color: '#8899b8', marginTop: 8, maxWidth: 520 }}>
              Browse, filter, and prioritize regulatory variants across your non-coding genome
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="ghost" size="sm" onClick={() => onExport('csv')} disabled={exporting || variants.length === 0} icon={<Download size={13} />}>
            {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onExport('json')} disabled={exporting || variants.length === 0} icon={<Download size={13} />}>
            JSON
          </Button>
          <Button variant={showBookmarkedOnly ? 'teal' : 'ghost'} size="sm" icon={<BookmarkCheck size={14} />} onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}>Bookmarked</Button>
          <Button variant={showFilters ? 'teal' : 'secondary'} size="sm" icon={<SlidersHorizontal size={14} />} onClick={() => setShowFilters(!showFilters)}>
            Filters{activeFilterCount > 0 && <span style={{ marginLeft: 6, width: 18, height: 18, borderRadius: '50%', background: '#0ae8d2', color: '#0a0e1a', fontSize: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{activeFilterCount}</span>}
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

// ── Sortable Column Header ──
function SortHeader({
  label,
  field,
  currentSort,
  currentDir,
  onSort,
  className = '',
}: {
  label: string;
  field: SortField;
  currentSort: SortField;
  currentDir: SortDir;
  onSort: (field: SortField) => void;
  className?: string;
}) {
  const isActive = currentSort === field;
  return (
    <button
      onClick={() => onSort(field)}
      className={`flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold transition-colors cursor-pointer ${
        isActive ? 'text-rg-teal-400' : 'text-rg-text-muted hover:text-rg-text-secondary'
      } ${className}`}
    >
      {label}
      {isActive ? (
        currentDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
      ) : (
        <ArrowUpDown size={8} className="opacity-40" />
      )}
    </button>
  );
}

// ── Variant Row ──
// Simplified: 5-column layout that fits any screen width
function VariantRow({
  variant,
  index,
  onToggleBookmark,
}: {
  variant: VariantExplorerEntry;
  index: number;
  onToggleBookmark: (id: string) => void;
}) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyRsId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(variant.rsId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => navigate(`/app/variants/${variant.id}`)}
      className="grid grid-cols-[40px_minmax(180px,1.5fr)_minmax(180px,1.2fr)_100px_80px_160px_100px_40px] gap-4 items-center px-6 py-5 bg-rg-bg-tertiary/50 border border-rg-border/50 rounded-xl hover:bg-rg-bg-hover/80 hover:border-rg-border transition-all duration-200 cursor-pointer group"
    >
      {/* 1: Bookmark */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleBookmark(variant.id);
        }}
        className="shrink-0 text-rg-text-muted hover:text-rg-warning transition-colors cursor-pointer"
      >
        {variant.bookmarked ? (
          <BookmarkCheck size={18} className="text-rg-warning" />
        ) : (
          <Bookmark size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>

      {/* 2: Variant ID + Gene + Chromosome (main info) */}
      <div className="min-w-0 flex-2">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-mono font-semibold text-rg-teal-400 group-hover:text-rg-teal-300 transition-colors">
            {variant.rsId}
          </span>
          <button
            onClick={copyRsId}
            className="text-rg-text-muted hover:text-rg-text-primary opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            title="Copy rsID"
          >
            {copied ? (
              <span className="text-[10px] text-rg-success font-medium">Copied!</span>
            ) : (
              <Copy size={12} />
            )}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-medium text-rg-text-primary">{variant.gene}</span>
          <span className="text-xs text-rg-text-muted">·</span>
          <span className="text-xs text-rg-text-muted font-mono">
            {variant.chromosome}:{variant.position.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 3: Tissues */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {variant.tissues.slice(0, 2).map((t) => (
          <span
            key={t}
            className="px-2.5 py-1 rounded-md bg-rg-bg-hover border border-rg-border text-[11px] text-rg-text-secondary whitespace-nowrap"
          >
            {t}
          </span>
        ))}
        {variant.tissues.length > 2 && (
          <span className="text-[10px] text-rg-text-muted font-medium px-1">
            +{variant.tissues.length - 2}
          </span>
        )}
      </div>

      {/* 4: Element Type */}
      <div>
        <Badge variant="default" size="sm" className="w-full justify-center">
          {elementTypeLabels[variant.elementType] || variant.elementType}
        </Badge>
      </div>

      {/* 5: Effect */}
      <div>
        <span
          className="block w-full text-[11px] font-mono font-bold px-2 py-1.5 rounded text-center"
          style={{
            color: effectColors[variant.effect],
            background: `${effectColors[variant.effect]}15`,
          }}
        >
          {variant.effect.toUpperCase()}
        </span>
      </div>

      {/* 6: Evidence */}
      <div>
        <EvidenceBadge level={variant.evidenceLevel} />
      </div>

      {/* 7: Priority Score */}
      <div className="flex items-center gap-2.5 justify-end">
        <div className="w-10 h-1.5 rounded-full bg-rg-bg-primary overflow-hidden hidden sm:block">
          <div
            className="h-full rounded-full"
            style={{
              width: `${variant.priorityScore}%`,
              background: `linear-gradient(90deg, #0ae8d2, #8b5cf6)`,
            }}
          />
        </div>
        <span className="text-sm font-bold text-rg-text-primary text-right min-w-[20px]">
          {variant.priorityScore}
        </span>
      </div>

      {/* 8: Arrow */}
      <div className="flex justify-end">
        <ArrowRight
          size={16}
          className="text-rg-text-muted opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-8px] group-hover:translate-x-0 duration-300"
        />
      </div>
    </motion.div>
  );
}

// ── Main Variant Explorer Page ──
export default function VariantExplorerPage() {
  const navigate = useNavigate();
  const { mode, hasUploadedData } = useApp();
  const { profile } = useRegulatoryProfile();
  const activeVariants = profile.variants;
  const isDemo = mode === 'demo';

  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('priorityScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Filters
  const [selectedTissue, setSelectedTissue] = useState('All');
  const [selectedElement, setSelectedElement] = useState<'All' | RegulatoryElementType>('All');
  const [selectedEffect, setSelectedEffect] = useState<'All' | 'gain' | 'loss' | 'neutral'>('All');
  const [selectedLevel, setSelectedLevel] = useState<'All' | EvidenceLevel>('All');
  const [selectedDisease, setSelectedDisease] = useState('All');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  const initialBookmarkedIds = useMemo(() => activeVariants.filter(v => v.bookmarked).map(v => v.id), [activeVariants]);
  const { bookmarks, toggleBookmark } = useBookmarks(initialBookmarkedIds);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const filteredVariants = useMemo(() => {
    let variants = activeVariants.map(v => ({ ...v, bookmarked: bookmarks.has(v.id) }));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      variants = variants.filter(v =>
        v.rsId.toLowerCase().includes(q) ||
        v.gene.toLowerCase().includes(q) ||
        v.chromosome.toLowerCase().includes(q) ||
        v.tissues.some(t => t.toLowerCase().includes(q)) ||
        v.affectedTFs.some(tf => tf.toLowerCase().includes(q)) ||
        v.linkedDiseases.some(d => d.toLowerCase().includes(q))
      );
    }
    if (selectedTissue !== 'All') variants = variants.filter(v => v.tissues.includes(selectedTissue));
    if (selectedElement !== 'All') variants = variants.filter(v => v.elementType === selectedElement);
    if (selectedEffect !== 'All') variants = variants.filter(v => v.effect === selectedEffect);
    if (selectedLevel !== 'All') variants = variants.filter(v => v.evidenceLevel === selectedLevel);
    if (selectedDisease !== 'All') variants = variants.filter(v => v.linkedDiseases.includes(selectedDisease));
    if (showBookmarkedOnly) variants = variants.filter(v => v.bookmarked);
    variants.sort((a, b) => {
      let c = 0;
      if (sortField === 'gene') c = a.gene.localeCompare(b.gene);
      else if (sortField === 'chromosome') c = a.chromosome.localeCompare(b.chromosome);
      else c = (a[sortField] as number) - (b[sortField] as number);
      return sortDir === 'asc' ? c : -c;
    });
    return variants;
  }, [activeVariants, searchQuery, selectedTissue, selectedElement, selectedEffect, selectedLevel, selectedDisease, showBookmarkedOnly, sortField, sortDir, bookmarks]);

  const activeFilterCount = [selectedTissue, selectedElement, selectedEffect, selectedLevel, selectedDisease].filter(f => f !== 'All').length + (showBookmarkedOnly ? 1 : 0);
  const clearFilters = () => {
    setSelectedTissue('All');
    setSelectedElement('All');
    setSelectedEffect('All');
    setSelectedLevel('All');
    setSelectedDisease('All');
    setShowBookmarkedOnly(false);
    setSearchQuery('');
  };

  const handleExport = async (fmt: 'json' | 'csv') => {
    setExporting(true);
    try {
      if (!isDemo) {
        const blob = await apiExportRealVariants(fmt);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `regulome_variants.${fmt}`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
      throw new Error('Use client export');
    } catch {
      const rows = filteredVariants.map((v) => ({
        rsid: v.rsId,
        chromosome: v.chromosome,
        position: v.position,
        genotype: `${v.refAllele}/${v.altAllele}`,
        gene: v.gene,
        element_type: v.elementType,
        effect: v.effect,
        evidence_level: v.evidenceLevel,
        priority_score: v.priorityScore,
        tissues: v.tissues.join('; '),
        affected_tfs: v.affectedTFs.join('; '),
        linked_diseases: v.linkedDiseases.join('; '),
      }));
      let content = '';
      let mime = 'application/json';
      if (fmt === 'json') {
        content = JSON.stringify(rows, null, 2);
      } else {
        const headers = ['rsid', 'chromosome', 'position', 'genotype', 'gene', 'element_type', 'effect', 'evidence_level', 'priority_score', 'tissues', 'affected_tfs', 'linked_diseases'];
        content = [
          headers.join(','),
          ...rows.map((r: Record<string, unknown>) => headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')),
        ].join('\n');
        mime = 'text/csv';
      }
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `regulome_variants.${fmt}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  // ── Real mode: no data uploaded ───────────────────────────────────────────
  if (!isDemo && !hasUploadedData) {
    return (
      <div className="flex h-full min-h-[70vh] flex-col items-center justify-center">
        <GlassCard padding="xl" className="max-w-lg text-center">
          <UploadCloud size={48} className="mx-auto text-rg-purple-400 mb-6" />
          <h2 className="text-2xl font-bold text-rg-text-primary mb-3">No genome data yet</h2>
          <p className="text-rg-text-secondary leading-relaxed mb-8">Load a sample genome or upload your VCF / 23andMe file in Data Studio to populate the Variant Explorer with your real annotated variants.</p>
          <Button variant="primary" glow onClick={() => navigate('/app/data-studio')} iconRight={<ArrowRight size={16} />}>Go to Data Studio</Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <motion.div variants={stagger.container} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: 40, width: '100%' }}>
      <motion.div variants={stagger.item}>
        <HeroSection
          variants={filteredVariants}
          liveBookmarkCount={bookmarks.size}
          showBookmarkedOnly={showBookmarkedOnly}
          setShowBookmarkedOnly={setShowBookmarkedOnly}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          activeFilterCount={activeFilterCount}
          exporting={exporting}
          onExport={handleExport}
        />
      </motion.div>
      <motion.div variants={stagger.item}>
        <Input placeholder="Search by rsID, gene, chromosome, tissue, transcription factor, or disease..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} icon={<Search size={18} />}
          iconRight={searchQuery ? <button onClick={() => setSearchQuery('')} className="text-rg-text-muted hover:text-rg-text-primary transition-colors cursor-pointer"><X size={14} /></button> : undefined} />
      </motion.div>
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div style={{ borderRadius: 16, border: '1px solid rgba(56,78,122,0.3)', background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)', padding: 28, display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7d9c', marginBottom: 14 }}>Tissue</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{variantFilterOptions.tissues.map(t => <FilterPill key={t} label={t} active={selectedTissue === t} onClick={() => setSelectedTissue(t)} />)}</div>
              </div>
              <div style={{ height: 1, background: 'rgba(56,78,122,0.2)' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                <div><p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7d9c', marginBottom: 14 }}>Element Type</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{variantFilterOptions.elementTypes.map(el => <FilterPill key={el} label={el === 'All' ? 'All' : elementTypeLabels[el as RegulatoryElementType] || el} active={selectedElement === el} onClick={() => setSelectedElement(el)} />)}</div></div>
                <div><p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7d9c', marginBottom: 14 }}>Effect</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{variantFilterOptions.effects.map(ef => <FilterPill key={ef} label={ef === 'All' ? 'All' : ef.charAt(0).toUpperCase() + ef.slice(1)} active={selectedEffect === ef} onClick={() => setSelectedEffect(ef)} color={ef !== 'All' ? effectColors[ef] : undefined} />)}</div></div>
                <div><p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7d9c', marginBottom: 14 }}>Evidence Level</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{variantFilterOptions.evidenceLevels.map(lv => <FilterPill key={lv} label={lv === 'All' ? 'All' : lv.charAt(0).toUpperCase() + lv.slice(1)} active={selectedLevel === lv} onClick={() => setSelectedLevel(lv)} color={lv !== 'All' ? levelColors[lv as EvidenceLevel] : undefined} />)}</div></div>
              </div>
              <div style={{ height: 1, background: 'rgba(56,78,122,0.2)' }} />
              <div><p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7d9c', marginBottom: 14 }}>Linked Disease Domain</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{variantFilterOptions.diseaseLinks.map(d => <FilterPill key={d} label={d} active={selectedDisease === d} onClick={() => setSelectedDisease(d)} />)}</div></div>
              {activeFilterCount > 0 && (<div style={{ display: 'flex', justifyContent: 'flex-end' }}><Button variant="ghost" size="xs" onClick={clearFilters} icon={<X size={12} />}>Clear all filters</Button></div>)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div variants={stagger.item} className="mb-4"><p className="text-sm text-rg-text-secondary"><span className="font-medium text-rg-text-primary">{filteredVariants.length}</span> variants{activeFilterCount > 0 && <span className="text-rg-text-muted"> (filtered)</span>}</p></motion.div>
      <motion.div variants={stagger.item}>
        <div className="overflow-x-auto"><div style={{ minWidth: 760 }}>
          <div className="grid grid-cols-[40px_minmax(180px,1.5fr)_minmax(180px,1.2fr)_100px_80px_160px_100px_40px] gap-4 items-center px-6 py-2 border-b border-rg-border/50 mb-3">
            <span /><SortHeader label="Gene / Variant" field="gene" currentSort={sortField} currentDir={sortDir} onSort={handleSort} />
            <span className="text-[10px] uppercase tracking-wider font-semibold text-rg-text-muted">Tissue</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-rg-text-muted text-center">Element</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-rg-text-muted text-center">Effect</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-rg-text-muted">Evidence</span>
            <SortHeader label="Score" field="priorityScore" currentSort={sortField} currentDir={sortDir} onSort={handleSort} className="justify-end" /><span />
          </div>
          {filteredVariants.length > 0 ? (
            <div className="space-y-3">{filteredVariants.map((variant, i) => <VariantRow key={variant.id} variant={variant} index={i} onToggleBookmark={toggleBookmark} />)}</div>
          ) : (
            <GlassCard padding="xl" hover={false} animate={false}><div className="text-center py-20"><div className="text-4xl mb-5">🧬</div><h3 className="text-lg font-semibold text-rg-text-primary mb-3">No variants found</h3><p className="text-sm text-rg-text-secondary mb-6">Try adjusting your search query or filters.</p><Button variant="outline" size="sm" onClick={clearFilters}>Clear all filters</Button></div></GlassCard>
          )}
        </div></div>
      </motion.div>
    </motion.div>
  );
}

