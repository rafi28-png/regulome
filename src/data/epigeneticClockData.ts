// ============================================
// ReguloMe — Epigenetic Clock Data
// ============================================
// Biological age, methylation trends, and
// regulatory age tracking data.

/* ── Types ─────────────────────────────────── */

export interface AgeTrendPoint {
  age: number;          // chronological age
  bioAge: number;       // biological/epigenetic age
  methylAge: number;    // Horvath methylation clock
  regulatoryAge: number;// regulatory element age estimate
}

export interface MethylationSite {
  id: string;
  name: string;
  chromosome: string;
  gene: string;
  cpgIsland: string;
  methylationLevel: number;    // 0-100%
  ageCorrelation: number;      // -1 to 1
  trend: 'hyper' | 'hypo' | 'stable';
  deltaPerDecade: number;      // % change per decade
  significance: 'high' | 'moderate' | 'low';
  tissue: string;
}

export interface ClockModel {
  id: string;
  name: string;
  author: string;
  year: number;
  cpgCount: number;
  accuracy: string;
  description: string;
  prediction: number;    // predicted bio-age
  deviation: number;     // from chronological
  color: string;
}

export interface OrganAge {
  organ: string;
  icon: string;
  bioAge: number;
  chronAge: number;
  delta: number;
  riskFactor: string;
  color: string;
}

export interface InterventionTarget {
  gene: string;
  pathway: string;
  currentMethyl: number;
  optimalMethyl: number;
  impactScore: number;       // 0-100
  evidenceLevel: 'validated' | 'literature' | 'predicted';
  description: string;
}

/* ── Subject Profile ─────────────────────── */

export const subjectProfile = {
  name: 'Alex Rivera',
  chronologicalAge: 34,
  biologicalAge: 31.2,
  methylationAge: 32.8,
  regulatoryAge: 30.6,
  ageDelta: -2.8,
  percentile: 82,
  lastUpdated: 'Apr 18, 2026',
};

/* ── Age Trend Data (20 yr span) ──────────── */

export const ageTrendData: AgeTrendPoint[] = [
  { age: 20, bioAge: 19.5, methylAge: 20.2, regulatoryAge: 19.0 },
  { age: 22, bioAge: 21.2, methylAge: 22.1, regulatoryAge: 20.5 },
  { age: 24, bioAge: 22.8, methylAge: 23.8, regulatoryAge: 22.0 },
  { age: 26, bioAge: 24.5, methylAge: 25.5, regulatoryAge: 23.2 },
  { age: 28, bioAge: 26.0, methylAge: 27.4, regulatoryAge: 24.8 },
  { age: 30, bioAge: 27.8, methylAge: 29.2, regulatoryAge: 26.5 },
  { age: 32, bioAge: 29.5, methylAge: 31.0, regulatoryAge: 28.5 },
  { age: 34, bioAge: 31.2, methylAge: 32.8, regulatoryAge: 30.6 },
];

/* ── Clock Models ─────────────────────────── */

export const clockModels: ClockModel[] = [
  { id: 'horvath', name: 'Horvath', author: 'Horvath S.', year: 2013, cpgCount: 353, accuracy: '±3.6 yr', description: 'Multi-tissue DNA methylation clock based on 353 CpG sites', prediction: 32.8, deviation: -1.2, color: '#0ae8d2' },
  { id: 'hannum',  name: 'Hannum',  author: 'Hannum G.', year: 2013, cpgCount: 71,  accuracy: '±4.9 yr', description: 'Blood-based epigenetic clock using 71 CpG markers', prediction: 33.5, deviation: -0.5, color: '#8b5cf6' },
  { id: 'phenoage', name: 'PhenoAge', author: 'Levine M.', year: 2018, cpgCount: 513, accuracy: '±2.8 yr', description: 'Phenotypic age estimator combining methylation with clinical biomarkers', prediction: 30.8, deviation: -3.2, color: '#f59e0b' },
  { id: 'grimage',  name: 'GrimAge',  author: 'Lu A.T.', year: 2019, cpgCount: 1030, accuracy: '±2.1 yr', description: 'Mortality-predictive clock incorporating DNAm surrogates of plasma proteins', prediction: 31.0, deviation: -3.0, color: '#ef4444' },
  { id: 'dunedinpace', name: 'DunedinPACE', author: 'Belsky D.', year: 2022, cpgCount: 173, accuracy: 'Pace', description: 'Rate-of-aging measure from longitudinal methylation changes', prediction: 0.92, deviation: -0.08, color: '#10b981' },
];

/* ── Methylation Sites ────────────────────── */

