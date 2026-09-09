import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  elevated?: boolean;
}

export function Card({ children, className, hover, onClick, elevated }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={`${elevated ? 'card-elevated' : 'card-surface'} ${hover ? 'cursor-pointer transition-shadow hover:shadow-lg' : ''} ${className || ''}`}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`px-6 pt-6 pb-2 ${className || ''}`}>{children}</div>;
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`px-6 py-4 ${className || ''}`}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-lg font-bold text-ink-900 dark:text-ink-100 ${className || ''}`}>{children}</h3>;
}
