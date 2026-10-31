import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dna,
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Check,
  Microscope,
  Stethoscope,
  FlaskConical,
  Compass,
  Activity,
  HeartPulse,
  Brain,
  Zap,
  Shield,
  Globe,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import api from '@/services/api';

interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  name: string;
  email: string;
}

const STEPS = [
  { id: 1, label: 'Account', icon: User },
  { id: 2, label: 'Profile', icon: Microscope },
  { id: 3, label: 'Interests', icon: Activity },
];

const ROLES = [
  {
    id: 'researcher',
    label: 'Researcher',
    description: 'Academic or industry genomics researcher',
    icon: <Microscope size={20} />,
    accent: '#0ae8d2',
    borderColor: 'border-rg-teal-500/35',
    bgColor: 'bg-rg-teal-500/10',
  },
  {
    id: 'clinician',
    label: 'Clinician',
    description: 'Physician or clinical geneticist',
    icon: <Stethoscope size={20} />,
    accent: '#8b5cf6',
    borderColor: 'border-rg-purple-500/35',
    bgColor: 'bg-rg-purple-500/10',
  },
  {
    id: 'biohacker',
    label: 'Biohacker',
    description: 'Self-optimization and longevity enthusiast',
    icon: <FlaskConical size={20} />,
    accent: '#f59e0b',
    borderColor: 'border-rg-warning/35',
    bgColor: 'bg-rg-warning/10',
  },
  {
    id: 'explorer',
    label: 'Curious Explorer',
    description: 'Learning about regulatory genomics',
    icon: <Compass size={20} />,
    accent: '#3b82f6',
    borderColor: 'border-rg-info/35',
    bgColor: 'bg-rg-info/10',
  },
];

const INTERESTS = [
  { id: 'variants', label: 'Regulatory Variants', icon: <Dna size={16} />, color: '#0ae8d2' },
  { id: 'expression', label: 'Gene Expression', icon: <Activity size={16} />, color: '#8b5cf6' },
  { id: 'epigenetics', label: 'Epigenetic Aging', icon: <Zap size={16} />, color: '#f59e0b' },
  { id: 'disease', label: 'Disease Networks', icon: <HeartPulse size={16} />, color: '#ef4444' },
  { id: 'neuro', label: 'Neurogenomics', icon: <Brain size={16} />, color: '#3b82f6' },
  { id: 'immune', label: 'Immunogenomics', icon: <Shield size={16} />, color: '#10b981' },
  { id: 'longevity', label: 'Longevity Science', icon: <FlaskConical size={16} />, color: '#ec4899' },
  { id: '3d-genome', label: '3D Genome Structure', icon: <Globe size={16} />, color: '#f97316' },
];

const PREVIEW_STEPS = [
  {
    step: 1,
    title: 'Credential layer',
    text: 'Secure identity for your regulatory workspace',
    icon: Lock,
  },
  {
    step: 2,
    title: 'Persona model',
    text: 'Match the interface to your scientific workflow',
    icon: Microscope,
  },
  {
    step: 3,
    title: 'Signal priorities',
    text: 'Tune modules around the pathways you care about',
    icon: Activity,
  },
];

const BASES = ['A', 'T', 'C', 'G', 'G', 'A', 'T', 'C', 'A', 'G', 'C', 'T'];
function InsetCard({
  children,
  className = '',
  innerClassName = '',
  outerPadding = 10,
  innerPadding = 14,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  outerPadding?: number;
  innerPadding?: number;
}) {
  return (
    <div className={`min-w-0 max-w-full rounded-lg border border-rg-border bg-rg-bg-card/70 ${className}`} style={{ padding: outerPadding }}>
      <div className={`min-w-0 max-w-full rounded-md ${innerClassName}`} style={{ padding: innerPadding }}>
        {children}
      </div>
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
      {STEPS.map((step, idx) => {
        const isComplete = currentStep > step.id;
        const isActive = currentStep === step.id;
        const Icon = step.icon;
        return (
          <>
            <motion.div
              key={step.id}
              animate={{ opacity: isActive || isComplete ? 1 : 0.45 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, flex: isActive ? 1.4 : 1,
                padding: '8px 14px', borderRadius: 999, transition: 'all 0.3s',
                background: isActive ? 'rgba(10,232,210,0.1)' : isComplete ? 'rgba(10,232,210,0.05)' : 'rgba(255,255,255,0.03)',
                border: isActive ? '1px solid rgba(10,232,210,0.35)' : isComplete ? '1px solid rgba(10,232,210,0.2)' : '1px solid rgba(56,78,122,0.25)',
                boxShadow: isActive ? '0 0 20px rgba(10,232,210,0.12)' : 'none' }}
            >
              <motion.div animate={{ scale: isActive ? 1.05 : 1 }}
                style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: isComplete ? 'rgba(10,232,210,0.2)' : isActive ? 'rgba(10,232,210,0.15)' : 'rgba(56,78,122,0.2)',
                  border: isActive || isComplete ? '1px solid rgba(10,232,210,0.4)' : '1px solid rgba(56,78,122,0.3)',
                  color: isActive || isComplete ? '#0ae8d2' : '#6b7d9c' }}>
                {isComplete ? <Check size={11} /> : <Icon size={11} />}
              </motion.div>
              <span style={{ fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden',
                color: isActive ? '#c8daf0' : isComplete ? '#8899b8' : '#4a5568' }}>
                {step.label}
              </span>
            </motion.div>
            {idx < STEPS.length - 1 && (
              <div style={{ flex: 0.15, height: 1, background: 'rgba(56,78,122,0.3)', borderRadius: 999 }} />
            )}
          </>
        );
      })}
    </div>
  );
}

