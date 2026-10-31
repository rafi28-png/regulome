// ============================================
// ReguloMe — 3D Genome Explorer Data
// ============================================

import type { EvidenceLevel, RegulatoryElementType } from '@/types';

// ── Types ──

export interface ChromosomeInfo {
  id: string;
  label: string;
  sizeMb: number;
  geneCount: number;
  variantCount: number;
  regulatoryDensity: number;  // elements per Mb
  tadCount: number;
  color: string;
}

export interface TADRegion {
  id: string;
  chromosomeId: string;
  startMb: number;
  endMb: number;
  sizeMb: number;
  compartment: 'A' | 'B';       // A = active, B = inactive
  insulationScore: number;       // 0-1
  boundaryStrength: number;      // 0-1
  geneCount: number;
  variantCount: number;
  label: string;
  description: string;
}

export interface RegulatoryAnnotation {
  id: string;
  chromosomeId: string;
  tadId: string;
  positionMb: number;
  elementType: RegulatoryElementType;
  gene: string;
  rsId?: string;
  evidenceLevel: EvidenceLevel;
  score: number;    // 0-100
  tissue: string;
  description: string;
}

export interface LocusDetail {
  id: string;
  chromosomeId: string;
  tadId: string;
  gene: string;
  positionMb: number;
  variants: { rsId: string; effect: 'gain' | 'loss' | 'neutral'; score: number }[];
  tissues: string[];
  pathways: string[];
  expression: 'high' | 'moderate' | 'low';
  evidenceLevel: EvidenceLevel;
  summary: string;
}

// ── Chromosomes ──

export const chromosomes: ChromosomeInfo[] = [
  { id: 'chr1',  label: '1',  sizeMb: 249, geneCount: 2058, variantCount: 187, regulatoryDensity: 12.4, tadCount: 18, color: '#3b82f6' },
  { id: 'chr2',  label: '2',  sizeMb: 243, geneCount: 1309, variantCount: 162, regulatoryDensity: 10.8, tadCount: 16, color: '#6366f1' },
  { id: 'chr3',  label: '3',  sizeMb: 198, geneCount: 1078, variantCount: 131, regulatoryDensity: 9.6,  tadCount: 14, color: '#8b5cf6' },
  { id: 'chr4',  label: '4',  sizeMb: 191, geneCount: 752,  variantCount: 108, regulatoryDensity: 8.2,  tadCount: 12, color: '#a855f7' },
  { id: 'chr5',  label: '5',  sizeMb: 181, geneCount: 876,  variantCount: 119, regulatoryDensity: 9.1,  tadCount: 13, color: '#0ae8d2' },
  { id: 'chr6',  label: '6',  sizeMb: 171, geneCount: 1048, variantCount: 145, regulatoryDensity: 11.3, tadCount: 15, color: '#14b8a6' },
  { id: 'chr7',  label: '7',  sizeMb: 159, geneCount: 989,  variantCount: 134, regulatoryDensity: 10.5, tadCount: 13, color: '#10b981' },
  { id: 'chr8',  label: '8',  sizeMb: 145, geneCount: 677,  variantCount: 96,  regulatoryDensity: 8.7,  tadCount: 11, color: '#22c55e' },
  { id: 'chr9',  label: '9',  sizeMb: 138, geneCount: 786,  variantCount: 103, regulatoryDensity: 9.4,  tadCount: 10, color: '#84cc16' },
  { id: 'chr10', label: '10', sizeMb: 134, geneCount: 733,  variantCount: 98,  regulatoryDensity: 9.0,  tadCount: 10, color: '#eab308' },
  { id: 'chr11', label: '11', sizeMb: 135, geneCount: 1298, variantCount: 141, regulatoryDensity: 11.1, tadCount: 12, color: '#f59e0b' },
  { id: 'chr12', label: '12', sizeMb: 133, geneCount: 1034, variantCount: 118, regulatoryDensity: 10.2, tadCount: 11, color: '#f97316' },
  { id: 'chr13', label: '13', sizeMb: 115, geneCount: 327,  variantCount: 58,  regulatoryDensity: 6.3,  tadCount: 8,  color: '#ef4444' },
  { id: 'chr14', label: '14', sizeMb: 107, geneCount: 830,  variantCount: 89,  regulatoryDensity: 9.2,  tadCount: 9,  color: '#f43f5e' },
  { id: 'chr15', label: '15', sizeMb: 103, geneCount: 613,  variantCount: 78,  regulatoryDensity: 8.5,  tadCount: 8,  color: '#ec4899' },
  { id: 'chr16', label: '16', sizeMb: 90,  geneCount: 873,  variantCount: 104, regulatoryDensity: 12.1, tadCount: 9,  color: '#d946ef' },
  { id: 'chr17', label: '17', sizeMb: 83,  geneCount: 1197, variantCount: 128, regulatoryDensity: 13.5, tadCount: 10, color: '#a78bfa' },
  { id: 'chr18', label: '18', sizeMb: 80,  geneCount: 270,  variantCount: 49,  regulatoryDensity: 5.8,  tadCount: 6,  color: '#818cf8' },
  { id: 'chr19', label: '19', sizeMb: 59,  geneCount: 1472, variantCount: 168, regulatoryDensity: 18.4, tadCount: 8,  color: '#60a5fa' },
  { id: 'chr20', label: '20', sizeMb: 64,  geneCount: 544,  variantCount: 72,  regulatoryDensity: 9.8,  tadCount: 6,  color: '#38bdf8' },
  { id: 'chr21', label: '21', sizeMb: 47,  geneCount: 234,  variantCount: 36,  regulatoryDensity: 6.1,  tadCount: 4,  color: '#22d3ee' },
  { id: 'chr22', label: '22', sizeMb: 51,  geneCount: 488,  variantCount: 63,  regulatoryDensity: 10.3, tadCount: 5,  color: '#2dd4bf' },
  { id: 'chrX',  label: 'X',  sizeMb: 155, geneCount: 842,  variantCount: 97,  regulatoryDensity: 7.8,  tadCount: 11, color: '#fb7185' },
  { id: 'chrY',  label: 'Y',  sizeMb: 57,  geneCount: 63,   variantCount: 12,  regulatoryDensity: 2.1,  tadCount: 3,  color: '#94a3b8' },
];

