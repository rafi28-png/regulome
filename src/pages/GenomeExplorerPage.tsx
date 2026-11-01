import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import {
  Globe,
  Dna,
  Layers,
  X,
  Atom,
} from 'lucide-react';
import {
  GlassCard, EvidenceBadge,
  ContentCardSkeleton, ChartSkeleton, StatCardSkeleton,
  ErrorState
} from '@/components/ui';
import { useRegulatoryProfile } from '@/hooks/useRegulatoryProfile';
import {
  elementTypeConfig,
  type ChromosomeInfo,
  type TADRegion,
  type RegulatoryAnnotation,
  type LocusDetail,
} from '@/data/genomeExplorerData';
import ChromosomeScene3D from '@/components/genome/ChromosomeScene3D';
import NuclearTerritoryScene, { type NuclearHoverInfo } from '@/components/genome/NuclearTerritoryScene';
import type { RegulatoryElementType } from '@/types';

/* =============================================
   ReguloMe — 3D Genome Explorer  (GOD-MODE v2)
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

// ── Compartment colors ──
const compartmentColors = {
  A: '#0ae8d2',
  B: '#8b5cf6',
};

/* ─────────────────────────────────────────────
   3D Scene imported from ChromosomeScene3D
   ───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   2D COMPONENTS
   ───────────────────────────────────────────── */

