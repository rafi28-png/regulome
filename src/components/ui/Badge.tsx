import clsx from 'clsx';
import type { EvidenceLevel } from '@/types';
import { Tooltip } from './Primitives';

type BadgeVariant = 'default' | 'teal' | 'purple' | 'success' | 'warning' | 'error' | 'info' | 'evidence';
type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  evidenceLevel?: EvidenceLevel;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-rg-bg-hover text-rg-text-secondary border-rg-border',
  teal: 'bg-rg-teal-500/10 text-rg-teal-400 border-rg-teal-500/20',
  purple: 'bg-rg-purple-500/10 text-rg-purple-400 border-rg-purple-500/20',
  success: 'bg-rg-success/10 text-rg-success border-rg-success/20',
  warning: 'bg-rg-warning/10 text-rg-warning border-rg-warning/20',
  error: 'bg-rg-error/10 text-rg-error border-rg-error/20',
  info: 'bg-rg-info/10 text-rg-info border-rg-info/20',
  evidence: '', // set dynamically
};

const evidenceStyles: Record<EvidenceLevel, string> = {
  validated: 'bg-rg-validated/10 text-rg-validated border-rg-validated/20',
  literature: 'bg-rg-literature/10 text-rg-literature border-rg-literature/20',
  predicted: 'bg-rg-predicted/10 text-rg-predicted border-rg-predicted/20',
  inferred: 'bg-rg-inferred/10 text-rg-inferred border-rg-inferred/20',
};

const evidenceDotColors: Record<EvidenceLevel, string> = {
  validated: 'bg-rg-validated',
  literature: 'bg-rg-literature',
  predicted: 'bg-rg-predicted',
  inferred: 'bg-rg-inferred',
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'text-[10px] px-1.5 py-0.5 rounded',
  sm: 'text-xs px-2 py-0.5 rounded-md',
  md: 'text-sm px-2.5 py-1 rounded-lg',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  evidenceLevel,
  dot = false,
  pulse = false,
  className,
}: BadgeProps) {
  const actualVariant = variant === 'evidence' && evidenceLevel ? evidenceStyles[evidenceLevel] : variantStyles[variant];
  const dotColor = variant === 'evidence' && evidenceLevel ? evidenceDotColors[evidenceLevel] : '';

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium border whitespace-nowrap',
        sizeStyles[size],
        actualVariant,
        className
      )}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span
              className={clsx(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotColor || 'bg-current'
              )}
            />
          )}
          <span
            className={clsx(
              'relative inline-flex rounded-full h-1.5 w-1.5',
              dotColor || 'bg-current'
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
}

// Convenience: Evidence Badge
interface EvidenceBadgeProps {
  level: EvidenceLevel;
  size?: BadgeSize;
  className?: string;
}

const evidenceLabels: Record<EvidenceLevel, string> = {
  validated: 'Clinically Validated',
  literature: 'Literature-Supported',
  predicted: 'Predicted',
  inferred: 'Inferred',
};

const evidenceDescriptions: Record<EvidenceLevel, string> = {
  validated: "Experimentally validated in human models with gold-standard functional assays.",
  literature: "Supported by peer-reviewed literature and curated databases.",
  predicted: "High-confidence computational prediction from machine learning ensemble models.",
  inferred: "Statistically inferred from pathway analysis and orthologous species.",
};

export function EvidenceBadge({ level, size = 'sm', className }: EvidenceBadgeProps) {
  return (
    <Tooltip 
      content={
        <div style={{ padding: '4px', maxWidth: 220, whiteSpace: 'normal', lineHeight: 1.5 }}>
          <strong style={{ display: 'block', marginBottom: 4, color: '#e8edf5', fontSize: 13 }}>{evidenceLabels[level]}</strong>
          <span style={{ color: '#8899b8', fontSize: 11 }}>{evidenceDescriptions[level]}</span>
        </div>
      }
    >
      <Badge variant="evidence" evidenceLevel={level} size={size} dot pulse className={className}>
        {evidenceLabels[level]}
      </Badge>
    </Tooltip>
  );
}

// Convenience: Score Badge
interface ScoreBadgeProps {
  score: number; // 0-100
  size?: BadgeSize;
  className?: string;
}

export function ScoreBadge({ score, size = 'sm', className }: ScoreBadgeProps) {
  const variant: BadgeVariant =
    score >= 80 ? 'error' : score >= 60 ? 'warning' : score >= 40 ? 'info' : 'success';
  return (
    <Badge variant={variant} size={size} className={className}>
      {score}/100
    </Badge>
  );
}
