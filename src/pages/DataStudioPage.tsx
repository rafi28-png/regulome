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
  Shield,
  CheckCircle2,
  XCircle,
  Download,
  Sparkles,
  Sliders,
  Trash2,
  ArrowRight,
  HardDrive,
  Plus,
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
import { saveUploadedGenomicVariants, useRegulatoryProfile } from '@/hooks/useRegulatoryProfile';

/* =============================================
   ReguloMe — Data Studio & Genome Vault (GOD-MODE)
   ============================================= */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const ease = [0.22, 0.61, 0.36, 1] as [number, number, number, number];

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

type StudioTab = 'presets' | 'builder' | 'upload';

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
  const { profile } = useRegulatoryProfile();

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

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = useCallback((text: string, color = '#6bffcc', bold = false) => {
    setLogs((prev) => [...prev, { text, color, bold }]);
  }, []);

  const inspectAndSelectFile = async (candidate: File) => {
    setError(null);
    try {
      const rawText = await candidate.text();
      const parsed = parseGenomicFileContent(rawText);
      if (parsed.length === 0) {
        setFile(null);
        setPreviewVariants([]);
        setError(
          `Invalid genome file: "${candidate.name}" contains 0 valid DNA variants. Please upload a real VCF (.vcf) or 23andMe/AncestryDNA (.txt) file containing chromosome coordinates and rsIDs, or select a curated genome panel.`
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
      <div style={{ display: 'flex', minHeight: '60vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <GlassCard padding="xl" className="max-w-md text-center">
          <AlertCircle size={48} className="mx-auto text-rg-teal-400" style={{ marginBottom: 20 }} />
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#e8edf5', marginBottom: 10 }}>Demo Mode Active</h2>
          <p style={{ fontSize: 14, color: '#8899b8', lineHeight: 1.65, marginBottom: 28 }}>
            Data Studio manages your real genomic profile storage and live variant synthesis. Switch to Real Mode to load curated DNA files, synthesize custom loci panels, or upload your own VCF / 23andMe file.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
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

  const activeVariantsCount = hasUploadedData ? profile.variants.length : 0;
  const activeGenesCount = hasUploadedData ? profile.expression.geneSummaries.length : 0;
  const activeFilename = hasUploadedData ? (profile.meta.filename || 'Active Genome Panel') : 'No Panel Loaded';
  const activeRiskScore = hasUploadedData ? `${profile.dashboard.stats.riskScore}/100` : '—';

  const heroStats = [
    { label: 'Storage Status', value: hasUploadedData ? 'Active' : 'Empty', sub: activeFilename, color: hasUploadedData ? '#10b981' : '#f59e0b' },
    { label: 'Stored Variants', value: activeVariantsCount.toLocaleString(), sub: 'verified loci', color: '#0ae8d2' },
    { label: 'Target Genes', value: activeGenesCount.toLocaleString(), sub: 'mapped in cascade', color: '#8b5cf6' },
    { label: 'Regulatory Burden', value: activeRiskScore, sub: hasUploadedData ? profile.dashboard.stats.riskLevel : 'awaiting input', color: '#ec4899' },
  ];

  const TABS: { id: StudioTab; label: string; sub: string; badge: string; color: string; icon: React.ReactNode }[] = [
    {
      id: 'presets',
      label: 'Curated Genome Vault',
      sub: 'Download 3 real VCF / 23andMe files or analyze in 1 click',
      badge: 'RECOMMENDED',
      color: '#0ae8d2',
      icon: <Database size={18} />,
    },
    {
      id: 'builder',
      label: 'Variant & Gene Synthesizer',
      sub: 'Toggle specific clinical loci or custom rsIDs without a file',
      badge: 'INTERACTIVE',
      color: '#8b5cf6',
      icon: <Sliders size={18} />,
    },
    {
      id: 'upload',
      label: 'Local Genome Upload',
      sub: 'Strict VCF v4.2 & 23andMe / AncestryDNA file parser',
      badge: 'STRICT VALIDATOR',
      color: '#10b981',
      icon: <UploadCloud size={18} />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%' }}
    >
      {/* ── GOD-MODE HERO BANNER ── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '48px 44px',
          borderRadius: 28,
          background: 'linear-gradient(135deg, rgba(17,24,39,0.88), rgba(10,14,26,0.94))',
          border: '1px solid rgba(10,232,210,0.18)',
          backdropFilter: 'blur(28px)',
        }}
      >
        <motion.div
          animate={{ y: [0, -16, 0], x: [0, 8, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: -60,
            right: 90,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(10,232,210,0.09) 0%, transparent 65%)',
            filter: 'blur(45px)',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          animate={{ y: [0, 14, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            position: 'absolute',
            bottom: -40,
            left: 70,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            marginBottom: 34,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.1 }}
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(10,232,210,0.2), rgba(139,92,246,0.15))',
                border: '1px solid rgba(10,232,210,0.28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 36px rgba(10,232,210,0.12)',
              }}
            >
              <HardDrive size={28} color="#0ae8d2" />
            </motion.div>
            <div>
              <div style={{ marginBottom: 8 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: 'rgba(139,92,246,0.12)',
                    border: '1px solid rgba(139,92,246,0.32)',
                    fontSize: 10,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: '#a78bfa',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#0ae8d2',
                      boxShadow: '0 0 8px rgba(10,232,210,0.7)',
                    }}
                  />
                  GENOME STORAGE &amp; SYNTHESIS ENGINE
                </span>
              </div>
              <h1
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(135deg, #e8edf5 25%, #0ae8d2 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Data Studio
              </h1>
              <p style={{ fontSize: 14, color: '#8899b8', marginTop: 6, maxWidth: 580 }}>
                Load verified genome panels, synthesize custom regulatory loci, or upload VCF / 23andMe files with live ClinVar, Ensembl VEP &amp; GTEx annotation
              </p>
            </div>
          </div>

          {/* Right Hero Action Buttons */}
          {!isAnalyzing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {hasUploadedData && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/app/dashboard')}
                    iconRight={<ArrowRight size={14} />}
                  >
                    Open Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      clearUploadedData();
                      setFile(null);
                      setPreviewVariants([]);
                      setError(null);
                    }}
                    icon={<Trash2 size={14} />}
                  >
                    Purge Storage
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 4-Column Hero Stats Strip */}
        <div
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
          }}
        >
          {heroStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.06, duration: 0.4, ease }}
              style={{
                padding: '18px 18px',
                borderRadius: 16,
                background: 'rgba(10,14,26,0.58)',
                border: `1px solid ${s.color}22`,
                backdropFilter: 'blur(12px)',
              }}
            >
              <p
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.13em',
                  color: '#6b7d9c',
                  marginBottom: 6,
                }}
              >
                {s.label}
              </p>
              <p style={{ fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p
                style={{
                  fontSize: 11,
                  color: '#8899b8',
                  marginTop: 5,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {s.sub}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── ACTIVE STORAGE VAULT STRIP (When data is loaded) ── */}
      {hasUploadedData && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            padding: '18px 24px',
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(10,232,210,0.05))',
            border: '1px solid rgba(16,185,129,0.25)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                flexShrink: 0,
              }}
            >
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#e8edf5' }}>
                  Active Genome Vault: <span style={{ color: '#0ae8d2', fontFamily: 'monospace' }}>{activeFilename}</span>
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: 'rgba(16,185,129,0.16)',
                    border: '1px solid rgba(16,185,129,0.35)',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#10b981',
                  }}
                >
                  {activeVariantsCount} Loci · {activeGenesCount} Genes
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#8899b8', marginTop: 3 }}>
                Active genes:{' '}
                <span style={{ color: '#c4b5fd', fontFamily: 'monospace' }}>
                  {profile.expression.geneSummaries.map((g) => g.gene).join(', ') || 'None'}
                </span>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                downloadTextFile(
                  activeFilename.endsWith('.vcf') ? activeFilename : 'active_panel.vcf',
                  buildVcfFromRsIds(profile.variants.map((v) => v.rsId))
                )
              }
              icon={<Download size={13} />}
            >
              Export Active VCF
            </Button>
            <Button
              variant="primary"
              size="sm"
              glow
              onClick={() => navigate('/app/variants')}
              iconRight={<ArrowRight size={13} />}
            >
              Inspect Variants
            </Button>
          </div>
        </motion.div>
      )}

      {/* ── VALIDATION ERROR BANNER ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              padding: '18px 22px',
              borderRadius: 18,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.35)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <XCircle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#fca5a5', marginBottom: 4 }}>
                Genome Validation Alert
              </p>
              <p style={{ fontSize: 12, color: '#fecaca', lineHeight: 1.6 }}>{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODE SELECTOR CARDS ── */}
      {!isAnalyzing && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {TABS.map((t) => {
            const isSelected = activeTab === t.id;
            return (
              <motion.button
                key={t.id}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setActiveTab(t.id);
                  setError(null);
                }}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  textAlign: 'left',
                  padding: '22px 24px',
                  borderRadius: 22,
                  cursor: 'pointer',
                  background: isSelected
                    ? `linear-gradient(135deg, ${t.color}16, rgba(17,24,39,0.92))`
                    : 'linear-gradient(135deg, rgba(17,24,39,0.82), rgba(10,14,26,0.88))',
                  border: isSelected ? `1px solid ${t.color}55` : '1px solid rgba(56,78,122,0.22)',
                  boxShadow: isSelected ? `0 0 32px ${t.color}18` : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: `${t.color}18`,
                      border: `1px solid ${t.color}38`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: t.color,
                    }}
                  >
                    {t.icon}
                  </div>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: 999,
                      background: `${t.color}16`,
                      border: `1px solid ${t.color}35`,
                      fontSize: 9,
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      color: t.color,
                    }}
                  >
                    {t.badge}
                  </span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#e8edf5', marginBottom: 4 }}>
                  {t.label}
                </h3>
                <p style={{ fontSize: 12, color: '#8899b8', lineHeight: 1.5 }}>{t.sub}</p>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ── MAIN WORKSPACE CONTENT ── */}
      {!isAnalyzing ? (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease }}
          style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          {/* ════════════════════════════════════════════════════════════════
              TAB 1: CURATED GENOME VAULT (3 VERIFIED DNA FILES)
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'presets' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 20,
              }}
            >
              {SAMPLE_GENOME_PRESETS.map((preset, idx) => {
                const presetColor =
                  preset.id === 'longevity-panel'
                    ? '#10b981'
                    : preset.id === 'neuro-immune-23andme'
                      ? '#f59e0b'
                      : '#8b5cf6';
                return (
                  <motion.div
                    key={preset.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07, duration: 0.4, ease }}
                    whileHover={{ y: -3 }}
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '28px 26px',
                      borderRadius: 24,
                      background: 'linear-gradient(135deg, rgba(17,24,39,0.92), rgba(10,14,26,0.88))',
                      border: `1px solid ${presetColor}28`,
                      backdropFilter: 'blur(20px)',
                      boxShadow: `0 0 40px ${presetColor}08`,
                    }}
                  >
                    {/* Subtle corner radial glow */}
                    <div
                      style={{
                        position: 'absolute',
                        top: -40,
                        right: -40,
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${presetColor}12, transparent 70%)`,
                        filter: 'blur(28px)',
                        pointerEvents: 'none',
                      }}
                    />

                    <div style={{ position: 'relative' }}>
                      {/* Top badge row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          marginBottom: 16,
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 11px',
                            borderRadius: 999,
                            background: `${presetColor}16`,
                            border: `1px solid ${presetColor}38`,
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: '0.06em',
                            color: presetColor,
                          }}
                        >
                          <Dna size={12} />
                          {preset.badge}
                        </span>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#8899b8',
                            padding: '3px 9px',
                            borderRadius: 8,
                            background: 'rgba(10,14,26,0.6)',
                            border: '1px solid rgba(56,78,122,0.2)',
                          }}
                        >
                          {preset.variantCount} Loci
                        </span>
                      </div>

                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: '#e8edf5',
                          letterSpacing: '-0.02em',
                          marginBottom: 8,
                        }}
                      >
                        {preset.title}
                      </h3>

                      <p
                        style={{
                          fontSize: 12.5,
                          color: '#8899b8',
                          lineHeight: 1.68,
                          marginBottom: 18,
                        }}
                      >
                        {preset.description}
                      </p>

                      {/* File chip */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '9px 12px',
                          borderRadius: 12,
                          background: 'rgba(10,14,26,0.65)',
                          border: '1px solid rgba(56,78,122,0.22)',
                          marginBottom: 20,
                        }}
                      >
                        <FileText size={14} style={{ color: presetColor, flexShrink: 0 }} />
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 11,
                            color: '#c4b5fd',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {preset.filename}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        paddingTop: 16,
                        borderTop: '1px solid rgba(56,78,122,0.18)',
                      }}
                    >
                      <Button
                        variant="primary"
                        glow
                        onClick={() => runPresetAnalysis(preset.id)}
                        iconRight={<Activity size={14} />}
                      >
                        Load &amp; Synthesize Profile
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => downloadTextFile(preset.filename, preset.content)}
                        icon={<Download size={14} />}
                      >
                        Download {preset.filename.endsWith('.txt') ? '.txt' : '.vcf'} to Disk
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 2: INTERACTIVE VARIANT & GENE SYNTHESIZER
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'builder' && (
            <div
              style={{
                padding: '32px 30px',
                borderRadius: 24,
                background: 'linear-gradient(135deg, rgba(17,24,39,0.92), rgba(10,14,26,0.88))',
                border: '1px solid rgba(139,92,246,0.22)',
                backdropFilter: 'blur(20px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}
            >
              {/* Header + Quick Presets */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#e8edf5', letterSpacing: '-0.02em' }}>
                    Interactive Variant &amp; Gene Synthesizer
                  </h2>
                  <p style={{ fontSize: 13, color: '#8899b8', marginTop: 4 }}>
                    Toggle regulatory loci below or append custom NCBI dbSNP identifiers (`rsID`). All downstream scores, tissue heatmaps, and 3D chromosomes compute strictly from your selection.
                  </p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    {
                      label: 'Longevity (0 Cardio Risk)',
                      color: '#10b981',
                      ids: ['rs2802292', 'rs8192678', 'rs1815739', 'rs7412', 'rs4988235'],
                    },
                    {
                      label: 'Cytokine / Immune',
                      color: '#f59e0b',
                      ids: ['rs1800795', 'rs1800629', 'rs1801133'],
                    },
                    {
                      label: 'Cardiometabolic',
                      color: '#ef4444',
                      ids: ['rs12740374', 'rs429358', 'rs7903146', 'rs9939609'],
                    },
                    {
                      label: 'Clear',
                      color: '#6b7d9c',
                      ids: [],
                    },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setSelectedRsIds(p.ids)}
                      style={{
                        padding: '7px 13px',
                        borderRadius: 10,
                        background: `${p.color}14`,
                        border: `1px solid ${p.color}38`,
                        color: p.color,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Variant Selection Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(255px, 1fr))',
                  gap: 12,
                }}
              >
                {CURATED_BUILDER_VARIANTS.map((item) => {
                  const isSelected = selectedRsIds.includes(item.rsId);
                  const cat = KNOWN_RSID_CATALOG[item.rsId];
                  return (
                    <motion.button
                      key={item.rsId}
                      type="button"
                      whileHover={{ y: -2 }}
                      onClick={() => toggleBuilderRsId(item.rsId)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '15px 16px',
                        borderRadius: 16,
                        textAlign: 'left',
                        cursor: 'pointer',
                        background: isSelected
                          ? 'linear-gradient(135deg, rgba(10,232,210,0.12), rgba(139,92,246,0.08))'
                          : 'rgba(10,14,26,0.55)',
                        border: isSelected
                          ? '1px solid rgba(10,232,210,0.48)'
                          : '1px solid rgba(56,78,122,0.2)',
                        boxShadow: isSelected ? '0 0 20px rgba(10,232,210,0.1)' : 'none',
                        opacity: isSelected ? 1 : 0.78,
                        transition: 'all 0.18s ease',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: 12,
                              fontWeight: 800,
                              color: isSelected ? '#0ae8d2' : '#e8edf5',
                            }}
                          >
                            {item.rsId}
                          </span>
                          <span
                            style={{
                              padding: '2px 7px',
                              borderRadius: 6,
                              background: `${item.color}20`,
                              border: `1px solid ${item.color}38`,
                              fontSize: 10,
                              fontWeight: 800,
                              color: item.color,
                            }}
                          >
                            {cat?.gene || 'LOCUS'}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#e8edf5', marginBottom: 4 }}>
                          {item.label}
                        </p>
                        <p style={{ fontSize: 10.5, fontFamily: 'monospace', color: '#6b7d9c' }}>
                          {cat
                            ? `${cat.chromosome}:${cat.position.toLocaleString()} · ${cat.ref}→${cat.alt}`
                            : item.tag}
                        </p>
                      </div>

                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 7,
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isSelected ? '#0ae8d2' : 'rgba(21,28,46,0.8)',
                          border: isSelected ? '1px solid #0ae8d2' : '1px solid rgba(56,78,122,0.35)',
                          color: isSelected ? '#0a0e1a' : 'transparent',
                          fontSize: 12,
                          fontWeight: 900,
                        }}
                      >
                        ✓
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Custom rsID Input Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                  paddingTop: 16,
                  borderTop: '1px solid rgba(56,78,122,0.18)',
                }}
              >
                <input
                  type="text"
                  value={customRsInput}
                  onChange={(e) => setCustomRsInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCustomRsIds();
                  }}
                  placeholder="Enter custom dbSNP rsIDs separated by commas (e.g., rs1801282, rs1799983)..."
                  style={{
                    flex: 1,
                    minWidth: 240,
                    padding: '11px 16px',
                    borderRadius: 12,
                    background: 'rgba(10,14,26,0.75)',
                    border: '1px solid rgba(56,78,122,0.32)',
                    color: '#e8edf5',
                    fontSize: 13,
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
                <Button variant="secondary" onClick={handleAddCustomRsIds} icon={<Plus size={14} />}>
                  Append rsID
                </Button>
              </div>

              {/* Action Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                  padding: '18px 22px',
                  borderRadius: 18,
                  background: 'rgba(10,14,26,0.65)',
                  border: '1px solid rgba(139,92,246,0.28)',
                }}
              >
                <div style={{ fontSize: 12, color: '#8899b8' }}>
                  Active Selection ({selectedRsIds.length}):{' '}
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0ae8d2' }}>
                    {selectedRsIds.length > 0 ? selectedRsIds.join(', ') : 'None selected'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  <Button
                    variant="secondary"
                    disabled={selectedRsIds.length === 0}
                    onClick={() =>
                      downloadTextFile(
                        `Custom_${selectedRsIds.length}_Loci_Panel.vcf`,
                        buildVcfFromRsIds(selectedRsIds)
                      )
                    }
                    icon={<Download size={14} />}
                  >
                    Export `.vcf`
                  </Button>
                  <Button
                    variant="primary"
                    glow
                    disabled={selectedRsIds.length === 0}
                    onClick={runBuilderAnalysis}
                    iconRight={<Sparkles size={14} />}
                  >
                    Synthesize {selectedRsIds.length} Selected Loci
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 3: LOCAL GENOME FILE UPLOAD (.VCF / 23ANDME .TXT)
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  padding: '52px 36px',
                  borderRadius: 26,
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: isDragging
                    ? 'linear-gradient(135deg, rgba(10,232,210,0.12), rgba(139,92,246,0.1))'
                    : file
                      ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(10,14,26,0.92))'
                      : 'linear-gradient(135deg, rgba(17,24,39,0.9), rgba(10,14,26,0.92))',
                  border: isDragging
                    ? '2px dashed #0ae8d2'
                    : file
                      ? '2px dashed rgba(16,185,129,0.45)'
                      : '2px dashed rgba(56,78,122,0.38)',
                  backdropFilter: 'blur(20px)',
                  transition: 'all 0.25s ease',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                  accept=".vcf,.txt,.tsv"
                />

                <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 22,
                      marginBottom: 18,
                      background: file
                        ? 'rgba(16,185,129,0.15)'
                        : 'linear-gradient(135deg, rgba(10,232,210,0.16), rgba(139,92,246,0.14))',
                      border: file ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(10,232,210,0.28)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 32px rgba(10,232,210,0.1)',
                    }}
                  >
                    {file ? (
                      <CheckCircle2 size={30} color="#10b981" />
                    ) : (
                      <UploadCloud size={30} color="#0ae8d2" />
                    )}
                  </div>

                  {file ? (
                    <>
                      <h3 style={{ fontSize: 22, fontWeight: 800, color: '#e8edf5', marginBottom: 6 }}>
                        {file.name}
                      </h3>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 22 }}>
                        Verified · {previewVariants.length} valid genomic variants parsed
                      </p>

                      {/* Glassmorphic Parsed Variant Preview Table */}
                      <div
                        style={{
                          width: '100%',
                          maxWidth: 640,
                          padding: '16px 20px',
                          borderRadius: 16,
                          background: 'rgba(10,14,26,0.78)',
                          border: '1px solid rgba(56,78,122,0.25)',
                          marginBottom: 24,
                          textAlign: 'left',
                        }}
                      >
                        <p
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            color: '#6b7d9c',
                            marginBottom: 10,
                          }}
                        >
                          Parsed Variant Preview ({Math.min(5, previewVariants.length)} of {previewVariants.length})
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {previewVariants.slice(0, 5).map((pv, i) => (
                            <div
                              key={i}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '110px 1fr 80px 110px',
                                alignItems: 'center',
                                gap: 10,
                                paddingBottom: 6,
                                borderBottom:
                                  i < Math.min(5, previewVariants.length) - 1
                                    ? '1px solid rgba(56,78,122,0.16)'
                                    : 'none',
                                fontFamily: 'monospace',
                                fontSize: 12,
                              }}
                            >
                              <span style={{ fontWeight: 800, color: '#0ae8d2' }}>{pv.rsId}</span>
                              <span style={{ color: '#8899b8' }}>
                                {pv.chromosome}:{pv.position.toLocaleString()}
                              </span>
                              <span style={{ color: '#c4b5fd' }}>
                                {pv.refAllele}→{pv.altAllele}
                              </span>
                              <span style={{ color: '#10b981', textAlign: 'right' }}>
                                {pv.gene || KNOWN_RSID_CATALOG[pv.rsId]?.gene || 'Locus'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 12 }}>
                        <Button
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            setPreviewVariants([]);
                          }}
                        >
                          Clear Selection
                        </Button>
                        <Button
                          variant="primary"
                          glow
                          onClick={(e) => {
                            e.stopPropagation();
                            void startAnalysis();
                          }}
                          iconRight={<Activity size={15} />}
                        >
                          Run 5-Layer Analysis ({previewVariants.length} Loci)
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 style={{ fontSize: 22, fontWeight: 800, color: '#e8edf5', marginBottom: 8 }}>
                        Drop your `.vcf` or 23andMe `.txt` genome file
                      </h3>
                      <p
                        style={{
                          fontSize: 13,
                          color: '#8899b8',
                          maxWidth: 520,
                          lineHeight: 1.65,
                          marginBottom: 24,
                        }}
                      >
                        Strict coordinate &amp; allele verification is enforced. Supports standard{' '}
                        <strong style={{ color: '#e8edf5' }}>VCF v4.2</strong> (`#CHROM POS ID REF ALT`) and{' '}
                        <strong style={{ color: '#e8edf5' }}>23andMe / AncestryDNA</strong> raw genotype exports.
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
                        <Button
                          variant="primary"
                          glow
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          icon={<FileText size={15} />}
                        >
                          Select `.vcf` / `.txt` File
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab('presets');
                          }}
                        >
                          Browse Curated Genome Vault →
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Format Specification Reference Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    padding: '20px 22px',
                    borderRadius: 20,
                    background: 'rgba(17,24,39,0.78)',
                    border: '1px solid rgba(10,232,210,0.18)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: 'rgba(10,232,210,0.12)',
                        color: '#0ae8d2',
                        fontSize: 10,
                        fontWeight: 800,
                      }}
                    >
                      VCF v4.2
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#e8edf5' }}>
                      Standard Variant Call Format (`.vcf`)
                    </span>
                  </div>
                  <pre
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'rgba(10,14,26,0.75)',
                      border: '1px solid rgba(56,78,122,0.2)',
                      fontFamily: 'monospace',
                      fontSize: 11,
                      color: '#8899b8',
                      overflowX: 'auto',
                      lineHeight: 1.6,
                    }}
                  >
{`#CHROM  POS        ID          REF  ALT
chr6    108659993  rs2802292   T    G
chr19   44908822   rs7412      C    T`}
                  </pre>
                </div>

                <div
                  style={{
                    padding: '20px 22px',
                    borderRadius: 20,
                    background: 'rgba(17,24,39,0.78)',
                    border: '1px solid rgba(139,92,246,0.18)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: 'rgba(139,92,246,0.15)',
                        color: '#a78bfa',
                        fontSize: 10,
                        fontWeight: 800,
                      }}
                    >
                      23andMe / Ancestry
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#e8edf5' }}>
                      Raw Genotype Array (`.txt`)
                    </span>
                  </div>
                  <pre
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'rgba(10,14,26,0.75)',
                      border: '1px solid rgba(56,78,122,0.2)',
                      fontFamily: 'monospace',
                      fontSize: 11,
                      color: '#8899b8',
                      overflowX: 'auto',
                      lineHeight: 1.6,
                    }}
                  >
{`# rsid      chromosome  position   genotype
rs2802292   6           108659993  TG
rs7412      19          44908822   CT`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* ── PROVENANCE & PRIVACY FOOTER STRIP ── */}
          <div
            style={{
              padding: '20px 24px',
              borderRadius: 20,
              background: 'rgba(17,24,39,0.65)',
              border: '1px solid rgba(56,78,122,0.18)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <Shield size={20} color="#0ae8d2" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: '#8899b8', lineHeight: 1.6 }}>
              <strong style={{ color: '#e8edf5' }}>Zero Demo Padding · Browser-Native Provenance:</strong>{' '}
              In Real Mode, ReguloMe computes your disease burden, tissue expression matrix, 3D chromosome territories, and regulatory network strictly from your verified variants via live NCBI ClinVar, dbSNP, gnomAD, CADD, and Ensembl VEP queries.
            </p>
          </div>
        </motion.div>
      ) : (
        /* ── GOD-MODE SYNTHESIS TERMINAL ── */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            overflow: 'hidden',
            borderRadius: 24,
            background: 'rgba(17,24,39,0.92)',
            border: '1px solid rgba(139,92,246,0.32)',
            boxShadow: '0 0 48px rgba(139,92,246,0.15)',
          }}
        >
          {/* Terminal Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              background: 'rgba(10,14,26,0.9)',
              borderBottom: '1px solid rgba(56,78,122,0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {['#ef4444', '#f59e0b', '#10b981'].map((c) => (
                <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
              ))}
              <Terminal size={15} style={{ marginLeft: 8, color: '#a78bfa' }} />
              <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#e8edf5' }}>
                regulome-synthesis — {file?.name}
              </span>
            </div>
            <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 800, color: '#0ae8d2' }}>
              {progress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{ height: 5, width: '100%', background: 'rgba(10,14,26,0.9)', overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: 'linear-gradient(90deg, #7c3aed, #0ae8d2)' }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'linear', duration: 0.35 }}
            />
          </div>

          {/* Terminal Log Window */}
          <div
            style={{
              height: 360,
              width: '100%',
              background: '#060a14',
              padding: '24px 28px',
              fontFamily: 'monospace',
              fontSize: 13,
              overflowY: 'auto',
            }}
          >
            <AnimatePresence>
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    marginBottom: 8,
                    lineHeight: 1.6,
                    color: log.color,
                    fontWeight: log.bold ? 700 : 400,
                  }}
                >
                  {log.text || '\u00A0'}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={logsEndRef} />
          </div>

          {/* Terminal Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 24px',
              background: 'rgba(10,14,26,0.9)',
              borderTop: '1px solid rgba(56,78,122,0.22)',
              fontFamily: 'monospace',
              fontSize: 11,
              color: '#6b7d9c',
            }}
          >
            <span>Synthesizing 5-layer regulatory twin from verified genomic variants…</span>
            <span style={{ color: '#a78bfa', fontWeight: 700 }}>
              {progress < 100 ? `${progress}% complete` : done ? '✅ Complete — opening Dashboard…' : '⏳ Finalizing…'}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
