import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1,
  suffix = '',
  prefix = '',
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      <CounterInner value={value} duration={duration} prefix={prefix} suffix={suffix} decimals={decimals} />
    </motion.span>
  );
}

function CounterInner({ value, duration, prefix, suffix, decimals }: Omit<AnimatedCounterProps, 'className'>) {
  const dec = decimals ?? 0;
  const displayValue = dec > 0 ? value.toFixed(dec) : Math.round(value).toString();
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {prefix}
      {Number(displayValue).toLocaleString('en-IN')}
      {suffix}
    </motion.span>
  );
}

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  color?: string;
  height?: string;
}

export function ProgressBar({ value, max, className, color = 'bg-primary-500', height = 'h-2' }: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={`w-full ${height} bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden ${className || ''}`}>
      <motion.div
        className={`h-full ${color} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

interface ConfidenceBarProps {
  value: number;
  className?: string;
}

export function ConfidenceBar({ value, className }: ConfidenceBarProps) {
  const color = value >= 85 ? 'bg-success-500' : value >= 70 ? 'bg-secondary-500' : 'bg-danger-500';
  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      <div className="flex-1">
        <ProgressBar value={value} max={100} color={color} height="h-1.5" />
      </div>
      <span className="text-sm font-bold text-ink-700 dark:text-ink-300 tabular-nums">{value}%</span>
    </div>
  );
}

export function Skeleton({ className, children }: { className?: string; children?: ReactNode }) {
  return <div className={`skeleton rounded-lg ${className || ''}`}>{children}</div>;
}
