import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// === Toggle / Switch ===
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, size = 'md', disabled }: ToggleProps) {
  const trackSize = size === 'sm' ? 'w-8 h-4' : 'w-11 h-6';
  const thumbSize = size === 'sm' ? 'w-3 h-3' : 'w-5 h-5';
  const thumbTranslate = size === 'sm' ? 'translate-x-4' : 'translate-x-5';

  return (
    <label className={clsx('inline-flex items-center gap-2.5 cursor-pointer', disabled && 'opacity-40 cursor-not-allowed')}>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        className={clsx(
          'relative inline-flex shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-rg-teal-500/30',
          trackSize,
          checked ? 'bg-rg-teal-500' : 'bg-rg-bg-hover border border-rg-border'
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={clsx(
            'inline-block rounded-full bg-white shadow-md',
            thumbSize,
            checked ? thumbTranslate : 'translate-x-0.5',
            'mt-0.5'
          )}
        />
      </button>
      {label && <span className="text-sm text-rg-text-secondary">{label}</span>}
    </label>
  );
}

// === Tabs ===
interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md';
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, variant = 'default', size = 'md', className }: TabsProps) {
  return (
    <div className={clsx('flex gap-1', variant === 'underline' && 'border-b border-rg-border gap-0', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'relative inline-flex items-center gap-1.5 font-medium transition-all duration-200',
              size === 'sm' ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2',
              variant === 'underline' && [
                'border-b-2 rounded-none',
                isActive ? 'border-rg-teal-500 text-rg-teal-400' : 'border-transparent text-rg-text-muted hover:text-rg-text-secondary',
              ],
              variant === 'pills' && [
                'rounded-lg',
                isActive ? 'bg-rg-teal-500/10 text-rg-teal-400 border border-rg-teal-500/20' : 'text-rg-text-muted hover:text-rg-text-secondary hover:bg-rg-bg-hover',
              ],
              variant === 'default' && [
                'rounded-lg',
                isActive ? 'bg-rg-bg-hover text-rg-text-primary' : 'text-rg-text-muted hover:text-rg-text-secondary hover:bg-rg-bg-hover/50',
              ]
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-rg-teal-500/20 text-rg-teal-400">
                {tab.badge}
              </span>
            )}
            {isActive && variant === 'underline' && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-rg-teal-500"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// === ProgressBar ===
interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  size?: 'xs' | 'sm' | 'md';
  color?: 'teal' | 'purple' | 'gradient' | 'success' | 'warning' | 'error';
  label?: string;
  showValue?: boolean;
  animate?: boolean;
  className?: string;
}

const progressColors = {
  teal: 'bg-rg-teal-500',
  purple: 'bg-rg-purple-500',
  gradient: 'bg-linear-to-r from-rg-teal-500 to-rg-purple-500',
  success: 'bg-rg-success',
  warning: 'bg-rg-warning',
  error: 'bg-rg-error',
};

const progressSizes = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2.5',
};

export function ProgressBar({
  value,
  max = 100,
  size = 'sm',
  color = 'teal',
  label,
  showValue = false,
  animate = true,
  className,
}: ProgressBarProps) {
  const percent = Math.min((value / max) * 100, 100);

  return (
    <div className={clsx('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-rg-text-secondary">{label}</span>}
          {showValue && <span className="text-xs font-mono text-rg-text-muted">{Math.round(percent)}%</span>}
        </div>
      )}
      <div className={clsx('w-full bg-rg-bg-hover rounded-full overflow-hidden', progressSizes[size])}>
        <motion.div
          initial={animate ? { width: 0 } : undefined}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={clsx('h-full rounded-full', progressColors[color])}
        />
      </div>
    </div>
  );
}

// === Skeleton Loader ===
interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = '16px', rounded = 'md', className, style }: SkeletonProps) {
  const roundedStyles = {
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  };

  return (
    <div
      className={clsx(
        'bg-white/10 animate-pulse',
        roundedStyles[rounded],
        className
      )}
      style={{ width, height, ...style }}
    />
  );
}

// === Tooltip ===
interface TooltipProps {
  content: React.ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className={clsx(
              'absolute z-50 px-2.5 py-1.5 text-xs font-medium text-rg-text-primary bg-rg-bg-card border border-rg-border rounded-lg shadow-elevated whitespace-nowrap pointer-events-none',
              positionStyles[side],
              className
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// === Divider ===
interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className }: DividerProps) {
  return (
    <div className={clsx('flex items-center gap-3', className)}>
      <div className="flex-1 h-px bg-rg-border" />
      {label && <span className="text-xs text-rg-text-muted font-medium uppercase tracking-wider">{label}</span>}
      <div className="flex-1 h-px bg-rg-border" />
    </div>
  );
}

// === Section Header ===
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={clsx('flex items-start justify-between', className)}>
      <div>
        <h2 className="text-xl font-bold text-rg-text-primary">{title}</h2>
        {subtitle && <p className="text-sm text-rg-text-secondary mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
