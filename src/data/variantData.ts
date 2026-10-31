// ============================================
// ReguloMe — Variant Explorer Demo Data
// ============================================
// Comprehensive set of synthetic regulatory
// variants for the Variant Explorer page.

import type { EvidenceLevel, RegulatoryElementType } from '@/types';

export interface VariantExplorerEntry {
  id: string;
  rsId: string;
  chromosome: string;
  position: number;
  refAllele: string;
  altAllele: string;
  gene: string;
  elementType: RegulatoryElementType;
  effect: 'gain' | 'loss' | 'neutral';
  tissues: string[];
  affectedTFs: string[];
  evidenceLevel: EvidenceLevel;
  confidenceScore: number;
  priorityScore: number;
  linkedDiseases: string[];
  publicationCount: number;
  bookmarked: boolean;
}

export const variantExplorerData: VariantExplorerEntry[] = [
  {
    id: 'var-001', rsId: 'rs1800795', chromosome: 'chr7', position: 22766645,
    refAllele: 'G', altAllele: 'C', gene: 'IL-6', elementType: 'promoter',
    effect: 'gain', tissues: ['Immune', 'Liver'], affectedTFs: ['NF-κB', 'AP-1'],
    evidenceLevel: 'validated', confidenceScore: 0.96, priorityScore: 94,
    linkedDiseases: ['Inflammatory', 'Cardiovascular'], publicationCount: 847, bookmarked: true,
  },
  {
    id: 'var-002', rsId: 'rs12740374', chromosome: 'chr1', position: 109818530,
    refAllele: 'T', altAllele: 'G', gene: 'SORT1', elementType: 'enhancer',
    effect: 'loss', tissues: ['Liver'], affectedTFs: ['C/EBPα', 'HNF4α'],
    evidenceLevel: 'literature', confidenceScore: 0.89, priorityScore: 89,
    linkedDiseases: ['Cardiovascular', 'Metabolic'], publicationCount: 312, bookmarked: true,
  },
  {
    id: 'var-003', rsId: 'rs6983267', chromosome: 'chr8', position: 128413305,
    refAllele: 'T', altAllele: 'G', gene: 'MYC', elementType: 'enhancer',
    effect: 'gain', tissues: ['Intestine', 'Immune'], affectedTFs: ['TCF7L2', 'LEF1'],
    evidenceLevel: 'validated', confidenceScore: 0.92, priorityScore: 87,
    linkedDiseases: ['Cancer'], publicationCount: 1204, bookmarked: false,
  },
  {
    id: 'var-004', rsId: 'rs1333049', chromosome: 'chr9', position: 22125503,
    refAllele: 'C', altAllele: 'G', gene: 'CDKN2B-AS1', elementType: 'silencer',
    effect: 'loss', tissues: ['Heart', 'Adipose'], affectedTFs: ['CTCF', 'YY1'],
    evidenceLevel: 'predicted', confidenceScore: 0.74, priorityScore: 82,
    linkedDiseases: ['Cardiovascular'], publicationCount: 89, bookmarked: false,
  },
  {
    id: 'var-005', rsId: 'rs7903146', chromosome: 'chr10', position: 114758349,
    refAllele: 'C', altAllele: 'T', gene: 'TCF7L2', elementType: 'enhancer',
    effect: 'gain', tissues: ['Pancreas', 'Intestine'], affectedTFs: ['TCF7L2', 'GATA6'],
    evidenceLevel: 'literature', confidenceScore: 0.88, priorityScore: 79,
    linkedDiseases: ['Metabolic'], publicationCount: 2103, bookmarked: true,
  },
  {
    id: 'var-006', rsId: 'rs2476601', chromosome: 'chr1', position: 114377568,
    refAllele: 'A', altAllele: 'G', gene: 'PTPN22', elementType: 'promoter',
    effect: 'gain', tissues: ['Immune', 'Bone Marrow'], affectedTFs: ['STAT3', 'NF-κB'],
    evidenceLevel: 'literature', confidenceScore: 0.85, priorityScore: 77,
    linkedDiseases: ['Autoimmune', 'Inflammatory'], publicationCount: 567, bookmarked: false,
  },
  {
    id: 'var-007', rsId: 'rs9939609', chromosome: 'chr16', position: 53820527,
    refAllele: 'T', altAllele: 'A', gene: 'FTO', elementType: 'enhancer',
    effect: 'gain', tissues: ['Adipose', 'Brain'], affectedTFs: ['ARID5B', 'IRX3'],
    evidenceLevel: 'validated', confidenceScore: 0.91, priorityScore: 85,
    linkedDiseases: ['Metabolic'], publicationCount: 1890, bookmarked: true,
  },
  {
    id: 'var-008', rsId: 'rs1801282', chromosome: 'chr3', position: 12393125,
    refAllele: 'C', altAllele: 'G', gene: 'PPARG', elementType: 'promoter',
    effect: 'loss', tissues: ['Adipose', 'Liver'], affectedTFs: ['PPARγ', 'RXRα'],
    evidenceLevel: 'inferred', confidenceScore: 0.62, priorityScore: 58,
    linkedDiseases: ['Metabolic'], publicationCount: 23, bookmarked: false,
  },
  {
    id: 'var-009', rsId: 'rs4988235', chromosome: 'chr2', position: 136608646,
    refAllele: 'C', altAllele: 'T', gene: 'LCT', elementType: 'enhancer',
    effect: 'gain', tissues: ['Intestine'], affectedTFs: ['OCT1', 'HNF1α'],
    evidenceLevel: 'validated', confidenceScore: 0.98, priorityScore: 91,
    linkedDiseases: [], publicationCount: 3420, bookmarked: false,
  },
  {
    id: 'var-010', rsId: 'rs10757278', chromosome: 'chr9', position: 22124477,
    refAllele: 'A', altAllele: 'G', gene: 'ANRIL', elementType: 'enhancer',
    effect: 'loss', tissues: ['Heart', 'Adipose'], affectedTFs: ['STAT1', 'EZH2'],
    evidenceLevel: 'literature', confidenceScore: 0.78, priorityScore: 73,
    linkedDiseases: ['Cardiovascular'], publicationCount: 445, bookmarked: false,
  },
  {
    id: 'var-011', rsId: 'rs53576', chromosome: 'chr3', position: 8804371,
    refAllele: 'G', altAllele: 'A', gene: 'OXTR', elementType: 'promoter',
    effect: 'loss', tissues: ['Brain', 'Immune'], affectedTFs: ['SP1', 'USF1'],
    evidenceLevel: 'literature', confidenceScore: 0.72, priorityScore: 64,
    linkedDiseases: ['Neurodegenerative'], publicationCount: 289, bookmarked: false,
  },
  {
    id: 'var-012', rsId: 'rs1042522', chromosome: 'chr17', position: 7676154,
    refAllele: 'G', altAllele: 'C', gene: 'TP53', elementType: 'promoter',
    effect: 'gain', tissues: ['Multiple'], affectedTFs: ['p53', 'MDM2'],
    evidenceLevel: 'validated', confidenceScore: 0.94, priorityScore: 88,
    linkedDiseases: ['Cancer'], publicationCount: 4521, bookmarked: true,
  },
  {
    id: 'var-013', rsId: 'rs17782313', chromosome: 'chr18', position: 60183864,
    refAllele: 'T', altAllele: 'C', gene: 'MC4R', elementType: 'enhancer',
    effect: 'gain', tissues: ['Brain', 'Adipose'], affectedTFs: ['SIM1', 'ARNT2'],
    evidenceLevel: 'literature', confidenceScore: 0.81, priorityScore: 71,
    linkedDiseases: ['Metabolic'], publicationCount: 678, bookmarked: false,
  },
  {
    id: 'var-014', rsId: 'rs1801131', chromosome: 'chr1', position: 11796321,
    refAllele: 'A', altAllele: 'C', gene: 'MTHFR', elementType: 'promoter',
    effect: 'loss', tissues: ['Liver', 'Brain'], affectedTFs: ['SP1', 'E2F1'],
    evidenceLevel: 'validated', confidenceScore: 0.87, priorityScore: 76,
    linkedDiseases: ['Cardiovascular', 'Neurodegenerative'], publicationCount: 1567, bookmarked: false,
  },
  {
    id: 'var-015', rsId: 'rs429358', chromosome: 'chr19', position: 44908684,
    refAllele: 'T', altAllele: 'C', gene: 'APOE', elementType: 'promoter',
    effect: 'gain', tissues: ['Brain', 'Liver'], affectedTFs: ['LXRα', 'RXRα'],
    evidenceLevel: 'validated', confidenceScore: 0.97, priorityScore: 95,
    linkedDiseases: ['Neurodegenerative', 'Cardiovascular'], publicationCount: 8920, bookmarked: true,
  },
  {
    id: 'var-016', rsId: 'rs662', chromosome: 'chr7', position: 95308134,
    refAllele: 'A', altAllele: 'G', gene: 'PON1', elementType: 'enhancer',
    effect: 'loss', tissues: ['Liver'], affectedTFs: ['HNF4α', 'FOXA2'],
    evidenceLevel: 'literature', confidenceScore: 0.79, priorityScore: 68,
    linkedDiseases: ['Cardiovascular', 'Metabolic'], publicationCount: 432, bookmarked: false,
  },
  {
    id: 'var-017', rsId: 'rs4680', chromosome: 'chr22', position: 19963748,
    refAllele: 'G', altAllele: 'A', gene: 'COMT', elementType: 'promoter',
    effect: 'loss', tissues: ['Brain'], affectedTFs: ['SP1', 'EGR1'],
    evidenceLevel: 'validated', confidenceScore: 0.93, priorityScore: 83,
    linkedDiseases: ['Neurodegenerative'], publicationCount: 2345, bookmarked: false,
  },
  {
    id: 'var-018', rsId: 'rs1800896', chromosome: 'chr1', position: 206773552,
    refAllele: 'A', altAllele: 'G', gene: 'IL-10', elementType: 'promoter',
    effect: 'gain', tissues: ['Immune'], affectedTFs: ['STAT3', 'SP1'],
    evidenceLevel: 'literature', confidenceScore: 0.84, priorityScore: 75,
    linkedDiseases: ['Inflammatory', 'Autoimmune'], publicationCount: 734, bookmarked: false,
  },
  {
    id: 'var-019', rsId: 'rs1695', chromosome: 'chr11', position: 67585218,
    refAllele: 'A', altAllele: 'G', gene: 'GSTP1', elementType: 'enhancer',
    effect: 'loss', tissues: ['Liver', 'Lung'], affectedTFs: ['NRF2', 'MAF'],
    evidenceLevel: 'predicted', confidenceScore: 0.71, priorityScore: 62,
    linkedDiseases: ['Cancer'], publicationCount: 156, bookmarked: false,
  },
  {
    id: 'var-020', rsId: 'rs1799983', chromosome: 'chr7', position: 150990023,
    refAllele: 'G', altAllele: 'T', gene: 'NOS3', elementType: 'promoter',
    effect: 'loss', tissues: ['Heart', 'Lung'], affectedTFs: ['SP1', 'AP-2'],
    evidenceLevel: 'literature', confidenceScore: 0.82, priorityScore: 74,
    linkedDiseases: ['Cardiovascular'], publicationCount: 891, bookmarked: false,
  },
];

