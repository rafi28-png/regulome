/* =============================================
   ReguloMe — Self-Optimization Studio Data
   ============================================= */

export interface Protocol {
  id: string;
  name: string;
  category: 'sleep' | 'nutrition' | 'exercise' | 'stress' | 'supplementation' | 'fasting';
  status: 'active' | 'paused' | 'completed' | 'recommended';
  adherence: number; // 0–100
  impact: 'high' | 'medium' | 'low';
  linkedPathways: string[];
  linkedVariants: string[];
  description: string;
  startedAt: string;
  biomarkerEffect: string;
  accentColor: string;
}

export interface Intervention {
  id: string;
  title: string;
  reasoning: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timeframe: string;
  linkedVariant: string;
  gene: string;
  pathway: string;
  expectedGain: string;
  evidenceLevel: 'validated' | 'literature' | 'predicted';
}

export interface LifestyleMetric {
  label: string;
  value: string | number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  color: string;
  icon: string;
}

export interface PathwayStatus {
  name: string;
  score: number;
  maxScore: number;
  status: 'optimal' | 'improving' | 'needs-attention' | 'critical';
  variants: number;
  modulators: string[];
}

export interface WeeklyAdherence {
  day: string;
  sleep: number;
  nutrition: number;
  exercise: number;
  stress: number;
}

// ── Protocols ──────────────────────────────────
export const protocols: Protocol[] = [
  {
    id: 'sleep-01',
    name: 'Circadian anchoring',
    category: 'sleep',
    status: 'active',
    adherence: 86,
    impact: 'high',
    linkedPathways: ['CLOCK/BMAL1', 'NF-kB anti-inflammatory'],
    linkedVariants: ['rs1800795', 'rs4988235'],
    description: 'Fixed wake time at 06:30, dark room by 22:00. Targets CLOCK gene expression rhythm to reduce inflammatory cytokine burst.',
    startedAt: '2026-01-12',
    biomarkerEffect: '↓ IL-6, ↑ melatonin amplitude',
    accentColor: '#8b5cf6',
  },
  {
    id: 'nutrition-01',
    name: 'IL-6 suppression diet',
    category: 'nutrition',
    status: 'active',
    adherence: 74,
    impact: 'high',
    linkedPathways: ['NF-kB / IL-6', 'Omega-3 EPA/DHA'],
    linkedVariants: ['rs1800795', 'rs6983267'],
    description: 'Mediterranean-pattern with high EPA/DHA intake (3g/day). Directly downregulates IL-6 promoter activity in rs1800795 carriers.',
    startedAt: '2026-01-20',
    biomarkerEffect: '↓ CRP, ↓ IL-6, ↑ BDNF',
    accentColor: '#10b981',
  },
  {
    id: 'exercise-01',
    name: 'Zone 2 + resistance split',
    category: 'exercise',
    status: 'active',
    adherence: 91,
    impact: 'high',
    linkedPathways: ['PGC-1α / AMPK', 'mTOR / IGF-1'],
    linkedVariants: ['rs4988235', 'rs9939609'],
    description: '4×/week: 3 Zone 2 sessions (45min) + 2 resistance sessions. Activates PGC-1α to improve mitochondrial density and offset FTO-linked metabolic risk.',
    startedAt: '2025-12-05',
    biomarkerEffect: '↑ VO₂max, ↓ visceral fat, ↑ GLUT4',
    accentColor: '#0ae8d2',
  },
  {
    id: 'stress-01',
    name: 'HRV-driven breathwork',
    category: 'stress',
    status: 'active',
    adherence: 68,
    impact: 'medium',
    linkedPathways: ['HPA axis / cortisol', 'Vagal tone'],
    linkedVariants: ['rs1800795'],
    description: '6-cycle/min coherent breathing for 15min each morning. Reduces cortisol-driven NF-kB activation and strengthens vagal tone.',
    startedAt: '2026-02-01',
    biomarkerEffect: '↑ HRV, ↓ cortisol AM, ↓ NF-kB',
    accentColor: '#f59e0b',
  },
  {
    id: 'supplement-01',
    name: 'Omega-3 + Magnesium protocol',
    category: 'supplementation',
    status: 'active',
    adherence: 95,
    impact: 'medium',
    linkedPathways: ['EPA/DHA membrane', 'NMDA / GABA'],
    linkedVariants: ['rs1800795', 'rs429358'],
    description: '3g EPA/DHA (triglyceride form) + 400mg Mg glycinate nightly. Synergistic anti-inflammatory and sleep architecture support.',
    startedAt: '2025-11-15',
    biomarkerEffect: '↓ triglycerides, ↑ slow-wave sleep',
    accentColor: '#3b82f6',
  },
  {
    id: 'fasting-01',
    name: 'Time-restricted eating 16:8',
    category: 'fasting',
    status: 'paused',
    adherence: 52,
    impact: 'medium',
    linkedPathways: ['AMPK / autophagy', 'Insulin / IGF-1'],
    linkedVariants: ['rs9939609', 'rs4988235'],
    description: 'Eating window 10:00–18:00. Promotes AMPK activation and supports FTO variant carriers with metabolic timing advantage.',
    startedAt: '2026-03-10',
    biomarkerEffect: '↑ ketones, ↑ autophagy markers',
    accentColor: '#ec4899',
  },
];

