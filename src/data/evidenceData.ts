// ============================================
// ReguloMe — Evidence Studio Demo Data
// ============================================
// Synthetic evidence records with provenance,
// confidence levels, and source attributions.

import type { EvidenceLevel, RegulatoryElementType } from '@/types';

/* ── Evidence Source ───────────────────────── */
export interface EvidenceSource {
  id: string;
  name: string;
  type: 'database' | 'publication' | 'consortium' | 'computational';
  url?: string;
  icon: string;
}

export const evidenceSources: EvidenceSource[] = [
  { id: 'encode', name: 'ENCODE Project', type: 'consortium', url: 'https://encodeproject.org', icon: '🏛️' },
  { id: 'clinvar', name: 'ClinVar', type: 'database', url: 'https://ncbi.nlm.nih.gov/clinvar', icon: '🏥' },
  { id: 'gtex', name: 'GTEx Portal', type: 'consortium', url: 'https://gtexportal.org', icon: '🧪' },
  { id: 'pubmed', name: 'PubMed', type: 'publication', url: 'https://pubmed.ncbi.nlm.nih.gov', icon: '📜' },
  { id: 'roadmap', name: 'Roadmap Epigenomics', type: 'consortium', url: 'http://www.roadmapepigenomics.org', icon: '🗺️' },
  { id: 'regulomedb', name: 'RegulomeDB', type: 'database', url: 'https://regulomedb.org', icon: '🧬' },
  { id: 'deepvariant', name: 'DeepVariant AI', type: 'computational', icon: '🤖' },
  { id: 'fantom', name: 'FANTOM5', type: 'consortium', url: 'https://fantom.gsc.riken.jp', icon: '🔬' },
];

/* ── Evidence Record ───────────────────────── */
export interface EvidenceRecord {
  id: string;
  variantId: string;
  rsId: string;
  gene: string;
  chromosome: string;
  position: number;
  elementType: RegulatoryElementType;
  effect: 'gain' | 'loss' | 'neutral';
  tissue: string;
  confidenceScore: number; // 0-1
  evidenceLevel: EvidenceLevel;
  sources: string[]; // source IDs
  summary: string;
  publicationCount: number;
  lastUpdated: string;
  tags: string[];
}