export const methylationSites: MethylationSite[] = [
  { id: 'cg16867657', name: 'ELOVL2 promoter',   chromosome: 'chr6',  gene: 'ELOVL2',  cpgIsland: 'Shore', methylationLevel: 42, ageCorrelation: 0.96, trend: 'hyper', deltaPerDecade: 8.2,  significance: 'high',     tissue: 'Blood' },
  { id: 'cg06639320', name: 'FHL2 enhancer',      chromosome: 'chr2',  gene: 'FHL2',    cpgIsland: 'Island', methylationLevel: 68, ageCorrelation: 0.91, trend: 'hyper', deltaPerDecade: 6.1,  significance: 'high',     tissue: 'Multi-tissue' },
  { id: 'cg22736354', name: 'NHLRC1 body',        chromosome: 'chr6',  gene: 'NHLRC1',  cpgIsland: 'Open Sea', methylationLevel: 55, ageCorrelation: 0.88, trend: 'hyper', deltaPerDecade: 5.4, significance: 'high',     tissue: 'Blood' },
  { id: 'cg02085507', name: 'SCGN promoter',      chromosome: 'chr6',  gene: 'SCGN',    cpgIsland: 'Island', methylationLevel: 28, ageCorrelation: 0.85, trend: 'hyper', deltaPerDecade: 4.8,  significance: 'moderate', tissue: 'Brain' },
  { id: 'cg10523019', name: 'KLF14 regulatory',   chromosome: 'chr7',  gene: 'KLF14',   cpgIsland: 'Shore',  methylationLevel: 72, ageCorrelation: -0.82, trend: 'hypo', deltaPerDecade: -5.2, significance: 'moderate', tissue: 'Adipose' },
  { id: 'cg07553761', name: 'TRIM59 intron',      chromosome: 'chr3',  gene: 'TRIM59',  cpgIsland: 'Open Sea', methylationLevel: 38, ageCorrelation: 0.79, trend: 'hyper', deltaPerDecade: 3.8, significance: 'moderate', tissue: 'Blood' },
  { id: 'cg07955995', name: 'CDKN2A locus',       chromosome: 'chr9',  gene: 'CDKN2A',  cpgIsland: 'Island', methylationLevel: 15, ageCorrelation: 0.76, trend: 'hyper', deltaPerDecade: 3.2,  significance: 'moderate', tissue: 'Multi-tissue' },
  { id: 'cg27320127', name: 'LINE-1 element',     chromosome: 'chrX',  gene: 'LINE1',   cpgIsland: 'N/A',    methylationLevel: 82, ageCorrelation: -0.72, trend: 'hypo', deltaPerDecade: -2.8, significance: 'low',      tissue: 'Blood' },
];

/* ── Organ Ages ───────────────────────────── */

export const organAges: OrganAge[] = [
  { organ: 'Brain',    icon: '🧠', bioAge: 30.2, chronAge: 34, delta: -3.8, riskFactor: 'Cognitive reserve maintained', color: '#8b5cf6' },
  { organ: 'Heart',    icon: '❤️', bioAge: 32.5, chronAge: 34, delta: -1.5, riskFactor: 'Low inflammatory markers',     color: '#ef4444' },
  { organ: 'Liver',    icon: '🫁', bioAge: 33.8, chronAge: 34, delta: -0.2, riskFactor: 'Borderline NASH markers',      color: '#10b981' },
  { organ: 'Immune',   icon: '🛡️', bioAge: 29.0, chronAge: 34, delta: -5.0, riskFactor: 'Strong thymic output',        color: '#0ae8d2' },
  { organ: 'Skin',     icon: '✨', bioAge: 31.5, chronAge: 34, delta: -2.5, riskFactor: 'Collagen turnover normal',     color: '#f59e0b' },
  { organ: 'Kidney',   icon: '🫘', bioAge: 34.2, chronAge: 34, delta: 0.2,  riskFactor: 'GFR slightly below optimal',  color: '#f97316' },
  { organ: 'Muscle',   icon: '💪', bioAge: 30.8, chronAge: 34, delta: -3.2, riskFactor: 'High mitochondrial fitness',   color: '#ec4899' },
  { organ: 'Lung',     icon: '🌬️', bioAge: 33.0, chronAge: 34, delta: -1.0, riskFactor: 'Normal spirometric values',   color: '#3b82f6' },
];

/* ── Intervention Targets ─────────────────── */

export const interventionTargets: InterventionTarget[] = [
  { gene: 'ELOVL2', pathway: 'Fatty acid elongation',      currentMethyl: 42, optimalMethyl: 35, impactScore: 92, evidenceLevel: 'validated',  description: 'Reducing ELOVL2 methylation could slow epigenetic aging by 1.8 years' },
  { gene: 'KLF14',  pathway: 'Adipose metabolism',          currentMethyl: 72, optimalMethyl: 78, impactScore: 78, evidenceLevel: 'validated',  description: 'Restoring KLF14 expression improves insulin sensitivity and metabolic age' },
  { gene: 'CDKN2A', pathway: 'Cell cycle regulation',       currentMethyl: 15, optimalMethyl: 10, impactScore: 85, evidenceLevel: 'literature', description: 'p16 locus demethylation enhances senescent cell clearance' },
  { gene: 'LINE1',  pathway: 'Genome stability',            currentMethyl: 82, optimalMethyl: 88, impactScore: 70, evidenceLevel: 'literature', description: 'Maintaining LINE-1 methylation preserves genomic integrity' },
  { gene: 'FHL2',   pathway: 'Muscle differentiation',      currentMethyl: 68, optimalMethyl: 60, impactScore: 65, evidenceLevel: 'predicted',  description: 'FHL2 modulation may improve musculoskeletal aging trajectory' },
];

/* ── Summary stats ────────────────────────── */

export const clockStats = {
  bioAge: subjectProfile.biologicalAge,
  chronAge: subjectProfile.chronologicalAge,
  delta: subjectProfile.ageDelta,
  percentile: subjectProfile.percentile,
  modelsUsed: clockModels.length,
  cpgTracked: methylationSites.length,
  organsProfiled: organAges.length,
  interventions: interventionTargets.length,
};
