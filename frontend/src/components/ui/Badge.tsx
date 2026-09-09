import { type ReactNode } from 'react';
import type { CongestionLevel } from '@/types';
import { congestionLabel } from '@/data/mockData';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'ai';
  size?: 'sm' | 'md';
  className?: string;
}

const variants = {
  default: 'bg-ink-100 text-ink-700 border-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:border-ink-700',
  success: 'bg-success-50 text-success-700 border-success-200 dark:bg-success-950 dark:text-success-400 dark:border-success-900',
  warning: 'bg-secondary-50 text-secondary-700 border-secondary-200 dark:bg-secondary-950 dark:text-secondary-400 dark:border-secondary-900',
  danger: 'bg-danger-50 text-danger-700 border-danger-200 dark:bg-danger-950 dark:text-danger-400 dark:border-danger-900',
  info: 'bg-accent-50 text-accent-700 border-accent-200 dark:bg-accent-950 dark:text-accent-400 dark:border-accent-900',
  primary: 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-950 dark:text-primary-400 dark:border-primary-900',
  ai: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-400 dark:border-teal-900',
};

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${variants[variant]} ${sizeClass} ${className || ''}`}
    >
      {children}
    </span>
  );
}

const congestionBgMap: Record<CongestionLevel, string> = {
  low: 'bg-success-50 text-success-700 border-success-200 dark:bg-success-950 dark:text-success-400 dark:border-success-900',
  medium: 'bg-secondary-50 text-secondary-700 border-secondary-200 dark:bg-secondary-950 dark:text-secondary-400 dark:border-secondary-900',
  high: 'bg-danger-50 text-danger-700 border-danger-200 dark:bg-danger-950 dark:text-danger-400 dark:border-danger-900',
};

const congestionDotMap: Record<CongestionLevel, string> = {
  low: 'bg-success-500',
  medium: 'bg-secondary-500',
  high: 'bg-danger-500',
};

export function CongestionBadge({ level, size = 'sm' }: { level: CongestionLevel; size?: 'sm' | 'md' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${congestionBgMap[level]} ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
    >
      <span className={`w-2 h-2 rounded-full ${congestionDotMap[level]} animate-pulse`} />
      {congestionLabel[level]}
    </span>
  );
}
