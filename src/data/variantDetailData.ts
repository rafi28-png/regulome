// ============================================
// ReguloMe — Variant Detail Data
// ============================================
// Extended detail records for the Variant Detail
// Page. Each entry enriches a base variant with
// deep-dive fields: mechanism, tissue scores,
// regulatory network, disease associations, etc.

import {
  variantExplorerData,
  type VariantExplorerEntry,
} from './variantData';
import { evidenceRecords, evidenceSources } from './evidenceData';

/* ── Sub-types ─────────────────────────────── */

export interface TissueExpressionScore {
  tissue: string;
  score: number;       // 0-100 impact score
  foldChange: number;  // e.g. 1.4 = 40% increase
  direction: 'up' | 'down' | 'neutral';
}

export interface RegulatoryNetworkNode {
  id: string;
  label: string;
  type: 'variant' | 'tf' | 'gene' | 'pathway' | 'disease';
  color: string;
}

export interface RegulatoryNetworkEdge {
  from: string;
  to: string;
  label: string;
  style: 'solid' | 'dashed';
}

export interface DiseaseAssociation {
  disease: string;
  domain: string;
  riskRatio: number;   // odds ratio, e.g. 1.45
  pValue: string;      // e.g. '2.3e-12'
  populationStudies: number;
  color: string;
}

export interface TimelineEntry {
  date: string;
  event: string;
  source: string;
}

export interface PopulationFrequency {
  population: string;
  frequency: number;
  abbrev: string;
}

export interface RelatedVariant {
  id: string;
  rsId: string;
  gene: string;
  relation: string;   // 'same gene' | 'same pathway' | 'LD partner'
  priorityScore: number;
}

/* ── Main Detail Interface ─────────────────── */

export interface VariantDetail extends VariantExplorerEntry {
  functionalSummary: string;
  mechanism: string;
  alleleFrequency: number;
  populationFrequencies: PopulationFrequency[];
  tissueExpressionScores: TissueExpressionScore[];
  networkNodes: RegulatoryNetworkNode[];
  networkEdges: RegulatoryNetworkEdge[];
  diseaseAssociations: DiseaseAssociation[];
  timeline: TimelineEntry[];
  relatedVariants: RelatedVariant[];
}

/* ── Extended Detail Records ───────────────── */

type PartialDetail = Omit<VariantDetail, keyof VariantExplorerEntry>;

