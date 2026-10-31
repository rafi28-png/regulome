// ============================================
// ReguloMe — Utility Functions
// ============================================

/**
 * Format a number as a percentage string
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a genomic position (e.g., chr1:12345)
 */
export function formatGenomicPosition(chr: string, pos: number): string {
  return `${chr}:${pos.toLocaleString()}`;
}

/**
 * Get the display color for an evidence level
 */
export function getEvidenceColor(level: string): string {
  const colors: Record<string, string> = {
    validated: '#10b981',
    literature: '#3b82f6',
    predicted: '#f59e0b',
    inferred: '#8b5cf6',
  };
  return colors[level] || '#8899b8';
}

/**
 * Get the display label for an evidence level
 */
export function getEvidenceLabel(level: string): string {
  const labels: Record<string, string> = {
    validated: 'Clinically Validated',
    literature: 'Literature-Supported',
    predicted: 'Predicted',
    inferred: 'Inferred',
  };
  return labels[level] || 'Unknown';
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Delay utility for async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Classify CN string to readable form
 */
export function classifyChromosome(chr: string): string {
  return chr.startsWith('chr') ? chr : `chr${chr}`;
}
