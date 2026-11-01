import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  Database,
  Activity,
  Terminal,
  AlertCircle,
  Dna,
  Lock,
  CheckCircle2,
  XCircle,
  Download,
  Sparkles,
  Sliders,
  HelpCircle,
  Trash2,
} from 'lucide-react';
import { Button, GlassCard } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { AUTH_TOKEN_STORAGE_KEY, readStorageItem } from '@/lib/storage';
import {
  parseGenomicFileContent,
  annotateVariantsLive,
  buildRegulatoryProfile,
  KNOWN_RSID_CATALOG,
  SAMPLE_GENOME_PRESETS,
  buildVcfFromRsIds,
  type RawGenomicVariant,
} from '@/lib/regulatoryEngine';
import { saveUploadedGenomicVariants } from '@/hooks/useRegulatoryProfile';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ── Pipeline display steps ──
const DISPLAY_STEPS = [
  { label: 'Initializing ReguloMe analysis core...', color: '#8899b8', dur: 300 },
  { label: 'Validating genome file format (VCF v4.2 / 23andMe / AncestryDNA)...', color: '#0ae8d2', dur: 300 },
  { label: 'Parsing verified genetic variants & GRCh38 coordinates...', color: '#0ae8d2', dur: 450 },
  { label: 'Querying ClinVar, dbSNP, CADD & gnomAD (MyVariant.info v1)...', color: '#a78bfa', dur: 600 },
  { label: 'Cross-referencing Ensembl VEP & JASPAR 2024 TF PWM motifs...', color: '#a78bfa', dur: 550 },
  { label: 'Mapping GTEx v10 tissue expression & 3D chromosome TADs...', color: '#f59e0b', dur: 500 },
  { label: 'Scoring Open Targets disease domains & Epigenetic Clock...', color: '#ec4899', dur: 450 },
  { label: 'Compiling 5-layer personalized regulatory twin...', color: '#10b981', dur: 350 },
];

interface LogLine {
  text: string;
  color: string;
  bold?: boolean;
}

type StudioTab = 'builder' | 'presets' | 'upload';

const CURATED_BUILDER_VARIANTS = [
  { rsId: 'rs2802292', label: 'FOXO3 Longevity Enhancer', tag: 'Protective · Longevity', color: '#10b981' },
  { rsId: 'rs8192678', label: 'PPARGC1A Mitochondrial Biogenesis', tag: 'Protective · Endurance', color: '#10b981' },
  { rsId: 'rs1815739', label: 'ACTN3 Fast-Twitch Muscle Fiber', tag: 'Athletic · Muscle', color: '#14b8a6' },
  { rsId: 'rs7412', label: 'APOE ε2 Neuro-Protective Allele', tag: 'Protective · Brain', color: '#10b981' },
  { rsId: 'rs4988235', label: 'MCM6 / LCT Lactase Enhancer', tag: 'Metabolic · Gut', color: '#0ae8d2' },
  { rsId: 'rs1800795', label: 'IL-6 -174G>C Promoter', tag: 'Inflammatory · Immune', color: '#f59e0b' },
  { rsId: 'rs1800629', label: 'TNF-α -308G>A Promoter', tag: 'Inflammatory · Cytokine', color: '#f59e0b' },
  { rsId: 'rs4680', label: 'COMT Val158Met Catecholamine', tag: 'Neuro · Stress Response', color: '#8b5cf6' },
  { rsId: 'rs1801133', label: 'MTHFR C677T Folate Methylation', tag: 'Epigenetic · Methylation', color: '#a78bfa' },
  { rsId: 'rs7903146', label: 'TCF7L2 Pancreatic Islet Enhancer', tag: 'Metabolic · Glucose', color: '#eab308' },
  { rsId: 'rs12740374', label: 'SORT1 Hepatic C/EBPα TFBS', tag: 'Hepatic · Lipid', color: '#ef4444' },
  { rsId: 'rs429358', label: 'APOE ε4 Lipid / Glial Enhancer', tag: 'Cardio · Neuro Risk', color: '#ef4444' },
  { rsId: 'rs1042522', label: 'TP53 DNA Repair Checkpoint', tag: 'Cellular · Longevity', color: '#ec4899' },
  { rsId: 'rs9939609', label: 'FTO IRX3/IRX5 Thermogenesis', tag: 'Metabolic · Adipose', color: '#f97316' },
];