const detailRecords: Record<string, PartialDetail> = {
  // ── var-001: IL-6 (rs1800795) — RICH ──
  'var-001': {
    functionalSummary:
      'This promoter variant in IL-6 creates a gain-of-function effect, increasing IL-6 transcription by ~40%. The C>G substitution enhances NF-κB and AP-1 binding affinity, driving elevated inflammatory cytokine production across immune and hepatic tissues.',
    mechanism:
      'The G→C change at position −174 of the IL-6 promoter strengthens the NF-κB consensus motif (GGGATTTTCC → GGGATTTTCG), increasing transcription factor occupancy 2.4-fold. This results in constitutively elevated IL-6 mRNA, amplifying JAK/STAT3 signalling and CRP production in hepatocytes.',
    alleleFrequency: 0.39,
    populationFrequencies: [
      { population: 'European', frequency: 0.42, abbrev: 'EUR' },
      { population: 'East Asian', frequency: 0.28, abbrev: 'EAS' },
      { population: 'African', frequency: 0.33, abbrev: 'AFR' },
      { population: 'South Asian', frequency: 0.37, abbrev: 'SAS' },
      { population: 'American', frequency: 0.35, abbrev: 'AMR' },
    ],
    tissueExpressionScores: [
      { tissue: 'Immune',    score: 92, foldChange: 2.4,  direction: 'up' },
      { tissue: 'Liver',     score: 78, foldChange: 1.8,  direction: 'up' },
      { tissue: 'Adipose',   score: 54, foldChange: 1.3,  direction: 'up' },
      { tissue: 'Heart',     score: 41, foldChange: 1.15, direction: 'up' },
      { tissue: 'Brain',     score: 28, foldChange: 1.05, direction: 'neutral' },
      { tissue: 'Lung',      score: 35, foldChange: 1.1,  direction: 'up' },
      { tissue: 'Intestine', score: 47, foldChange: 1.2,  direction: 'up' },
      { tissue: 'Pancreas',  score: 18, foldChange: 0.98, direction: 'neutral' },
    ],
    networkNodes: [
      { id: 'v1', label: 'rs1800795', type: 'variant', color: '#0ae8d2' },
      { id: 'tf1', label: 'NF-κB', type: 'tf', color: '#f59e0b' },
      { id: 'tf2', label: 'AP-1', type: 'tf', color: '#f59e0b' },
      { id: 'g1', label: 'IL-6', type: 'gene', color: '#8b5cf6' },
      { id: 'p1', label: 'JAK/STAT3', type: 'pathway', color: '#3b82f6' },
      { id: 'p2', label: 'NF-κB Signalling', type: 'pathway', color: '#3b82f6' },
      { id: 'd1', label: 'Inflammatory', type: 'disease', color: '#ef4444' },
      { id: 'd2', label: 'Cardiovascular', type: 'disease', color: '#ef4444' },
    ],
    networkEdges: [
      { from: 'tf1', to: 'v1', label: 'binds', style: 'solid' },
      { from: 'tf2', to: 'v1', label: 'binds', style: 'solid' },
      { from: 'v1', to: 'g1', label: 'regulates', style: 'solid' },
      { from: 'g1', to: 'p1', label: 'activates', style: 'solid' },
      { from: 'g1', to: 'p2', label: 'activates', style: 'dashed' },
      { from: 'p1', to: 'd1', label: 'associated', style: 'dashed' },
      { from: 'p2', to: 'd2', label: 'associated', style: 'dashed' },
    ],
    diseaseAssociations: [
      { disease: 'Systemic Inflammation', domain: 'Inflammatory', riskRatio: 1.45, pValue: '2.3e-12', populationStudies: 48, color: '#ef4444' },
      { disease: 'Coronary Artery Disease', domain: 'Cardiovascular', riskRatio: 1.22, pValue: '5.1e-8', populationStudies: 31, color: '#f59e0b' },
      { disease: 'Rheumatoid Arthritis', domain: 'Autoimmune', riskRatio: 1.18, pValue: '3.7e-5', populationStudies: 14, color: '#8b5cf6' },
      { disease: 'Type 2 Diabetes', domain: 'Metabolic', riskRatio: 1.11, pValue: '8.2e-4', populationStudies: 9, color: '#3b82f6' },
    ],
    timeline: [
      { date: '2026-03-28', event: 'Evidence record updated with new GWAS data', source: 'ClinVar' },
      { date: '2025-11-15', event: 'Functional validation in hepatocyte cell line', source: 'ENCODE' },
      { date: '2025-06-02', event: 'Added to RegulomeDB with score 1b', source: 'RegulomeDB' },
      { date: '2024-09-20', event: 'First identified as regulatory variant', source: 'PubMed' },
    ],
    relatedVariants: [
      { id: 'var-006', rsId: 'rs2476601', gene: 'PTPN22', relation: 'Same pathway (NF-κB)', priorityScore: 77 },
      { id: 'var-018', rsId: 'rs1800896', gene: 'IL-10', relation: 'Same gene family', priorityScore: 75 },
      { id: 'var-010', rsId: 'rs10757278', gene: 'ANRIL', relation: 'Cardiovascular risk', priorityScore: 73 },
    ],
  },

  // ── var-003: MYC (rs6983267) — RICH ──
  'var-003': {
    functionalSummary:
      'A gain-of-function enhancer variant at the 8q24 locus that increases MYC oncogene expression through long-range chromatin looping. This is one of the most well-characterised non-coding cancer risk variants in the human genome.',
    mechanism:
      'The T→G substitution strengthens a TCF7L2 (TCF4) binding site within a 335-kb upstream enhancer of MYC. Chromatin conformation capture shows the risk allele forms stronger contact with the MYC promoter via a CTCF-mediated loop, increasing transcription 1.6-fold in intestinal epithelium.',
    alleleFrequency: 0.50,
    populationFrequencies: [
      { population: 'European', frequency: 0.51, abbrev: 'EUR' },
      { population: 'East Asian', frequency: 0.57, abbrev: 'EAS' },
      { population: 'African', frequency: 0.44, abbrev: 'AFR' },
      { population: 'South Asian', frequency: 0.48, abbrev: 'SAS' },
      { population: 'American', frequency: 0.50, abbrev: 'AMR' },
    ],
    tissueExpressionScores: [
      { tissue: 'Intestine', score: 88, foldChange: 1.6,  direction: 'up' },
      { tissue: 'Immune',    score: 62, foldChange: 1.35, direction: 'up' },
      { tissue: 'Liver',     score: 34, foldChange: 1.1,  direction: 'up' },
      { tissue: 'Brain',     score: 22, foldChange: 1.02, direction: 'neutral' },
      { tissue: 'Adipose',   score: 15, foldChange: 0.97, direction: 'neutral' },
      { tissue: 'Heart',     score: 12, foldChange: 0.95, direction: 'neutral' },
    ],
    networkNodes: [
      { id: 'v1', label: 'rs6983267', type: 'variant', color: '#0ae8d2' },
      { id: 'tf1', label: 'TCF7L2', type: 'tf', color: '#f59e0b' },
      { id: 'tf2', label: 'LEF1', type: 'tf', color: '#f59e0b' },
      { id: 'g1', label: 'MYC', type: 'gene', color: '#8b5cf6' },
      { id: 'p1', label: 'Wnt/β-catenin', type: 'pathway', color: '#3b82f6' },
      { id: 'p2', label: 'Cell Proliferation', type: 'pathway', color: '#3b82f6' },
      { id: 'd1', label: 'Colorectal Cancer', type: 'disease', color: '#ef4444' },
    ],
    networkEdges: [
      { from: 'tf1', to: 'v1', label: 'binds', style: 'solid' },
      { from: 'tf2', to: 'v1', label: 'binds', style: 'solid' },
      { from: 'v1', to: 'g1', label: 'enhances', style: 'solid' },
      { from: 'g1', to: 'p1', label: 'activates', style: 'solid' },
      { from: 'g1', to: 'p2', label: 'drives', style: 'solid' },
      { from: 'p2', to: 'd1', label: 'associated', style: 'dashed' },
    ],
    diseaseAssociations: [
      { disease: 'Colorectal Cancer', domain: 'Cancer', riskRatio: 1.27, pValue: '1.2e-24', populationStudies: 67, color: '#ef4444' },
      { disease: 'Prostate Cancer', domain: 'Cancer', riskRatio: 1.21, pValue: '4.8e-15', populationStudies: 42, color: '#f59e0b' },
      { disease: 'Bladder Cancer', domain: 'Cancer', riskRatio: 1.12, pValue: '6.3e-6', populationStudies: 11, color: '#8b5cf6' },
    ],
    timeline: [
      { date: '2026-04-01', event: 'Updated with FANTOM5 enhancer atlas data', source: 'FANTOM5' },
      { date: '2025-08-22', event: 'ChIP-seq validation of TCF7L2 binding', source: 'ENCODE' },
      { date: '2025-01-10', event: 'Hi-C chromatin loop confirmed in intestinal organoids', source: 'Roadmap' },
      { date: '2024-04-15', event: 'Initial GWAS hit at genome-wide significance', source: 'PubMed' },
    ],
    relatedVariants: [
      { id: 'var-005', rsId: 'rs7903146', gene: 'TCF7L2', relation: 'Same TF (TCF7L2)', priorityScore: 79 },
      { id: 'var-012', rsId: 'rs1042522', gene: 'TP53', relation: 'Cancer pathway', priorityScore: 88 },
      { id: 'var-019', rsId: 'rs1695', gene: 'GSTP1', relation: 'Cancer risk', priorityScore: 62 },
    ],
  },

  // ── var-015: APOE (rs429358) — RICH ──
  'var-015': {
    functionalSummary:
      'A promoter variant in the APOE gene that drives the ε4 haplotype — the strongest known common genetic risk factor for late-onset Alzheimer\'s disease. The C allele increases APOE transcription in astrocytes and alters lipid metabolism in the CNS.',
    mechanism:
      'The T→C substitution at codon 130 (R130C) modifies the LXRα response element in the APOE promoter. The ε4 allele shifts apolipoprotein E isoform preference toward less efficient cholesterol recycling in synaptic membranes, accelerating amyloid-β aggregation. Concurrently, the variant enhances hepatic APOE production, influencing circulating lipoprotein clearance.',
    alleleFrequency: 0.14,
    populationFrequencies: [
      { population: 'European', frequency: 0.15, abbrev: 'EUR' },
      { population: 'East Asian', frequency: 0.09, abbrev: 'EAS' },
      { population: 'African', frequency: 0.27, abbrev: 'AFR' },
      { population: 'South Asian', frequency: 0.11, abbrev: 'SAS' },
      { population: 'American', frequency: 0.13, abbrev: 'AMR' },
    ],
    tissueExpressionScores: [
      { tissue: 'Brain',   score: 95, foldChange: 2.8, direction: 'up' },
      { tissue: 'Liver',   score: 82, foldChange: 2.1, direction: 'up' },
      { tissue: 'Immune',  score: 45, foldChange: 1.2, direction: 'up' },
      { tissue: 'Heart',   score: 38, foldChange: 1.15, direction: 'up' },
      { tissue: 'Adipose', score: 22, foldChange: 1.05, direction: 'neutral' },
      { tissue: 'Lung',    score: 15, foldChange: 0.98, direction: 'neutral' },
    ],
    networkNodes: [
      { id: 'v1', label: 'rs429358', type: 'variant', color: '#0ae8d2' },
      { id: 'tf1', label: 'LXRα', type: 'tf', color: '#f59e0b' },
      { id: 'tf2', label: 'RXRα', type: 'tf', color: '#f59e0b' },
      { id: 'g1', label: 'APOE', type: 'gene', color: '#8b5cf6' },
      { id: 'p1', label: 'Lipid Metabolism', type: 'pathway', color: '#3b82f6' },
      { id: 'p2', label: 'Aβ Clearance', type: 'pathway', color: '#3b82f6' },
      { id: 'd1', label: 'Alzheimer\'s', type: 'disease', color: '#ef4444' },
      { id: 'd2', label: 'Cardiovascular', type: 'disease', color: '#ef4444' },
    ],
    networkEdges: [
      { from: 'tf1', to: 'v1', label: 'binds', style: 'solid' },
      { from: 'tf2', to: 'v1', label: 'co-binds', style: 'dashed' },
      { from: 'v1', to: 'g1', label: 'regulates', style: 'solid' },
      { from: 'g1', to: 'p1', label: 'modulates', style: 'solid' },
      { from: 'g1', to: 'p2', label: 'impairs', style: 'solid' },
      { from: 'p2', to: 'd1', label: 'associated', style: 'dashed' },
      { from: 'p1', to: 'd2', label: 'associated', style: 'dashed' },
    ],
    diseaseAssociations: [
      { disease: 'Late-Onset Alzheimer\'s', domain: 'Neurodegenerative', riskRatio: 3.68, pValue: '1.1e-120', populationStudies: 189, color: '#ef4444' },
      { disease: 'Coronary Artery Disease', domain: 'Cardiovascular', riskRatio: 1.34, pValue: '3.5e-18', populationStudies: 56, color: '#f59e0b' },
      { disease: 'Vascular Dementia', domain: 'Neurodegenerative', riskRatio: 1.82, pValue: '5.2e-9', populationStudies: 22, color: '#8b5cf6' },
    ],
    timeline: [
      { date: '2026-04-12', event: 'Updated with UK Biobank longitudinal data', source: 'PubMed' },
      { date: '2025-12-01', event: 'Single-cell RNA-seq in astrocytes confirmed', source: 'GTEx' },
      { date: '2025-05-18', event: 'Functional allele-specific expression validated', source: 'ENCODE' },
      { date: '2024-01-05', event: 'Meta-analysis of 189 cohort studies', source: 'ClinVar' },
    ],
    relatedVariants: [
      { id: 'var-014', rsId: 'rs1801131', gene: 'MTHFR', relation: 'Cardiovascular overlap', priorityScore: 76 },
      { id: 'var-017', rsId: 'rs4680', gene: 'COMT', relation: 'Neurodegenerative', priorityScore: 83 },
      { id: 'var-011', rsId: 'rs53576', gene: 'OXTR', relation: 'Brain tissue', priorityScore: 64 },
    ],
  },
};

