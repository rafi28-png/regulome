import { useState, useEffect } from 'react';
import { apiSetNcbiKey, apiGetSettingsStatus } from '../services/api';

export default function SettingsPage() {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [keyConfigured, setKeyConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('regulome:ncbi-api-key') || '';
    setKey(stored);
    apiGetSettingsStatus().then(s => setKeyConfigured(s.ncbi_key_configured)).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      await apiSetNcbiKey(key.trim());
      localStorage.setItem('regulome:ncbi-api-key', key.trim());
      setKeyConfigured(true); setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to save key');
    } finally {
      setSaving(false);
    }
  };

  const C = {
    bg: '#0a0e1a', card: 'rgba(17,24,39,0.8)', border: 'rgba(167,139,250,0.2)',
    purple: '#a78bfa', text: '#e8edf5', muted: '#8899b8',
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: 32, color: C.text, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.purple, marginBottom: 8 }}>⚙️ Settings</h1>
        <p style={{ color: C.muted, marginBottom: 32 }}>Configure your analysis settings</p>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 24, backdropFilter: 'blur(20px)' }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>🔑 NCBI API Key</h2>
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.65, marginBottom: 16 }}>
            Optional but recommended for faster analysis. Without a key the app works at 3 requests/sec.
            With a key: 10 requests/sec. Get your free key at{' '}
            <a href="https://www.ncbi.nlm.nih.gov/account/" target="_blank" rel="noreferrer" style={{ color: C.purple }}>
              ncbi.nlm.nih.gov/account
            </a>
            . After signing in, go to Account Settings → API Key Management → Create an API Key.
          </p>
          <input
            type="password"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="Paste your NCBI API key here..."
            style={{
              width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${C.border}`, borderRadius: 8, color: C.text,
              fontSize: 14, boxSizing: 'border-box', marginBottom: 12,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: keyConfigured ? '#10b981' : '#f59e0b' }} />
            <span style={{ color: C.muted, fontSize: 13 }}>
              {keyConfigured ? '✓ API key active — full-speed mode enabled' : 'No key — app works but at reduced speed'}
            </span>
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>❌ {error}</p>}
          <button
            onClick={handleSave}
            disabled={saving || !key.trim()}
            style={{
              padding: '10px 22px',
              background: saved ? '#10b981' : 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              border: 'none', borderRadius: 8, color: '#fff', fontSize: 14,
              fontWeight: 600, cursor: 'pointer',
              opacity: (!key.trim() || saving) ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving...' : saved ? '✅ Saved!' : 'Save Key'}
          </button>
        </div>

        <div style={{
          background: 'rgba(10,232,210,0.04)', border: '1px solid rgba(10,232,210,0.15)',
          borderRadius: 12, padding: 14, fontSize: 12, color: C.muted, lineHeight: 1.6,
        }}>
          <strong style={{ color: '#0ae8d2' }}>Privacy:</strong> Your key is stored only in your browser and your local backend server. Never shared with anyone.
        </div>
      </div>
    </div>
  );
}