// ── TAD Regions (for chr1 default view, plus a few on other chromosomes) ──

export const tadRegions: TADRegion[] = [
  // Chromosome 1
  { id: 'tad1-1',  chromosomeId: 'chr1', startMb: 1.2,   endMb: 8.5,   sizeMb: 7.3,  compartment: 'A', insulationScore: 0.92, boundaryStrength: 0.88, geneCount: 42, variantCount: 14, label: 'TP73-CAMTA1 Domain',    description: 'Active domain harboring tumor suppressor TP73 and transcription co-activator CAMTA1' },
  { id: 'tad1-2',  chromosomeId: 'chr1', startMb: 11.8,  endMb: 22.4,  sizeMb: 10.6, compartment: 'B', insulationScore: 0.78, boundaryStrength: 0.71, geneCount: 28, variantCount: 8,  label: 'MTOR Regulatory Region', description: 'Repressed compartment flanking the MTOR signaling locus with multiple silencer elements' },
  { id: 'tad1-3',  chromosomeId: 'chr1', startMb: 25.3,  endMb: 33.8,  sizeMb: 8.5,  compartment: 'A', insulationScore: 0.95, boundaryStrength: 0.93, geneCount: 56, variantCount: 18, label: 'RUNX3-HMGN2 Hub',        description: 'Highly active domain with strong CTCF boundaries and abundant enhancer-promoter loops' },
  { id: 'tad1-4',  chromosomeId: 'chr1', startMb: 36.2,  endMb: 46.9,  sizeMb: 10.7, compartment: 'A', insulationScore: 0.88, boundaryStrength: 0.82, geneCount: 67, variantCount: 21, label: 'MECP2-FOXO6 Domain',     description: 'Gene-dense active domain with regulatory variants affecting neuronal gene expression' },
  { id: 'tad1-5',  chromosomeId: 'chr1', startMb: 50.1,  endMb: 58.4,  sizeMb: 8.3,  compartment: 'B', insulationScore: 0.72, boundaryStrength: 0.65, geneCount: 19, variantCount: 5,  label: 'Desert Region Alpha',   description: 'Gene-poor inactive compartment with sparse regulatory annotations' },
  { id: 'tad1-6',  chromosomeId: 'chr1', startMb: 62.8,  endMb: 74.3,  sizeMb: 11.5, compartment: 'A', insulationScore: 0.91, boundaryStrength: 0.87, geneCount: 74, variantCount: 23, label: 'NRAS-PDE4B Complex',     description: 'Active domain containing NRAS oncogene and PDE4B with multiple enhancer clusters' },
  { id: 'tad1-7',  chromosomeId: 'chr1', startMb: 78.5,  endMb: 91.2,  sizeMb: 12.7, compartment: 'B', insulationScore: 0.69, boundaryStrength: 0.58, geneCount: 31, variantCount: 9,  label: 'Heterochromatin Block',   description: 'Large inactive domain with condensed chromatin and low accessibility scores' },
  { id: 'tad1-8',  chromosomeId: 'chr1', startMb: 95.4,  endMb: 110.8, sizeMb: 15.4, compartment: 'A', insulationScore: 0.94, boundaryStrength: 0.91, geneCount: 89, variantCount: 28, label: 'COL11A1-MOV10 Hub',      description: 'Largest active domain on chr1 with collagen and RNA helicase regulatory circuits' },
  { id: 'tad1-9',  chromosomeId: 'chr1', startMb: 115.0, endMb: 128.6, sizeMb: 13.6, compartment: 'A', insulationScore: 0.86, boundaryStrength: 0.79, geneCount: 52, variantCount: 16, label: 'NOTCH2 Signaling Domain', description: 'Active compartment centered on Notch signaling pathway regulatory elements' },
  { id: 'tad1-10', chromosomeId: 'chr1', startMb: 132.4, endMb: 145.7, sizeMb: 13.3, compartment: 'B', insulationScore: 0.74, boundaryStrength: 0.68, geneCount: 24, variantCount: 7,  label: 'Centromeric Boundary',    description: 'Pericentromeric heterochromatin transitioning between active and repressed states' },

  // Chromosome 6 (MHC region)
  { id: 'tad6-1',  chromosomeId: 'chr6', startMb: 28.5,  endMb: 33.4,  sizeMb: 4.9,  compartment: 'A', insulationScore: 0.97, boundaryStrength: 0.95, geneCount: 128, variantCount: 45, label: 'MHC Class I Domain',   description: 'Extremely gene-dense HLA region with strongest known boundary elements' },
  { id: 'tad6-2',  chromosomeId: 'chr6', startMb: 33.4,  endMb: 36.2,  sizeMb: 2.8,  compartment: 'A', insulationScore: 0.96, boundaryStrength: 0.94, geneCount: 96,  variantCount: 38, label: 'MHC Class II Domain',  description: 'HLA class II locus with dense autoimmune-associated regulatory variants' },

  // Chromosome 17
  { id: 'tad17-1', chromosomeId: 'chr17', startMb: 41.2, endMb: 44.8,  sizeMb: 3.6,  compartment: 'A', insulationScore: 0.93, boundaryStrength: 0.90, geneCount: 34, variantCount: 19, label: 'BRCA1 Domain',          description: 'DNA repair locus with BRCA1 and strong enhancer-promoter contacts' },
  { id: 'tad17-2', chromosomeId: 'chr17', startMb: 7.5,  endMb: 13.2,  sizeMb: 5.7,  compartment: 'A', insulationScore: 0.89, boundaryStrength: 0.84, geneCount: 48, variantCount: 15, label: 'TP53-EFNB3 Region',     description: 'Tumor suppressor hub with complex regulatory element interactions' },

  // Chromosome 19
  { id: 'tad19-1', chromosomeId: 'chr19', startMb: 44.9, endMb: 45.5,  sizeMb: 0.6,  compartment: 'A', insulationScore: 0.91, boundaryStrength: 0.88, geneCount: 8,  variantCount: 12, label: 'APOE-TOMM40 Domain',    description: 'Alzheimer risk locus with complex LD structure and multiple regulatory variants' },
];

