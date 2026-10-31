import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Database,
  Dna,
  FileStack,
  HeartPulse,
  Lock,
  Microscope,
  ShieldCheck,
  Sparkles,
  Terminal,
  UploadCloud,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { MODE_STORAGE_KEY, PERSONA_STORAGE_KEY, writeStorageItem } from '@/lib/storage';
import type { DemoPersona } from '@/types';

type StepId = 1 | 2 | 3;
type SourceId = 'demo' | 'vcf' | 'consumer';

interface Step {
  id: StepId;
  label: string;
  title: string;
  summary: string;
}

interface SourceOption {
  id: SourceId;
  title: string;
  description: string;
  badge: string;
  icon: LucideIcon;
  points: string[];
}

interface PersonaOption {
  id: string;
  title: string;
  subtitle: string;
  score: string;
  signal: string;
  icon: LucideIcon;
  accent: 'teal' | 'purple' | 'green' | 'amber';
}

const steps: Step[] = [
  {
    id: 1,
    label: 'Source',
    title: 'Choose data source',
    summary: 'Start safely with demo data or reserve an upload path for later.',
  },
  {
    id: 2,
    label: 'Context',
    title: 'Select starting profile',
    summary: 'Pick the synthetic profile that seeds the first dashboard view.',
  },
  {
    id: 3,
    label: 'Review',
    title: 'Confirm workspace',
    summary: 'Check the setup before entering the interactive dashboard.',
  },
];

const sources: SourceOption[] = [
  {
    id: 'demo',
    title: 'Synthetic demo genome',
    description: 'Open a complete regulatory workspace immediately with prepared safe data.',
    badge: 'Recommended',
    icon: Database,
    points: ['No upload needed', 'All demo modules ready', 'Fastest first run'],
  },
  {
    id: 'vcf',
    title: 'Upload VCF later',
    description: 'Reserve a real variant-file workspace without showing synthetic demo results.',
    badge: 'VCF-ready',
    icon: UploadCloud,
    points: ['Reserved import path', 'Variant parsing flow', 'Real mode stays active'],
  },
  {
    id: 'consumer',
    title: 'Consumer data later',
    description: 'Prepare for consumer genomics import without blocking the guided setup.',
    badge: 'Import path',
    icon: Dna,
    points: ['Consumer data path', 'Trait mapping queue', 'Real workspace kept empty'],
  },
];

// Full DemoPersona profile objects for each persona option
const personaProfiles: Record<string, DemoPersona> = {
  inflammatory: {
    id: 'inflammatory-immune',
    name: 'Alex Rivera',
    label: 'Inflammatory Immune-Skewed',
    description: 'Cytokine burden with immune regulatory hotspots and NF-kB pathway activation.',
    profileType: 'inflammatory',
    age: 38,
    genomeBuild: 'GRCh38',
    variantCount: 247,
    color: '#f59e0b',
    icon: 'Activity',
  },
  longevity: {
    id: 'longevity-protected',
    name: 'Dr. Mei Chen',
    label: 'Longevity Protected',
    description: 'Lower methyl-age drift with repair pathway support and FOXO3 activation.',
    profileType: 'longevity',
    age: 52,
    genomeBuild: 'GRCh38',
    variantCount: 156,
    color: '#8b5cf6',
    icon: 'Sparkles',
  },
  endurance: {
    id: 'endurance-optimized',
    name: 'Jordan Blake',
    label: 'Endurance Optimized',
    description: 'Mitochondrial expression and oxygen response advantage with PGC1A upregulation.',
    profileType: 'endurance',
    age: 29,
    genomeBuild: 'GRCh38',
    variantCount: 182,
    color: '#10b981',
    icon: 'Zap',
  },
  cardiometabolic: {
    id: 'cardiometabolic-risk',
    name: 'Sam Torres',
    label: 'Cardiometabolic Risk',
    description: 'Liver and adipose regulatory pressure with FTO-driven risk shift.',
    profileType: 'cardiometabolic',
    age: 45,
    genomeBuild: 'GRCh38',
    variantCount: 301,
    color: '#00ccb8',
    icon: 'HeartPulse',
  },
};