export const evidenceRecords: EvidenceRecord[] = [
  {
    id: 'ev-001',
    variantId: 'var-001',
    rsId: 'rs1800795',
    gene: 'IL-6',
    chromosome: 'chr7',
    position: 22766645,
    elementType: 'promoter',
    effect: 'gain',
    tissue: 'Immune',
    confidenceScore: 0.96,
    evidenceLevel: 'validated',
    sources: ['encode', 'clinvar', 'pubmed', 'gtex'],
    summary: 'The C>G substitution in the IL-6 promoter region creates a gain-of-function effect, increasing IL-6 transcription by ~40%. Extensively validated in clinical cohorts with consistent inflammatory biomarker elevation.',
    publicationCount: 847,
    lastUpdated: '2026-03-28',
    tags: ['inflammatory', 'cytokine', 'immune', 'high-impact'],
  },
  {
    id: 'ev-002',
    variantId: 'var-002',
    rsId: 'rs12740374',
    gene: 'SORT1',
    chromosome: 'chr1',
    position: 109818530,
    elementType: 'enhancer',
    effect: 'loss',
    tissue: 'Liver',
    confidenceScore: 0.89,
    evidenceLevel: 'literature',
    sources: ['encode', 'gtex', 'pubmed'],
    summary: 'Loss-of-function variant disrupting a liver-specific enhancer controlling SORT1 expression. Associated with altered LDL cholesterol metabolism through hepatic VLDL secretion pathways.',
    publicationCount: 312,
    lastUpdated: '2026-03-15',
    tags: ['cardiovascular', 'lipid', 'liver', 'metabolism'],
  },
  {
    id: 'ev-003',
    variantId: 'var-003',
    rsId: 'rs6983267',
    gene: 'MYC',
    chromosome: 'chr8',
    position: 128413305,
    elementType: 'enhancer',
    effect: 'gain',
    tissue: 'Intestine',
    confidenceScore: 0.92,
    evidenceLevel: 'validated',
    sources: ['encode', 'roadmap', 'pubmed', 'fantom'],
    summary: 'Gain-of-function at a long-range enhancer of MYC, creating increased cell proliferation signaling in intestinal epithelium. One of the most well-characterized non-coding cancer risk variants.',
    publicationCount: 1204,
    lastUpdated: '2026-04-01',
    tags: ['cancer', 'proliferation', 'intestine', 'high-impact'],
  },
  {
    id: 'ev-004',
    variantId: 'var-004',
    rsId: 'rs1333049',
    gene: 'CDKN2B-AS1',
    chromosome: 'chr9',
    position: 22125503,
    elementType: 'silencer',
    effect: 'loss',
    tissue: 'Heart',
    confidenceScore: 0.74,
    evidenceLevel: 'predicted',
    sources: ['regulomedb', 'deepvariant', 'encode'],
    summary: 'Predicted loss of silencer function at the 9p21 locus. Computational models suggest disrupted CTCF-mediated chromatin looping, potentially de-repressing CDKN2B-AS1 antisense RNA.',
    publicationCount: 89,
    lastUpdated: '2026-02-20',
    tags: ['cardiovascular', 'chromatin', 'heart', 'predicted'],
  },
  {
    id: 'ev-005',
    variantId: 'var-005',
    rsId: 'rs7903146',
    gene: 'TCF7L2',
    chromosome: 'chr10',
    position: 114758349,
    elementType: 'enhancer',
    effect: 'gain',
    tissue: 'Pancreas',
    confidenceScore: 0.88,
    evidenceLevel: 'literature',
    sources: ['clinvar', 'gtex', 'pubmed', 'encode'],
    summary: 'Strong gain-of-function in a pancreatic islet enhancer controlling TCF7L2 expression. The T allele is the strongest known common variant for type 2 diabetes susceptibility.',
    publicationCount: 2103,
    lastUpdated: '2026-03-10',
    tags: ['metabolic', 'diabetes', 'pancreas', 'high-impact'],
  },
  {
    id: 'ev-006',
    variantId: 'var-006',
    rsId: 'rs2476601',
    gene: 'PTPN22',
    chromosome: 'chr1',
    position: 114377568,
    elementType: 'promoter',
    effect: 'gain',
    tissue: 'Immune',
    confidenceScore: 0.85,
    evidenceLevel: 'literature',
    sources: ['clinvar', 'pubmed', 'regulomedb'],
    summary: 'Gain-of-function variant in the PTPN22 promoter affecting T-cell receptor signaling. Associated with multiple autoimmune conditions including rheumatoid arthritis and lupus.',
    publicationCount: 567,
    lastUpdated: '2026-03-22',
    tags: ['autoimmune', 'immune', 'T-cell', 'multi-disease'],
  },
  {
    id: 'ev-007',
    variantId: 'var-007',
    rsId: 'rs9939609',
    gene: 'FTO',
    chromosome: 'chr16',
    position: 53820527,
    elementType: 'enhancer',
    effect: 'gain',
    tissue: 'Adipose',
    confidenceScore: 0.91,
    evidenceLevel: 'validated',
    sources: ['encode', 'gtex', 'pubmed', 'roadmap'],
    summary: 'The A allele disrupts ARID5B binding at an adipocyte enhancer, shifting the IRX3/IRX5 regulatory circuit toward thermogenesis suppression and increased lipid storage.',
    publicationCount: 1890,
    lastUpdated: '2026-04-05',
    tags: ['metabolic', 'obesity', 'adipose', 'high-impact'],
  },
  {
    id: 'ev-008',
    variantId: 'var-008',
    rsId: 'rs1801282',
    gene: 'PPARG',
    chromosome: 'chr3',
    position: 12393125,
    elementType: 'promoter',
    effect: 'loss',
    tissue: 'Adipose',
    confidenceScore: 0.62,
    evidenceLevel: 'inferred',
    sources: ['deepvariant', 'regulomedb'],
    summary: 'Computationally inferred loss of PPARG promoter activity. Network analysis suggests downstream disruption of adipogenesis and insulin sensitization pathways, pending experimental validation.',
    publicationCount: 23,
    lastUpdated: '2026-01-15',
    tags: ['metabolic', 'adipose', 'inferred', 'needs-validation'],
  },
  {
    id: 'ev-009',
    variantId: 'var-009',
    rsId: 'rs4988235',
    gene: 'LCT',
    chromosome: 'chr2',
    position: 136608646,
    elementType: 'enhancer',
    effect: 'gain',
    tissue: 'Intestine',
    confidenceScore: 0.98,
    evidenceLevel: 'validated',
    sources: ['encode', 'clinvar', 'pubmed', 'gtex', 'fantom'],
    summary: 'Classic regulatory variant controlling adult lactase persistence. The T allele maintains enhancer activity in intestinal epithelium, enabling continued lactose digestion post-weaning.',
    publicationCount: 3420,
    lastUpdated: '2026-04-10',
    tags: ['dietetics', 'intestine', 'well-characterized', 'high-impact'],
  },
  {
    id: 'ev-010',
    variantId: 'var-010',
    rsId: 'rs10757278',
    gene: 'ANRIL',
    chromosome: 'chr9',
    position: 22124477,
    elementType: 'enhancer',
    effect: 'loss',
    tissue: 'Heart',
    confidenceScore: 0.78,
    evidenceLevel: 'literature',
    sources: ['pubmed', 'encode', 'roadmap'],
    summary: 'Enhancer variant at the 9p21 locus affecting ANRIL lncRNA expression. Literature supports role in vascular smooth muscle cell proliferation and atherosclerosis susceptibility.',
    publicationCount: 445,
    lastUpdated: '2026-03-05',
    tags: ['cardiovascular', 'lncRNA', 'heart', 'atherosclerosis'],
  },
];

/* ── Filter Options ────────────────────────── */
export const evidenceFilterOptions = {
  tissues: ['All', 'Immune', 'Liver', 'Heart', 'Intestine', 'Pancreas', 'Adipose', 'Brain', 'Lung'],
  evidenceLevels: ['All', 'validated', 'literature', 'predicted', 'inferred'] as ('All' | EvidenceLevel)[],
  elementTypes: ['All', 'enhancer', 'promoter', 'silencer', 'tfbs', 'insulator'] as ('All' | RegulatoryElementType)[],
  effects: ['All', 'gain', 'loss', 'neutral'] as const,
};

/* ── Stats ─────────────────────────────────── */
export const evidenceStats = {
  totalRecords: 2847,
  validated: 842,
  literature: 1203,
  predicted: 567,
  inferred: 235,
  uniqueGenes: 1456,
  uniqueTissues: 12,
  totalSources: 8,
};
