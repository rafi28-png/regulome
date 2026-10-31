// ============================================
// ReguloMe — Gene Expression Data
// ============================================
// Synthetic tissue × gene expression matrix data
// for the Gene Expression Landscape page.

/* ── Types ─────────────────────────────────── */

export interface ExpressionEntry {
  gene: string;
  tissue: string;
  expressionLevel: number;    // 0-100 normalised TPM
  foldChange: number;         // vs baseline, e.g. 2.1 = 2.1×
  deviation: number;          // % deviation from population mean
  isHotspot: boolean;
  affectedVariants: string[]; // variant rsIDs
}

export interface GeneSummary {
  gene: string;
  fullName: string;
  chromosome: string;
  avgExpression: number;
  maxDeviation: number;
  hotspotCount: number;
  topTissue: string;
  linkedVariants: string[];
  category: 'oncogene' | 'tumor_suppressor' | 'metabolism' | 'immune' | 'neural' | 'structural';
}

export interface TissueSummary {
  tissue: string;
  icon: string;
  geneCount: number;
  avgExpression: number;
  hotspotCount: number;
  topGene: string;
  color: string;
}

/* ── Tissues ───────────────────────────────── */

export const tissues = [
  'Brain', 'Heart', 'Liver', 'Immune', 'Lung',
  'Intestine', 'Adipose', 'Pancreas', 'Kidney', 'Muscle',
] as const;

export type TissueName = typeof tissues[number];

/* ── Genes ─────────────────────────────────── */

export const geneSummaries: GeneSummary[] = [
  { gene: 'APOE',   fullName: 'Apolipoprotein E',              chromosome: 'chr19', avgExpression: 78, maxDeviation: 62, hotspotCount: 3, topTissue: 'Brain',     linkedVariants: ['rs429358'],            category: 'metabolism' },
  { gene: 'IL-6',   fullName: 'Interleukin 6',                  chromosome: 'chr7',  avgExpression: 65, maxDeviation: 48, hotspotCount: 2, topTissue: 'Immune',    linkedVariants: ['rs1800795'],            category: 'immune' },
  { gene: 'MYC',    fullName: 'MYC Proto-Oncogene',             chromosome: 'chr8',  avgExpression: 72, maxDeviation: 55, hotspotCount: 3, topTissue: 'Intestine', linkedVariants: ['rs6983267'],            category: 'oncogene' },
  { gene: 'TP53',   fullName: 'Tumor Protein P53',              chromosome: 'chr17', avgExpression: 68, maxDeviation: 42, hotspotCount: 2, topTissue: 'Immune',    linkedVariants: ['rs1042522'],            category: 'tumor_suppressor' },
  { gene: 'TCF7L2', fullName: 'Transcription Factor 7-Like 2',  chromosome: 'chr10', avgExpression: 58, maxDeviation: 38, hotspotCount: 2, topTissue: 'Pancreas',  linkedVariants: ['rs7903146'],            category: 'metabolism' },
  { gene: 'FTO',    fullName: 'Fat Mass and Obesity-Associated', chromosome: 'chr16', avgExpression: 61, maxDeviation: 45, hotspotCount: 2, topTissue: 'Adipose',   linkedVariants: ['rs9939609'],            category: 'metabolism' },
  { gene: 'COMT',   fullName: 'Catechol-O-Methyltransferase',   chromosome: 'chr22', avgExpression: 55, maxDeviation: 36, hotspotCount: 1, topTissue: 'Brain',     linkedVariants: ['rs4680'],               category: 'neural' },
  { gene: 'NOS3',   fullName: 'Nitric Oxide Synthase 3',        chromosome: 'chr7',  avgExpression: 48, maxDeviation: 32, hotspotCount: 1, topTissue: 'Heart',     linkedVariants: ['rs1799983'],            category: 'structural' },
  { gene: 'SORT1',  fullName: 'Sortilin 1',                     chromosome: 'chr1',  avgExpression: 52, maxDeviation: 34, hotspotCount: 1, topTissue: 'Liver',     linkedVariants: ['rs12740374'],           category: 'metabolism' },
  { gene: 'PTPN22', fullName: 'Protein Tyrosine Phosphatase N22',chromosome: 'chr1',  avgExpression: 44, maxDeviation: 29, hotspotCount: 1, topTissue: 'Immune',    linkedVariants: ['rs2476601'],            category: 'immune' },
  { gene: 'PPARG',  fullName: 'Peroxisome Proliferator Act. Rγ', chromosome: 'chr3',  avgExpression: 42, maxDeviation: 24, hotspotCount: 1, topTissue: 'Adipose',   linkedVariants: ['rs1801282'],            category: 'metabolism' },
  { gene: 'LCT',    fullName: 'Lactase',                        chromosome: 'chr2',  avgExpression: 38, maxDeviation: 58, hotspotCount: 2, topTissue: 'Intestine', linkedVariants: ['rs4988235'],            category: 'metabolism' },
  { gene: 'MTHFR',  fullName: 'Methylenetetrahydrofolate Red.',  chromosome: 'chr1',  avgExpression: 46, maxDeviation: 28, hotspotCount: 1, topTissue: 'Liver',     linkedVariants: ['rs1801131'],            category: 'metabolism' },
  { gene: 'GSTP1',  fullName: 'Glutathione S-Transferase Pi 1', chromosome: 'chr11', avgExpression: 40, maxDeviation: 22, hotspotCount: 1, topTissue: 'Liver',     linkedVariants: ['rs1695'],              category: 'metabolism' },
  { gene: 'MC4R',   fullName: 'Melanocortin 4 Receptor',        chromosome: 'chr18', avgExpression: 35, maxDeviation: 30, hotspotCount: 1, topTissue: 'Brain',     linkedVariants: ['rs17782313'],           category: 'neural' },
];

