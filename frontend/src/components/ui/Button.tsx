import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'ai' | 'warning';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md hover:shadow-primary-600/20 dark:bg-primary-700 dark:hover:bg-primary-600',
  secondary: 'bg-white text-ink-800 hover:bg-ink-50 border border-ink-200 dark:bg-ink-800 dark:text-ink-100 dark:hover:bg-ink-700 dark:border-ink-700',
  outline: 'border-2 border-primary-200 text-primary-700 hover:bg-primary-50 hover:border-primary-300 dark:border-primary-800 dark:text-primary-400 dark:hover:bg-primary-950 dark:hover:border-primary-700',
  ghost: 'text-ink-700 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 shadow-sm dark:bg-danger-700 dark:hover:bg-danger-600',
  ai: 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm hover:shadow-md hover:shadow-teal-600/20 dark:bg-teal-700 dark:hover:bg-teal-600',
  warning: 'bg-secondary-500 text-white hover:bg-secondary-600 shadow-sm dark:bg-secondary-600 dark:hover:bg-secondary-500',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg gap-1.5',
  md: 'px-6 py-3 text-sm rounded-xl gap-2',
  lg: 'px-8 py-4 text-base rounded-xl gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        className={`inline-flex items-center justify-center font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className || ''}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children as React.ReactNode}
      </motion.button>
    );
  },
);
Button.displayName = 'Button';