const personas: PersonaOption[] = [
  {
    id: 'inflammatory',
    title: 'Inflammatory immune-skewed',
    subtitle: 'Cytokine burden with immune regulatory hotspots.',
    score: '247 variants',
    signal: 'NF-kB',
    icon: Activity,
    accent: 'amber',
  },
  {
    id: 'longevity',
    title: 'Longevity protected',
    subtitle: 'Lower methyl-age drift with repair pathway support.',
    score: '156 variants',
    signal: 'FOXO3',
    icon: Sparkles,
    accent: 'purple',
  },
  {
    id: 'endurance',
    title: 'Endurance optimized',
    subtitle: 'Mitochondrial expression and oxygen response advantage.',
    score: '182 variants',
    signal: 'PGC1A',
    icon: Zap,
    accent: 'green',
  },
  {
    id: 'cardiometabolic',
    title: 'Cardiometabolic risk',
    subtitle: 'Liver and adipose regulatory pressure with risk shift.',
    score: '301 variants',
    signal: 'FTO',
    icon: HeartPulse,
    accent: 'teal',
  },
];

const accentStyles = {
  teal: {
    border: 'border-rg-teal-500/45',
    bg: 'bg-rg-teal-500/10',
    text: 'text-rg-teal-300',
    dot: 'bg-rg-teal-400',
    ring: 'shadow-[0_0_24px_rgba(0,204,184,0.16)]',
  },
  purple: {
    border: 'border-rg-purple-500/45',
    bg: 'bg-rg-purple-500/10',
    text: 'text-rg-purple-300',
    dot: 'bg-rg-purple-400',
    ring: 'shadow-[0_0_24px_rgba(139,92,246,0.16)]',
  },
  green: {
    border: 'border-rg-success/45',
    bg: 'bg-rg-success/10',
    text: 'text-rg-success',
    dot: 'bg-rg-success',
    ring: 'shadow-[0_0_24px_rgba(16,185,129,0.14)]',
  },
  amber: {
    border: 'border-rg-warning/45',
    bg: 'bg-rg-warning/10',
    text: 'text-rg-warning',
    dot: 'bg-rg-warning',
    ring: 'shadow-[0_0_24px_rgba(245,158,11,0.12)]',
  },
};