/* ── Expression Matrix ─────────────────────── */

// Pre-computed expression values: gene × tissue
// Each value encodes { expressionLevel, foldChange, deviation, isHotspot }
const matrixSeed: Record<string, Record<string, [number, number, number, boolean]>> = {
  APOE:   { Brain: [95, 2.8, 62, true],  Heart: [42, 1.2, 12, false], Liver: [82, 2.1, 48, true],  Immune: [55, 1.3, 18, false], Lung: [28, 0.9, -8, false],  Intestine: [22, 0.8, -12, false], Adipose: [30, 1.0, 5, false],   Pancreas: [18, 0.7, -15, false], Kidney: [48, 1.4, 22, false], Muscle: [12, 0.6, -20, false] },
  'IL-6': { Brain: [28, 1.0, 5, false],  Heart: [45, 1.3, 15, false], Liver: [78, 1.8, 42, true],  Immune: [92, 2.4, 48, true],  Lung: [38, 1.1, 8, false],   Intestine: [52, 1.4, 20, false],  Adipose: [58, 1.5, 25, false],  Pancreas: [22, 0.8, -10, false], Kidney: [32, 1.0, 3, false],  Muscle: [15, 0.7, -18, false] },
  MYC:    { Brain: [25, 0.9, -5, false],  Heart: [18, 0.7, -15, false], Liver: [38, 1.1, 10, false], Immune: [65, 1.5, 30, false], Lung: [32, 1.0, 2, false],  Intestine: [88, 1.6, 55, true],   Adipose: [20, 0.8, -12, false],  Pancreas: [28, 0.9, -5, false],  Kidney: [22, 0.8, -10, false], Muscle: [15, 0.7, -18, false] },
  TP53:   { Brain: [35, 1.1, 8, false],   Heart: [42, 1.2, 12, false], Liver: [55, 1.3, 18, false],  Immune: [72, 1.6, 42, true],  Lung: [48, 1.3, 15, false], Intestine: [58, 1.4, 22, false],  Adipose: [25, 0.9, -5, false],   Pancreas: [38, 1.1, 8, false],   Kidney: [45, 1.2, 12, false],  Muscle: [20, 0.8, -10, false] },
  TCF7L2: { Brain: [22, 0.8, -10, false], Heart: [18, 0.7, -15, false], Liver: [35, 1.0, 5, false],  Immune: [28, 0.9, -3, false], Lung: [15, 0.7, -18, false], Intestine: [62, 1.4, 28, false], Adipose: [42, 1.2, 15, false],  Pancreas: [85, 2.2, 38, true],  Kidney: [30, 1.0, 2, false],  Muscle: [20, 0.8, -8, false] },
  FTO:    { Brain: [58, 1.4, 25, false],  Heart: [22, 0.8, -10, false], Liver: [35, 1.0, 5, false],  Immune: [18, 0.7, -15, false], Lung: [15, 0.6, -20, false], Intestine: [28, 0.9, -5, false], Adipose: [88, 2.5, 45, true],   Pancreas: [32, 1.0, 3, false],   Kidney: [20, 0.8, -10, false], Muscle: [25, 0.9, -5, false] },
  COMT:   { Brain: [82, 2.2, 36, true],   Heart: [18, 0.7, -15, false], Liver: [25, 0.8, -8, false], Immune: [32, 1.0, 5, false],  Lung: [15, 0.7, -18, false], Intestine: [12, 0.6, -22, false], Adipose: [20, 0.8, -10, false], Pancreas: [10, 0.5, -25, false], Kidney: [28, 0.9, -3, false],  Muscle: [8, 0.4, -28, false] },
  NOS3:   { Brain: [22, 0.8, -10, false], Heart: [75, 1.8, 32, true],  Liver: [35, 1.0, 5, false],  Immune: [28, 0.9, -3, false], Lung: [55, 1.4, 22, false], Intestine: [18, 0.7, -15, false], Adipose: [15, 0.6, -20, false], Pancreas: [12, 0.5, -25, false], Kidney: [62, 1.5, 28, false], Muscle: [42, 1.2, 12, false] },
  SORT1:  { Brain: [15, 0.6, -20, false], Heart: [22, 0.8, -10, false], Liver: [78, 2.0, 34, true],  Immune: [18, 0.7, -15, false], Lung: [12, 0.5, -25, false], Intestine: [28, 0.9, -3, false], Adipose: [35, 1.0, 5, false],   Pancreas: [20, 0.8, -10, false], Kidney: [25, 0.8, -8, false],  Muscle: [10, 0.4, -28, false] },
  PTPN22: { Brain: [15, 0.6, -20, false], Heart: [12, 0.5, -25, false], Liver: [18, 0.7, -15, false], Immune: [72, 1.8, 29, true], Lung: [22, 0.8, -10, false], Intestine: [28, 0.9, -3, false], Adipose: [10, 0.4, -28, false], Pancreas: [8, 0.3, -30, false],  Kidney: [20, 0.8, -10, false], Muscle: [8, 0.3, -30, false] },
  PPARG:  { Brain: [10, 0.4, -28, false], Heart: [15, 0.6, -20, false], Liver: [45, 1.2, 15, false], Immune: [12, 0.5, -25, false], Lung: [8, 0.3, -30, false],  Intestine: [22, 0.8, -10, false], Adipose: [72, 1.8, 24, true],   Pancreas: [18, 0.7, -15, false], Kidney: [15, 0.6, -20, false], Muscle: [25, 0.9, -5, false] },
  LCT:    { Brain: [5, 0.2, -35, false],  Heart: [8, 0.3, -30, false],  Liver: [12, 0.5, -25, false], Immune: [8, 0.3, -30, false],  Lung: [5, 0.2, -35, false], Intestine: [92, 3.2, 58, true],   Adipose: [5, 0.2, -35, false],   Pancreas: [10, 0.4, -28, false], Kidney: [8, 0.3, -30, false],  Muscle: [3, 0.1, -38, false] },
  MTHFR:  { Brain: [38, 1.1, 10, false],  Heart: [25, 0.9, -5, false],  Liver: [68, 1.6, 28, true],   Immune: [22, 0.8, -10, false], Lung: [18, 0.7, -15, false], Intestine: [30, 1.0, 3, false],  Adipose: [15, 0.6, -20, false],  Pancreas: [20, 0.8, -8, false],  Kidney: [48, 1.3, 18, false], Muscle: [12, 0.5, -25, false] },
  GSTP1:  { Brain: [18, 0.7, -15, false], Heart: [15, 0.6, -20, false], Liver: [62, 1.5, 22, true],  Immune: [25, 0.9, -5, false],  Lung: [55, 1.4, 20, false], Intestine: [22, 0.8, -10, false], Adipose: [12, 0.5, -25, false],  Pancreas: [10, 0.4, -28, false], Kidney: [35, 1.0, 8, false],  Muscle: [8, 0.3, -30, false] },
  MC4R:   { Brain: [78, 2.0, 30, true],   Heart: [12, 0.5, -25, false], Liver: [8, 0.3, -30, false],  Immune: [10, 0.4, -28, false], Lung: [5, 0.2, -35, false], Intestine: [15, 0.6, -20, false], Adipose: [55, 1.4, 22, false],  Pancreas: [8, 0.3, -30, false],  Kidney: [10, 0.4, -28, false], Muscle: [5, 0.2, -35, false] },
};

