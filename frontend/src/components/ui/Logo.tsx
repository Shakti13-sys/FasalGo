import { Sprout } from 'lucide-react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  lightOnDark?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, lightOnDark = false, className }: LogoProps) {
  const dimensions = {
    sm: { box: 'w-8 h-8 rounded-lg', icon: 'w-5 h-5', text: 'text-base', sub: 'text-[10px]' },
    md: { box: 'w-10 h-10 rounded-xl', icon: 'w-6 h-6', text: 'text-xl', sub: 'text-xs' },
    lg: { box: 'w-12 h-12 rounded-xl', icon: 'w-7 h-7', text: 'text-2xl', sub: 'text-sm' },
  };
  const d = dimensions[size];

  return (
    <div className={`flex items-center gap-2.5 ${className || ''}`}>
      <motion.div
        whileHover={{ rotate: 5 }}
        className={`${d.box} bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-600/20 flex-shrink-0 relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20" />
        <Sprout className={`${d.icon} text-white relative z-10`} />
      </motion.div>
      {showText && (
        <div className="leading-none">
          <span className={`font-display font-extrabold ${d.text} ${lightOnDark ? 'text-white' : 'text-ink-900 dark:text-white'} tracking-tight`}>
            Fasal<span className="text-primary-500 dark:text-primary-400">Go</span>
          </span>
          <p className={`${d.sub} ${lightOnDark ? 'text-primary-200/70' : 'text-ink-500 dark:text-ink-400'} font-medium mt-0.5`}>
            Smart Procurement
          </p>
        </div>
      )}
    </div>
  );
}