// ── Regulatory Annotations ──

export const regulatoryAnnotations: RegulatoryAnnotation[] = [
  // TAD 1-1
  { id: 'reg-1',  chromosomeId: 'chr1', tadId: 'tad1-1',  positionMb: 3.6,   elementType: 'enhancer',        gene: 'TP73',    rsId: 'rs2273953',  evidenceLevel: 'validated',  score: 92, tissue: 'Brain',  description: 'Strong enhancer driving TP73 expression in neural progenitors' },
  { id: 'reg-2',  chromosomeId: 'chr1', tadId: 'tad1-1',  positionMb: 6.2,   elementType: 'promoter',        gene: 'CAMTA1',  rsId: 'rs12087811', evidenceLevel: 'literature', score: 78, tissue: 'Heart',  description: 'Active promoter with cardiac-specific TF binding' },
  { id: 'reg-3',  chromosomeId: 'chr1', tadId: 'tad1-1',  positionMb: 4.8,   elementType: 'ctcf_site',       gene: 'TP73',                        evidenceLevel: 'validated',  score: 95, tissue: 'Multi',  description: 'CTCF boundary element at TAD edge' },

  // TAD 1-3
  { id: 'reg-4',  chromosomeId: 'chr1', tadId: 'tad1-3',  positionMb: 27.1,  elementType: 'super_enhancer',  gene: 'RUNX3',   rsId: 'rs7517847',  evidenceLevel: 'validated',  score: 97, tissue: 'Blood', description: 'Super-enhancer controlling RUNX3 in T-cell differentiation' },
  { id: 'reg-5',  chromosomeId: 'chr1', tadId: 'tad1-3',  positionMb: 29.8,  elementType: 'enhancer',        gene: 'HMGN2',   rsId: 'rs6672356',  evidenceLevel: 'literature', score: 74, tissue: 'Liver', description: 'Tissue-specific enhancer active in hepatocytes' },
  { id: 'reg-6',  chromosomeId: 'chr1', tadId: 'tad1-3',  positionMb: 31.5,  elementType: 'silencer',        gene: 'HCRTR1',                      evidenceLevel: 'predicted',  score: 61, tissue: 'Brain', description: 'Predicted silencer element repressing orexin receptor' },

  // TAD 1-4
  { id: 'reg-7',  chromosomeId: 'chr1', tadId: 'tad1-4',  positionMb: 38.4,  elementType: 'promoter',        gene: 'MECP2',   rsId: 'rs2734647',  evidenceLevel: 'validated',  score: 89, tissue: 'Brain', description: 'Core promoter of MECP2 with Rett syndrome variants' },
  { id: 'reg-8',  chromosomeId: 'chr1', tadId: 'tad1-4',  positionMb: 42.9,  elementType: 'enhancer',        gene: 'FOXO6',   rsId: 'rs4845604',  evidenceLevel: 'literature', score: 72, tissue: 'Brain', description: 'Enhancer element active in hippocampal neurons' },
  { id: 'reg-9',  chromosomeId: 'chr1', tadId: 'tad1-4',  positionMb: 44.1,  elementType: 'insulator',       gene: 'SLC2A1',                      evidenceLevel: 'predicted',  score: 65, tissue: 'Multi', description: 'Insulator preventing enhancer-promoter crosstalk across domains' },

  // TAD 1-6
  { id: 'reg-10', chromosomeId: 'chr1', tadId: 'tad1-6',  positionMb: 65.3,  elementType: 'enhancer',        gene: 'NRAS',    rsId: 'rs2273724',  evidenceLevel: 'validated',  score: 88, tissue: 'Blood', description: 'RAS pathway enhancer with oncogenic variant association' },
  { id: 'reg-11', chromosomeId: 'chr1', tadId: 'tad1-6',  positionMb: 69.7,  elementType: 'promoter',        gene: 'PDE4B',   rsId: 'rs10122902', evidenceLevel: 'literature', score: 76, tissue: 'Lung',  description: 'Inflammatory response promoter active in airway epithelium' },
  { id: 'reg-12', chromosomeId: 'chr1', tadId: 'tad1-6',  positionMb: 72.1,  elementType: 'super_enhancer',  gene: 'LRRC7',                       evidenceLevel: 'validated',  score: 94, tissue: 'Brain', description: 'Synaptic organization super-enhancer cluster' },

  // TAD 1-8
  { id: 'reg-13', chromosomeId: 'chr1', tadId: 'tad1-8',  positionMb: 98.2,  elementType: 'enhancer',        gene: 'COL11A1', rsId: 'rs3753841',  evidenceLevel: 'validated',  score: 86, tissue: 'Bone',  description: 'Collagen regulation enhancer associated with skeletal dysplasia' },
  { id: 'reg-14', chromosomeId: 'chr1', tadId: 'tad1-8',  positionMb: 103.6, elementType: 'tfbs',            gene: 'MOV10',   rsId: 'rs823114',   evidenceLevel: 'literature', score: 71, tissue: 'Multi', description: 'TFBS affecting RNA helicase MOV10 expression' },
  { id: 'reg-15', chromosomeId: 'chr1', tadId: 'tad1-8',  positionMb: 107.9, elementType: 'ctcf_site',       gene: 'VAV3',                        evidenceLevel: 'validated',  score: 91, tissue: 'Blood', description: 'Hematopoietic lineage CTCF site at domain sub-boundary' },

  // TAD 1-9
  { id: 'reg-16', chromosomeId: 'chr1', tadId: 'tad1-9',  positionMb: 120.5, elementType: 'enhancer',        gene: 'NOTCH2',  rsId: 'rs10923931', evidenceLevel: 'validated',  score: 93, tissue: 'Multi', description: 'Notch signaling enhancer with T2D-associated variant' },
  { id: 'reg-17', chromosomeId: 'chr1', tadId: 'tad1-9',  positionMb: 124.8, elementType: 'promoter',        gene: 'NTRK1',   rsId: 'rs6336',     evidenceLevel: 'literature', score: 80, tissue: 'Brain', description: 'Neurotrophin receptor promoter with pain pathway regulation' },

  // MHC TADs
  { id: 'reg-18', chromosomeId: 'chr6', tadId: 'tad6-1',  positionMb: 30.1,  elementType: 'super_enhancer',  gene: 'HLA-A',   rsId: 'rs2523608',  evidenceLevel: 'validated',  score: 98, tissue: 'Blood', description: 'HLA class I super-enhancer with autoimmune risk variants' },
  { id: 'reg-19', chromosomeId: 'chr6', tadId: 'tad6-2',  positionMb: 34.8,  elementType: 'enhancer',        gene: 'HLA-DRB1',rsId: 'rs660895',   evidenceLevel: 'validated',  score: 96, tissue: 'Blood', description: 'Major autoimmune susceptibility enhancer in MHC class II' },

  // BRCA1
  { id: 'reg-20', chromosomeId: 'chr17', tadId: 'tad17-1', positionMb: 43.1, elementType: 'enhancer',        gene: 'BRCA1',   rsId: 'rs1799950',  evidenceLevel: 'validated',  score: 95, tissue: 'Breast', description: 'BRCA1 enhancer with breast cancer risk variant' },

  // APOE
  { id: 'reg-21', chromosomeId: 'chr19', tadId: 'tad19-1', positionMb: 45.1, elementType: 'promoter',        gene: 'APOE',    rsId: 'rs429358',   evidenceLevel: 'validated',  score: 99, tissue: 'Brain', description: 'APOE promoter variant: key determinant of Alzheimer risk' },
  { id: 'reg-22', chromosomeId: 'chr19', tadId: 'tad19-1', positionMb: 45.3, elementType: 'enhancer',        gene: 'TOMM40',  rsId: 'rs2075650',  evidenceLevel: 'literature', score: 82, tissue: 'Brain', description: 'TOMM40 enhancer in LD with APOE risk haplotype' },
];