export default function DataStudioPage() {
  const navigate = useNavigate();
  const { mode, setMode, setHasUploadedData, hasUploadedData, clearUploadedData } = useApp();

  const [activeTab, setActiveTab] = useState<StudioTab>('presets');
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewVariants, setPreviewVariants] = useState<RawGenomicVariant[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Interactive Variant Builder state
  const [selectedRsIds, setSelectedRsIds] = useState<string[]>([
    'rs2802292',
    'rs8192678',
    'rs1815739',
    'rs7412',
    'rs4988235',
  ]);
  const [customRsInput, setCustomRsInput] = useState('');

  const logsEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = useCallback((text: string, color = '#6bffcc', bold = false) => {
    setLogs((prev) => [...prev, { text, color, bold }]);
  }, []);

  // Immediately inspect any selected/dropped file and reject invalid files!
  const inspectAndSelectFile = async (candidate: File) => {
    setError(null);
    try {
      const rawText = await candidate.text();
      const parsed = parseGenomicFileContent(rawText);
      if (parsed.length === 0) {
        setFile(null);
        setPreviewVariants([]);
        setError(
          `Invalid genome file: "${candidate.name}" contains 0 valid DNA variants. A random text file (such as a name or notes) cannot be analyzed. Please upload a real VCF (.vcf) or 23andMe/AncestryDNA (.txt) file containing chromosome coordinates and rsIDs, or use Tab 1 / Tab 2 above to download or build a real variant panel.`
        );
        return;
      }
      setFile(candidate);
      setPreviewVariants(parsed);
    } catch {
      setFile(null);
      setPreviewVariants([]);
      setError(`Could not read "${candidate.name}". Please select a plain-text .vcf or .txt genome file.`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      void inspectAndSelectFile(e.dataTransfer.files[0]);
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      void inspectAndSelectFile(e.target.files[0]);
    }
  };

  const downloadTextFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleBuilderRsId = (rsId: string) => {
    setSelectedRsIds((prev) =>
      prev.includes(rsId) ? prev.filter((id) => id !== rsId) : [...prev, rsId]
    );
  };

  const handleAddCustomRsIds = () => {
    const matches = customRsInput
      .split(/[\s,;]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => /^rs\d{2,12}$/.test(s));
    if (matches.length === 0) {
      setError('Please enter at least one valid NCBI dbSNP ID starting with "rs" followed by digits (e.g., rs1800795, rs7412).');
      return;
    }
    setError(null);
    setSelectedRsIds((prev) => Array.from(new Set([...prev, ...matches])));
    setCustomRsInput('');
  };

  const startAnalysis = async (overrideFile?: File) => {
    const targetFile = overrideFile || file;
    if (!targetFile) return;

    setError(null);
    const rawText = await targetFile.text();
    const parsedClientVariants = parseGenomicFileContent(rawText);

    // STRICT VALIDATION: Never fall back to sample data if the file has 0 valid variants
    if (parsedClientVariants.length === 0) {
      setError(
        `Rejected "${targetFile.name}": 0 valid genetic variants found. Please provide a valid VCF or 23andMe/AncestryDNA file with real rsIDs and allele genotypes.`
      );
      return;
    }

    setIsAnalyzing(true);
    setLogs([]);
    setProgress(0);
    setDone(false);

    const token = readStorageItem(AUTH_TOKEN_STORAGE_KEY);

    addLog('ReguloMe 5-Layer Regulatory Synthesis Engine v2.5', '#a78bfa', true);
    addLog(`Input Source: ${targetFile.name} (${parsedClientVariants.length} verified DNA variants)`, '#8899b8');
    addLog('Live Databases: MyVariant (ClinVar/dbSNP/gnomAD/CADD) · Ensembl VEP · GTEx · JASPAR PWM', '#8899b8');
    addLog('', '#8899b8');

    try {
      // 1. Optional local FastAPI upload if running
      const backendPromise = (async () => {
        if (!token) return null;
        try {
          const formData = new FormData();
          formData.append('file', targetFile);
          const resp = await fetch(`${API_BASE}/upload/genome`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
          if (resp.ok) return await resp.json();
        } catch {
          // Local backend offline — browser CORS pipeline handles live annotation
        }
        return null;
      })();

      // 2. Run live CORS annotation on the exact parsed variants from the user's file
      const liveAnnotationPromise = annotateVariantsLive(parsedClientVariants);

      for (let i = 0; i < DISPLAY_STEPS.length; i++) {
        const step = DISPLAY_STEPS[i];
        addLog(`[${String(i + 1).padStart(2, '0')}/${DISPLAY_STEPS.length}] ${step.label}`, step.color);
        setProgress(Math.round(((i + 1) / DISPLAY_STEPS.length) * 90));
        await new Promise((r) => setTimeout(r, step.dur));
      }

      const [backendResult, liveAnnotated] = await Promise.all([
        backendPromise,
        liveAnnotationPromise,
      ]);

      const finalVariants = liveAnnotated.variants;
      const synthesized = buildRegulatoryProfile(finalVariants, {
        source: backendResult ? 'backend-api' : 'uploaded-vcf',
        personaId: 'real-genome',
        filename: targetFile.name,
        totalParsedVariants: parsedClientVariants.length,
        liveApiEnrichedCount: liveAnnotated.liveEnrichedCount,
      });

      saveUploadedGenomicVariants(finalVariants, {
        filename: targetFile.name,
        totalParsedVariants: parsedClientVariants.length,
        liveApiEnrichedCount: liveAnnotated.liveEnrichedCount,
        analyzedAt: new Date().toISOString(),
        source: backendResult ? 'backend-api' : 'uploaded-vcf',
      });

      const activeDomains = synthesized.diseases.domains.filter((d) => d.variantCount > 0);
      setProgress(100);
      addLog('', '#8899b8');
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', '#a78bfa', true);
      addLog('✅ 5-LAYER REGULATORY ANALYSIS COMPLETE', '#10b981', true);
      addLog(`   Verified variants analyzed: ${parsedClientVariants.length}`, '#10b981');
      addLog(`   Unique target genes:        ${synthesized.expression.geneSummaries.map((g) => g.gene).join(', ')}`, '#10b981');
      addLog(`   Active disease domains:     ${activeDomains.length}/6 (${activeDomains.map((d) => `${d.name}: ${d.burdenScore}%`).join(', ') || 'None'})`, '#10b981');
      addLog(`   Network cascade:            ${synthesized.network.nodes.length} nodes · ${synthesized.network.edges.length} edges`, '#10b981');
      addLog(`   Overall regulatory score:   ${synthesized.dashboard.stats.riskScore}/100 (${synthesized.dashboard.stats.riskLevel.toUpperCase()})`, '#10b981');
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', '#a78bfa', true);
      addLog('→ Opening your personalized Real Mode Dashboard...', '#8899b8');

      setMode('real');
      setHasUploadedData(true);
      setDone(true);
      setTimeout(() => navigate('/app/dashboard'), 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      setError(msg);
      addLog('', '#8899b8');
      addLog(`❌ ERROR: ${msg}`, '#ef4444', true);
      setIsAnalyzing(false);
    }
  };

  const runPresetAnalysis = (presetId: string) => {
    const preset = SAMPLE_GENOME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const blob = new Blob([preset.content], { type: 'text/plain' });
    const presetFile = new File([blob], preset.filename, { type: 'text/plain' });
    setFile(presetFile);
    setPreviewVariants(parseGenomicFileContent(preset.content));
    void startAnalysis(presetFile);
  };

  const runBuilderAnalysis = () => {
    if (selectedRsIds.length === 0) {
      setError('Select at least 1 genetic variant in the Builder before starting analysis.');
      return;
    }
    const vcfContent = buildVcfFromRsIds(selectedRsIds);
    const filename = `Custom_${selectedRsIds.length}_Loci_Panel.vcf`;
    const blob = new Blob([vcfContent], { type: 'text/plain' });
    const customFile = new File([blob], filename, { type: 'text/plain' });
    setFile(customFile);
    setPreviewVariants(parseGenomicFileContent(vcfContent));
    void startAnalysis(customFile);
  };

  if (mode === 'demo') {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center p-8">
        <GlassCard padding="xl" className="max-w-md text-center">
          <AlertCircle size={48} className="mx-auto text-rg-teal-400 mb-6" />
          <h2 className="text-2xl font-bold text-rg-text-primary mb-3">Demo Mode Active</h2>
          <p className="text-rg-text-secondary leading-relaxed mb-8">
            The Data Studio is for analyzing real genomic variants. Switch to Real Mode to build a custom variant panel, download sample VCF/23andMe files, or upload your own DNA file.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/app/dashboard')}>
              Back to Dashboard
            </Button>
            <Button variant="primary" glow onClick={() => setMode('real')}>
              Switch to Real Mode
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header & Clear Reset Action */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-rg-purple-500/25 bg-rg-purple-500/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-rg-purple-300">
            <Database size={14} />
            DATA STUDIO — REAL GENOMIC ENGINE
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-rg-text-primary">
            Real Genome Analysis Studio
          </h1>
          <p className="mt-2 text-base text-rg-text-secondary max-w-2xl">
            Don&apos;t have a `.vcf` or 23andMe `.txt` file on your computer? Choose any of the <strong className="text-rg-text-primary">3 ways below</strong> to test real genomic profiles, download valid DNA files to your PC, or build your own variant panel.
          </p>
        </div>

        {hasUploadedData && !isAnalyzing && (
          <Button
            variant="secondary"
            onClick={() => {
              clearUploadedData();
              setFile(null);
              setPreviewVariants([]);
              setError(null);
            }}
            icon={<Trash2 size={15} />}
          >
            Clear Current Genome Data
          </Button>
        )}
      </div>

      {/* Step-by-step Quick Guide Banner */}
      {!isAnalyzing && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => { setActiveTab('presets'); setError(null); }}
            className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${
              activeTab === 'presets'
                ? 'border-rg-teal-500/50 bg-rg-teal-500/10 shadow-glow-teal'
                : 'border-rg-border bg-rg-bg-card/60 hover:border-rg-border-light'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-rg-teal-400">Option 1 · Recommended</span>
              <Download size={16} className="text-rg-teal-400" />
            </div>
            <div className="text-sm font-bold text-rg-text-primary">Download or 1-Click Load DNA Files</div>
            <p className="mt-1 text-xs text-rg-text-secondary">
              Download 3 real `.vcf` &amp; 23andMe `.txt` files to your PC or analyze them in 1 click.
            </p>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('builder'); setError(null); }}
            className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${
              activeTab === 'builder'
                ? 'border-rg-purple-500/50 bg-rg-purple-500/10 shadow-glow-purple'
                : 'border-rg-border bg-rg-bg-card/60 hover:border-rg-border-light'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-rg-purple-400">Option 2 · No File Needed</span>
              <Sliders size={16} className="text-rg-purple-400" />
            </div>
            <div className="text-sm font-bold text-rg-text-primary">Interactive Variant &amp; Gene Picker</div>
            <p className="mt-1 text-xs text-rg-text-secondary">
              Pick exact genes (`FOXO3`, `IL-6`, `APOE`, `ACTN3`) or type any `rsID` and analyze live.
            </p>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('upload'); setError(null); }}
            className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-emerald-500/50 bg-emerald-500/10'
                : 'border-rg-border bg-rg-bg-card/60 hover:border-rg-border-light'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Option 3 · Strict Validator</span>
              <UploadCloud size={16} className="text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-rg-text-primary">Upload Your Own `.vcf` / `.txt`</div>
            <p className="mt-1 text-xs text-rg-text-secondary">
              Upload from your PC with strict variant verification (invalid `.txt` files are rejected).
            </p>
          </button>
        </div>
      )}

      {/* Error Banner (Always visible when invalid file is uploaded) */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-5"
        >
          <XCircle className="mt-0.5 shrink-0 text-red-400" size={22} />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-red-300">Genome Validation Error</h4>
            <p className="mt-1 text-xs text-red-200/90 leading-relaxed">{error}</p>
          </div>
        </motion.div>
      )}

      {!isAnalyzing ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* ── TAB 1: DOWNLOAD OR 1-CLICK LOAD REAL GENOME FILES ── */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-rg-border bg-rg-bg-card/70 p-5">
                <h2 className="text-lg font-bold text-rg-text-primary mb-1">
                  3 Verified Real Genome Files (Download to PC or 1-Click Analyze)
                </h2>
                <p className="text-xs text-rg-text-secondary mb-5">
                  Each panel contains completely different genetic variants and produces a completely different risk profile across all 14 pages. You can <strong className="text-rg-text-primary">Download</strong> any file to your computer to see how a real `.vcf` or 23andMe `.txt` file is formatted, then upload it in Option 3 — or click <strong className="text-rg-text-primary">1-Click Analyze</strong> right now.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SAMPLE_GENOME_PRESETS.map((preset) => {
                    const presetColor =
                      preset.id === 'longevity-panel'
                        ? '#10b981'
                        : preset.id === 'neuro-immune-23andme'
                          ? '#f59e0b'
                          : '#8b5cf6';
                    return (
                    <div
                      key={preset.id}
                      className="flex flex-col justify-between rounded-xl border border-rg-border bg-rg-bg-primary/70 p-5 hover:border-rg-border-light transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                            style={{
                              background: `${presetColor}18`,
                              color: presetColor,
                              border: `1px solid ${presetColor}40`,
                            }}
                          >
                            <Dna size={11} />
                            {preset.badge}
                          </span>
                          <span className="font-mono text-[11px] text-rg-text-muted">
                            {preset.variantCount} loci
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-rg-text-primary mb-1.5">
                          {preset.title}
                        </h3>
                        <p className="text-xs text-rg-text-secondary leading-relaxed mb-3">
                          {preset.description}
                        </p>
                        <div className="rounded-lg border border-rg-border/60 bg-rg-bg-card/50 px-3 py-2 mb-4 font-mono text-[11px] text-rg-text-muted truncate">
                          📄 {preset.filename}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-2 border-t border-rg-border/50">
                        <Button
                          variant="primary"
                          glow
                          onClick={() => runPresetAnalysis(preset.id)}
                          iconRight={<Activity size={14} />}
                        >
                          ⚡ 1-Click Load &amp; Analyze
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => downloadTextFile(preset.filename, preset.content)}
                          icon={<Download size={14} />}
                        >
                          Download {preset.filename.endsWith('.txt') ? '.txt' : '.vcf'} to PC
                        </Button>
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: INTERACTIVE VARIANT & GENE BUILDER (NO FILE NEEDED) ── */}
          {activeTab === 'builder' && (
            <div className="rounded-xl border border-rg-border bg-rg-bg-card/70 p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-rg-text-primary">
                    Interactive Variant &amp; Gene Builder ({selectedRsIds.length} Loci Selected)
                  </h2>
                  <p className="text-xs text-rg-text-secondary mt-0.5">
                    Click any real human variants below to toggle them on/off, or type any NCBI `rsID`. Your dashboard, disease risks, and network graph will be computed exclusively from the variants you pick!
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRsIds(['rs2802292', 'rs8192678', 'rs1815739', 'rs7412', 'rs4988235'])}
                    className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 cursor-pointer"
                  >
                    Preset: Longevity Only (0 Cardio Risk)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRsIds(['rs1800795', 'rs1800629', 'rs2476601'])}
                    className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 cursor-pointer"
                  >
                    Preset: Immune/Cytokine Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRsIds([])}
                    className="rounded-lg border border-rg-border bg-rg-bg-primary px-3 py-1.5 text-xs font-semibold text-rg-text-muted hover:text-rg-text-primary cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Variant Chips Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {CURATED_BUILDER_VARIANTS.map((item) => {
                  const isSelected = selectedRsIds.includes(item.rsId);
                  const cat = KNOWN_RSID_CATALOG[item.rsId];
                  return (
                    <button
                      key={item.rsId}
                      type="button"
                      onClick={() => toggleBuilderRsId(item.rsId)}
                      className={`flex items-start justify-between gap-2 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-rg-teal-400/60 bg-rg-teal-500/12 shadow-sm'
                          : 'border-rg-border bg-rg-bg-primary/50 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-rg-text-primary">
                            {item.rsId}
                          </span>
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                            style={{ background: `${item.color}20`, color: item.color }}
                          >
                            {cat?.gene || 'LOCUS'}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-rg-text-secondary mt-1">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-rg-text-muted mt-0.5">
                          {cat ? `${cat.chromosome}:${cat.position.toLocaleString()} (${cat.ref}>${cat.alt})` : item.tag}
                        </div>
                      </div>
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${
                          isSelected
                            ? 'border-rg-teal-400 bg-rg-teal-400 text-slate-950'
                            : 'border-rg-border bg-rg-bg-card text-transparent'
                        }`}
                      >
                        ✓
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom rsID input */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rg-border/60">
                <input
                  type="text"
                  value={customRsInput}
                  onChange={(e) => setCustomRsInput(e.target.value)}
                  placeholder="Add any custom dbSNP rsIDs (e.g. rs1801282, rs1799983)..."
                  className="flex-1 min-w-[240px] rounded-lg border border-rg-border bg-rg-bg-primary px-3.5 py-2 text-xs text-rg-text-primary placeholder:text-rg-text-muted focus:border-rg-teal-400 focus:outline-none"
                />
                <Button variant="secondary" onClick={handleAddCustomRsIds}>
                  + Add Custom rsID
                </Button>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rg-purple-500/30 bg-rg-purple-500/08 p-4">
                <div className="text-xs text-rg-text-secondary">
                  Selected Loci:{' '}
                  <span className="font-mono font-bold text-rg-text-primary">
                    {selectedRsIds.length > 0 ? selectedRsIds.join(', ') : 'None selected'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    disabled={selectedRsIds.length === 0}
                    onClick={() =>
                      downloadTextFile(
                        `Custom_${selectedRsIds.length}_Loci_Panel.vcf`,
                        buildVcfFromRsIds(selectedRsIds)
                      )
                    }
                    icon={<Download size={15} />}
                  >
                    Download as `.vcf` File
                  </Button>
                  <Button
                    variant="primary"
                    glow
                    disabled={selectedRsIds.length === 0}
                    onClick={runBuilderAnalysis}
                    iconRight={<Sparkles size={15} />}
                  >
                    🚀 Analyze {selectedRsIds.length} Selected Loci Live
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: UPLOAD YOUR OWN .VCF OR 23ANDME .TXT FILE ── */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`
                  relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
                  ${isDragging ? 'border-rg-purple-400 bg-rg-purple-500/10' : file ? 'border-emerald-500/40 bg-emerald-500/05' : 'border-rg-border-light bg-rg-bg-card/50 hover:border-rg-purple-500/30 hover:bg-rg-bg-card/80'}
                `}
                style={{ padding: '44px 32px', textAlign: 'center' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rg-purple-500/5 to-transparent pointer-events-none" />
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".vcf,.txt,.tsv"
                />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rg-bg-primary shadow-elevated border border-rg-border">
                    {file ? (
                      <CheckCircle2 size={28} className="text-emerald-400" />
                    ) : (
                      <UploadCloud size={28} className="text-rg-text-secondary" />
                    )}
                  </div>

                  {file ? (
                    <>
                      <h3 className="text-xl font-bold text-rg-text-primary mb-1">{file.name}</h3>
                      <p className="text-xs text-emerald-400 font-semibold mb-4">
                        ✅ Verified: {previewVariants.length} valid DNA variants parsed from file
                      </p>

                      {/* Preview table of parsed variants */}
                      <div className="w-full max-w-xl rounded-xl border border-rg-border bg-rg-bg-primary/90 p-3 mb-5 text-left">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-rg-text-muted mb-2">
                          Parsed Variant Preview (First {Math.min(5, previewVariants.length)} of {previewVariants.length})
                        </div>
                        <div className="space-y-1.5 font-mono text-xs">
                          {previewVariants.slice(0, 5).map((pv, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-rg-border/40 pb-1 last:border-0">
                              <span className="font-bold text-rg-teal-400">{pv.rsId}</span>
                              <span className="text-rg-text-secondary">{pv.chromosome}:{pv.position.toLocaleString()}</span>
                              <span className="text-rg-purple-300">{pv.refAllele}→{pv.altAllele}</span>
                              <span className="text-rg-text-muted">{pv.gene || KNOWN_RSID_CATALOG[pv.rsId]?.gene || 'Genomic Locus'}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            setPreviewVariants([]);
                          }}
                        >
                          Remove File
                        </Button>
                        <Button
                          variant="primary"
                          glow
                          onClick={(e) => {
                            e.stopPropagation();
                            void startAnalysis();
                          }}
                          iconRight={<Activity size={16} />}
                        >
                          🚀 Start Real Analysis Pipeline ({previewVariants.length} Loci)
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-rg-text-primary mb-2">
                        Drop your `.vcf` or 23andMe `.txt` genome file here
                      </h3>
                      <p className="text-xs text-rg-text-secondary mb-6 max-w-lg mx-auto leading-relaxed">
                        Strict Genome Verification is active: files must contain valid <strong className="text-rg-text-primary">VCF v4.2</strong> (`#CHROM POS ID REF ALT`) or <strong className="text-rg-text-primary">23andMe / AncestryDNA</strong> (`rsid chromosome position genotype`) rows. Non-genomic text files are automatically rejected.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <Button
                          variant="primary"
                          glow
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          icon={<FileText size={16} />}
                        >
                          Browse `.vcf` / `.txt` File from PC
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab('presets');
                          }}
                        >
                          Don&apos;t have a file? Get Sample DNA Files →
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Format Reference Example */}
              <div className="rounded-xl border border-rg-border bg-rg-bg-card/60 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-rg-text-primary mb-2">
                  <HelpCircle size={15} className="text-rg-teal-400" />
                  What does a valid DNA `.vcf` or 23andMe `.txt` file look like?
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px] text-rg-text-secondary">
                  <div className="rounded-lg bg-rg-bg-primary p-3 border border-rg-border/60">
                    <div className="text-rg-teal-400 font-bold mb-1">VCF Format (.vcf):</div>
                    <div>#CHROM  POS        ID          REF  ALT</div>
                    <div>chr6    108659993  rs2802292   T    G</div>
                    <div>chr19   44908822   rs7412      C    T</div>
                  </div>
                  <div className="rounded-lg bg-rg-bg-primary p-3 border border-rg-border/60">
                    <div className="text-rg-purple-300 font-bold mb-1">23andMe Raw Data (.txt):</div>
                    <div># rsid      chromosome  position   genotype</div>
                    <div>rs2802292   6           108659993  TG</div>
                    <div>rs7412      19          44908822   CT</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security note */}
          <div className="flex items-start gap-4 rounded-xl border border-rg-border bg-rg-bg-secondary/50 p-4">
            <Lock className="mt-0.5 text-rg-success shrink-0" size={18} />
            <div>
              <h4 className="text-xs font-bold text-rg-text-primary">100% Real Variant Calculation · Zero Demo Leakage</h4>
              <p className="mt-0.5 text-xs text-rg-text-secondary leading-relaxed">
                In Real Mode, ReguloMe calculates disease domains, chromosome counts, tissue expression, and network cascades strictly from your uploaded or selected variants — with zero demo padding.
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="overflow-hidden rounded-2xl border border-rg-purple-500/30 bg-rg-bg-card shadow-glow-purple"
        >
          {/* Terminal Header */}
          <div className="flex items-center justify-between border-b border-rg-border bg-rg-bg-primary px-6 py-4">
            <div className="flex items-center gap-3">
              {['#ef4444', '#f59e0b', '#10b981'].map((c) => (
                <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
              ))}
              <Terminal size={16} className="ml-2 text-rg-purple-400" />
              <span className="font-mono text-sm font-bold tracking-wider text-rg-text-primary">
                regulome-analysis — {file?.name}
              </span>
            </div>
            <div className="font-mono text-sm font-bold text-rg-purple-400">{progress}%</div>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-rg-bg-primary overflow-hidden">
            <motion.div
              className="h-full"
              style={{ background: 'linear-gradient(90deg, #7c3aed, #0ae8d2)' }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'linear', duration: 0.4 }}
            />
          </div>

          {/* Terminal Window */}
          <div className="h-[360px] w-full bg-[#060a14] p-6 font-mono text-sm overflow-y-auto">
            <AnimatePresence>
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-2 leading-relaxed"
                  style={{ color: log.color, fontWeight: log.bold ? 700 : 400 }}
                >
                  {log.text || '\u00A0'}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={logsEndRef} />
            {isAnalyzing && !done && !error && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
                className="inline-block w-2 h-4 bg-emerald-400 align-middle ml-1"
              />
            )}
          </div>

          {/* Step counter */}
          <div className="border-t border-rg-border px-6 py-3 text-xs text-rg-text-muted font-mono bg-rg-bg-primary flex justify-between">
            <span>Running live regulatory synthesis against public genomic databases…</span>
            <span className="text-rg-purple-400">
              {progress < 100 ? `${progress}% complete` : done ? '✅ Done — redirecting…' : '⏳ Finalizing…'}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
