import { motion } from 'framer-motion';
import clsx from 'clsx';

interface ScoreGaugeProps {
  value: number; // 0-100
  label: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'teal' | 'purple' | 'gradient' | 'auto';
  showLabel?: boolean;
  animate?: boolean;
  delay?: number;
  className?: string;
}

const sizes = {
  sm: { outer: 80, stroke: 6, fontSize: 'text-lg', labelSize: 'text-[10px]' },
  md: { outer: 120, stroke: 8, fontSize: 'text-2xl', labelSize: 'text-xs' },
  lg: { outer: 160, stroke: 10, fontSize: 'text-3xl', labelSize: 'text-sm' },
};

function getAutoColor(value: number): string {
  if (value >= 75) return '#10b981'; // green
  if (value >= 50) return '#00ccb8'; // teal
  if (value >= 25) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

export default function ScoreGauge({
  value,
  label,
  subtitle,
  size = 'md',
  color = 'teal',
  showLabel = true,
  animate = true,
  delay = 0,
  className,
}: ScoreGaugeProps) {
  const config = sizes[size];
  const radius = (config.outer - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.max(0, Math.min(100, value));
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  const strokeColor =
    color === 'auto'
      ? getAutoColor(clampedValue)
      : color === 'teal'
      ? '#00ccb8'
      : color === 'purple'
      ? '#8b5cf6'
      : 'url(#gaugeGradient)';

  const glowColor =
    color === 'auto'
      ? getAutoColor(clampedValue)
      : color === 'teal'
      ? 'rgba(0, 204, 184, 0.3)'
      : color === 'purple'
      ? 'rgba(139, 92, 246, 0.3)'
      : 'rgba(0, 204, 184, 0.3)';

  return (
    <div className={clsx('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: config.outer, height: config.outer }}>
        <svg
          width={config.outer}
          height={config.outer}
          viewBox={`0 0 ${config.outer} ${config.outer}`}
          className="-rotate-90"
        >
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00ccb8" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={config.outer / 2}
            cy={config.outer / 2}
            r={radius}
            fill="none"
            stroke="rgba(56, 78, 122, 0.2)"
            strokeWidth={config.stroke}
          />

          {/* Progress arc */}
          <circle
            cx={config.outer / 2}
            cy={config.outer / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            filter="url(#glow)"
            style={{
              filter: `drop-shadow(0 0 6px ${glowColor})`,
              transition: animate ? `stroke-dashoffset 1.5s ${delay}s ease` : undefined,
            }}
          />
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={animate ? { opacity: 0, scale: 0.5 } : undefined}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.5 }}
            className={clsx('font-bold text-rg-text-primary', config.fontSize)}
          >
            {clampedValue}
          </motion.span>
          {showLabel && (
            <span className={clsx('text-rg-text-muted font-medium', config.labelSize)}>
              / 100
            </span>
          )}
        </div>
      </div>

      {/* Label below */}
      <div className="text-center mt-2">
        <p className="text-sm font-medium text-rg-text-primary">{label}</p>
        {subtitle && <p className="text-xs text-rg-text-muted mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// === Mini inline score ===
interface MiniScoreProps {
  value: number;
  maxValue?: number;
  color?: 'teal' | 'purple' | 'auto';
  className?: string;
}

export function MiniScore({ value, maxValue = 100, color = 'auto', className }: MiniScoreProps) {
  const percent = (value / maxValue) * 100;
  const barColor =
    color === 'auto'
      ? percent >= 75
        ? 'bg-rg-success'
        : percent >= 50
        ? 'bg-rg-teal-500'
        : percent >= 25
        ? 'bg-rg-warning'
        : 'bg-rg-error'
      : color === 'teal'
      ? 'bg-rg-teal-500'
      : 'bg-rg-purple-500';

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 bg-rg-bg-hover rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={clsx('h-full rounded-full', barColor)}
        />
      </div>
      <span className="text-xs font-mono text-rg-text-muted w-8 text-right">{value}</span>
    </div>
  );
}