// ── God-Mode Hero Section ──
function HeroSection() {
  const { profile } = useRegulatoryProfile();
  const genomeExplorerStats = profile.genome3d.stats;
  const stats = [
    { label: 'Chromosomes', value: genomeExplorerStats.chromosomes, color: '#3b82f6' },
    { label: 'TAD Domains', value: genomeExplorerStats.totalTADs, color: '#0ae8d2' },
    { label: 'Reg. Elements', value: genomeExplorerStats.regulatoryElements, color: '#8b5cf6' },
    { label: 'Variants', value: genomeExplorerStats.variantsMapped.toLocaleString(), color: '#f59e0b' },
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
        animate={{ y: [0, -16, 0], x: [0, 8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: -50, right: 60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 65%)', filter: 'blur(45px)' }}
      />
      <motion.div
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        style={{ position: 'absolute', bottom: -30, left: 50, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,232,210,0.06) 0%, transparent 65%)', filter: 'blur(40px)' }}
      />
      <motion.div
        animate={{ y: [0, -10, 0], x: [0, -6, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        style={{ position: 'absolute', top: 40, left: '40%', width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 65%)', filter: 'blur(35px)' }}
      />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36 }}>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.15 }}
          style={{
            width: 60, height: 60, borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(10,232,210,0.15))',
            border: '1px solid rgba(59,130,246,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(59,130,246,0.08)',
          }}
        >
          <Globe size={28} color="#3b82f6" />
        </motion.div>
        <div>
          <h1 style={{
            fontSize: 42, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #e8edf5 30%, #8899b8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            3D Genome Explorer
          </h1>
          <p style={{ fontSize: 15, color: '#8899b8', marginTop: 8, maxWidth: 580 }}>
            Interactive chromosome visualization with TAD boundaries, regulatory element annotations, and locus-level deep-dive
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, position: 'relative' }}>
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

// ── Chromosome Selector ──
function ChromosomeSelector({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const { profile } = useRegulatoryProfile();
  const chromosomes = profile.genome3d.chromosomes;
  return (
    <GlassCard padding="lg" hover={false} animate={false}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Dna size={16} color="#3b82f6" />
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#e8edf5' }}>Chromosome Selector</h3>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {chromosomes.map((chr) => {
          const isActive = chr.id === selected;
          return (
            <motion.button
              key={chr.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(chr.id)}
              style={{
                width: 40, height: 40, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                border: `1px solid ${isActive ? chr.color + '50' : 'rgba(56,78,122,0.15)'}`,
                background: isActive ? chr.color + '18' : 'rgba(17,24,39,0.5)',
                color: isActive ? chr.color : '#8899b8',
                transition: 'all 0.2s',
                boxShadow: isActive ? `0 0 16px ${chr.color}15` : 'none',
              }}
            >
              {chr.label}
            </motion.button>
          );
        })}
      </div>
    </GlassCard>
  );
}

// ── TAD Browser Panel ──
function TADBrowser({
  tads,
  activeTadId,
  hoveredTadId,
  onClickTad,
  onHoverTad,
}: {
  tads: TADRegion[];
  activeTadId: string | null;
  hoveredTadId: string | null;
  onClickTad: (id: string) => void;
  onHoverTad: (id: string | null) => void;
}) {
  if (tads.length === 0) {
    return (
      <GlassCard padding="xl" hover={false} animate={false} className="text-center">
        <div style={{ fontSize: 32, marginBottom: 12 }}>🧬</div>
        <p style={{ fontSize: 14, color: '#8899b8' }}>
          No TAD regions annotated for this chromosome yet.
        </p>
        <p style={{ fontSize: 12, color: '#6b7d9c', marginTop: 6 }}>
          Select chromosome 1, 6, 17, or 19 for rich annotations.
        </p>
      </GlassCard>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {tads.map((tad, i) => {
        const isActive = activeTadId === tad.id;
        const isHovered = hoveredTadId === tad.id;

        return (
          <motion.div
            key={tad.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onClickTad(tad.id)}
            onMouseEnter={() => onHoverTad(tad.id)}
            onMouseLeave={() => onHoverTad(null)}
            style={{
              padding: '16px 18px', borderRadius: 16, cursor: 'pointer',
              background: isActive ? 'rgba(10,232,210,0.06)' : 'rgba(17,24,39,0.45)',
              border: `1px solid ${isActive ? compartmentColors[tad.compartment] + '35' : isHovered ? 'rgba(56,78,122,0.3)' : 'rgba(56,78,122,0.12)'}`,
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: compartmentColors[tad.compartment],
                boxShadow: `0 0 6px ${compartmentColors[tad.compartment]}50`,
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5', flex: 1, minWidth: 0 }}>
                {tad.label}
              </span>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                background: compartmentColors[tad.compartment] + '15',
                color: compartmentColors[tad.compartment],
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                {tad.compartment}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: '#6b7d9c' }}>
                <span style={{ fontFamily: 'monospace', color: '#8899b8' }}>{tad.startMb.toFixed(1)}</span>–
                <span style={{ fontFamily: 'monospace', color: '#8899b8' }}>{tad.endMb.toFixed(1)}</span> Mb
              </span>
              <span style={{ fontSize: 10, color: '#6b7d9c' }}>
                {tad.geneCount} genes
              </span>
              <span style={{ fontSize: 10, color: '#6b7d9c' }}>
                {tad.variantCount} variants
              </span>
            </div>

            {/* Insulation score bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 9, color: '#6b7d9c', fontWeight: 600, minWidth: 60 }}>Insulation</span>
              <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'rgba(10,14,26,0.5)', overflow: 'hidden' }}>
                <div style={{
                  width: `${tad.insulationScore * 100}%`, height: '100%', borderRadius: 999,
                  background: `linear-gradient(90deg, ${compartmentColors[tad.compartment]}, ${compartmentColors[tad.compartment]}80)`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: compartmentColors[tad.compartment], fontWeight: 700, minWidth: 30, textAlign: 'right' }}>
                {(tad.insulationScore * 100).toFixed(0)}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Locus Detail Panel ──
function LocusDetailPanel({
  locus,
  annotations,
  onClose,
}: {
  locus: LocusDetail | null;
  annotations: RegulatoryAnnotation[];
  onClose: () => void;
}) {
  const relatedAnnotations = annotations.filter((a) => locus && a.tadId === locus.tadId);

  const effectColors = {
    gain: '#0ae8d2',
    loss: '#ef4444',
    neutral: '#6b7d9c',
  };

  const expressionColors = {
    high: '#0ae8d2',
    moderate: '#f59e0b',
    low: '#ef4444',
  };

  return (
    <AnimatePresence>
      {locus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard padding="none" hover={false} animate={false}>
            <div style={{
              padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24,
              background: 'rgba(10,14,26,0.4)',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: 'linear-gradient(135deg, rgba(10,232,210,0.15), rgba(59,130,246,0.1))',
                    border: '1px solid rgba(10,232,210,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Dna size={20} color="#0ae8d2" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: '#e8edf5' }}>{locus.gene}</h3>
                    <p style={{ fontSize: 11, color: '#6b7d9c', fontFamily: 'monospace' }}>
                      {locus.chromosomeId.replace('chr', 'Chr ')}:{locus.positionMb.toFixed(1)} Mb
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <EvidenceBadge level={locus.evidenceLevel} />
                  <button
                    onClick={onClose}
                    style={{
                      width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(56,78,122,0.2)',
                      background: 'rgba(17,24,39,0.6)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: 'pointer', color: '#6b7d9c',
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <p style={{ fontSize: 13, color: '#c4cfdf', lineHeight: 1.7 }}>{locus.summary}</p>

              {/* Metadata grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div style={{ background: 'rgba(30,42,66,0.5)', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(56,78,122,0.15)' }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Expression</p>
                  <span style={{
                    fontSize: 13, fontWeight: 700, color: expressionColors[locus.expression],
                    textTransform: 'capitalize',
                  }}>
                    {locus.expression}
                  </span>
                </div>
                <div style={{ background: 'rgba(30,42,66,0.5)', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(56,78,122,0.15)' }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Tissues</p>
                  <p style={{ fontSize: 12, color: '#e8edf5', fontWeight: 600 }}>{locus.tissues.join(', ')}</p>
                </div>
                <div style={{ background: 'rgba(30,42,66,0.5)', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(56,78,122,0.15)' }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Pathways</p>
                  <p style={{ fontSize: 12, color: '#e8edf5', fontWeight: 600 }}>{locus.pathways.join(', ')}</p>
                </div>
              </div>

              {/* Variants */}
              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                  Associated Variants
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {locus.variants.map((v) => (
                    <div
                      key={v.rsId}
                      style={{
                        padding: '10px 16px', borderRadius: 12,
                        background: 'rgba(17,24,39,0.5)', border: '1px solid rgba(56,78,122,0.15)',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}
                    >
                      <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#0ae8d2' }}>{v.rsId}</span>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                        color: effectColors[v.effect],
                        background: effectColors[v.effect] + '15',
                        textTransform: 'uppercase',
                      }}>
                        {v.effect}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, fontFamily: 'monospace', color: '#e8edf5' }}>
                        {v.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regulatory Elements in this TAD */}
              {relatedAnnotations.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                    Regulatory Elements in Domain
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {relatedAnnotations.map((ann) => {
                      const config = elementTypeConfig[ann.elementType];
                      return (
                        <div
                          key={ann.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 12px', borderRadius: 10,
                            background: 'rgba(17,24,39,0.4)', border: '1px solid rgba(56,78,122,0.1)',
                          }}
                        >
                          <span style={{ color: config.color, fontSize: 12 }}>{config.icon}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: config.color, minWidth: 90 }}>{config.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#e8edf5' }}>{ann.gene}</span>
                          {ann.rsId && (
                            <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#6b7d9c' }}>{ann.rsId}</span>
                          )}
                          <span style={{ marginLeft: 'auto', fontSize: 10, color: '#6b7d9c' }}>{ann.tissue}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Element Type Legend ──
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ElementLegend() {
  const types = Object.entries(elementTypeConfig) as [RegulatoryElementType, typeof elementTypeConfig[RegulatoryElementType]][];

  return (
    <GlassCard padding="lg" hover={false} animate={false}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Layers size={14} color="#8b5cf6" />
        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5' }}>Element Legend</h4>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
        {types.map(([key, config]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
            <span style={{ color: config.color, fontSize: 14, width: 18, textAlign: 'center' }}>{config.icon}</span>
            <span style={{ fontSize: 11, color: '#8899b8', fontWeight: 500 }}>{config.label}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(56,78,122,0.15)' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Compartment</p>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: compartmentColors.A }} />
            <span style={{ fontSize: 11, color: '#8899b8' }}>A (Active)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: compartmentColors.B }} />
            <span style={{ fontSize: 11, color: '#8899b8' }}>B (Inactive)</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ── Chromosome Info Card ──
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ChromosomeInfoCard({ chromosome }: { chromosome: ChromosomeInfo }) {
  return (
    <GlassCard padding="lg" hover={false} animate={false}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Dna size={14} color="#3b82f6" />
        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5' }}>
          Chromosome {chromosome.label}
        </h4>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[
          { label: 'Size', value: `${chromosome.sizeMb} Mb`, color: '#e8edf5' },
          { label: 'Genes', value: chromosome.geneCount.toLocaleString(), color: '#3b82f6' },
          { label: 'Variants', value: chromosome.variantCount, color: '#f59e0b' },
          { label: 'TADs', value: chromosome.tadCount, color: '#0ae8d2' },
          { label: 'Reg. Density', value: `${chromosome.regulatoryDensity}/Mb`, color: '#8b5cf6' },
        ].map((item) => (
          <div key={item.label} style={{
            padding: '12px 14px', borderRadius: 12,
            background: 'rgba(10,14,26,0.4)', border: '1px solid rgba(56,78,122,0.1)',
          }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{item.label}</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: item.color as string, lineHeight: 1 }}>{item.value}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ──────────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────────── */

export default function GenomeExplorerPage() {
  const { profile, isLoading, error, refresh } = useRegulatoryProfile();
  const { chromosomes, tadRegions, regulatoryAnnotations, locusDetails } = profile.genome3d;
  const [selectedChromosome, setSelectedChromosome] = useState('chr1');
  const [activeTadId, setActiveTadId] = useState<string | null>(null);
  const [hoveredTadId, setHoveredTadId] = useState<string | null>(null);
  const [zoomAction, setZoomAction] = useState<{ type: 'in' | 'out' | 'fit' | 'none'; ts: number }>({ type: 'none', ts: 0 });
  const [viewMode, setViewMode] = useState<'chromosome' | 'nucleus'>('chromosome');
  const [nucleusHover, setNucleusHover] = useState<NuclearHoverInfo>(null);

  const currentChromosome = useMemo(
    () => chromosomes.find((c) => c.id === selectedChromosome) || chromosomes[0],
    [chromosomes, selectedChromosome]
  );

  const currentTads = useMemo(
    () => tadRegions.filter((t) => t.chromosomeId === selectedChromosome),
    [tadRegions, selectedChromosome]
  );

  const currentAnnotations = useMemo(
    () => regulatoryAnnotations.filter((a) => a.chromosomeId === selectedChromosome),
    [regulatoryAnnotations, selectedChromosome]
  );

  const activeLocus = useMemo(() => {
    if (!activeTadId) return null;
    return locusDetails.find((l) => l.tadId === activeTadId) || null;
  }, [locusDetails, activeTadId]);

  const activeTad = useMemo(() => {
    if (!activeTadId) return null;
    return tadRegions.find((t) => t.id === activeTadId) || null;
  }, [tadRegions, activeTadId]);

  const handleSelectChromosome = useCallback((id: string) => {
    setSelectedChromosome(id);
    setActiveTadId(null);
    setHoveredTadId(null);
    setViewMode('chromosome'); // fly from nucleus into chromosome
  }, []);

  const handleClickTad = useCallback((id: string) => {
    setActiveTadId((prev) => (prev === id ? null : id));
  }, []);

  const handleHoverTad = useCallback((id: string | null) => {
    setHoveredTadId(id);
  }, []);

  if (isLoading) {
    return (
       <div style={{ display: 'flex', flexDirection: 'column', gap: 40, width: '100%' }}>
        <ContentCardSkeleton />
        <GlassCard padding="xl"><ChartSkeleton height="60px" /></GlassCard>
        <GlassCard padding="xl"><ChartSkeleton height="600px" /></GlassCard>
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
        <HeroSection />
      </motion.div>

      {/* ── Chromosome Selector ── */}
      <motion.div variants={stagger.item}>
        <ChromosomeSelector
          selected={selectedChromosome}
          onSelect={handleSelectChromosome}
        />
      </motion.div>

      {/* ── Immersive 3D Viewer (full-width + HUD panels) ── */}
      {(() => {
        // Compute camera target Y position for active TAD
        const cameraTargetY = activeTad
          ? ((((activeTad.startMb + activeTad.endMb) / 2) / currentChromosome.sizeMb) - 0.5) * 5.2
          : null;

        return (
          <motion.div variants={stagger.item} style={{ position: 'relative', width: '100%', height: 780, borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(56,78,122,0.2)' }}>

            {/* ─ Full-width Canvas ─ */}
            <Canvas
              camera={viewMode === 'nucleus'
                ? { position: [0, 0, 7] as [number,number,number], fov: 50 }
                : { position: [3, 0.8, 3] as [number,number,number], fov: 38 }}
              style={{ position: 'absolute', inset: 0, background: '#050810' }}
              gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
              dpr={[1, 2]}
            >
              <fog attach="fog" args={['#050810', viewMode === 'nucleus' ? 9 : 6, viewMode === 'nucleus' ? 20 : 14]} />
              {viewMode === 'nucleus' ? (
                <NuclearTerritoryScene
                  chromosomes={chromosomes}
                  onSelectChromosome={handleSelectChromosome}
                  onHoverChange={setNucleusHover}
                />
              ) : (
                <ChromosomeScene3D
                  chromosome={currentChromosome}
                  tads={currentTads}
                  annotations={currentAnnotations}
                  activeTadId={activeTadId}
                  hoveredTadId={hoveredTadId}
                  onHoverTad={handleHoverTad}
                  onClickTad={handleClickTad}
                  cameraTargetY={cameraTargetY}
                  zoomAction={zoomAction}
                />
              )}
            </Canvas>

            {/* ─ Nuclear Hover Tooltip — rendered OUTSIDE Canvas as proper HTML ─ */}
            {viewMode === 'nucleus' && nucleusHover && (() => {
              const { chr, screenX, screenY } = nucleusHover;
              return (
                <div style={{
                  position: 'absolute',
                  left: Math.min(screenX + 16, window.innerWidth - 220),
                  top: Math.max(screenY - 72, 8),
                  zIndex: 50,
                  pointerEvents: 'none',
                  background: 'rgba(5,8,16,0.96)',
                  border: `1px solid ${chr.color}55`,
                  borderRadius: 14,
                  padding: '12px 16px',
                  backdropFilter: 'blur(24px)',
                  boxShadow: `0 0 28px ${chr.color}22, 0 8px 32px rgba(0,0,0,0.75)`,
                  minWidth: 192,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: chr.color, boxShadow: `0 0 10px ${chr.color}`, flexShrink: 0 }} />
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#e8edf5', letterSpacing: '-0.02em' }}>Chr {chr.label}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: chr.color, background: `${chr.color}18`, padding: '2px 7px', borderRadius: 6, border: `1px solid ${chr.color}30`, marginLeft: 'auto', letterSpacing: '0.05em' }}>
                      {chr.regulatoryDensity > 15 ? 'A+ ACTIVE' : chr.regulatoryDensity > 10 ? 'A ACTIVE' : 'B INACTIVE'}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px', marginBottom: 8 }}>
                    {[
                      { label: 'Size',     value: `${chr.sizeMb} Mb`,            color: '#c3cedf' },
                      { label: 'Genes',    value: chr.geneCount.toLocaleString(), color: '#0ae8d2' },
                      { label: 'Variants', value: String(chr.variantCount),       color: '#f59e0b' },
                      { label: 'TADs',     value: String(chr.tadCount),           color: '#8b5cf6' },
                      { label: 'Density',  value: `${chr.regulatoryDensity}/Mb`, color: '#10b981' },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <div style={{ fontSize: 9, color: '#4b5a73', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 1 }}>{label}</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ paddingTop: 8, borderTop: `1px solid ${chr.color}20`, fontSize: 10, color: '#6b7d9c', fontWeight: 600, display: 'flex', gap: 5 }}>
                    <span>👆</span><span>Click to explore chromosome in 3D</span>
                  </div>
                </div>
              );
            })()}

            {/* ─ HUD: Top-Left — chromosome label + active TAD badge + Nuclear Toggle ─ */}
            <div style={{ position: 'absolute', top: 20, left: 24, zIndex: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                fontSize: 15, fontWeight: 800, color: '#e8edf5', letterSpacing: '0.02em',
                background: 'rgba(5,8,16,0.85)', padding: '10px 20px', borderRadius: 12,
                border: '1px solid rgba(56,78,122,0.3)', backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                {viewMode === 'nucleus' ? (
                  <>
                    <Atom size={16} color="#0ae8d2" />
                    <span style={{ color: '#8899b8', fontWeight: 600, fontSize: 12 }}>NUCLEAR</span>
                    <span style={{ fontSize: 18, fontWeight: 900, lineHeight: 1 }}>Territory View</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#0ae8d2', background: 'rgba(10,232,210,0.12)', padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(10,232,210,0.3)' }}>
                      Click any chromosome ↗
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: currentChromosome.color, boxShadow: `0 0 10px ${currentChromosome.color}`, flexShrink: 0 }} />
                    <span style={{ color: '#8899b8', fontWeight: 600, fontSize: 12 }}>CHR</span>
                    <span style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{currentChromosome.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: currentChromosome.color, background: `${currentChromosome.color}18`, padding: '3px 10px', borderRadius: 20, border: `1px solid ${currentChromosome.color}35` }}>
                      {currentChromosome.sizeMb} Mb
                    </span>
                  </>
                )}
              </div>

              {/* Nuclear / Chromosome toggle */}
              <button
                onClick={() => setViewMode(v => v === 'nucleus' ? 'chromosome' : 'nucleus')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px', borderRadius: 12, cursor: 'pointer',
                  background: viewMode === 'nucleus'
                    ? 'linear-gradient(135deg, rgba(10,232,210,0.2), rgba(139,92,246,0.15))'
                    : 'rgba(5,8,16,0.85)',
                  border: viewMode === 'nucleus'
                    ? '1px solid rgba(10,232,210,0.4)'
                    : '1px solid rgba(56,78,122,0.3)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: viewMode === 'nucleus' ? '0 0 24px rgba(10,232,210,0.15)' : '0 8px 32px rgba(0,0,0,0.4)',
                  color: viewMode === 'nucleus' ? '#0ae8d2' : '#8899b8',
                  fontSize: 12, fontWeight: 700,
                  transition: 'all 0.3s',
                }}
              >
                <Atom size={14} />
                {viewMode === 'nucleus' ? 'Chromosome View' : '🌐 Nuclear View'}
              </button>

              {viewMode === 'chromosome' && activeTad && (
                <div style={{
                  fontSize: 12, fontWeight: 700,
                  color: compartmentColors[activeTad.compartment],
                  background: 'rgba(5,8,16,0.85)', padding: '10px 18px', borderRadius: 12,
                  border: `1px solid ${compartmentColors[activeTad.compartment]}40`,
                  backdropFilter: 'blur(16px)',
                  boxShadow: `0 0 24px ${compartmentColors[activeTad.compartment]}18`,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: compartmentColors[activeTad.compartment], boxShadow: `0 0 8px ${compartmentColors[activeTad.compartment]}` }} />
                  {activeTad.label}
                </div>
              )}
            </div>

            {/* ─ HUD: Top-Right — Chromosome Info + live stats (chromosome mode only) ─ */}
            {viewMode === 'chromosome' && (
            <div style={{ position: 'absolute', top: 20, right: 24, zIndex: 20, width: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                background: 'rgba(5,8,16,0.88)', borderRadius: 14,
                border: '1px solid rgba(56,78,122,0.25)', backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)', padding: '16px 20px',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Chromosome {currentChromosome.label}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                  {[
                    { label: 'Size', value: `${currentChromosome.sizeMb} Mb`, color: '#e8edf5' },
                    { label: 'Genes', value: currentChromosome.geneCount.toLocaleString(), color: '#0ae8d2' },
                    { label: 'Variants', value: currentChromosome.variantCount, color: '#f59e0b' },
                    { label: 'TADs', value: currentChromosome.tadCount, color: '#8b5cf6' },
                    { label: 'Reg. Elements', value: currentAnnotations.length, color: '#10b981' },
                    { label: 'Density', value: `${currentChromosome.regulatoryDensity}/Mb`, color: '#0ae8d2' },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div style={{ fontSize: 10, color: '#4a5568', fontWeight: 600, marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
              {[{ label: 'Active TADs', value: currentTads.length, color: '#0ae8d2' }, { label: 'Annotations', value: currentAnnotations.length, color: '#8b5cf6' }].map(s => (
                <div key={s.label} style={{
                  background: 'rgba(5,8,16,0.85)', borderRadius: 10,
                  border: '1px solid rgba(56,78,122,0.2)', backdropFilter: 'blur(16px)',
                  padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 11, color: '#6b7d9c', fontWeight: 600 }}>{s.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
            )}

            {/* ─ HUD: Bottom-Right — Element Legend (chromosome mode only) ─ */}
            {viewMode === 'chromosome' && (
            <div style={{ position: 'absolute', bottom: 60, right: 24, zIndex: 20, width: 270 }}>
              <div style={{
                background: 'rgba(5,8,16,0.92)', borderRadius: 14,
                border: '1px solid rgba(56,78,122,0.3)', backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)', padding: '16px 18px',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#8b5cf6', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Regulatory Elements</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px 14px' }}>
                  {Object.entries(elementTypeConfig).map(([key, cfg]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: cfg.color, boxShadow: `0 0 8px ${cfg.color}80`, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: '#b0c0d8', fontWeight: 600 }}>{cfg.label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(56,78,122,0.25)', display: 'flex', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 14, height: 5, borderRadius: 3, background: '#0ae8d2', boxShadow: '0 0 6px #0ae8d280' }} />
                    <span style={{ fontSize: 10, color: '#8899b8', fontWeight: 600 }}>Active (A)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 14, height: 5, borderRadius: 3, background: '#8b5cf6', boxShadow: '0 0 6px #8b5cf680' }} />
                    <span style={{ fontSize: 10, color: '#8899b8', fontWeight: 600 }}>Inactive (B)</span>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* ─ HUD: Bottom-Left — Zoom Controls (chromosome mode only) ─ */}
            {viewMode === 'chromosome' && (
            <div style={{
              position: 'absolute', bottom: 20, left: 24, zIndex: 20,
              display: 'flex', alignItems: 'center', gap: 0,
              background: 'rgba(5,8,16,0.88)', borderRadius: 12,
              border: '1px solid rgba(56,78,122,0.3)', backdropFilter: 'blur(16px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)', overflow: 'hidden',
            }}>
              <button onClick={() => setZoomAction({ type: 'in', ts: Date.now() })} style={{ width: 36, height: 36, border: 'none', cursor: 'pointer', background: 'transparent', color: '#e8edf5', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(56,78,122,0.25)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} title="Zoom In">+</button>
              <div style={{ width: 1, height: 20, background: 'rgba(56,78,122,0.3)' }} />
              <button onClick={() => setZoomAction({ type: 'fit', ts: Date.now() })} style={{ width: 36, height: 36, border: 'none', cursor: 'pointer', background: 'transparent', color: '#6b7d9c', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', letterSpacing: '0.05em' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(56,78,122,0.25)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} title="Reset Zoom">FIT</button>
              <div style={{ width: 1, height: 20, background: 'rgba(56,78,122,0.3)' }} />
              <button onClick={() => setZoomAction({ type: 'out', ts: Date.now() })} style={{ width: 36, height: 36, border: 'none', cursor: 'pointer', background: 'transparent', color: '#e8edf5', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(56,78,122,0.25)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} title="Zoom Out">−</button>
            </div>
            )}

            {/* ─ HUD: Bottom-Center — controls hint ─ */}
            <div style={{
              position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 20,
              fontSize: 10, color: '#4a5568', fontWeight: 600,
              background: 'rgba(5,8,16,0.8)', padding: '8px 20px', borderRadius: 20,
              border: '1px solid rgba(56,78,122,0.15)', backdropFilter: 'blur(12px)',
              display: 'flex', gap: 16, whiteSpace: 'nowrap',
            }}>
              {viewMode === 'nucleus' ? (
                <><span>🖱 Drag · rotate nucleus</span><span style={{ color: 'rgba(56,78,122,0.3)' }}>|</span><span>⚡ Scroll · zoom</span><span style={{ color: 'rgba(56,78,122,0.3)' }}>|</span><span>👆 Click chromosome · fly in</span></>
              ) : (
                <><span>🖱 Drag · rotate</span><span style={{ color: 'rgba(56,78,122,0.3)' }}>|</span><span>⚡ Scroll · zoom</span><span style={{ color: 'rgba(56,78,122,0.3)' }}>|</span><span>👆 Click TAD · camera zooms to region</span></>
              )}
            </div>

            {/* ─ HUD: Animated gradient border (top edge) ─ */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2, zIndex: 25,
              background: `linear-gradient(90deg, transparent, ${currentChromosome.color}, #8b5cf6, ${currentChromosome.color}, transparent)`,
              opacity: 0.7,
            }} />
          </motion.div>
        );
      })()}

      {/* ── TAD Browser ── */}
      <motion.div variants={stagger.item}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Layers size={18} color="#0ae8d2" />
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#e8edf5' }}>TAD Domains</h3>
          <span style={{ fontSize: 12, color: '#6b7d9c', fontWeight: 600 }}>
            — {currentTads.length} domains on Chr {currentChromosome.label}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <TADBrowser
            tads={currentTads.filter((_, i) => i % 2 === 0)}
            activeTadId={activeTadId}
            hoveredTadId={hoveredTadId}
            onClickTad={handleClickTad}
            onHoverTad={handleHoverTad}
          />
          <TADBrowser
            tads={currentTads.filter((_, i) => i % 2 === 1)}
            activeTadId={activeTadId}
            hoveredTadId={hoveredTadId}
            onClickTad={handleClickTad}
            onHoverTad={handleHoverTad}
          />
        </div>
      </motion.div>

      {/* ── Locus Detail ── */}
      <motion.div variants={stagger.item}>
        {activeLocus ? (
          <LocusDetailPanel
            locus={activeLocus}
            annotations={currentAnnotations}
            onClose={() => setActiveTadId(null)}
          />
        ) : activeTadId && activeTad ? (
          <GlassCard padding="xl" hover={false} animate={false}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🔬</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e8edf5', marginBottom: 6 }}>{activeTad.label}</h3>
              <p style={{ fontSize: 13, color: '#8899b8', lineHeight: 1.6, maxWidth: 540, margin: '0 auto' }}>
                {activeTad.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16 }}>
                <span style={{ fontSize: 12, color: '#6b7d9c' }}>
                  <span style={{ fontWeight: 700, color: '#e8edf5' }}>{activeTad.geneCount}</span> genes
                </span>
                <span style={{ fontSize: 12, color: '#6b7d9c' }}>
                  <span style={{ fontWeight: 700, color: '#e8edf5' }}>{activeTad.variantCount}</span> variants
                </span>
                <span style={{ fontSize: 12, color: '#6b7d9c' }}>
                  Insulation: <span style={{ fontWeight: 700, color: compartmentColors[activeTad.compartment] }}>{(activeTad.insulationScore * 100).toFixed(0)}%</span>
                </span>
              </div>
            </div>
          </GlassCard>
        ) : (
          <GlassCard padding="xl" hover={false} animate={false} className="text-center">
            <div style={{ fontSize: 28, marginBottom: 12 }}>👆</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e8edf5', marginBottom: 6 }}>Select a TAD Domain</h3>
            <p style={{ fontSize: 13, color: '#8899b8' }}>
              Click on a TAD segment in the 3D viewer or the browser above to view locus details
            </p>
          </GlassCard>
        )}
      </motion.div>
    </motion.div>
  );
}
