// ============================================
// ReguloMe — Network Atlas Data
// ============================================
// Regulatory network graph data for the
// Network Atlas force-directed visualization.

/* ── Types ─────────────────────────────────── */

export type NodeType = 'variant' | 'tf' | 'gene' | 'pathway' | 'disease' | 'tissue';

export interface NetworkNode {
  id: string;
  label: string;
  type: NodeType;
  size: number;      // radius multiplier
  metadata?: string;
}

export interface NetworkEdge {
  source: string;
  target: string;
  type: 'regulates' | 'activates' | 'represses' | 'associated' | 'expressed_in';
  weight: number;    // 0-1 strength
}

/* ── Node styling ──────────────────────────── */

export const nodeColors: Record<NodeType, string> = {
  variant: '#0ae8d2',
  tf: '#f59e0b',
  gene: '#8b5cf6',
  pathway: '#3b82f6',
  disease: '#ef4444',
  tissue: '#10b981',
};

export const nodeIcons: Record<NodeType, string> = {
  variant: '🧬',
  tf: '🔑',
  gene: '🧪',
  pathway: '⚙️',
  disease: '💔',
  tissue: '🫁',
};

export const nodeTypeLabels: Record<NodeType, string> = {
  variant: 'Variant',
  tf: 'Transcription Factor',
  gene: 'Gene',
  pathway: 'Pathway',
  disease: 'Disease',
  tissue: 'Tissue',
};

/* ── Edge styling ──────────────────────────── */

export const edgeColors: Record<string, string> = {
  regulates: '#0ae8d2',
  activates: '#10b981',
  represses: '#ef4444',
  associated: '#8b5cf6',
  expressed_in: '#3b82f6',
};

/* ── Network Data ──────────────────────────── */

export const networkNodes: NetworkNode[] = [
  // Variants
  { id: 'v-rs1800795', label: 'rs1800795',  type: 'variant', size: 1.2, metadata: 'IL-6 promoter variant' },
  { id: 'v-rs6983267', label: 'rs6983267',  type: 'variant', size: 1.2, metadata: 'MYC enhancer variant' },
  { id: 'v-rs429358',  label: 'rs429358',   type: 'variant', size: 1.4, metadata: 'APOE ε4 variant' },
  { id: 'v-rs7903146', label: 'rs7903146',  type: 'variant', size: 1.0, metadata: 'TCF7L2 enhancer' },
  { id: 'v-rs9939609', label: 'rs9939609',  type: 'variant', size: 1.1, metadata: 'FTO enhancer' },
  { id: 'v-rs4680',    label: 'rs4680',     type: 'variant', size: 0.9, metadata: 'COMT promoter' },

  // Transcription Factors
  { id: 'tf-nfkb',  label: 'NF-κB',   type: 'tf', size: 1.3 },
  { id: 'tf-ap1',   label: 'AP-1',    type: 'tf', size: 1.0 },
  { id: 'tf-tcf7l2',label: 'TCF7L2',  type: 'tf', size: 1.1 },
  { id: 'tf-lef1',  label: 'LEF1',    type: 'tf', size: 0.9 },
  { id: 'tf-lxra',  label: 'LXRα',    type: 'tf', size: 1.0 },
  { id: 'tf-arid5b',label: 'ARID5B',  type: 'tf', size: 0.9 },
  { id: 'tf-sp1',   label: 'SP1',     type: 'tf', size: 1.1 },
  { id: 'tf-stat3', label: 'STAT3',   type: 'tf', size: 1.2 },

  // Genes
  { id: 'g-il6',    label: 'IL-6',    type: 'gene', size: 1.3 },
  { id: 'g-myc',    label: 'MYC',     type: 'gene', size: 1.4 },
  { id: 'g-apoe',   label: 'APOE',    type: 'gene', size: 1.5 },
  { id: 'g-tcf7l2', label: 'TCF7L2',  type: 'gene', size: 1.1 },
  { id: 'g-fto',    label: 'FTO',     type: 'gene', size: 1.2 },
  { id: 'g-comt',   label: 'COMT',    type: 'gene', size: 1.0 },

  // Pathways
  { id: 'p-jakstat', label: 'JAK/STAT3',       type: 'pathway', size: 1.2 },
  { id: 'p-nfkb',   label: 'NF-κB Signalling', type: 'pathway', size: 1.1 },
  { id: 'p-wnt',    label: 'Wnt/β-catenin',    type: 'pathway', size: 1.1 },
  { id: 'p-lipid',  label: 'Lipid Metabolism',  type: 'pathway', size: 1.0 },
  { id: 'p-abeta',  label: 'Aβ Clearance',      type: 'pathway', size: 1.0 },
  { id: 'p-thermo', label: 'Thermogenesis',     type: 'pathway', size: 0.9 },
  { id: 'p-dopa',   label: 'Dopamine',          type: 'pathway', size: 0.9 },

  // Diseases
  { id: 'd-inflam',  label: 'Inflammatory',     type: 'disease', size: 1.2 },
  { id: 'd-cardio',  label: 'Cardiovascular',   type: 'disease', size: 1.3 },
  { id: 'd-cancer',  label: 'Cancer',           type: 'disease', size: 1.2 },
  { id: 'd-alz',     label: "Alzheimer's",      type: 'disease', size: 1.3 },
  { id: 'd-t2d',     label: 'Type 2 Diabetes',  type: 'disease', size: 1.1 },
  { id: 'd-obesity',label: 'Obesity',            type: 'disease', size: 1.0 },

  // Tissues
  { id: 't-immune', label: 'Immune',    type: 'tissue', size: 1.0 },
  { id: 't-liver',  label: 'Liver',     type: 'tissue', size: 1.0 },
  { id: 't-brain',  label: 'Brain',     type: 'tissue', size: 1.1 },
  { id: 't-intest', label: 'Intestine', type: 'tissue', size: 0.9 },
  { id: 't-adipose',label: 'Adipose',   type: 'tissue', size: 0.9 },
  { id: 't-pancr',  label: 'Pancreas',  type: 'tissue', size: 0.8 },
];

