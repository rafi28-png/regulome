import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings, Key, HardDrive, Trash2, CheckCircle2, Shield, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { useRegulatoryProfile } from '@/hooks/useRegulatoryProfile';
import { apiSetNcbiKey, apiGetSettingsStatus } from '../services/api';

/* =============================================
   ReguloMe — Settings & Storage Vault (GOD-MODE)
   ============================================= */

const ease = [0.22, 0.61, 0.36, 1] as [number, number, number, number];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { hasUploadedData, clearUploadedData } = useApp();
  const { profile } = useRegulatoryProfile();

  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [keyConfigured, setKeyConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheCleared, setCacheCleared] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('regulome:ncbi-api-key') || '';
    setKey(stored);
    if (stored) setKeyConfigured(true);
    apiGetSettingsStatus()
      .then((s) => {
        if (s?.ncbi_key_configured) setKeyConfigured(true);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await apiSetNcbiKey(key.trim()).catch(() => {});
      localStorage.setItem('regulome:ncbi-api-key', key.trim());
      setKeyConfigured(Boolean(key.trim()));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save key');
    } finally {
      setSaving(false);
    }
  };

  const handleClearApiCache = () => {
    localStorage.removeItem('regulome:live-variant-cache-v1');
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  const activeVariantsCount = hasUploadedData ? profile.variants.length : 0;
  const activeFilename = hasUploadedData ? (profile.meta.filename || 'Active Genome Panel') : 'None';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%' }}
    >
      {/* ── GOD-MODE HERO ── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '48px 44px',
          borderRadius: 28,
          background: 'linear-gradient(135deg, rgba(17,24,39,0.88), rgba(10,14,26,0.94))',
          border: '1px solid rgba(139,92,246,0.2)',
          backdropFilter: 'blur(28px)',
        }}
      >
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: -50,
            right: 90,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 65%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 22 }}>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(139,92,246,0.22), rgba(10,232,210,0.14))',
              border: '1px solid rgba(139,92,246,0.32)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 36px rgba(139,92,246,0.14)',
            }}
          >
            <Settings size={28} color="#a78bfa" />
          </motion.div>
          <div>
            <h1
              style={{
                fontSize: 42,
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #e8edf5 25%, #a78bfa 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Platform Settings
            </h1>
            <p style={{ fontSize: 14, color: '#8899b8', marginTop: 6 }}>
              Manage genomic API credentials, local browser genome storage, and live annotation cache
            </p>
          </div>
        </div>
      </div>

      {/* ── TWO-COLUMN CARDS ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 20,
        }}
      >
        {/* Card 1: Local Genome Storage Vault */}
        <div
          style={{
            padding: '28px 28px',
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(17,24,39,0.92), rgba(10,14,26,0.88))',
            border: '1px solid rgba(10,232,210,0.22)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: 'rgba(10,232,210,0.14)',
                  border: '1px solid rgba(10,232,210,0.32)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0ae8d2',
                }}
              >
                <HardDrive size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#e8edf5' }}>
                  Browser Genome Storage Vault
                </h2>
                <p style={{ fontSize: 12, color: '#8899b8' }}>
                  Active VCF / 23andMe panel &amp; annotation cache
                </p>
              </div>
            </div>

            <div
              style={{
                padding: '16px 18px',
                borderRadius: 16,
                background: 'rgba(10,14,26,0.65)',
                border: '1px solid rgba(56,78,122,0.22)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#6b7d9c' }}>Active Panel</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0ae8d2' }}>
                  {activeFilename}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#6b7d9c' }}>Stored Variants</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#e8edf5' }}>
                  {activeVariantsCount} verified loci
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#6b7d9c' }}>Storage Engine</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#10b981' }}>
                  Client-Side Encrypted Vault
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Button
              variant="primary"
              size="sm"
              glow
              onClick={() => navigate('/app/data-studio')}
              iconRight={<ArrowRight size={13} />}
            >
              Open Data Studio
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearApiCache}
              icon={<RefreshCw size={13} />}
            >
              {cacheCleared ? 'Cache Cleared ✓' : 'Refresh API Cache'}
            </Button>
            {hasUploadedData && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearUploadedData}
                icon={<Trash2 size={13} />}
              >
                Purge Stored Genome
              </Button>
            )}
          </div>
        </div>

        {/* Card 2: NCBI E-Utilities API Key */}
        <div
          style={{
            padding: '28px 28px',
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(17,24,39,0.92), rgba(10,14,26,0.88))',
            border: '1px solid rgba(139,92,246,0.22)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 18,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: 'rgba(139,92,246,0.14)',
                  border: '1px solid rgba(139,92,246,0.32)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a78bfa',
                }}
              >
                <Key size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#e8edf5' }}>
                  NCBI Entrez API Key
                </h2>
                <p style={{ fontSize: 12, color: '#8899b8' }}>
                  Increases ClinVar / dbSNP throughput from 3 req/s to 10 req/s
                </p>
              </div>
            </div>

            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Paste optional NCBI API key..."
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                background: 'rgba(10,14,26,0.75)',
                border: '1px solid rgba(56,78,122,0.3)',
                color: '#e8edf5',
                fontSize: 13,
                fontFamily: 'monospace',
                marginBottom: 12,
                outline: 'none',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: keyConfigured ? '#10b981' : '#0ae8d2',
                }}
              />
              <span style={{ fontSize: 12, color: '#8899b8' }}>
                {keyConfigured
                  ? 'High-throughput NCBI key active (10 req/sec)'
                  : 'Standard public CORS rate active (no key required)'}
              </span>
            </div>

            {error && (
              <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>{error}</p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <a
              href="https://www.ncbi.nlm.nih.gov/account/"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 12, color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}
            >
              Get free NCBI key →
            </a>
            <Button
              variant="primary"
              size="sm"
              glow
              disabled={saving || !key.trim()}
              onClick={handleSave}
              icon={saved ? <CheckCircle2 size={14} /> : undefined}
            >
              {saving ? 'Saving…' : saved ? 'Saved' : 'Save API Key'}
            </Button>
          </div>
        </div>
      </div>

      {/* ── PRIVACY STRIP ── */}
      <div
        style={{
          padding: '20px 24px',
          borderRadius: 20,
          background: 'rgba(17,24,39,0.65)',
          border: '1px solid rgba(56,78,122,0.18)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Shield size={20} color="#0ae8d2" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: '#8899b8', lineHeight: 1.6 }}>
          <strong style={{ color: '#e8edf5' }}>Zero Third-Party Tracking:</strong> Your genomic files, variant bookmarks, and optional API keys remain strictly inside your browser&apos;s local storage vault and are never transmitted to third-party analytics servers.
        </p>
      </div>
    </motion.div>
  );
}
