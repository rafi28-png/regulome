import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'teal' | 'purple';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  glow?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-linear-to-r from-rg-teal-500 to-rg-teal-600 text-rg-bg-primary hover:from-rg-teal-400 hover:to-rg-teal-500 shadow-lg shadow-rg-teal-500/20',
  secondary: 'bg-rg-bg-card text-rg-text-primary border border-rg-border hover:bg-rg-bg-hover hover:border-rg-teal-500/30',
  ghost: 'bg-transparent text-rg-text-secondary hover:bg-rg-bg-hover hover:text-rg-text-primary',
  outline: 'bg-transparent text-rg-teal-400 border border-rg-teal-500/30 hover:bg-rg-teal-500/10 hover:border-rg-teal-500/50',
  danger: 'bg-rg-error/10 text-rg-error border border-rg-error/20 hover:bg-rg-error/20 hover:border-rg-error/40',
  teal: 'bg-rg-teal-500/10 text-rg-teal-400 border border-rg-teal-500/20 hover:bg-rg-teal-500/20 hover:border-rg-teal-500/40',
  purple: 'bg-rg-purple-500/10 text-rg-purple-400 border border-rg-purple-500/20 hover:bg-rg-purple-500/20 hover:border-rg-purple-500/40',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-6 px-2.5 text-[11px] font-semibold tracking-wide gap-1 rounded-md',
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
  xl: 'h-14 px-8 text-lg gap-3 rounded-xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconRight,
      loading = false,
      fullWidth = false,
      glow = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={clsx(
          'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none',
          'focus:outline-none focus:ring-2 focus:ring-rg-teal-500/40 focus:ring-offset-2 focus:ring-offset-rg-bg-primary',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          glow && variant === 'primary' && 'shadow-[0_0_20px_rgba(0,204,184,0.3)]',
          glow && variant === 'purple' && 'shadow-[0_0_20px_rgba(139,92,246,0.3)]',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          icon
        )}
        {children}
        {iconRight}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