function BioSignalPreview({ step }: { step: number }) {
  const activePreview = PREVIEW_STEPS[step - 1];
  const ActiveIcon = activePreview.icon;

  return (
    <InsetCard className="mt-9 bg-rg-bg-card/55 shadow-elevated" outerPadding={12} innerPadding={16}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-rg-teal-400">Regulatory setup map</p>
          <h3 className="mt-2 text-xl font-semibold text-rg-text-primary">Live signal onboarding</h3>
        </div>
        <motion.div
          key={step}
          initial={{ rotate: -20, scale: 0.85, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-rg-teal-500/30 bg-rg-teal-500/10 text-rg-teal-400"
        >
          <ActiveIcon size={18} />
        </motion.div>
      </div>

      <div className="mt-5 rounded-md border border-rg-border-light bg-rg-bg-primary/45" style={{ padding: 12 }}>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
          {BASES.map((base, index) => {
            const isLit = (index + step) % 3 === 0;
            return (
              <motion.div
                key={`${base}-${index}`}
                animate={{
                  y: isLit ? -2 : 0,
                  borderColor: isLit ? 'rgba(10,232,210,0.45)' : 'rgba(56,78,122,0.22)',
                  color: isLit ? '#0ae8d2' : '#8899b8',
                }}
                transition={{ duration: 0.35, delay: index * 0.02 }}
                className="flex h-8 items-center justify-center rounded-md border bg-rg-bg-tertiary/70 font-mono text-xs"
              >
                {base}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-3">
          <motion.div
            key={`loop-${step}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden rounded-md border border-rg-teal-500/25 bg-rg-bg-secondary/70"
            style={{ padding: 12 }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-rg-text-primary">Chromatin loop engine</p>
                <p className="mt-1 text-[11px] text-rg-text-muted">Enhancer contact model</p>
              </div>
              <div className="rounded-md border border-rg-teal-500/30 bg-rg-teal-500/10 px-3 py-2 text-xs font-semibold text-rg-teal-400">
                3D loop
              </div>
            </div>

            <div className="relative mt-4 min-h-[126px] overflow-hidden rounded-md border border-rg-border-light bg-rg-bg-primary/45" style={{ padding: 12 }}>
              <motion.div
                className="absolute left-1/2 top-1/2 h-24 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-rg-teal-500/25 bg-rg-teal-500/5"
                animate={{ scale: [0.98, 1.04, 0.98], opacity: [0.45, 0.75, 0.45] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute left-1/2 top-1/2 h-16 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-rg-purple-500/20"
                animate={{ scale: [1.03, 0.97, 1.03], opacity: [0.25, 0.55, 0.25] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
              />

              <div className="relative z-10 grid min-h-[102px] grid-cols-[1fr_62px_1fr] items-center gap-3">
                <motion.div
                  className="rounded-md border border-rg-teal-500/25 bg-rg-teal-500/10"
                  style={{ padding: 10 }}
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <p className="text-[10px] font-semibold uppercase text-rg-teal-400">Enhancer</p>
                  <p className="mt-2 text-xs font-semibold text-rg-text-primary">Open chromatin</p>
                  <p className="mt-1 text-[10px] leading-snug text-rg-text-muted">ATAC signal ready</p>
                </motion.div>

                <motion.div
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-rg-border-light bg-rg-bg-card/80 text-rg-teal-400"
                  animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Dna size={20} />
                </motion.div>

                <motion.div
                  className="rounded-md border border-rg-purple-500/25 bg-rg-purple-500/10"
                  style={{ padding: 10 }}
                  animate={{ y: [0, 2, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.25 }}
                >
                  <p className="text-[10px] font-semibold uppercase text-rg-purple-400">Target gene</p>
                  <p className="mt-2 text-xs font-semibold text-rg-text-primary">Expression shift</p>
                  <p className="mt-1 text-[10px] leading-snug text-rg-text-muted">RNA path linked</p>
                </motion.div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {['Loop contact', 'Motif match', 'Tissue aware'].map((item, index) => (
                <motion.div
                  key={item}
                  className="rounded-md border border-rg-border-light bg-rg-bg-primary/35 text-center text-[10px] font-medium text-rg-text-secondary"
                  style={{ padding: 8 }}
                  animate={{ opacity: [0.62, 1, 0.62] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: index * 0.22 }}
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="mt-5 rounded-md border border-rg-border-light bg-rg-bg-tertiary/45"
          style={{ padding: 12 }}
        >
          <p className="text-sm font-semibold text-rg-text-primary">{activePreview.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-rg-text-secondary">{activePreview.text}</p>
        </motion.div>
      </AnimatePresence>
    </InsetCard>
  );
}

function Step1({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  errors,
}: {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-rg-teal-500/20 bg-rg-teal-500/10 px-3 py-2 text-xs font-semibold text-rg-teal-400">
          <Sparkles size={13} />
          Step 01
        </div>
        <h2 className="text-2xl font-bold text-rg-text-primary">Create your account</h2>
        <p className="mt-2 text-sm leading-relaxed text-rg-text-secondary">
          Start exploring the regulatory genome in minutes.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Dr. Alex Rivera"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User size={16} />}
          error={errors.name}
        />
        <Input
          label="Email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={16} />}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Minimum 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock size={16} />}
          error={errors.password}
          hint="Use at least 8 characters with a mix of letters and numbers"
        />
      </div>
    </motion.div>
  );
}

function Step2({
  selectedRole,
  setSelectedRole,
}: {
  selectedRole: string;
  setSelectedRole: (v: string) => void;
}) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
    >
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-rg-purple-500/20 bg-rg-purple-500/10 px-3 py-2 text-xs font-semibold text-rg-purple-400">
          <Microscope size={13} />
          Step 02
        </div>
        <h2 className="text-2xl font-bold text-rg-text-primary">What describes you best?</h2>
        <p className="mt-2 text-sm leading-relaxed text-rg-text-secondary">
          We&apos;ll tailor your experience to your expertise level.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ROLES.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <motion.button
              key={role.id}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole(role.id)}
              className={`relative rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? `${role.borderColor} ${role.bgColor} shadow-card`
                  : 'border-rg-border bg-rg-bg-tertiary/80 hover:bg-rg-bg-hover hover:border-rg-border'
              }`}
              style={{ padding: 10 }}
            >
              {isSelected && (
                <motion.div
                  layoutId="role-selected"
                  className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-md bg-rg-teal-500 text-rg-bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Check size={12} />
                </motion.div>
              )}

              <div className="min-h-[132px] rounded-md bg-rg-bg-primary/25" style={{ padding: 14 }}>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-rg-border-light bg-rg-bg-card" style={{ color: role.accent }}>
                  {role.icon}
                </div>
                <p className="pr-8 text-sm font-semibold text-rg-text-primary">{role.label}</p>
                <p className="mt-2 text-xs leading-relaxed text-rg-text-muted">{role.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

function Step3({
  selectedInterests,
  toggleInterest,
}: {
  selectedInterests: string[];
  toggleInterest: (id: string) => void;
}) {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
    >
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-rg-warning/20 bg-rg-warning/10 px-3 py-2 text-xs font-semibold text-rg-warning">
          <Activity size={13} />
          Step 03
        </div>
        <h2 className="text-2xl font-bold text-rg-text-primary">What interests you?</h2>
        <p className="mt-2 text-sm leading-relaxed text-rg-text-secondary">
          Select all that apply and we&apos;ll prioritize relevant modules.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {INTERESTS.map((interest) => {
          const isSelected = selectedInterests.includes(interest.id);
          return (
            <motion.button
              key={interest.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleInterest(interest.id)}
              className={`rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-rg-teal-500/35 bg-rg-teal-500/10'
                  : 'border-rg-border bg-rg-bg-tertiary/80 hover:bg-rg-bg-hover'
              }`}
              style={{ padding: 9 }}
            >
              <div className="flex min-h-[70px] items-center gap-3 rounded-md bg-rg-bg-primary/25" style={{ padding: 12 }}>
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${
                    isSelected ? 'border-rg-teal-500/25 bg-rg-teal-500/15' : 'border-rg-border-light bg-rg-bg-card'
                  }`}
                  style={{ color: isSelected ? interest.color : undefined }}
                >
                  {isSelected ? <Check size={15} /> : interest.icon}
                </div>
                <span
                  className={`text-sm font-medium leading-snug ${
                    isSelected ? 'text-rg-text-primary' : 'text-rg-text-secondary'
                  }`}
                >
                  {interest.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <InsetCard className="mt-5 bg-rg-bg-tertiary/45" outerPadding={8} innerPadding={12}>
        <p className="text-center text-xs leading-relaxed text-rg-text-muted">
          You can change these preferences later in your profile settings.
        </p>
      </InsetCard>
    </motion.div>
  );
}

function SignupConfirmation({
  name,
  onOpenDashboard,
}: {
  name: string;
  onOpenDashboard: () => void;
}) {
  const firstName = name.trim().split(' ')[0] || 'there';

  return (
    <motion.div
      key="signup-confirmation"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.35 }}
      className="text-center"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border border-rg-teal-500/30 bg-rg-teal-500/10 text-rg-teal-400">
        <CheckCircle2 size={28} />
      </div>

      <h2 className="mt-5 text-2xl font-bold text-rg-text-primary">Account created, {firstName}</h2>
      <p className="mx-auto mt-3 max-w-[380px] text-sm leading-relaxed text-rg-text-secondary">
        Your real workspace is ready. Head to the Data Studio to upload your first genomic dataset.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          { label: 'Workspace mode', value: 'Real' },
          { label: 'Demo persona', value: 'Off' },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-rg-border bg-rg-bg-tertiary/65" style={{ padding: 10 }}>
            <div className="rounded-md bg-rg-bg-primary/35 text-left" style={{ padding: 12 }}>
              <p className="text-[11px] font-semibold uppercase text-rg-text-muted">{item.label}</p>
              <p className="mt-2 text-sm font-bold text-rg-text-primary">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={onOpenDashboard}
        iconRight={<ArrowRight size={16} />}
        className="mt-7 w-full"
        glow
      >
        Continue to Data Studio
      </Button>
    </motion.div>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { setMode, setCurrentPersona, setIsAuthenticated, setUserIdentity, clearUploadedData } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setSubmitError('');
    setLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/signup', {
        name: name.trim(),
        email: email.trim(),
        password,
      });
      api.setToken(response.access_token);
      setIsAuthenticated(true);
      setUserIdentity(response.name, response.email);
      setMode('real');
      clearUploadedData();
      setAccountCreated(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to create your account right now.');
    } finally {
      setLoading(false);
    }
  };

  const openDashboard = () => {
    navigate('/app/data-studio');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', background: '#050810' }}
      className="max-lg:grid-cols-1">
      <div className="relative hidden min-h-screen items-center justify-center overflow-hidden lg:flex"
        style={{ background: 'linear-gradient(145deg, #050810, #0a0e1a, #0d1225)', borderRight: '1px solid rgba(56,78,122,0.2)' }}>
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(10,232,210,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.18) 1px, transparent 1px)',
            backgroundSize: '42px 42px',
          }}
        />
        <motion.div
          className="absolute left-0 top-0 h-full w-px bg-rg-teal-400/40"
          animate={{ x: ['0vw', '48vw', '0vw'], opacity: [0.15, 0.45, 0.15] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 w-full max-w-[540px] px-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-rg-teal-500 to-rg-purple-600 shadow-glow-teal">
                <Dna className="text-white" size={24} />
              </div>
              <span className="text-3xl font-bold tracking-normal text-rg-text-primary">
                Regulo<span className="text-rg-teal-400">Me</span>
              </span>
            </div>

            <div className="mt-9">
              <p className="text-sm font-semibold uppercase text-rg-teal-400">Synthetic demo available</p>
              <h1 className="mt-3 max-w-[460px] text-4xl font-bold leading-tight text-rg-text-primary">
                Sign up through a regulatory signal map.
              </h1>
              <p className="mt-4 max-w-[430px] text-sm leading-7 text-rg-text-secondary">
                Build a workspace around variants, expression, aging signals, and network biology without losing the clean dashboard feel.
              </p>
            </div>

            <BioSignalPreview step={step} />

            <div className="mt-6 grid grid-cols-3 gap-4">
              {PREVIEW_STEPS.map((item) => {
                const Icon = item.icon;
                const isActive = step === item.step;
                const isDone = step > item.step;
                return (
                  <div
                    key={item.step}
                    className={`rounded-lg border ${
                      isActive
                        ? 'border-rg-teal-500/35 bg-rg-teal-500/10'
                        : isDone
                        ? 'border-rg-teal-500/20 bg-rg-teal-500/5'
                        : 'border-rg-border bg-rg-bg-card/55'
                    }`}
                    style={{ padding: 8 }}
                  >
                    <div className="rounded-md bg-rg-bg-primary/25" style={{ padding: 10 }}>
                      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md border border-rg-border-light text-rg-teal-400">
                        {isDone ? <Check size={15} /> : <Icon size={15} />}
                      </div>
                      <p className="text-xs font-semibold leading-snug text-rg-text-primary">{item.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex min-h-screen min-w-0 items-center justify-center overflow-x-hidden"
        style={{ padding: '32px clamp(16px, 4vw, 52px)',
          background: 'linear-gradient(155deg, #060910 0%, #090d1a 50%, #0b0f1e 100%)', position: 'relative' }}>

        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: '20%', left: '60%', transform: 'translate(-50%,-50%)',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.07), transparent 65%)',
          filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '30%', transform: 'translate(-50%,-50%)',
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(10,232,210,0.05), transparent 65%)',
          filter: 'blur(80px)', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}
        >
          {/* Mobile logo */}
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <div style={{ width: 36, height: 36, borderRadius: 12,
              background: 'linear-gradient(135deg, #0ae8d2, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Dna color="#fff" size={16} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#e8edf5' }}>
              Regulo<span style={{ color: '#0ae8d2' }}>Me</span>
            </span>
          </div>

          {/* Premium card */}
          <div style={{
            borderRadius: 24, padding: '36px 36px 32px',
            background: 'linear-gradient(155deg, rgba(12,17,32,0.97) 0%, rgba(8,12,24,0.98) 60%, rgba(10,14,22,0.95) 100%)',
            border: '1px solid rgba(56,78,122,0.25)',
            backdropFilter: 'blur(32px)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset, 0 1px 0 rgba(255,255,255,0.06) inset',
          }}>
            {/* Top shimmer bar */}
            <div style={{ height: 2, borderRadius: 999, marginBottom: 32,
              background: 'linear-gradient(90deg, transparent 0%, #0ae8d2 30%, #8b5cf6 70%, transparent 100%)',
              opacity: 0.8 }} />

            <AnimatePresence mode="wait">
              {accountCreated ? (
                <SignupConfirmation name={name} onOpenDashboard={openDashboard} />
              ) : (
                <motion.div key="signup-wizard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <StepIndicator currentStep={step} />

                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <Step1
                        name={name}
                        setName={setName}
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                        errors={errors}
                      />
                    )}
                    {step === 2 && (
                      <Step2 selectedRole={selectedRole} setSelectedRole={setSelectedRole} />
                    )}
                    {step === 3 && (
                      <Step3 selectedInterests={selectedInterests} toggleInterest={toggleInterest} />
                    )}
                  </AnimatePresence>

                  <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {step > 1 ? (
                      <Button
                        variant="ghost"
                        size="md"
                        onClick={handleBack}
                        icon={<ArrowLeft size={16} />}
                        className="w-full sm:w-auto"
                      >
                        Back
                      </Button>
                    ) : (
                      <div className="hidden sm:block" />
                    )}

                    {step < 3 ? (
                      <motion.button type="button" onClick={handleNext}
                        whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 800,
                          background: 'linear-gradient(135deg, #0ae8d2, #06b6d4)',
                          color: '#050810', border: 'none', cursor: 'pointer',
                          boxShadow: '0 0 24px rgba(10,232,210,0.3)' }}>
                        Continue <ArrowRight size={16} />
                      </motion.button>
                    ) : (
                      <motion.button type="button" onClick={handleSubmit} disabled={loading}
                        whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                        whileTap={!loading ? { scale: 0.98 } : {}}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 800,
                          background: loading ? 'rgba(56,78,122,0.4)' : 'linear-gradient(135deg, #0ae8d2, #06b6d4)',
                          color: loading ? '#6b7d9c' : '#050810', border: 'none',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          boxShadow: loading ? 'none' : '0 0 24px rgba(10,232,210,0.3)' }}>
                        {loading ? (
                          <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                            borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        ) : (
                          <><Sparkles size={15} /> Create Account</>
                        )}
                      </motion.button>
                    )}
                  </div>

                  {submitError && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, fontSize: 13,
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                        color: '#ef4444' }}>
                      {submitError}
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#4a5568', marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#0ae8d2', fontWeight: 700, textDecoration: 'none' }}>
              Sign in →
            </Link>
          </p>
        </motion.div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes shimmer { to { background-position: 200% center; } }`}</style>
    </div>
  );
}
