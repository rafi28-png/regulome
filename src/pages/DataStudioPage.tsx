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
} from 'lucide-react';
import { Button, GlassCard } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { AUTH_TOKEN_STORAGE_KEY, readStorageItem } from '@/lib/storage';

const API_BASE = 'http://localhost:8000/api/v1';

// ── Pipeline display steps ──
const DISPLAY_STEPS = [
  { label: 'Initializing ReguloMe analysis core...', color: '#8899b8', dur: 600 },
  { label: 'Detecting genome file format...', color: '#0ae8d2', dur: 500 },
  { label: 'Parsing genetic variants...', color: '#0ae8d2', dur: 1000 },
  { label: 'Mapping to GRCh38/hg38 reference...', color: '#0ae8d2', dur: 700 },
  { label: 'Querying ClinVar & dbSNP databases...', color: '#a78bfa', dur: 2500 },
  { label: 'Cross-referencing Ensembl VEP...', color: '#a78bfa', dur: 1800 },
  { label: 'Fetching GTEx tissue expression data...', color: '#f59e0b', dur: 1500 },
  { label: 'Computing population frequencies (gnomAD)...', color: '#f59e0b', dur: 1800 },
  { label: 'Scoring Open Targets disease associations...', color: '#f59e0b', dur: 1500 },
  { label: 'Computing ReguloMe regulatory impact scores...', color: '#ec4899', dur: 900 },
  { label: 'Compiling personalized dashboard...', color: '#10b981', dur: 600 },
];

interface LogLine {
  text: string;
  color: string;
  bold?: boolean;
}

