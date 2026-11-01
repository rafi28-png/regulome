import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowRight,
  Dna,
  BarChart3,
  BookOpen,
  Activity,
  X,
  HeartPulse,
  Clock,
  FlaskConical,
  Network,
  Target,
  UploadCloud,
  Atom,
  MapPin,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useRegulatoryProfile } from '@/hooks/useRegulatoryProfile';

interface Command {
  id: string;
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
  keywords: string[];
}

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useApp();
  const { profile } = useRegulatoryProfile();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const close = useCallback(() => {
    setCommandPaletteOpen(false);
    setQuery('');
    setActiveIndex(0);
  }, [setCommandPaletteOpen]);

  useEffect(() => {
    if (!commandPaletteOpen) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [commandPaletteOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }

      if (e.key === 'Escape') close();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [close, commandPaletteOpen, setCommandPaletteOpen]);

  const allCommands = useMemo<Command[]>(() => {
    const pages: Command[] = [
      {
        id: 'data-studio',
        label: 'Data Studio',
        subtitle: 'Load sample genomes, pick variants, or upload VCF / 23andMe files',
        icon: <UploadCloud size={16} />,
        action: () => { navigate('/app/data-studio'); close(); },
        category: 'Pages',
        keywords: ['data', 'studio', 'upload', 'vcf', '23andme', 'sample', 'genome'],
      },
      {
        id: 'dashboard',
        label: 'Dashboard',
        subtitle: 'Overview and key regulatory metrics',
        icon: <Activity size={16} />,
        action: () => { navigate('/app/dashboard'); close(); },
        category: 'Pages',
        keywords: ['dashboard', 'home', 'overview', 'metrics'],
      },
      {
        id: 'variants',
        label: 'Variant Explorer',
        subtitle: `Browse ${profile.variants.length} active regulatory variants`,
        icon: <Dna size={16} />,
        action: () => { navigate('/app/variants'); close(); },
        category: 'Pages',
        keywords: ['variant', 'explorer', 'snp', 'regulatory', 'genome'],
      },
      {
        id: 'expression',
        label: 'Gene Expression Landscape',
        subtitle: 'Expression patterns across 10 tissues',
        icon: <BarChart3 size={16} />,
        action: () => { navigate('/app/expression'); close(); },
        category: 'Pages',
        keywords: ['gene', 'expression', 'rna', 'tissue', 'landscape'],
      },
      {
        id: 'genome-3d',
        label: '3D Genome Explorer',
        subtitle: 'Interactive 3D nuclear territory and TAD chromatin loops',
        icon: <Atom size={16} />,
        action: () => { navigate('/app/genome-3d'); close(); },
        category: 'Pages',
        keywords: ['3d', 'genome', 'tad', 'chromosome', 'nucleus', 'chromatin'],
      },
      {
        id: 'network',
        label: 'Regulatory Network Atlas',
        subtitle: 'Force-directed Variant → TF → Gene → Pathway → Disease graph',
        icon: <Network size={16} />,
        action: () => { navigate('/app/network'); close(); },
        category: 'Pages',
        keywords: ['network', 'atlas', 'graph', 'regulatory'],
      },
      {
        id: 'hotspots',
        label: 'Hotspot Atlas',
        subtitle: 'Chromosomal and tissue regulatory variant density',
        icon: <MapPin size={16} />,
        action: () => { navigate('/app/hotspots'); close(); },
        category: 'Pages',
        keywords: ['hotspot', 'atlas', 'density', 'chromosome'],
      },
      {
        id: 'diseases',
        label: 'Disease & Systems Hub',
        subtitle: 'Cross-domain disease burden and risk variants',
        icon: <HeartPulse size={16} />,
        action: () => { navigate('/app/diseases'); close(); },
        category: 'Pages',
        keywords: ['disease', 'hub', 'system', 'biology', 'pathway'],
      },
      {
        id: 'epigenetic',
        label: 'Epigenetic Clock',
        subtitle: 'Biological vs chronological age across 5 clocks',
        icon: <Clock size={16} />,
        action: () => { navigate('/app/epigenetic-clock'); close(); },
        category: 'Pages',
        keywords: ['epigenetic', 'clock', 'age', 'methylation'],
      },
      {
        id: 'optimization',
        label: 'Self-Optimization Studio',
        subtitle: 'Genotype-tailored lifestyle and supplement protocols',
        icon: <Target size={16} />,
        action: () => { navigate('/app/optimization'); close(); },
        category: 'Pages',
        keywords: ['optimization', 'lifestyle', 'tune', 'improve', 'protocol'],
      },
      {
        id: 'simulator',
        label: 'Regulatory Twin Simulator',
        subtitle: 'What-if lifestyle intervention modeling',
        icon: <FlaskConical size={16} />,
        action: () => { navigate('/app/simulator'); close(); },
        category: 'Pages',
        keywords: ['simulator', 'twin', 'scenario', 'model'],
      },
      {
        id: 'workbench',
        label: 'Research Workbench',
        subtitle: 'Live Ensembl, ClinVar, GTEx & Open Targets lookup',
        icon: <Search size={16} />,
        action: () => { navigate('/app/workbench'); close(); },
        category: 'Pages',
        keywords: ['workbench', 'research', 'ensembl', 'clinvar', 'gtex', 'lookup'],
      },
      {
        id: 'evidence',
        label: 'Evidence Studio',
        subtitle: 'Provenance, confidence levels, and literature sources',
        icon: <BookOpen size={16} />,
        action: () => { navigate('/app/evidence'); close(); },
        category: 'Pages',
        keywords: ['evidence', 'studio', 'confidence', 'publication', 'source'],
      },
      {
        id: 'reports',
        label: 'Report Center',
        subtitle: 'Export JSON and text genomic reports',
        icon: <FileText size={16} />,
        action: () => { navigate('/app/reports'); close(); },
        category: 'Pages',
        keywords: ['report', 'export', 'download', 'json'],
      },
    ];

    const variantCmds: Command[] = profile.variants.slice(0, 16).map((v) => ({
      id: `var-${v.id}`,
      label: `${v.rsId} (${v.gene})`,
      subtitle: `${v.chromosome}:${v.position.toLocaleString()} · ${v.tissues[0] || 'Regulatory'} · ${v.elementType} · ${v.effect.toUpperCase()}`,
      icon: <Dna size={16} style={{ color: v.effect === 'gain' ? '#0ae8d2' : '#8b5cf6' }} />,
      action: () => { navigate(`/app/variants/${v.id}`); close(); },
      category: 'Active Variants',
      keywords: [v.rsId.toLowerCase(), v.gene.toLowerCase(), v.chromosome.toLowerCase(), ...v.tissues.map(t => t.toLowerCase())],
    }));

    const geneCmds: Command[] = profile.expression.geneSummaries.slice(0, 12).map((g) => ({
      id: `gene-${g.gene}`,
      label: `${g.gene} — ${g.fullName}`,
      subtitle: `Chr ${g.chromosome} · Top tissue: ${g.topTissue} · Max deviation: ${g.maxDeviation > 0 ? '+' : ''}${g.maxDeviation}%`,
      icon: <BarChart3 size={16} style={{ color: '#a78bfa' }} />,
      action: () => { navigate(`/app/workbench?q=${encodeURIComponent(g.gene)}`); close(); },
      category: 'Genes (Live Workbench)',
      keywords: [g.gene.toLowerCase(), g.fullName.toLowerCase(), g.topTissue.toLowerCase()],
    }));

    return [...pages, ...variantCmds, ...geneCmds];
  }, [close, navigate, profile.variants, profile.expression.geneSummaries]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allCommands;

    const q = query.toLowerCase();
    return allCommands.filter(
      (command) =>
        command.label.toLowerCase().includes(q) ||
        command.subtitle?.toLowerCase().includes(q) ||
        command.keywords.some((keyword) => keyword.includes(q))
    );
  }, [allCommands, query]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, Command[]>>((acc, command) => {
      if (!acc[command.category]) acc[command.category] = [];
      acc[command.category].push(command);
      return acc;
    }, {});
  }, [filtered]);

  const flattened = useMemo(() => Object.values(grouped).flat(), [grouped]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, flattened.length - 1));
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }

    if (e.key === 'Enter' && flattened[activeIndex]) {
      flattened[activeIndex].action();
    }

    if (e.key === 'Escape') close();
  };

  let runningIndex = -1;

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md"
            onClick={close}
          />

          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed left-1/2 top-[10vh] z-[60] w-[min(680px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-lg border border-rg-border bg-rg-bg-card/95 shadow-elevated backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-rg-border px-4 py-3">
              <div className="flex items-center gap-3">
                <Search size={16} className="text-rg-text-muted" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={handleKey}
                  placeholder="Search genes, variants, pathways, and pages..."
                  className="flex-1 bg-transparent text-sm text-rg-text-primary outline-none placeholder:text-rg-text-muted"
                />
                <button
                  type="button"
                  onClick={close}
                  className="rounded-md p-1 text-rg-text-muted transition-colors hover:bg-rg-bg-hover hover:text-rg-text-primary"
                  aria-label="Close command palette"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-3 py-3">
              {flattened.length === 0 ? (
                <div className="rounded-lg border border-rg-border bg-rg-bg-primary/35 px-4 py-6 text-center">
                  <p className="text-sm font-semibold text-rg-text-primary">No matches found</p>
                  <p className="mt-1 text-xs text-rg-text-muted">Try a gene, pathway, page name, or rsID.</p>
                </div>
              ) : (
                Object.entries(grouped).map(([category, commands]) => (
                  <div key={category} className="mb-4 last:mb-0">
                    <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-rg-text-muted">
                      {category}
                    </p>

                    <div className="space-y-1">
                      {commands.map((command) => {
                        runningIndex += 1;
                        const active = runningIndex === activeIndex;

                        return (
                          <button
                            key={command.id}
                            type="button"
                            onMouseEnter={() => setActiveIndex(runningIndex)}
                            onClick={command.action}
                            className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-all ${
                              active
                                ? 'border-rg-teal-500/30 bg-rg-teal-500/10 text-rg-text-primary'
                                : 'border-transparent text-rg-text-secondary hover:border-rg-border hover:bg-rg-bg-primary/35 hover:text-rg-text-primary'
                            }`}
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-rg-border-light bg-rg-bg-primary/35 text-rg-teal-300">
                              {command.icon}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-inherit">{command.label}</span>
                              {command.subtitle && (
                                <span className="mt-0.5 block truncate text-xs text-rg-text-muted">
                                  {command.subtitle}
                                </span>
                              )}
                            </span>

                            <ArrowRight size={14} className={active ? 'text-rg-teal-300' : 'text-rg-text-muted'} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
