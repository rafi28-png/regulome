// ============================================
// ReguloMe — Disease Hub Data
// ============================================
// Rich disease domain data for the Disease Hub
// page with regulatory burden analysis.

/* ── Types ─────────────────────────────────── */

export interface DiseaseDomain {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  accentGradient: string;
  burdenScore: number;         // 0-100 regulatory burden
  variantCount: number;
  geneCount: number;
  studyCount: number;
  riskLevel: 'low' | 'moderate' | 'elevated' | 'high';
  topVariant: string;
  topGene: string;
  prevalence: string;          // population prevalence
  heritability: number;        // % heritable
  regulatoryContribution: number; // % of risk from regulatory
  categories: RadarCategory[];
}

export interface RadarCategory {
  axis: string;
  value: number; // 0-100
}

export interface DiseaseVariantLink {
  disease: string;
  variant: string;
  gene: string;
  riskRatio: number;
  pValue: string;
  evidenceLevel: 'validated' | 'literature' | 'predicted';
  tissue: string;
  mechanism: string;
}

export interface DiseasePathwayConnection {
  from: string;
  to: string;
  sharedPathway: string;
  sharedGenes: number;
  strength: number; // 0-1
}

/* ── Disease Domains ───────────────────────── */

export const diseaseDomains: DiseaseDomain[] = [
  {
    id: 'cardiovascular',
    name: 'Cardiovascular',
    icon: '❤️',
    description: 'Heart disease, atherosclerosis, hypertension, and vascular disorders driven by lipid metabolism and inflammatory regulatory variants.',
    color: '#ef4444',
    accentGradient: 'linear-gradient(135deg, #ef4444, #f97316)',
    burdenScore: 78,
    variantCount: 12,
    geneCount: 8,
    studyCount: 234,
    riskLevel: 'elevated',
    topVariant: 'rs429358',
    topGene: 'APOE',
    prevalence: '32%',
    heritability: 55,
    regulatoryContribution: 42,
    categories: [
      { axis: 'Genetic Load', value: 72 },
      { axis: 'Epigenetic', value: 65 },
      { axis: 'Expression', value: 78 },
      { axis: 'Network Hub', value: 58 },
      { axis: 'TF Binding', value: 82 },
      { axis: 'Conservation', value: 70 },
    ],
  },
  {
    id: 'inflammatory',
    name: 'Inflammatory',
    icon: '🔥',
    description: 'Chronic inflammation, autoimmune cascades, and cytokine dysregulation mediated by NF-κB and JAK/STAT pathway variants.',
    color: '#f59e0b',
    accentGradient: 'linear-gradient(135deg, #f59e0b, #eab308)',
    burdenScore: 85,
    variantCount: 15,
    geneCount: 10,
    studyCount: 312,
    riskLevel: 'high',
    topVariant: 'rs1800795',
    topGene: 'IL-6',
    prevalence: '28%',
    heritability: 48,
    regulatoryContribution: 62,
    categories: [
      { axis: 'Genetic Load', value: 85 },
      { axis: 'Epigenetic', value: 72 },
      { axis: 'Expression', value: 90 },
      { axis: 'Network Hub', value: 78 },
      { axis: 'TF Binding', value: 88 },
      { axis: 'Conservation', value: 65 },
    ],
  },
  {
    id: 'neurological',
    name: 'Neurological',
    icon: '🧠',
    description: 'Neurodegeneration, cognitive decline, and synaptic dysfunction linked to amyloid clearance and neurotransmitter regulatory circuits.',
    color: '#8b5cf6',
    accentGradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    burdenScore: 72,
    variantCount: 8,
    geneCount: 6,
    studyCount: 189,
    riskLevel: 'elevated',
    topVariant: 'rs429358',
    topGene: 'APOE',
    prevalence: '15%',
    heritability: 72,
    regulatoryContribution: 38,
    categories: [
      { axis: 'Genetic Load', value: 68 },
      { axis: 'Epigenetic', value: 82 },
      { axis: 'Expression', value: 55 },
      { axis: 'Network Hub', value: 72 },
      { axis: 'TF Binding', value: 60 },
      { axis: 'Conservation', value: 88 },
    ],
  },
  {
    id: 'metabolic',
    name: 'Metabolic',
    icon: '⚡',
    description: 'Type 2 diabetes, obesity, and metabolic syndrome arising from insulin signalling and energy homeostasis regulatory disruptions.',
    color: '#0ae8d2',
    accentGradient: 'linear-gradient(135deg, #0ae8d2, #06b6d4)',
    burdenScore: 68,
    variantCount: 11,
    geneCount: 7,
    studyCount: 276,
    riskLevel: 'moderate',
    topVariant: 'rs7903146',
    topGene: 'TCF7L2',
    prevalence: '38%',
    heritability: 45,
    regulatoryContribution: 52,
    categories: [
      { axis: 'Genetic Load', value: 65 },
      { axis: 'Epigenetic', value: 58 },
      { axis: 'Expression', value: 72 },
      { axis: 'Network Hub', value: 55 },
      { axis: 'TF Binding', value: 68 },
      { axis: 'Conservation', value: 48 },
    ],
  },
  {
    id: 'oncological',
    name: 'Oncological',
    icon: '🎗️',
    description: 'Cancer predisposition through dysregulated cell cycle control, Wnt/β-catenin signalling, and tumor suppressor regulatory variants.',
    color: '#ec4899',
    accentGradient: 'linear-gradient(135deg, #ec4899, #f472b6)',
    burdenScore: 62,
    variantCount: 9,
    geneCount: 6,
    studyCount: 198,
    riskLevel: 'moderate',
    topVariant: 'rs6983267',
    topGene: 'MYC',
    prevalence: '22%',
    heritability: 35,
    regulatoryContribution: 28,
    categories: [
      { axis: 'Genetic Load', value: 58 },
      { axis: 'Epigenetic', value: 75 },
      { axis: 'Expression', value: 62 },
      { axis: 'Network Hub', value: 68 },
      { axis: 'TF Binding', value: 55 },
      { axis: 'Conservation', value: 80 },
    ],
  },
  {
    id: 'hepatic',
    name: 'Hepatic',
    icon: '🫁',
    description: 'Liver disease, NAFLD, and hepatic steatosis driven by lipid transport, bile acid, and xenobiotic metabolism regulatory elements.',
    color: '#10b981',
    accentGradient: 'linear-gradient(135deg, #10b981, #34d399)',
    burdenScore: 52,
    variantCount: 6,
    geneCount: 5,
    studyCount: 142,
    riskLevel: 'moderate',
    topVariant: 'rs12740374',
    topGene: 'SORT1',
    prevalence: '25%',
    heritability: 40,
    regulatoryContribution: 35,
    categories: [
      { axis: 'Genetic Load', value: 48 },
      { axis: 'Epigenetic', value: 52 },
      { axis: 'Expression', value: 65 },
      { axis: 'Network Hub', value: 42 },
      { axis: 'TF Binding', value: 58 },
      { axis: 'Conservation', value: 55 },
    ],
  },
];

