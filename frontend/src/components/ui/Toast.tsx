import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  error: XCircle,
};

const colorMap = {
  success: 'border-success-200 bg-success-50 text-success-800 dark:bg-success-950 dark:text-success-300 dark:border-success-900',
  warning: 'border-secondary-200 bg-secondary-50 text-secondary-800 dark:bg-secondary-950 dark:text-secondary-300 dark:border-secondary-900',
  info: 'border-teal-200 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-900',
  error: 'border-danger-200 bg-danger-50 text-danger-800 dark:bg-danger-950 dark:text-danger-300 dark:border-danger-900',
};

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md ${colorMap[toast.type]}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button onClick={() => dismissToast(toast.id)} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
