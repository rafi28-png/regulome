import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'teal' | 'purple' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  delay?: number;
  onClick?: () => void;
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
  xl: 'p-8',
};

const glowStyles = {
  none: '',
  teal: 'shadow-[0_0_30px_rgba(0,204,184,0.08)] hover:shadow-[0_0_40px_rgba(0,204,184,0.15)]',
  purple: 'shadow-[0_0_30px_rgba(139,92,246,0.08)] hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]',
};

export default function GlassCard({
  children,
  className,
  hover = true,
  glow = 'none',
  padding = 'md',
  animate = true,
  delay = 0,
  onClick,
}: GlassCardProps) {
  const Component = animate ? motion.div : 'div';
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
        whileHover: hover ? { y: -2, transition: { duration: 0.2 } } : undefined,
      }
    : {};

  return (
    <Component
      className={clsx(
        'glass-panel transition-all duration-300',
        paddingStyles[padding],
        glowStyles[glow],
        hover && 'hover:border-rg-teal-500/20',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </Component>
  );
}

// Variant: Solid Card (no glass, more opaque)
export function SolidCard({
  children,
  className,
  padding = 'md',
  animate = true,
  delay = 0,
}: Omit<GlassCardProps, 'glow' | 'hover'>) {
  const Component = animate ? motion.div : 'div';
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, delay },
      }
    : {};

  return (
    <Component
      className={clsx(
        'bg-rg-bg-card border border-rg-border rounded-xl transition-all duration-300',
        paddingStyles[padding],
        className
      )}
      {...motionProps}
    >
      {children}
    </Component>
  );
}

// Variant: Stat Card (for dashboard metrics)
interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  glow?: 'teal' | 'purple' | 'none';
  delay?: number;
  invertTrendColor?: boolean;
}

export function StatCard({ label, value, subtitle, icon, trend, glow = 'teal', delay = 0, invertTrendColor = false }: StatCardProps) {
  return (
    <GlassCard glow={glow} delay={delay} className="relative overflow-hidden">
      {/* Background accent */}
      <div
        className={clsx(
          'absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10',
          glow === 'teal' ? 'bg-rg-teal-500' : glow === 'purple' ? 'bg-rg-purple-500' : ''
        )}
      />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 6, padding: '8px 0' }}>
        {icon && (
          <div style={{ color: '#6b7d9c', opacity: 0.7, marginBottom: 4 }}>{icon}</div>
        )}
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7d9c' }}>{label}</p>
        <p style={{ fontSize: 28, fontWeight: 800, color: '#e8edf5', lineHeight: 1 }}>{value}</p>
        {subtitle && <p style={{ fontSize: 13, color: '#8899b8', marginTop: 2 }}>{subtitle}</p>}
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 2 }}>
            <span
              style={{
                fontSize: 12, fontWeight: 600,
                color: (trend.value > 0 ? !invertTrendColor : invertTrendColor)
                  ? '#10b981'
                  : (trend.value < 0 ? !invertTrendColor : invertTrendColor)
                  ? '#ef4444'
                  : '#6b7d9c',
              }}
            >
              {trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '→'} {Math.abs(trend.value)}%
            </span>
            <span style={{ fontSize: 12, color: '#6b7d9c' }}>{trend.label}</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