/* ── Filter Options ─────────────────────────── */
export const variantFilterOptions = {
  chromosomes: ['All', 'chr1', 'chr2', 'chr3', 'chr7', 'chr8', 'chr9', 'chr10', 'chr11', 'chr16', 'chr17', 'chr18', 'chr19', 'chr22'],
  tissues: ['All', 'Immune', 'Liver', 'Heart', 'Intestine', 'Pancreas', 'Adipose', 'Brain', 'Lung', 'Bone Marrow', 'Multiple'],
  elementTypes: ['All', 'enhancer', 'promoter', 'silencer'] as ('All' | RegulatoryElementType)[],
  effects: ['All', 'gain', 'loss', 'neutral'] as const,
  evidenceLevels: ['All', 'validated', 'literature', 'predicted', 'inferred'] as ('All' | EvidenceLevel)[],
  diseaseLinks: ['All', 'Cardiovascular', 'Inflammatory', 'Autoimmune', 'Metabolic', 'Cancer', 'Neurodegenerative'],
};

/* ── Summary Stats ──────────────────────────── */
export const variantSummaryStats = {
  total: 20,
  highPriority: 8,
  enhancerVariants: 8,
  promoterVariants: 9,
  silencerVariants: 1,
  otherVariants: 2,
  gainOfFunction: 11,
  lossOfFunction: 9,
  neutral: 0,
  bookmarked: 6,
};