/* ── Disease × Variant Links ─────────────── */

export const diseaseVariantLinks: DiseaseVariantLink[] = [
  { disease: 'Cardiovascular', variant: 'rs429358',  gene: 'APOE',   riskRatio: 2.84, pValue: '2.1e-42', evidenceLevel: 'validated',  tissue: 'Liver',    mechanism: 'Disrupted LXRα binding in APOE enhancer' },
  { disease: 'Cardiovascular', variant: 'rs1800795', gene: 'IL-6',   riskRatio: 1.62, pValue: '4.3e-18', evidenceLevel: 'validated',  tissue: 'Immune',   mechanism: 'Elevated CRP via NF-κB pathway amplification' },
  { disease: 'Cardiovascular', variant: 'rs12740374',gene: 'SORT1',  riskRatio: 1.45, pValue: '1.2e-15', evidenceLevel: 'validated',  tissue: 'Liver',    mechanism: 'LDL receptor trafficking disruption' },
  { disease: 'Cardiovascular', variant: 'rs1799983', gene: 'NOS3',   riskRatio: 1.38, pValue: '8.7e-12', evidenceLevel: 'literature', tissue: 'Heart',    mechanism: 'Reduced nitric oxide bioavailability' },
  { disease: 'Inflammatory',   variant: 'rs1800795', gene: 'IL-6',   riskRatio: 2.12, pValue: '1.8e-35', evidenceLevel: 'validated',  tissue: 'Immune',   mechanism: 'Constitutive NF-κB/AP-1 driven IL-6 overproduction' },
  { disease: 'Inflammatory',   variant: 'rs2476601', gene: 'PTPN22', riskRatio: 1.89, pValue: '3.2e-28', evidenceLevel: 'validated',  tissue: 'Immune',   mechanism: 'Autoimmune T-cell activation threshold lowered' },
  { disease: 'Inflammatory',   variant: 'rs1042522', gene: 'TP53',   riskRatio: 1.34, pValue: '2.1e-10', evidenceLevel: 'literature', tissue: 'Immune',   mechanism: 'Senescence-associated inflammatory phenotype' },
  { disease: 'Neurological',   variant: 'rs429358',  gene: 'APOE',   riskRatio: 3.68, pValue: '8.4e-68', evidenceLevel: 'validated',  tissue: 'Brain',    mechanism: 'Impaired Aβ clearance and neuroinflammation' },
  { disease: 'Neurological',   variant: 'rs4680',    gene: 'COMT',   riskRatio: 1.52, pValue: '6.1e-14', evidenceLevel: 'validated',  tissue: 'Brain',    mechanism: 'Altered prefrontal dopamine catabolism' },
  { disease: 'Metabolic',      variant: 'rs7903146', gene: 'TCF7L2', riskRatio: 1.95, pValue: '3.7e-32', evidenceLevel: 'validated',  tissue: 'Pancreas', mechanism: 'Wnt signalling disruption in β-cell function' },
  { disease: 'Metabolic',      variant: 'rs9939609', gene: 'FTO',    riskRatio: 1.67, pValue: '1.4e-22', evidenceLevel: 'validated',  tissue: 'Adipose',  mechanism: 'IRX3/5 enhancer loop drives adipogenesis' },
  { disease: 'Metabolic',      variant: 'rs1801282', gene: 'PPARG',  riskRatio: 1.28, pValue: '5.6e-08', evidenceLevel: 'literature', tissue: 'Adipose',  mechanism: 'PPARγ activity reduction in adipocytes' },
  { disease: 'Oncological',    variant: 'rs6983267', gene: 'MYC',    riskRatio: 1.78, pValue: '2.3e-25', evidenceLevel: 'validated',  tissue: 'Intestine',mechanism: 'TCF7L2-driven MYC super-enhancer activation' },
  { disease: 'Oncological',    variant: 'rs1042522', gene: 'TP53',   riskRatio: 1.42, pValue: '4.8e-12', evidenceLevel: 'validated',  tissue: 'Immune',   mechanism: 'p53 transactivation efficiency reduced' },
  { disease: 'Hepatic',        variant: 'rs12740374',gene: 'SORT1',  riskRatio: 1.55, pValue: '2.8e-16', evidenceLevel: 'validated',  tissue: 'Liver',    mechanism: 'Hepatic VLDL secretion pathway altered' },
  { disease: 'Hepatic',        variant: 'rs1695',    gene: 'GSTP1',  riskRatio: 1.32, pValue: '7.3e-09', evidenceLevel: 'literature', tissue: 'Liver',    mechanism: 'Phase II detox enzyme efficiency reduced' },
];

