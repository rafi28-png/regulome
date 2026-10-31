import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, fullWidth = true, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-rg-text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rg-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full h-12 bg-rg-bg-tertiary border rounded-xl text-sm text-rg-text-primary placeholder-rg-text-muted',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-rg-teal-500/30 focus:border-rg-teal-500/50',
              'hover:border-rg-border',
              error
                ? 'border-rg-error/50 focus:ring-rg-error/30 focus:border-rg-error/50'
                : 'border-rg-border-light',
              className
            )}
            style={{
              paddingLeft: icon ? '3rem' : '1rem',
              paddingRight: iconRight ? '3rem' : '1rem'
            }}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-rg-text-muted">
              {iconRight}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rg-error">{error}</p>}
        {hint && !error && <p className="text-xs text-rg-text-muted">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;

// TextArea variant
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-rg-text-secondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={clsx(
            'w-full min-h-[80px] bg-rg-bg-tertiary border rounded-lg text-sm text-rg-text-primary placeholder-rg-text-muted p-3',
            'transition-all duration-200 resize-y',
            'focus:outline-none focus:ring-2 focus:ring-rg-teal-500/30 focus:border-rg-teal-500/50',
            error ? 'border-rg-error/50' : 'border-rg-border-light',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rg-error">{error}</p>}
        {hint && !error && <p className="text-xs text-rg-text-muted">{hint}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