// Build the flat expression entries
export const expressionMatrix: ExpressionEntry[] = [];

for (const gene of Object.keys(matrixSeed)) {
  const geneInfo = geneSummaries.find((g) => g.gene === gene);
  const variants = geneInfo?.linkedVariants || [];

  for (const tissue of tissues) {
    const vals = matrixSeed[gene]?.[tissue];
    if (vals) {
      expressionMatrix.push({
        gene,
        tissue,
        expressionLevel: vals[0],
        foldChange: vals[1],
        deviation: vals[2],
        isHotspot: vals[3],
        affectedVariants: vals[3] ? variants : [],
      });
    }
  }
}

/* ── Tissue Summaries ──────────────────────── */

export const tissueSummaries: TissueSummary[] = [
  { tissue: 'Brain',     icon: '🧠', geneCount: 15, avgExpression: 38, hotspotCount: 3, topGene: 'APOE',   color: '#8b5cf6' },
  { tissue: 'Heart',     icon: '❤️', geneCount: 15, avgExpression: 24, hotspotCount: 1, topGene: 'NOS3',   color: '#ef4444' },
  { tissue: 'Liver',     icon: '🫁', geneCount: 15, avgExpression: 42, hotspotCount: 3, topGene: 'SORT1',  color: '#f59e0b' },
  { tissue: 'Immune',    icon: '🛡️', geneCount: 15, avgExpression: 36, hotspotCount: 3, topGene: 'IL-6',   color: '#10b981' },
  { tissue: 'Lung',      icon: '🌬️', geneCount: 15, avgExpression: 22, hotspotCount: 0, topGene: 'GSTP1',  color: '#06b6d4' },
  { tissue: 'Intestine', icon: '🔄', geneCount: 15, avgExpression: 36, hotspotCount: 2, topGene: 'LCT',    color: '#0ae8d2' },
  { tissue: 'Adipose',   icon: '🟡', geneCount: 15, avgExpression: 29, hotspotCount: 2, topGene: 'FTO',    color: '#f97316' },
  { tissue: 'Pancreas',  icon: '🔬', geneCount: 15, avgExpression: 20, hotspotCount: 1, topGene: 'TCF7L2', color: '#a78bfa' },
  { tissue: 'Kidney',    icon: '🫘', geneCount: 15, avgExpression: 28, hotspotCount: 0, topGene: 'NOS3',   color: '#3b82f6' },
  { tissue: 'Muscle',    icon: '💪', geneCount: 15, avgExpression: 13, hotspotCount: 0, topGene: 'NOS3',   color: '#64748b' },
];

/* ── Summary Stats ─────────────────────────── */

export const expressionStats = {
  totalGenes: geneSummaries.length,
  totalTissues: tissues.length,
  totalHotspots: expressionMatrix.filter((e) => e.isHotspot).length,
  avgDeviation: +(expressionMatrix.reduce((sum, e) => sum + Math.abs(e.deviation), 0) / expressionMatrix.length).toFixed(1),
  maxExpression: Math.max(...expressionMatrix.map((e) => e.expressionLevel)),
  topDysregulatedGene: 'APOE',
};

/* ── Helper: get expression for a gene ─────── */

export function getGeneExpression(gene: string): ExpressionEntry[] {
  return expressionMatrix.filter((e) => e.gene === gene);
}

/* ── Helper: get expression for a tissue ───── */

export function getTissueExpression(tissue: string): ExpressionEntry[] {
  return expressionMatrix.filter((e) => e.tissue === tissue);
}
