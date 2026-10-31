// ============================================
// ReguloMe — Dashboard Demo Data
// ============================================
// Synthetic data for the Dashboard command center.
// All values are illustrative and based on the
// "Inflammatory Immune-Skewed" default persona.

import type {
  EvidenceLevel,
  RegulatoryElementType,
  DiseaseDomain,
} from '@/types';

/* ── Stat Card Data ────────────────────────── */
export const dashboardStats = {
  regulatoryAge: {
    value: 42.3,
    chronological: 38,
    delta: +4.3,
    trend: 'accelerating' as const,
    trendLabel: 'vs 6mo ago',
    trendValue: +2.1,
  },
  topVariantsCount: 87,
  totalVariants: 2847,
  riskScore: 72,
  riskLevel: 'elevated' as const,
  epigeneticDelta: +4.3,
  highImpactTissues: 6,
  activePathways: 14,
};

/* ── Variant Impact Summary (for bar chart) ── */
export interface VariantImpactEntry {
  element: string;
  elementType: RegulatoryElementType;
  gain: number;
  loss: number;
  neutral: number;
}

export const variantImpactData: VariantImpactEntry[] = [
  { element: 'Enhancers', elementType: 'enhancer', gain: 42, loss: 68, neutral: 312 },
  { element: 'Promoters', elementType: 'promoter', gain: 31, loss: 22, neutral: 198 },
  { element: 'Silencers', elementType: 'silencer', gain: 8, loss: 35, neutral: 87 },
  { element: 'TFBS', elementType: 'tfbs', gain: 56, loss: 41, neutral: 420 },
  { element: 'Insulators', elementType: 'insulator', gain: 12, loss: 19, neutral: 145 },
  { element: 'CTCF Sites', elementType: 'ctcf_site', gain: 18, loss: 27, neutral: 210 },
];

/* ── Tissue Impact Heatmap ─────────────────── */
export interface TissueImpactEntry {
  tissue: string;
  impactScore: number; // 0-100
  affectedVariants: number;
  trend: 'up' | 'down' | 'stable';
  riskColor: string; // CSS color
}

export const tissueImpactData: TissueImpactEntry[] = [
  { tissue: 'Liver', impactScore: 82, affectedVariants: 340, trend: 'up', riskColor: '#ef4444' },
  { tissue: 'Heart', impactScore: 71, affectedVariants: 285, trend: 'up', riskColor: '#f97316' },
  { tissue: 'Immune', impactScore: 91, affectedVariants: 512, trend: 'up', riskColor: '#ef4444' },
  { tissue: 'Brain', impactScore: 43, affectedVariants: 178, trend: 'stable', riskColor: '#eab308' },
  { tissue: 'Adipose', impactScore: 67, affectedVariants: 234, trend: 'up', riskColor: '#f97316' },
  { tissue: 'Muscle', impactScore: 38, affectedVariants: 145, trend: 'down', riskColor: '#22c55e' },
  { tissue: 'Thyroid', impactScore: 55, affectedVariants: 198, trend: 'stable', riskColor: '#eab308' },
  { tissue: 'Intestine', impactScore: 78, affectedVariants: 310, trend: 'up', riskColor: '#ef4444' },
  { tissue: 'Kidney', impactScore: 45, affectedVariants: 167, trend: 'stable', riskColor: '#eab308' },
  { tissue: 'Lung', impactScore: 61, affectedVariants: 220, trend: 'up', riskColor: '#f97316' },
  { tissue: 'Pancreas', impactScore: 52, affectedVariants: 189, trend: 'stable', riskColor: '#eab308' },
  { tissue: 'Bone Marrow', impactScore: 76, affectedVariants: 298, trend: 'up', riskColor: '#ef4444' },
];

/* ── Disease Risk Distribution ─────────────── */
export interface DiseaseRiskEntry {
  domain: DiseaseDomain;
  label: string;
  riskScore: number; // 0-100
  variantCount: number;
  icon: string;
  color: string;
}

export const diseaseRiskData: DiseaseRiskEntry[] = [
  { domain: 'inflammatory', label: 'Inflammatory', riskScore: 88, variantCount: 412, icon: '🔥', color: '#ef4444' },
  { domain: 'cardiovascular', label: 'Cardiovascular', riskScore: 72, variantCount: 285, icon: '❤️', color: '#f97316' },
  { domain: 'autoimmune', label: 'Autoimmune', riskScore: 81, variantCount: 367, icon: '🛡️', color: '#a855f7' },
  { domain: 'metabolic', label: 'Metabolic', riskScore: 65, variantCount: 234, icon: '⚡', color: '#eab308' },
  { domain: 'neurodegenerative', label: 'Neuro', riskScore: 41, variantCount: 156, icon: '🧠', color: '#3b82f6' },
  { domain: 'cancer', label: 'Cancer', riskScore: 38, variantCount: 142, icon: '🎗️', color: '#ec4899' },
];