export default function DataStudioPage() {
  const navigate = useNavigate();
  const { mode, setHasUploadedData } = useApp();

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = useCallback((text: string, color = '#6bffcc', bold = false) => {
    setLogs(prev => [...prev, { text, color, bold }]);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const startAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    setLogs([]);
    setProgress(0);
    setDone(false);

    // Start the real upload immediately in the background
    const token = readStorageItem(AUTH_TOKEN_STORAGE_KEY);
    if (!token) {
      setError('You must be logged in to upload data.');
      setIsAnalyzing(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // IMPORTANT: Do NOT set Content-Type — browser sets it automatically for FormData
    const uploadPromise = fetch(`${API_BASE}/upload/genome`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    // Show header
    addLog('ReguloMe Analysis Engine v2.0', '#a78bfa', true);
    addLog(`File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, '#8899b8');
    addLog('APIs: ClinVar · Ensembl · GTEx · gnomAD · Open Targets', '#8899b8');
    addLog('', '#8899b8');

    // Animate display steps while real pipeline runs in background
    for (let i = 0; i < DISPLAY_STEPS.length; i++) {
      const step = DISPLAY_STEPS[i];
      addLog(`[${String(i + 1).padStart(2, '0')}/${DISPLAY_STEPS.length}] ${step.label}`, step.color);
      setProgress(Math.round(((i + 1) / DISPLAY_STEPS.length) * 90));
      await new Promise(r => setTimeout(r, step.dur));
    }

    // Wait for real upload to finish
    try {
      const resp = await uploadPromise;
      if (!resp.ok) {
        let msg = `Analysis failed (${resp.status})`;
        try { msg = (await resp.json()).detail || msg; } catch {}
        throw new Error(msg);
      }
      const result = await resp.json();

      setProgress(100);
      addLog('', '#8899b8');
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', '#a78bfa', true);
      addLog('✅ ANALYSIS COMPLETE', '#10b981', true);
      addLog(`   Variants in file:     ${result.total_variants_in_file?.toLocaleString() ?? '—'}`, '#10b981');
      addLog(`   Variants processed:   ${result.variants_processed ?? '—'}`, '#10b981');
      addLog(`   Pathogenic found:     ${result.summary?.total_pathogenic ?? 0}`, '#10b981');
      addLog(`   High impact:          ${result.summary?.high_impact_count ?? 0}`, '#10b981');
      addLog(`   Unique genes:         ${result.summary?.unique_genes_count ?? 0}`, '#10b981');
      addLog(`   Overall risk score:   ${result.summary?.overall_risk_score ?? 0}/100`, '#10b981');
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', '#a78bfa', true);
      addLog('→ Loading your personalized dashboard...', '#8899b8');

      setHasUploadedData(true);
      setDone(true);
      setTimeout(() => navigate('/app/dashboard'), 2500);
    } catch (err: any) {
      const msg = err.message || 'Analysis failed. Please try again.';
      setError(msg);
      addLog('', '#8899b8');
      addLog(`❌ ERROR: ${msg}`, '#ef4444', true);
      setIsAnalyzing(false);
    }
  };

  if (mode === 'demo') {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center p-8">
        <GlassCard padding="xl" className="max-w-md text-center">
          <AlertCircle size={48} className="mx-auto text-rg-teal-400 mb-6" />
          <h2 className="text-2xl font-bold text-rg-text-primary mb-3">Demo Mode Active</h2>
          <p className="text-rg-text-secondary leading-relaxed mb-8">
            The Data Studio is for processing real genomic files. Switch to Real Mode to upload your own data.
          </p>
          <Button variant="secondary" onClick={() => navigate('/app/dashboard')}>
            Back to Dashboard
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-rg-purple-500/25 bg-rg-purple-500/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-rg-purple-300">
          <Database size={14} />
          DATA STUDIO — REAL MODE
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-rg-text-primary">
          Import &amp; Analyze
        </h1>
        <p className="mt-3 text-lg text-rg-text-secondary">
          Upload your genomic data and run real analysis against 5 public databases.
        </p>
      </div>

      {/* API Badge strip */}
      <div className="flex flex-wrap gap-2">
        {['ClinVar', 'Ensembl VEP', 'GTEx v8', 'gnomAD r4', 'Open Targets'].map(api => (
          <span key={api} className="inline-flex items-center gap-1.5 rounded-full border border-rg-purple-500/20 bg-rg-purple-500/08 px-3 py-1 text-xs font-medium text-rg-purple-300">
            <Dna size={11} />
            {api}
          </span>
        ))}
      </div>

      {!isAnalyzing ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            className={`
              relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
              ${isDragging ? 'border-rg-purple-400 bg-rg-purple-500/10' : file ? 'border-emerald-500/40 bg-emerald-500/05' : 'border-rg-border-light bg-rg-bg-card/50 hover:border-rg-purple-500/30 hover:bg-rg-bg-card/80'}
            `}
            style={{ padding: '60px 40px', textAlign: 'center' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rg-purple-500/5 to-transparent pointer-events-none" />
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept=".vcf,.gz,.txt"
            />
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rg-bg-primary shadow-elevated border border-rg-border">
                {file ? (
                  <CheckCircle2 size={32} className="text-emerald-400" />
                ) : (
                  <UploadCloud size={32} className="text-rg-text-secondary" />
                )}
              </div>

              {file ? (
                <>
                  <h3 className="text-2xl font-bold text-rg-text-primary mb-2">{file.name}</h3>
                  <p className="text-sm text-rg-text-muted mb-8">
                    {(file.size / 1024 / 1024).toFixed(2)} MB · Click to change file
                  </p>
                  <div className="flex gap-4">
                    <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                      Remove
                    </Button>
                    <Button variant="primary" glow onClick={(e) => { e.stopPropagation(); startAnalysis(); }} iconRight={<Activity size={16} />}>
                      🚀 Start Real Analysis Pipeline
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-rg-text-primary mb-3">Drop your genome file here</h3>
                  <p className="text-sm text-rg-text-secondary mb-8 max-w-md mx-auto leading-relaxed">
                    Supported: <strong className="text-rg-text-primary">VCF (.vcf, .vcf.gz)</strong> · <strong className="text-rg-text-primary">23andMe raw data (.txt)</strong> · <strong className="text-rg-text-primary">AncestryDNA raw data (.txt)</strong>
                  </p>
                  <Button variant="secondary">Browse Files</Button>
                </>
              )}
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/08 p-5">
              <XCircle className="mt-0.5 shrink-0 text-red-400" size={20} />
              <div>
                <h4 className="text-sm font-bold text-red-300">Analysis Failed</h4>
                <p className="mt-1 text-xs text-red-400/80 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Security note */}
          <div className="flex items-start gap-4 rounded-xl border border-rg-border bg-rg-bg-secondary/50 p-5">
            <Lock className="mt-1 text-rg-success shrink-0" size={20} />
            <div>
              <h4 className="text-sm font-bold text-rg-text-primary">Local-First Privacy</h4>
              <p className="mt-1 text-xs text-rg-text-secondary leading-relaxed">
                Your genetic data is processed by your local ReguloMe server. External APIs (ClinVar, Ensembl, etc.) receive only rsID identifiers — never your personal information.
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
              {/* macOS-style dots */}
              {['#ef4444', '#f59e0b', '#10b981'].map(c => (
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
              transition={{ ease: 'linear', duration: 0.5 }}
            />
          </div>

          {/* Terminal Window */}
          <div className="h-[380px] w-full bg-[#060a14] p-6 font-mono text-sm overflow-y-auto">
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
            <span>Running analysis against 5 real databases…</span>
            <span className="text-rg-purple-400">
              {progress < 100 ? `${progress}% complete` : done ? '✅ Done — redirecting…' : '⏳ Finalizing…'}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
