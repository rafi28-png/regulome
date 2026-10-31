import { motion } from 'framer-motion';
import clsx from 'clsx';

// === DNA Helix Spinner ===
export function DNASpinner({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx={24}
            cy={8 + i * 8}
            r={3}
            fill="url(#spinnerGrad)"
          >
            <animate
              attributeName="cx"
              values={`${24 - 10};${24 + 10};${24 - 10}`}
              dur="1.5s"
              begin={`${i * 0.15}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.4;1;0.4"
              dur="1.5s"
              begin={`${i * 0.15}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={`r-${i}`}
            cx={24}
            cy={8 + i * 8}
            r={3}
            fill="url(#spinnerGrad2)"
          >
            <animate
              attributeName="cx"
              values={`${24 + 10};${24 - 10};${24 + 10}`}
              dur="1.5s"
              begin={`${i * 0.15}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.4;1;0.4"
              dur="1.5s"
              begin={`${i * 0.15}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
        <defs>
          <linearGradient id="spinnerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ccb8" />
            <stop offset="100%" stopColor="#0ae8d2" />
          </linearGradient>
          <linearGradient id="spinnerGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a78bff" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// === Pulse Ring Loader ===
export function PulseLoader({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <div className={clsx('relative flex items-center justify-center', className)} style={{ width: size, height: size }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-rg-teal-500/40"
          style={{ width: size, height: size }}
          animate={{
            scale: [1, 2],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeOut',
          }}
        />
      ))}
      <div className="w-2 h-2 rounded-full bg-rg-teal-500" />
    </div>
  );
}

// === Full Page Loading ===
interface FullPageLoaderProps {
  message?: string;
  subtitle?: string;
}

export function FullPageLoader({ message = 'Loading...', subtitle }: FullPageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <DNASpinner size={64} />
      <div className="text-center">
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-rg-text-primary font-medium"
        >
          {message}
        </motion.p>
        {subtitle && <p className="text-rg-text-muted text-sm mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

// === Staggered List Container ===
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({ children, className, staggerDelay = 0.05 }: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// === Staggered Item ===
export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// === Animated Counter ===
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({ value, duration = 1.5, decimals = 0, prefix = '', suffix = '', className }: AnimatedCounterProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {prefix}
      </motion.span>
      <motion.span>
        {value.toFixed(decimals)}
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {suffix}
      </motion.span>
    </motion.span>
  );
}

// === Glow Dot ===
export function GlowDot({ color = 'teal', size = 8, pulse = true }: { color?: 'teal' | 'purple' | 'success' | 'error' | 'warning'; size?: number; pulse?: boolean }) {
  const colorMap = {
    teal: 'bg-rg-teal-500 shadow-[0_0_8px_rgba(0,204,184,0.5)]',
    purple: 'bg-rg-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]',
    success: 'bg-rg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    error: 'bg-rg-error shadow-[0_0_8px_rgba(239,68,68,0.5)]',
    warning: 'bg-rg-warning shadow-[0_0_8px_rgba(245,158,11,0.5)]',
  };

  return (
    <span className="relative inline-flex">
      {pulse && (
        <span
          className={clsx('animate-ping absolute inline-flex rounded-full opacity-50', colorMap[color])}
          style={{ width: size, height: size }}
        />
      )}
      <span
        className={clsx('relative inline-flex rounded-full', colorMap[color])}
        style={{ width: size, height: size }}
      />
    </span>
  );
}
