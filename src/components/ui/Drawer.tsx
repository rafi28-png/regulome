import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  side?: 'right' | 'left';
  width?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const widthStyles = {
  sm: 'w-80',
  md: 'w-96',
  lg: 'w-[32rem]',
  xl: 'w-[40rem]',
};

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  side = 'right',
  width = 'lg',
  className,
}: DrawerProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const slideFrom = side === 'right' ? { x: '100%' } : { x: '-100%' };
  const slideTo = { x: 0 };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            initial={slideFrom}
            animate={slideTo}
            exit={slideFrom}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={clsx(
              'absolute top-0 bottom-0 bg-rg-bg-secondary border-rg-border overflow-hidden flex flex-col',
              side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
              widthStyles[width],
              className
            )}
          >
            {/* Header */}
            {title && (
              <div className="flex items-start justify-between p-5 border-b border-rg-border shrink-0">
                <div>
                  <h2 className="text-lg font-semibold text-rg-text-primary">{title}</h2>
                  {subtitle && <p className="text-sm text-rg-text-secondary mt-0.5">{subtitle}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-rg-bg-hover text-rg-text-muted hover:text-rg-text-primary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
