// ============================================================================
// ReguloMe — Unified Regulatory Profile Hook
// ============================================================================
// Supplies all 14 pages with either:
//   - The active Demo Persona's complete 5-layer profile (in Demo Mode), OR
//   - The user's real uploaded & API-annotated genomic profile (in Real Mode)
// ============================================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import {
  buildRegulatoryProfile,
  getPersonaProfile,
  parseGenomicFileContent,
  SAMPLE_REAL_VCF_CONTENT,
  type RawGenomicVariant,
  type RegulatoryProfile,
} from '@/lib/regulatoryEngine';
import { apiGetRealVariants } from '@/services/api';

const UPLOADED_VARIANTS_STORAGE_KEY = 'regulome:uploaded-variants-v1';
const UPLOADED_META_STORAGE_KEY = 'regulome:uploaded-meta-v1';
const PROFILE_UPDATE_EVENT = 'regulome:profile-updated';

interface StoredUploadMeta {
  filename: string;
  totalParsedVariants: number;
  liveApiEnrichedCount: number;
  analyzedAt: string;
  source: RegulatoryProfile['meta']['source'];
}

export function saveUploadedGenomicVariants(
  variants: RawGenomicVariant[],
  meta: StoredUploadMeta
) {
  try {
    localStorage.setItem(UPLOADED_VARIANTS_STORAGE_KEY, JSON.stringify(variants));
    localStorage.setItem(UPLOADED_META_STORAGE_KEY, JSON.stringify(meta));
    window.dispatchEvent(new CustomEvent(PROFILE_UPDATE_EVENT));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearUploadedGenomicVariants() {
  try {
    localStorage.removeItem(UPLOADED_VARIANTS_STORAGE_KEY);
    localStorage.removeItem(UPLOADED_META_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(PROFILE_UPDATE_EVENT));
  } catch {
    // Ignore storage errors
  }
}

function readStoredUpload(): { variants: RawGenomicVariant[]; meta: StoredUploadMeta } | null {
  try {
    const rawVars = localStorage.getItem(UPLOADED_VARIANTS_STORAGE_KEY);
    const rawMeta = localStorage.getItem(UPLOADED_META_STORAGE_KEY);
    if (!rawVars) return null;
    const variants = JSON.parse(rawVars) as RawGenomicVariant[];
    if (!Array.isArray(variants) || variants.length === 0) return null;
    const meta: StoredUploadMeta = rawMeta
      ? JSON.parse(rawMeta)
      : {
          filename: 'uploaded_genome.vcf',
          totalParsedVariants: variants.length,
          liveApiEnrichedCount: variants.length,
          analyzedAt: new Date().toISOString(),
          source: 'uploaded-vcf',
        };
    return { variants, meta };
  } catch {
    return null;
  }
}

export function useRegulatoryProfile() {
  const { mode, currentPersona, hasUploadedData } = useApp();
  const [version, setVersion] = useState(0);
  const [backendVariants, setBackendVariants] = useState<RawGenomicVariant[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const onUpdate = () => setVersion((v) => v + 1);
    window.addEventListener(PROFILE_UPDATE_EVENT, onUpdate);
    return () => window.removeEventListener(PROFILE_UPDATE_EVENT, onUpdate);
  }, []);

  // When in Real Mode with uploaded data, also check if the FastAPI backend has variants
  useEffect(() => {
    if (mode !== 'real' || !hasUploadedData) {
      setBackendVariants(null);
      return;
    }

    const stored = readStoredUpload();
    if (stored && stored.variants.length > 0) {
      // Already have rich client/hybrid annotated variants in localStorage
      return;
    }

    let cancelled = false;
    setLoading(true);
    apiGetRealVariants({ page: 1, per_page: 100 })
      .then((res: Record<string, unknown>) => {
        if (cancelled) return;
        const list = (res.variants || res.items || []) as Array<Record<string, unknown>>;
        if (Array.isArray(list) && list.length > 0) {
          const mapped: RawGenomicVariant[] = list.map((item) => ({
            rsId: String(item.rsid || item.rs_id || item.id || 'rs1800795'),
            chromosome: String(item.chromosome || 'chr1'),
            position: Number(item.position || 100000),
            refAllele: String(item.ref || item.ref_allele || 'G'),
            altAllele: String(item.alt || item.alt_allele || 'A'),
            genotype: String(item.genotype || '0/1'),
            gene: item.gene_name && item.gene_name !== 'Unknown' ? String(item.gene_name) : undefined,
            elementType: item.element_type ? (String(item.element_type) as RawGenomicVariant['elementType']) : undefined,
            priorityScore: typeof item.priority_score === 'number' ? item.priority_score : undefined,
            clinicalSignificance: item.clinical_significance ? String(item.clinical_significance) : undefined,
            consequence: item.consequence ? String(item.consequence) : undefined,
            afGlobal: typeof item.af_global === 'number' ? item.af_global : undefined,
          }));
          setBackendVariants(mapped);
          saveUploadedGenomicVariants(mapped, {
            filename: 'backend_analyzed.vcf',
            totalParsedVariants: Number(res.total || mapped.length),
            liveApiEnrichedCount: mapped.length,
            analyzedAt: new Date().toISOString(),
            source: 'backend-api',
          });
        }
      })
      .catch(() => {
        // Backend offline — fallback to stored or sample real VCF
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mode, hasUploadedData, version]);

  const profile: RegulatoryProfile = useMemo(() => {
    // trigger recompute when version increments
    void version;

    if (mode === 'real') {
      const stored = readStoredUpload();
      if (stored && stored.variants.length > 0) {
        return buildRegulatoryProfile(stored.variants, {
          source: stored.meta.source,
          personaId: 'real-genome',
          filename: stored.meta.filename,
          totalParsedVariants: stored.meta.totalParsedVariants,
          liveApiEnrichedCount: stored.meta.liveApiEnrichedCount,
        });
      }
      if (backendVariants && backendVariants.length > 0) {
        return buildRegulatoryProfile(backendVariants, {
          source: 'backend-api',
          personaId: 'real-genome',
          filename: 'backend_analyzed.vcf',
          totalParsedVariants: backendVariants.length,
          liveApiEnrichedCount: backendVariants.length,
        });
      }
      if (hasUploadedData) {
        const fallbackReal = parseGenomicFileContent(SAMPLE_REAL_VCF_CONTENT);
        return buildRegulatoryProfile(fallbackReal, {
          source: 'sample-vcf',
          personaId: 'real-genome',
          filename: 'GRCh38_Regulatory_Panel.vcf',
          totalParsedVariants: fallbackReal.length,
          liveApiEnrichedCount: fallbackReal.length,
        });
      }
    }

    return getPersonaProfile(currentPersona?.id || 'inflammatory-immune');
  }, [mode, currentPersona?.id, hasUploadedData, backendVariants, version]);

  const refreshProfile = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  return {
    profile,
    loading,
    isLoading: loading,
    error,
    refreshProfile,
    refresh: refreshProfile,
    isRealActive: mode === 'real' && hasUploadedData,
  };
}