/* ── Cross-domain Pathway Connections ──────── */

export const pathwayConnections: DiseasePathwayConnection[] = [
  { from: 'cardiovascular', to: 'inflammatory', sharedPathway: 'NF-κB Signalling',     sharedGenes: 4, strength: 0.85 },
  { from: 'cardiovascular', to: 'neurological',  sharedPathway: 'Lipid Metabolism',      sharedGenes: 3, strength: 0.72 },
  { from: 'cardiovascular', to: 'metabolic',     sharedPathway: 'Insulin Signalling',    sharedGenes: 2, strength: 0.55 },
  { from: 'inflammatory',   to: 'neurological',  sharedPathway: 'Neuroinflammation',     sharedGenes: 2, strength: 0.62 },
  { from: 'inflammatory',   to: 'oncological',   sharedPathway: 'Cell Cycle / Apoptosis',sharedGenes: 2, strength: 0.48 },
  { from: 'metabolic',      to: 'hepatic',       sharedPathway: 'Lipid Transport',       sharedGenes: 3, strength: 0.68 },
  { from: 'metabolic',      to: 'oncological',   sharedPathway: 'Wnt/β-catenin',        sharedGenes: 2, strength: 0.45 },
  { from: 'neurological',   to: 'hepatic',       sharedPathway: 'Aβ Clearance',          sharedGenes: 1, strength: 0.35 },
];

/* ── Summary Stats ─────────────────────────── */

export const diseaseStats = {
  totalDomains: diseaseDomains.length,
  totalVariants: new Set(diseaseVariantLinks.map((l) => l.variant)).size,
  totalGenes: new Set(diseaseVariantLinks.map((l) => l.gene)).size,
  avgBurden: Math.round(diseaseDomains.reduce((s, d) => s + d.burdenScore, 0) / diseaseDomains.length),
  highRiskDomains: diseaseDomains.filter((d) => d.riskLevel === 'high' || d.riskLevel === 'elevated').length,
  totalStudies: diseaseDomains.reduce((s, d) => s + d.studyCount, 0),
};
