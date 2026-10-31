// ============================================
// ReguloMe — Core Type Definitions
// ============================================

// === Evidence & Confidence ===
export type EvidenceLevel = 'validated' | 'literature' | 'predicted' | 'inferred';

export type ConfidenceScore = {
  value: number; // 0-1
  level: EvidenceLevel;
  label: string;
};

// === Regulatory Elements ===
export type RegulatoryElementType =
  | 'enhancer'
  | 'promoter'
  | 'silencer'
  | 'insulator'
  | 'tfbs'        // transcription factor binding site
  | 'ctcf_site'
  | 'super_enhancer'
  | 'locus_control_region';

// === Variant ===
export interface RegulatoryVariant {
  id: string;
  chromosome: string;
  position: number;
  refAllele: string;
  altAllele: string;
  rsId?: string;
  elementType: RegulatoryElementType;
  affectedTFs: string[];
  predictedEffect: 'gain' | 'loss' | 'neutral';
  linkedGenes: string[];
  tissues: string[];
  confidenceScore: ConfidenceScore;
  priorityScore: number; // 0-100
  evidenceLevel: EvidenceLevel;
  bookmarked?: boolean;
}

// === Gene Expression ===
export interface GeneExpressionEntry {
  gene: string;
  tissue: string;
  expressionLevel: number;
  deviationFromBaseline: number;
  affectedByVariants: string[];
  isHotspot: boolean;
}

// === Network Graph ===
export interface NetworkNode {
  id: string;
  label: string;
  type: 'transcription_factor' | 'enhancer' | 'promoter' | 'gene' | 'pathway' | 'tissue' | 'disease';
  size: number;
  color?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight: number; // 0-1 confidence
  type: 'regulates' | 'activates' | 'represses' | 'associated' | 'interacts';
}

export interface NetworkGraph {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

// === Disease Domain ===
export type DiseaseDomain =
  | 'cardiovascular'
  | 'inflammatory'
  | 'autoimmune'
  | 'metabolic'
  | 'neurodegenerative'
  | 'cancer'
  | 'endocrine'
  | 'hepatic'
  | 'immune'
  | 'hematologic'
  | 'mitochondrial'
  | 'longevity';

export interface DiseaseSystemEntry {
  domain: DiseaseDomain;
  label: string;
  description: string;
  variantCount: number;
  disruptedPathways: string[];
  affectedTissues: string[];
  regulatoryBurden: number; // 0-100
  expressionShifts: number;
  evidenceGrade: EvidenceLevel;
  supportStrategies: string[];
  riskLevel: 'low' | 'moderate' | 'elevated' | 'high';
  icon: string;
}

// === Epigenetic Clock ===
export interface EpigeneticAge {
  chronologicalAge: number;
  epigeneticAge: number;
  regulatoryMethylationAge: number;
  trend: 'accelerating' | 'stable' | 'decelerating';
  isEstimated: boolean;
  historyPoints: { date: string; epigeneticAge: number; regulatoryAge: number }[];
}

// === Optimization / Habit Tracking ===
export interface HabitEntry {
  id: string;
  date: string;
  category: 'sleep' | 'fasting' | 'exercise' | 'stress' | 'diet' | 'cold_exposure' | 'supplements' | 'routine' | 'custom';
  label: string;
  value: number;
  unit: string;
  pathwaySupport: string[];
}

export interface OptimizationGoal {
  id: string;
  label: string;
  targetPathways: string[];
  currentScore: number;
  targetScore: number;
  streak: number;
}

// === Simulator ===
export interface SimulationScenario {
  id: string;
  label: string;
  adjustments: Record<string, number>;
  results: SimulationResult;
}

export interface SimulationResult {
  pathwaySupport: Record<string, number>;
  regulatoryBurden: number;
  tissueTrends: Record<string, number>;
  ageTrend: number;
  networkBalance: number;
}

// === Persona (Demo) ===
export interface DemoPersona {
  id: string;
  name: string;
  label: string;
  description: string;
  profileType: string;
  age: number;
  genomeBuild: string;
  variantCount: number;
  color: string;
  icon: string;
}

// === Dashboard Summary ===
export interface DashboardSummary {
  regulatoryAge: EpigeneticAge;
  topVariants: RegulatoryVariant[];
  tissueHighlights: { tissue: string; impactScore: number; trend: string }[];
  diseaseSystems: DiseaseSystemEntry[];
  habitSnapshot: { totalStreak: number; weeklyScore: number; topHabit: string };
  weeklyReportSummary: string;
}

// === App State ===
export type AppMode = 'demo' | 'real';

export interface AppState {
  mode: AppMode;
  currentPersona: DemoPersona | null;
  isAuthenticated: boolean;
  user: UserProfile | null;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// === Report ===
export type ReportType = 'user_friendly' | 'scientific' | 'clinician' | 'pathway';

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  generatedAt: string;
  sections: ReportSection[];
}

export interface ReportSection {
  title: string;
  content: string;
  visualizations?: string[];
}

// === Research Workbench ===
export interface SavedView {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  createdAt: string;
}

export interface PipelineRun {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  steps: PipelineStep[];
}

export interface PipelineStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message?: string;
}