/* ── Regulatory Age Trend (sparkline) ──────── */
export interface AgeTrendPoint {
  month: string;
  epigeneticAge: number;
  regulatoryAge: number;
  chronological: number;
}

export const ageTrendData: AgeTrendPoint[] = [
  { month: 'Jul', epigeneticAge: 39.8, regulatoryAge: 40.1, chronological: 37.5 },
  { month: 'Aug', epigeneticAge: 40.1, regulatoryAge: 40.4, chronological: 37.6 },
  { month: 'Sep', epigeneticAge: 40.5, regulatoryAge: 40.9, chronological: 37.7 },
  { month: 'Oct', epigeneticAge: 40.9, regulatoryAge: 41.2, chronological: 37.8 },
  { month: 'Nov', epigeneticAge: 41.3, regulatoryAge: 41.5, chronological: 37.9 },
  { month: 'Dec', epigeneticAge: 41.5, regulatoryAge: 41.8, chronological: 38.0 },
  { month: 'Jan', epigeneticAge: 41.8, regulatoryAge: 42.0, chronological: 38.1 },
  { month: 'Feb', epigeneticAge: 42.0, regulatoryAge: 42.3, chronological: 38.2 },
];

/* ── Recent Activity / Quick Actions ───────── */
export interface ActivityItem {
  id: string;
  type: 'variant_found' | 'report_generated' | 'pathway_alert' | 'simulation_complete' | 'evidence_update';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  accentColor: string;
}

export const recentActivity: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'pathway_alert',
    title: 'NF-κB Pathway Alert',
    description: 'Elevated regulatory burden detected across 12 inflammatory enhancers.',
    timestamp: '2 hours ago',
    icon: '⚠️',
    accentColor: '#f59e0b',
  },
  {
    id: 'act-2',
    type: 'variant_found',
    title: 'High-Impact Variant Flagged',
    description: 'rs1800795 (IL-6 promoter) — predicted transcriptional gain, immune-skewed signal.',
    timestamp: '5 hours ago',
    icon: '🧬',
    accentColor: '#0ae8d2',
  },
  {
    id: 'act-3',
    type: 'simulation_complete',
    title: 'Twin Simulation Complete',
    description: '"Anti-inflammatory Protocol" scenario finished — regulatory burden reduced by 18%.',
    timestamp: '1 day ago',
    icon: '🔬',
    accentColor: '#8b5cf6',
  },
  {
    id: 'act-4',
    type: 'report_generated',
    title: 'Weekly Report Ready',
    description: 'Your "Clinician Summary" report for week 12 has been generated.',
    timestamp: '2 days ago',
    icon: '📄',
    accentColor: '#3b82f6',
  },
  {
    id: 'act-5',
    type: 'evidence_update',
    title: 'Evidence Level Upgraded',
    description: 'rs12740374 (SORT1 enhancer) upgraded from "Predicted" to "Literature" confidence.',
    timestamp: '3 days ago',
    icon: '📚',
    accentColor: '#10b981',
  },
];

/* ── Top Variants Preview ──────────────────── */
export interface TopVariantPreview {
  rsId: string;
  gene: string;
  elementType: RegulatoryElementType;
  effect: 'gain' | 'loss' | 'neutral';
  evidenceLevel: EvidenceLevel;
  priorityScore: number;
  tissue: string;
}

export const topVariants: TopVariantPreview[] = [
  { rsId: 'rs1800795', gene: 'IL-6', elementType: 'promoter', effect: 'gain', evidenceLevel: 'validated', priorityScore: 94, tissue: 'Immune' },
  { rsId: 'rs12740374', gene: 'SORT1', elementType: 'enhancer', effect: 'loss', evidenceLevel: 'literature', priorityScore: 89, tissue: 'Liver' },
  { rsId: 'rs6983267', gene: 'MYC', elementType: 'enhancer', effect: 'gain', evidenceLevel: 'validated', priorityScore: 87, tissue: 'Intestine' },
  { rsId: 'rs1333049', gene: 'CDKN2B-AS1', elementType: 'silencer', effect: 'loss', evidenceLevel: 'predicted', priorityScore: 82, tissue: 'Heart' },
  { rsId: 'rs7903146', gene: 'TCF7L2', elementType: 'enhancer', effect: 'gain', evidenceLevel: 'literature', priorityScore: 79, tissue: 'Pancreas' },
];