// ── Locus Details ──

export const locusDetails: LocusDetail[] = [
  { id: 'loc-1', chromosomeId: 'chr1', tadId: 'tad1-1', gene: 'TP73', positionMb: 3.6, variants: [{ rsId: 'rs2273953', effect: 'loss', score: 92 }, { rsId: 'rs1801173', effect: 'neutral', score: 68 }], tissues: ['Brain', 'Lung'], pathways: ['Apoptosis', 'DNA Damage Response'], expression: 'moderate', evidenceLevel: 'validated', summary: 'TP73 is a p53 family member involved in apoptosis and neuronal development. Regulatory variants affect enhancer activity in neural progenitor cells.' },
  { id: 'loc-2', chromosomeId: 'chr1', tadId: 'tad1-3', gene: 'RUNX3', positionMb: 27.1, variants: [{ rsId: 'rs7517847', effect: 'loss', score: 97 }, { rsId: 'rs11249215', effect: 'gain', score: 73 }], tissues: ['Blood', 'Gut'], pathways: ['T-Cell Differentiation', 'TGF-β Signaling'], expression: 'high', evidenceLevel: 'validated', summary: 'RUNX3 super-enhancer controls T-cell lineage commitment. IBD-associated variants disrupt TF binding motifs.' },
  { id: 'loc-3', chromosomeId: 'chr1', tadId: 'tad1-4', gene: 'MECP2', positionMb: 38.4, variants: [{ rsId: 'rs2734647', effect: 'loss', score: 89 }], tissues: ['Brain'], pathways: ['Chromatin Remodeling', 'Synaptic Function'], expression: 'high', evidenceLevel: 'validated', summary: 'MECP2 promoter variants associated with Rett syndrome spectrum. Methylation-dependent gene silencing mechanism.' },
  { id: 'loc-4', chromosomeId: 'chr1', tadId: 'tad1-6', gene: 'NRAS', positionMb: 65.3, variants: [{ rsId: 'rs2273724', effect: 'gain', score: 88 }, { rsId: 'rs7545145', effect: 'neutral', score: 54 }], tissues: ['Blood', 'Skin'], pathways: ['RAS-MAPK', 'PI3K-AKT'], expression: 'moderate', evidenceLevel: 'validated', summary: 'NRAS enhancer variants increase RAS pathway activation. Associated with melanoma and hematologic malignancy risk.' },
  { id: 'loc-5', chromosomeId: 'chr1', tadId: 'tad1-8', gene: 'COL11A1', positionMb: 98.2, variants: [{ rsId: 'rs3753841', effect: 'loss', score: 86 }], tissues: ['Bone', 'Cartilage'], pathways: ['Collagen Biosynthesis', 'ECM Organization'], expression: 'moderate', evidenceLevel: 'validated', summary: 'COL11A1 collagen gene with enhancer variants disrupting chondrocyte-specific expression programs.' },
  { id: 'loc-6', chromosomeId: 'chr1', tadId: 'tad1-9', gene: 'NOTCH2', positionMb: 120.5, variants: [{ rsId: 'rs10923931', effect: 'loss', score: 93 }, { rsId: 'rs2793831', effect: 'gain', score: 71 }], tissues: ['Pancreas', 'Liver', 'Blood'], pathways: ['Notch Signaling', 'Beta-Cell Function'], expression: 'high', evidenceLevel: 'validated', summary: 'NOTCH2 enhancer variants associated with type 2 diabetes risk through impaired pancreatic beta-cell development.' },
  { id: 'loc-7', chromosomeId: 'chr6', tadId: 'tad6-1', gene: 'HLA-A', positionMb: 30.1, variants: [{ rsId: 'rs2523608', effect: 'gain', score: 98 }, { rsId: 'rs2395029', effect: 'gain', score: 91 }], tissues: ['Blood', 'Thymus'], pathways: ['Antigen Presentation', 'Immune Response'], expression: 'high', evidenceLevel: 'validated', summary: 'HLA-A super-enhancer in the MHC class I region. Strongest known regulatory signals for autoimmune disease susceptibility.' },
  { id: 'loc-8', chromosomeId: 'chr17', tadId: 'tad17-1', gene: 'BRCA1', positionMb: 43.1, variants: [{ rsId: 'rs1799950', effect: 'loss', score: 95 }, { rsId: 'rs16942', effect: 'neutral', score: 62 }], tissues: ['Breast', 'Ovary'], pathways: ['DNA Repair', 'Homologous Recombination'], expression: 'moderate', evidenceLevel: 'validated', summary: 'BRCA1 enhancer variants affecting DNA double-strand break repair. Critical for hereditary breast and ovarian cancer risk.' },
  { id: 'loc-9', chromosomeId: 'chr19', tadId: 'tad19-1', gene: 'APOE', positionMb: 45.1, variants: [{ rsId: 'rs429358', effect: 'gain', score: 99 }, { rsId: 'rs7412', effect: 'loss', score: 97 }], tissues: ['Brain', 'Liver'], pathways: ['Lipid Metabolism', 'Amyloid Clearance'], expression: 'high', evidenceLevel: 'validated', summary: 'APOE ε4 allele is the strongest genetic risk factor for late-onset Alzheimer disease. Regulatory variants alter astrocyte lipid handling.' },
];

// ── Summary Stats ──

export const genomeExplorerStats = {
  chromosomes: 24,
  totalTADs: tadRegions.length,
  regulatoryElements: regulatoryAnnotations.length,
  variantsMapped: chromosomes.reduce((sum, c) => sum + c.variantCount, 0),
};

// ── Element type display config ──

export const elementTypeConfig: Record<RegulatoryElementType, { label: string; color: string; icon: string }> = {
  enhancer:              { label: 'Enhancer',       color: '#0ae8d2', icon: '◆' },
  promoter:              { label: 'Promoter',       color: '#3b82f6', icon: '▶' },
  silencer:              { label: 'Silencer',       color: '#ef4444', icon: '■' },
  insulator:             { label: 'Insulator',      color: '#f59e0b', icon: '▬' },
  tfbs:                  { label: 'TFBS',           color: '#8b5cf6', icon: '●' },
  ctcf_site:             { label: 'CTCF Site',      color: '#ec4899', icon: '⊗' },
  super_enhancer:        { label: 'Super Enhancer', color: '#10b981', icon: '◈' },
  locus_control_region:  { label: 'LCR',            color: '#f97316', icon: '◇' },
};