function StepRail({ currentStep }: { currentStep: StepId }) {
  return (
    <div className="grid min-w-0 gap-6">
      {steps.map((item) => {
        const complete = currentStep > item.id;
        const active = currentStep === item.id;

        return (
          <div
            key={item.id}
            className={`relative min-w-0 overflow-hidden rounded-lg border transition-all ${
              active
                ? 'border-rg-teal-500/45 bg-rg-teal-500/10 shadow-[0_0_28px_rgba(0,204,184,0.10)]'
                : complete
                  ? 'border-rg-purple-500/30 bg-rg-purple-500/8'
                  : 'border-rg-border bg-rg-bg-secondary/50'
            }`}
          >
            <div className="m-3 flex items-start gap-4 rounded-md p-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-bold ${
                  complete
                    ? 'border-rg-purple-500/35 bg-rg-purple-500/12 text-rg-purple-300'
                    : active
                      ? 'border-rg-teal-500/40 bg-rg-teal-500/15 text-rg-teal-300'
                      : 'border-rg-border bg-rg-bg-primary/70 text-rg-text-muted'
                }`}
              >
                {complete ? <Check size={16} /> : item.id}
              </span>
              <div className="min-w-0">
                <p className={active ? 'text-sm font-bold text-rg-text-primary' : 'text-sm font-semibold text-rg-text-secondary'}>
                  {item.label}
                </p>
                <p className="mt-1 break-words text-xs leading-relaxed text-rg-text-muted">{item.summary}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SourceCard({
  item,
  active,
  onClick,
}: {
  item: SourceOption;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      className={`group relative min-w-0 overflow-hidden rounded-lg border text-left transition-all ${
        active
          ? 'border-rg-teal-500/55 bg-rg-teal-500/10 shadow-[0_0_32px_rgba(0,204,184,0.12)]'
          : 'border-rg-border bg-rg-bg-secondary/80 hover:border-rg-teal-500/30 hover:bg-rg-bg-hover/70'
      }`}
      style={{ padding: 14 }}
    >
      {active && (
        <motion.div
          layoutId="source-active-glow"
          className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-rg-teal-400 to-rg-purple-400"
        />
      )}

      <div className="grid min-w-0 gap-7 rounded-md" style={{ padding: 14 }}>
        <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-5">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border ${
                active ? 'border-rg-teal-500/35 bg-rg-teal-500/14 text-rg-teal-300' : 'border-rg-border bg-rg-bg-primary/70 text-rg-text-muted'
              }`}
            >
              <Icon size={22} />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-bold leading-snug text-rg-text-primary">
                {item.title}
              </h2>
              <p className="mt-2 max-w-2xl break-words text-sm leading-relaxed text-rg-text-secondary">
                {item.description}
              </p>
            </div>
          </div>
          <span
            className={`w-fit shrink-0 rounded-md border px-3 py-1.5 text-[11px] font-mono ${
              active ? 'border-rg-teal-500/35 bg-rg-teal-500/12 text-rg-teal-300' : 'border-rg-border bg-rg-bg-primary/70 text-rg-text-muted'
            }`}
          >
            {active ? 'Selected' : item.badge}
          </span>
        </div>

        <div className="flex flex-wrap gap-4">
          {item.points.map((point) => (
            <div
              key={point}
              className={`inline-flex min-w-[160px] items-center gap-2 rounded-lg border ${
                active ? 'border-rg-teal-500/20 bg-rg-teal-500/8' : 'border-rg-border/70 bg-rg-bg-primary/60'
              } px-5 py-4`}
            >
              <CheckCircle2 size={14} className={`shrink-0 ${active ? 'text-rg-teal-300' : 'text-rg-text-muted'}`} />
              <span className="text-xs leading-snug text-rg-text-muted">{point}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.button>
  );
}

function PersonaCard({
  item,
  active,
  onClick,
}: {
  item: PersonaOption;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  const accent = accentStyles[item.accent];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      className={`min-w-0 rounded-lg border text-left transition-all ${
        active ? `${accent.border} ${accent.bg} ${accent.ring}` : 'border-rg-border bg-rg-bg-secondary/80 hover:border-rg-purple-500/30 hover:bg-rg-bg-hover/70'
      }`}
      style={{ padding: 14 }}
    >
      <div className="rounded-md" style={{ padding: 14 }}>
      <div className="flex items-start gap-5">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border ${
            active ? `${accent.border} ${accent.bg} ${accent.text}` : 'border-rg-border bg-rg-bg-primary/70 text-rg-text-muted'
          }`}
        >
          <Icon size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-base font-bold leading-snug text-rg-text-primary">{item.title}</h2>
            <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${active ? accent.dot : 'bg-rg-border'}`} />
          </div>
          <p className="mt-2 break-words text-sm leading-relaxed text-rg-text-secondary">{item.subtitle}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-rg-border bg-rg-bg-primary/70 px-5 py-4">
          <p className="text-[11px] text-rg-text-muted">variant set</p>
          <p className="mt-1 text-sm font-bold text-rg-text-primary">{item.score}</p>
        </div>
        <div className="rounded-lg border border-rg-border bg-rg-bg-primary/70 px-5 py-4">
          <p className="text-[11px] text-rg-text-muted">signal</p>
          <p className={`mt-1 text-sm font-bold ${active ? accent.text : 'text-rg-text-primary'}`}>{item.signal}</p>
        </div>
      </div>
      </div>
    </motion.button>
  );
}

function RealSourcePrep({ source }: { source: SourceOption }) {
  const Icon = source.icon;

  return (
    <div className="grid gap-6">
      <div className="rounded-lg border border-rg-purple-500/25 bg-rg-purple-500/10" style={{ padding: 14 }}>
        <div className="rounded-md" style={{ padding: 14 }}>
          <div className="flex items-start gap-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-rg-purple-500/30 bg-rg-purple-500/10 text-rg-purple-300">
              <Icon size={22} />
            </span>
            <div>
              <h3 className="text-lg font-bold text-rg-text-primary">Real source path reserved</h3>
              <p className="mt-2 text-sm leading-relaxed text-rg-text-secondary">
                {source.title} will open a real workspace without loading synthetic dashboard values.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {[
          { label: 'Import status', value: 'Waiting for data', icon: UploadCloud },
          { label: 'Demo data', value: 'Hidden', icon: ShieldCheck },
          { label: 'Workspace mode', value: 'Real', icon: Lock },
        ].map((item) => {
          const ItemIcon = item.icon;
          return (
            <div key={item.label} className="rounded-lg border border-rg-border bg-rg-bg-secondary/80" style={{ padding: 14 }}>
              <div className="rounded-md" style={{ padding: 14 }}>
                <ItemIcon size={18} className="text-rg-teal-300" />
                <p className="mt-4 text-sm text-rg-text-muted">{item.label}</p>
                <p className="mt-1 text-base font-bold text-rg-text-primary">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SetupPreview({
  sourceTitle,
  persona,
  isDemoSource,
}: {
  sourceTitle: string;
  persona: PersonaOption;
  isDemoSource: boolean;
}) {
  const accent = accentStyles[persona.accent];
  const PersonaIcon = persona.icon;

  return (
    <aside
      className="min-w-0 overflow-hidden rounded-lg border border-rg-border bg-rg-bg-secondary/70 shadow-elevated backdrop-blur-xl"
      style={{ padding: 14 }}
    >
      <div className="rounded-md" style={{ padding: 14 }}>
      <div className="flex items-center justify-between gap-5 border-b border-rg-border/60 pb-5">
        <div>
          <p className="text-xs font-mono text-rg-teal-300">launch summary</p>
          <h2 className="mt-1 text-xl font-bold text-rg-text-primary">Selected setup</h2>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-rg-teal-500/30 bg-rg-teal-500/12 text-rg-teal-300">
          <Terminal size={20} />
        </span>
      </div>

      <div className="mt-6 grid min-w-0 gap-6">
        <div className="rounded-lg border border-rg-border bg-rg-bg-primary/70 p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rg-teal-500/12 text-rg-teal-300">
              <FileStack size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-rg-text-muted">data source</p>
              <p className="truncate text-sm font-bold text-rg-text-primary">{sourceTitle}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-lg border ${isDemoSource ? `${accent.border} ${accent.bg}` : 'border-rg-border bg-rg-bg-primary/70'} p-6`}>
          <div className="flex items-center gap-4">
            <span className={`flex h-10 w-10 items-center justify-center rounded-lg bg-rg-bg-primary/70 ${isDemoSource ? accent.text : 'text-rg-purple-300'}`}>
              {isDemoSource ? <PersonaIcon size={18} /> : <UploadCloud size={18} />}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-rg-text-muted">{isDemoSource ? 'persona' : 'real source status'}</p>
              <p className="truncate text-sm font-bold text-rg-text-primary">
                {isDemoSource ? persona.title : 'Waiting for your file'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-rg-border bg-rg-bg-primary/70 p-6">
          <div className="mb-5 flex min-w-0 items-center justify-between gap-4">
            <span className="min-w-0 text-sm font-bold text-rg-text-primary">What opens next</span>
            <span className="shrink-0 text-xs font-mono text-rg-purple-300">dashboard</span>
          </div>
          <div className="grid gap-4">
            {[
              { label: isDemoSource ? 'Demo data source' : 'Real data source', value: sourceTitle, icon: FileStack, color: 'text-rg-teal-300' },
              { label: isDemoSource ? 'Persona highlight' : 'Import status', value: isDemoSource ? persona.signal : 'Reserved', icon: isDemoSource ? PersonaIcon : UploadCloud, color: isDemoSource ? accent.text : 'text-rg-purple-300' },
              { label: 'Workspace status', value: isDemoSource ? 'Safe demo mode' : 'Real mode empty', icon: ShieldCheck, color: isDemoSource ? 'text-rg-success' : 'text-rg-purple-300' },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="flex min-w-0 items-center gap-4 rounded-lg border border-rg-border/70 bg-rg-bg-secondary/70 p-5">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rg-bg-primary/80 ${item.color}`}>
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-rg-text-muted">{item.label}</p>
                    <p className="mt-1 truncate text-sm font-bold text-rg-text-primary">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-6">
          <div className="rounded-lg border border-rg-border bg-rg-bg-primary/70 p-6">
            <Microscope size={16} className="text-rg-teal-300" />
            <p className="mt-3 text-[11px] text-rg-text-muted">modules</p>
            <p className="text-sm font-bold text-rg-text-primary">{isDemoSource ? '12 ready' : 'waiting'}</p>
          </div>
          <div className="rounded-lg border border-rg-border bg-rg-bg-primary/70 p-6">
            <Lock size={16} className="text-rg-purple-300" />
            <p className="mt-3 text-[11px] text-rg-text-muted">privacy</p>
            <p className="text-sm font-bold text-rg-text-primary">{isDemoSource ? 'sandbox' : 'real mode'}</p>
          </div>
        </div>
      </div>
      </div>
    </aside>
  );
}

function ReviewTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-rg-border bg-rg-bg-secondary/80" style={{ padding: 14 }}>
      <div className="flex items-start gap-5 rounded-md" style={{ padding: 14 }}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-rg-teal-500/25 bg-rg-teal-500/10 text-rg-teal-300">
          <Icon size={20} />
        </span>
        <div>
          <p className="text-sm text-rg-text-muted">{label}</p>
          <p className="mt-1 text-lg font-bold leading-snug text-rg-text-primary">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { mode, setMode, setCurrentPersona, isAuthenticated } = useApp();
  const [step, setStep] = useState<StepId>(1);
  const [source, setSource] = useState<SourceId>(() => (mode === 'real' ? 'vcf' : 'demo'));
  const [personaId, setPersonaId] = useState(personas[0].id);

  const selectedSource = useMemo(
    () => sources.find((item) => item.id === source) ?? sources[0],
    [source]
  );

  const selectedPersona = useMemo(
    () => personas.find((item) => item.id === personaId) ?? personas[0],
    [personaId]
  );

  const isDemoSource = source === 'demo';
  const progress = (step / steps.length) * 100;
  const activeStep = steps[step - 1];
  const stepTitle = step === 2 && !isDemoSource ? 'Prepare real source' : activeStep.title;
  const stepSummary =
    step === 2 && !isDemoSource
      ? 'Reserve the real import path and keep synthetic demo values hidden.'
      : activeStep.summary;

  const handleNext = () => {
    if (step < steps.length) {
      setStep((current) => (current + 1) as StepId);
      return;
    }

    // ── Demo source: switch to demo mode and load persona ──
    if (isDemoSource) {
      const fullPersona: DemoPersona = personaProfiles[personaId] ?? personaProfiles['inflammatory'];
      setMode('demo');
      writeStorageItem(PERSONA_STORAGE_KEY, JSON.stringify(fullPersona));
      setCurrentPersona(fullPersona);
      return navigate('/app/dashboard');
    }

    // ── Real source ──
    // If already logged in, go straight to the real dashboard
    if (isAuthenticated) {
      setMode('real');
      return navigate('/app/dashboard');
    }

    // Not logged in yet → send to login, then come back to dashboard in real mode
    navigate('/login?reason=real-mode');
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((current) => (current - 1) as StepId);
      return;
    }

    navigate('/');
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen overflow-x-hidden bg-rg-bg-primary text-rg-text-primary"
      style={{ maxWidth: '100vw' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-80"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,204,184,0.11), rgba(139,92,246,0.08) 42%, transparent 100%)',
        }}
      />

      <div
        className="relative z-10 min-w-0"
        style={{
          width: 'min(calc(100vw - clamp(32px, 8vw, 96px)), 1280px)',
          marginInline: 'auto',
          paddingTop: 48,
          paddingBottom: 96,
        }}
      >
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" size="md" icon={<ArrowLeft size={16} />} onClick={handleBack}>
            {step === 1 ? 'Back to landing' : 'Back'}
          </Button>

          <div className="flex items-center gap-3 rounded-lg border border-rg-border bg-rg-bg-secondary/70 px-4 py-2.5 backdrop-blur-xl">
            <span className="h-2.5 w-2.5 rounded-full bg-rg-teal-400 shadow-[0_0_14px_rgba(0,204,184,0.75)]" />
            <span className="text-sm font-mono text-rg-text-secondary">
              {isDemoSource ? 'synthetic setup active' : 'real setup active'}
            </span>
          </div>
        </header>

        <section style={{ marginTop: 56 }}>
          <div className="grid min-w-0 gap-5 lg:grid-cols-[1fr_420px] lg:items-end">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-rg-teal-500/25 bg-rg-teal-500/10 px-4 py-2 text-sm font-mono text-rg-teal-300">
                <Dna size={15} />
                ReguloMe onboarding
              </div>
              <h1 className="mt-6 max-w-3xl break-words text-3xl font-extrabold leading-tight text-rg-text-primary sm:text-4xl">
                Configure your virtual twin with a cleaner first run.
              </h1>
              <p className="mt-5 max-w-3xl break-words text-lg leading-relaxed text-rg-text-secondary">
                Choose a safe data source and open the dashboard with the right workspace context already prepared.
              </p>
            </div>

            <div className="min-w-0 rounded-lg border border-rg-border bg-rg-bg-secondary/70 shadow-elevated backdrop-blur-xl" style={{ padding: 14 }}>
              <div style={{ padding: 14 }}>
              <div className="mb-4 flex min-w-0 items-center justify-between gap-5">
                <span className="text-sm font-semibold text-rg-text-primary">Setup progress</span>
                <span className="text-sm font-mono text-rg-text-muted">Step {step} of {steps.length}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-rg-bg-primary">
                <motion.div
                  className="h-full rounded-full bg-linear-to-r from-rg-teal-500 via-rg-success to-rg-purple-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                />
              </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid min-w-0 gap-6 lg:grid-cols-[360px_1fr] lg:items-start" style={{ marginTop: 56 }}>
          <div className="grid min-w-0 gap-6 lg:sticky lg:top-6">
            <StepRail currentStep={step} />
            <SetupPreview sourceTitle={selectedSource.title} persona={selectedPersona} isDemoSource={isDemoSource} />
          </div>

          <div className="min-w-0 overflow-hidden rounded-lg border border-rg-border bg-rg-bg-card/72 shadow-elevated backdrop-blur-xl" style={{ padding: 14 }}>
            <div style={{ padding: 14 }}>
            <div className="border-b border-rg-border/60" style={{ paddingBottom: 28, marginBottom: 36 }}>
              <div className="min-w-0">
                <p className="text-sm font-mono text-rg-purple-300">{activeStep.label}</p>
                <h2 className="mt-2 text-2xl font-extrabold text-rg-text-primary">{stepTitle}</h2>
                <p className="mt-2 max-w-2xl break-words text-sm leading-relaxed text-rg-text-secondary">{stepSummary}</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {step === 1 && (
                  <div className="grid gap-6">
                    {sources.map((item) => (
                      <SourceCard
                        key={item.id}
                        item={item}
                        active={source === item.id}
                        onClick={() => setSource(item.id)}
                      />
                    ))}
                  </div>
                )}

                {step === 2 && (
                  isDemoSource ? (
                    <div className="grid gap-6 xl:grid-cols-2">
                      {personas.map((item) => (
                        <PersonaCard
                          key={item.id}
                          item={item}
                          active={personaId === item.id}
                          onClick={() => setPersonaId(item.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <RealSourcePrep source={selectedSource} />
                  )
                )}

                {step === 3 && (
                  <div className="grid gap-6">
                    <div className="grid gap-6 xl:grid-cols-2">
                      <ReviewTile label="Data source" value={selectedSource.title} icon={selectedSource.icon} />
                      <ReviewTile
                        label={isDemoSource ? 'Synthetic persona' : 'Real workspace'}
                        value={isDemoSource ? selectedPersona.title : 'No demo data loaded'}
                        icon={isDemoSource ? selectedPersona.icon : Lock}
                      />
                    </div>

                    <div className="rounded-lg border border-rg-teal-500/25 bg-rg-teal-500/10 p-7">
                      <div className="flex items-start gap-5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rg-bg-primary/70 text-rg-teal-300">
                          <ShieldCheck size={20} />
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-rg-text-primary">Selected workspace is ready</h3>
                          <p className="mt-2 text-sm leading-relaxed text-rg-text-secondary">
                            {isDemoSource
                              ? 'Your first dashboard opens with the selected synthetic data source, persona context, and safe sandbox mode enabled.'
                              : 'Your dashboard opens in real mode with demo values hidden until you connect the selected source.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col-reverse gap-5 border-t border-rg-border/60 sm:flex-row sm:items-center sm:justify-between" style={{ marginTop: 44, paddingTop: 28 }}>
              <Button variant="secondary" size="md" onClick={handleBack}>
                {step === 1 ? 'Cancel' : 'Previous'}
              </Button>
              <Button variant="primary" size="md" glow iconRight={<ArrowRight size={16} />} onClick={handleNext}>
                {step === steps.length ? 'Open workspace' : 'Continue'}
              </Button>
            </div>
            </div>
          </div>
        </section>
      </div>
    </motion.main>
  );
}