export const networkEdges: NetworkEdge[] = [
  // IL-6 cluster
  { source: 'tf-nfkb',  target: 'v-rs1800795', type: 'regulates', weight: 0.92 },
  { source: 'tf-ap1',   target: 'v-rs1800795', type: 'regulates', weight: 0.85 },
  { source: 'v-rs1800795', target: 'g-il6',    type: 'activates', weight: 0.96 },
  { source: 'g-il6',    target: 'p-jakstat',   type: 'activates', weight: 0.88 },
  { source: 'g-il6',    target: 'p-nfkb',      type: 'activates', weight: 0.82 },
  { source: 'p-jakstat', target: 'd-inflam',   type: 'associated', weight: 0.78 },
  { source: 'p-nfkb',   target: 'd-cardio',    type: 'associated', weight: 0.65 },
  { source: 'g-il6',    target: 't-immune',    type: 'expressed_in', weight: 0.95 },
  { source: 'g-il6',    target: 't-liver',     type: 'expressed_in', weight: 0.72 },

  // MYC cluster
  { source: 'tf-tcf7l2', target: 'v-rs6983267', type: 'regulates', weight: 0.90 },
  { source: 'tf-lef1',  target: 'v-rs6983267', type: 'regulates', weight: 0.78 },
  { source: 'v-rs6983267', target: 'g-myc',    type: 'activates', weight: 0.92 },
  { source: 'g-myc',    target: 'p-wnt',       type: 'activates', weight: 0.85 },
  { source: 'p-wnt',    target: 'd-cancer',    type: 'associated', weight: 0.80 },
  { source: 'g-myc',    target: 't-intest',    type: 'expressed_in', weight: 0.88 },

  // APOE cluster
  { source: 'tf-lxra',  target: 'v-rs429358',  type: 'regulates', weight: 0.94 },
  { source: 'v-rs429358', target: 'g-apoe',    type: 'activates', weight: 0.97 },
  { source: 'g-apoe',   target: 'p-lipid',     type: 'activates', weight: 0.90 },
  { source: 'g-apoe',   target: 'p-abeta',     type: 'represses', weight: 0.85 },
  { source: 'p-abeta',  target: 'd-alz',       type: 'associated', weight: 0.92 },
  { source: 'p-lipid',  target: 'd-cardio',    type: 'associated', weight: 0.70 },
  { source: 'g-apoe',   target: 't-brain',     type: 'expressed_in', weight: 0.95 },
  { source: 'g-apoe',   target: 't-liver',     type: 'expressed_in', weight: 0.80 },

  // TCF7L2 cluster
  { source: 'tf-tcf7l2', target: 'v-rs7903146', type: 'regulates', weight: 0.88 },
  { source: 'v-rs7903146', target: 'g-tcf7l2', type: 'activates', weight: 0.86 },
  { source: 'g-tcf7l2', target: 'p-wnt',       type: 'activates', weight: 0.75 },
  { source: 'p-wnt',    target: 'd-t2d',       type: 'associated', weight: 0.72 },
  { source: 'g-tcf7l2', target: 't-pancr',     type: 'expressed_in', weight: 0.90 },

  // FTO cluster
  { source: 'tf-arid5b', target: 'v-rs9939609', type: 'regulates', weight: 0.88 },
  { source: 'v-rs9939609', target: 'g-fto',    type: 'activates', weight: 0.91 },
  { source: 'g-fto',    target: 'p-thermo',    type: 'represses', weight: 0.80 },
  { source: 'p-thermo', target: 'd-obesity',   type: 'associated', weight: 0.75 },
  { source: 'g-fto',    target: 't-adipose',   type: 'expressed_in', weight: 0.88 },
  { source: 'g-fto',    target: 't-brain',     type: 'expressed_in', weight: 0.60 },

  // COMT cluster
  { source: 'tf-sp1',   target: 'v-rs4680',    type: 'regulates', weight: 0.82 },
  { source: 'v-rs4680', target: 'g-comt',      type: 'activates', weight: 0.93 },
  { source: 'g-comt',   target: 'p-dopa',      type: 'activates', weight: 0.85 },
  { source: 'g-comt',   target: 't-brain',     type: 'expressed_in', weight: 0.92 },

  // Cross-cluster connections
  { source: 'tf-stat3', target: 'g-il6',       type: 'regulates', weight: 0.70 },
  { source: 'tf-nfkb',  target: 'g-apoe',      type: 'regulates', weight: 0.55 },
  { source: 'tf-sp1',   target: 'g-il6',       type: 'regulates', weight: 0.50 },
];

/* ── Stats ─────────────────────────────────── */

export const networkStats = {
  totalNodes: networkNodes.length,
  totalEdges: networkEdges.length,
  variants: networkNodes.filter((n) => n.type === 'variant').length,
  tfs: networkNodes.filter((n) => n.type === 'tf').length,
  genes: networkNodes.filter((n) => n.type === 'gene').length,
  pathways: networkNodes.filter((n) => n.type === 'pathway').length,
  diseases: networkNodes.filter((n) => n.type === 'disease').length,
  tissues: networkNodes.filter((n) => n.type === 'tissue').length,
  avgConnectivity: +(networkEdges.length / networkNodes.length).toFixed(1),
};