// ── Interventions ───────────────────────────────
export const interventions: Intervention[] = [
  {
    id: 'int-01',
    title: 'Add cold exposure (2×/week)',
    reasoning: 'rs4988235 LCT variant correlates with enhanced cold shock response and PGC-1α activation. Cold exposure may amplify your existing exercise gains by 18–32%.',
    category: 'exercise',
    priority: 'high',
    timeframe: '3–4 weeks',
    linkedVariant: 'rs4988235',
    gene: 'LCT',
    pathway: 'PGC-1α / Brown adipose',
    expectedGain: '+12% mitochondrial efficiency',
    evidenceLevel: 'literature',
  },
  {
    id: 'int-02',
    title: 'Increase DHA to 4g/day',
    reasoning: 'rs1800795 IL-6 promoter variant shows dose-dependent suppression with higher EPA/DHA. Current 3g intake may be sub-threshold for your variant load.',
    category: 'nutrition',
    priority: 'critical',
    timeframe: '6–8 weeks',
    linkedVariant: 'rs1800795',
    gene: 'IL6',
    pathway: 'NF-kB / IL-6',
    expectedGain: '↓ IL-6 by est. 22%',
    evidenceLevel: 'validated',
  },
  {
    id: 'int-03',
    title: 'Add sauna 3×/week (20min)',
    reasoning: 'APOE rs429358 carriers show cardiovascular risk reduction with regular heat shock exposure. HSP70 induction protects lipid metabolism pathways.',
    category: 'exercise',
    priority: 'high',
    timeframe: '4–6 weeks',
    linkedVariant: 'rs429358',
    gene: 'APOE',
    pathway: 'HSP70 / Lipid clearance',
    expectedGain: '↓ LDL-C by est. 8–12%',
    evidenceLevel: 'literature',
  },
  {
    id: 'int-04',
    title: 'Introduce ashwagandha (600mg/day)',
    reasoning: 'High-adherence HPA-axis modulators reduce cortisol variance in NF-kB–upregulated phenotypes significantly, complementing current breathwork.',
    category: 'supplementation',
    priority: 'medium',
    timeframe: '8–12 weeks',
    linkedVariant: 'rs1800795',
    gene: 'IL6',
    pathway: 'HPA axis / Cortisol',
    expectedGain: '↓ cortisol 14–20%',
    evidenceLevel: 'predicted',
  },
];

// ── Pathway Statuses ────────────────────────────
export const pathwayStatuses: PathwayStatus[] = [
  { name: 'NF-kB / Inflammatory', score: 64, maxScore: 100, status: 'needs-attention', variants: 4, modulators: ['IL-6 diet', 'Omega-3', 'Breathwork'] },
  { name: 'Mitochondrial / PGC-1α', score: 81, maxScore: 100, status: 'improving', variants: 2, modulators: ['Zone 2 exercise', 'TRE 16:8'] },
  { name: 'Insulin / mTOR', score: 73, maxScore: 100, status: 'improving', variants: 3, modulators: ['Resistance training', 'TRE 16:8'] },
  { name: 'Circadian / CLOCK', score: 86, maxScore: 100, status: 'optimal', variants: 1, modulators: ['Circadian anchoring'] },
  { name: 'HPA Axis / Cortisol', score: 58, maxScore: 100, status: 'needs-attention', variants: 2, modulators: ['Breathwork', 'Ashwagandha (rec.)'] },
  { name: 'Lipid Clearance / APOE', score: 47, maxScore: 100, status: 'critical', variants: 1, modulators: ['Omega-3', 'Sauna (rec.)'] },
];

// ── Weekly Adherence Data ───────────────────────
export const weeklyAdherence: WeeklyAdherence[] = [
  { day: 'Mon', sleep: 90, nutrition: 85, exercise: 100, stress: 70 },
  { day: 'Tue', sleep: 88, nutrition: 72, exercise: 0, stress: 65 },
  { day: 'Wed', sleep: 92, nutrition: 80, exercise: 100, stress: 75 },
  { day: 'Thu', sleep: 85, nutrition: 78, exercise: 100, stress: 68 },
  { day: 'Fri', sleep: 76, nutrition: 65, exercise: 0, stress: 55 },
  { day: 'Sat', sleep: 82, nutrition: 88, exercise: 100, stress: 80 },
  { day: 'Sun', sleep: 94, nutrition: 92, exercise: 0, stress: 88 },
];

// ── Lifestyle Metrics ───────────────────────────
export const optimizationStats = {
  overallScore: 74,
  protocolsActive: 5,
  averageAdherence: 83,
  pathwaysImproving: 3,
  interventionsPending: 4,
  weeklyStreak: 6,
};
