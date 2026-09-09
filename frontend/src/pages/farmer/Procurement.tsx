import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, Check, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getProcurement } from '@/services/procurementService';
import { useApp } from '@/context/AppContext';
import type { Procurement } from '@/types';

export default function ProcurementTracking() {
  const { showToast } = useApp();
  const [procurement, setProcurement] = useState<Procurement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const p = await getProcurement();
      setProcurement(p);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="skeleton rounded-2xl h-96" />;
  }

  const currentIdx = procurement!.stages.findIndex((s) => !s.completed);
  const currentStage = procurement!.stages[currentIdx] || procurement!.stages[procurement!.stages.length - 1];
  const completedCount = procurement!.stages.filter((s) => s.completed).length;
  const progressPct = (completedCount / procurement!.stages.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Truck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h1 className="text-2xl font-display font-bold text-ink-900 dark:text-white">Procurement Tracking</h1>
        </div>
        <p className="text-ink-500 dark:text-ink-400">Track your crop from booking to payment in real time.</p>
      </div>

      {/* Summary Card */}
      <Card elevated>
        <div className="p-6 grid sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-ink-500 dark:text-ink-400">Procurement ID</p>
            <p className="font-bold text-ink-900 dark:text-ink-100">{procurement?.procurementId}</p>
          </div>
          <div>
            <p className="text-xs text-ink-500 dark:text-ink-400">Centre</p>
            <p className="font-bold text-ink-900 dark:text-ink-100 text-sm">{procurement?.centreName}</p>
          </div>
          <div>
            <p className="text-xs text-ink-500 dark:text-ink-400">Crop &amp; Quantity</p>
            <p className="font-bold text-ink-900 dark:text-ink-100">{procurement?.crop} · {procurement?.quantity} {procurement?.unit}</p>
          </div>
          <div>
            <p className="text-xs text-ink-500 dark:text-ink-400">Amount</p>
            <p className="font-bold text-primary-700 dark:text-primary-400 text-lg">₹{procurement?.amount.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </Card>

      {/* Current Status */}
      <Card className="overflow-hidden" elevated>
        <div className="relative bg-gradient-to-r from-primary-50 to-teal-50 dark:from-primary-950/40 dark:to-teal-950/40 p-6 pattern-contour">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-teal-500" />
                </motion.div>
                <span className="text-sm font-bold text-ink-500 dark:text-ink-400 uppercase tracking-wide">Current Status</span>
              </div>
              <h2 className="text-3xl font-display font-bold text-ink-900 dark:text-white">{currentStage.label}</h2>
              <p className="text-ink-600 dark:text-ink-400 mt-1">{currentStage.description}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-500 dark:text-ink-400 mb-1">Progress</p>
              <p className="text-3xl font-display font-bold text-teal-600 dark:text-teal-400">{Math.round(progressPct)}%</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full h-2 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-teal-400 to-primary-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Timeline — Journey style */}
      <Card>
        <div className="p-6">
          <h3 className="font-display font-bold text-lg text-ink-900 dark:text-ink-100 mb-6">Procurement Journey</h3>
          <div className="relative">
            {procurement!.stages.map((stage, i) => {
              const isLast = i === procurement!.stages.length - 1;
              const isCurrent = i === currentIdx;
              return (
                <motion.div
                  key={stage.stage}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 pb-8 relative"
                >
                  {!isLast && (
                    <div className={`absolute left-5 top-10 bottom-0 w-0.5 ${stage.completed ? 'bg-primary-500' : 'bg-ink-200 dark:bg-ink-800'}`} />
                  )}

                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                    stage.completed
                      ? 'bg-primary-600 text-white shadow-lg'
                      : isCurrent
                      ? 'bg-teal-500 text-white shadow-lg ring-4 ring-teal-100 dark:ring-teal-950'
                      : 'bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400'
                  }`}>
                    {stage.completed ? (
                      <Check className="w-5 h-5" />
                    ) : isCurrent ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      >
                        <Clock className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <span className="text-xs font-bold">{i + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-bold ${stage.completed || isCurrent ? 'text-ink-900 dark:text-ink-100' : 'text-ink-500 dark:text-ink-400'}`}>{stage.label}</h4>
                      {isCurrent && <Badge variant="ai" size="sm">In Progress</Badge>}
                      {stage.completed && <Badge variant="success" size="sm"><Check className="w-3 h-3" /> Done</Badge>}
                    </div>
                    <p className={`text-sm ${stage.completed || isCurrent ? 'text-ink-600 dark:text-ink-400' : 'text-ink-500 dark:text-ink-400'}`}>{stage.description}</p>
                    {stage.timestamp && stage.timestamp !== '—' && (
                      <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">{stage.timestamp}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-4 flex gap-3">
            <Link to="/payment" className="flex-1">
              <Button variant="outline" className="w-full">View Payment Details <ArrowRight className="w-4 h-4" /></Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => showToast('info', 'You will be notified when the next stage is completed.')}
            >
              Get Updates
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
