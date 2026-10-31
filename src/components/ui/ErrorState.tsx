import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import GlassCard from './GlassCard';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'An error occurred while fetching data from the backend.', onRetry }: ErrorStateProps) {
  return (
    <GlassCard padding="xl" glow="none" hover={false} animate={false}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 16, padding: '40px 0', textAlign: 'center',
        }}
      >
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.1)',
        }}>
          <AlertTriangle size={30} color="#ef4444" />
        </div>
        
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5', marginBottom: 8 }}>Connection Error</h3>
          <p style={{ fontSize: 14, color: '#8899b8', maxWidth: 400, lineHeight: 1.6 }}>{message}</p>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              marginTop: 12, padding: '10px 24px', borderRadius: 12,
              background: 'rgba(56, 78, 122, 0.15)',
              border: '1px solid rgba(56, 78, 122, 0.3)',
              color: '#e8edf5', fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(56, 78, 122, 0.25)';
              e.currentTarget.style.borderColor = 'rgba(56, 78, 122, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(56, 78, 122, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(56, 78, 122, 0.3)';
            }}
          >
            <RefreshCw size={14} /> Retry Connection
          </button>
        )}
      </motion.div>
    </GlassCard>
  );
}