/* ── Default generator for non-enriched variants ── */

function generateDefaultDetail(base: VariantExplorerEntry): PartialDetail {
  const primaryTissue = base.tissues[0] || 'Unknown';

  return {
    functionalSummary:
      `This ${base.elementType} variant in ${base.gene} has a ${base.effect}-of-function effect detected primarily in ${primaryTissue} tissue. ${base.affectedTFs.join(' and ')} binding is affected, with a confidence score of ${(base.confidenceScore * 100).toFixed(0)}%.`,
    mechanism:
      `The ${base.refAllele}→${base.altAllele} substitution at ${base.chromosome}:${base.position.toLocaleString()} modifies the ${base.elementType} regulatory element controlling ${base.gene}. ${base.effect === 'gain' ? 'Enhanced' : base.effect === 'loss' ? 'Reduced' : 'Altered'} transcription factor binding leads to downstream expression changes in ${primaryTissue} tissue.`,
    alleleFrequency: +(Math.random() * 0.4 + 0.05).toFixed(3),
    populationFrequencies: [
      { population: 'European', frequency: +(Math.random() * 0.3 + 0.1).toFixed(3), abbrev: 'EUR' },
      { population: 'East Asian', frequency: +(Math.random() * 0.3 + 0.05).toFixed(3), abbrev: 'EAS' },
      { population: 'African', frequency: +(Math.random() * 0.3 + 0.1).toFixed(3), abbrev: 'AFR' },
      { population: 'South Asian', frequency: +(Math.random() * 0.3 + 0.08).toFixed(3), abbrev: 'SAS' },
    ],
    tissueExpressionScores: base.tissues.map((t, i) => ({
      tissue: t,
      score: Math.max(20, base.priorityScore - i * 15),
      foldChange: +(1 + (base.effect === 'gain' ? 0.3 : -0.2) * (1 - i * 0.3)).toFixed(2),
      direction: (base.effect === 'gain' ? 'up' : base.effect === 'loss' ? 'down' : 'neutral') as 'up' | 'down' | 'neutral',
    })),
    networkNodes: [
      { id: 'v1', label: base.rsId, type: 'variant', color: '#0ae8d2' },
      ...base.affectedTFs.map((tf, i) => ({ id: `tf${i + 1}`, label: tf, type: 'tf' as const, color: '#f59e0b' })),
      { id: 'g1', label: base.gene, type: 'gene', color: '#8b5cf6' },
      ...base.linkedDiseases.map((d, i) => ({ id: `d${i + 1}`, label: d, type: 'disease' as const, color: '#ef4444' })),
    ],
    networkEdges: [
      ...base.affectedTFs.map((_, i) => ({ from: `tf${i + 1}`, to: 'v1', label: 'binds', style: 'solid' as const })),
      { from: 'v1', to: 'g1', label: 'regulates', style: 'solid' },
      ...base.linkedDiseases.map((_, i) => ({ from: 'g1', to: `d${i + 1}`, label: 'associated', style: 'dashed' as const })),
    ],
    diseaseAssociations: base.linkedDiseases.map((d, i) => ({
      disease: d,
      domain: d,
      riskRatio: +(1.1 + Math.random() * 0.5).toFixed(2),
      pValue: `${(Math.random() * 9 + 1).toFixed(1)}e-${Math.floor(Math.random() * 10 + 3)}`,
      populationStudies: Math.floor(Math.random() * 40 + 5),
      color: ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6'][i % 4],
    })),
    timeline: [
      { date: '2026-03-01', event: 'Evidence record last updated', source: 'RegulomeDB' },
      { date: '2025-06-15', event: 'Computational prediction added', source: 'DeepVariant AI' },
    ],
    relatedVariants: [],
  };
}

/* ── Lookup function ───────────────────────── */

export function getVariantDetail(variantId: string): VariantDetail | null {
  const base = variantExplorerData.find((v) => v.id === variantId);
  if (!base) return null;

  const extended = detailRecords[variantId] || generateDefaultDetail(base);

  return { ...base, ...extended };
}

/* ── Evidence lookup helper ────────────────── */

export function getVariantEvidence(variantId: string) {
  const record = evidenceRecords.find((e) => e.variantId === variantId);
  if (!record) return null;

  const sources = record.sources
    .map((sid) => evidenceSources.find((s) => s.id === sid))
    .filter(Boolean);

  return { ...record, resolvedSources: sources };
}
