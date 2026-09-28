import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Zap, TrendingUp, ArrowRight, ShieldAlert, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getBottlenecks, resolveBottleneck } from '@/services/aiService';
import { useApp } from '@/context/AppContext';
import type { Bottleneck } from '@/types';

export default function AdminBottlenecks() {
  const { showToast } = useApp();
  const [bottlenecks, setBottlenecks] = useState<Bottleneck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await getBottlenecks();
        setBottlenecks(list || []);
      } catch (err) {
        console.error('Failed to load bottlenecks:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleApplyAction = async (b: Bottleneck) => {
    try {
      await resolveBottleneck(b.id);
      setBottlenecks((prev) => prev.filter((item) => item.id !== b.id));
      showToast('success', `${b.recommendedAction} — action dispatched to centre.`);
    } catch {
      showToast('error', 'Failed to dispatch action.');
    }
  };

  const handleDismiss = async (b: Bottleneck) => {
    try {
      await resolveBottleneck(b.id);
      setBottlenecks((prev) => prev.filter((item) => item.id !== b.id));
      showToast('info', 'Bottleneck acknowledged.');
    } catch {
      showToast('error', 'Failed to dismiss.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-28" />)}
        </div>
        <div className="skeleton rounded-2xl h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-6 h-6 text-warning-500" />
          <h1 className="text-2xl font-display font-bold text-ink-900 dark:text-white">Bottleneck Detection</h1>
        </div>
        <p className="text-ink-500 dark:text-ink-400">AI-detected operational bottlenecks with real-time recommended actions.</p>
      </div>

      {/* Summary Banner */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card-surface p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-warning-500" />
            <span className="text-sm text-ink-500 dark:text-ink-400">Active Bottlenecks</span>
          </div>
          <p className="text-2xl font-display font-bold text-ink-900 dark:text-white">{bottlenecks.length}</p>
        </div>
        <div className="card-surface p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-danger-500" />
            <span className="text-sm text-ink-500 dark:text-ink-400">Critical</span>
          </div>
          <p className="text-2xl font-display font-bold text-danger-600 dark:text-danger-400">
            {bottlenecks.filter((b) => b.severity === 'critical').length}
          </p>
        </div>
        <div className="card-surface p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-accent-500 dark:text-accent-400" />
            <span className="text-sm text-ink-500 dark:text-ink-400">Total Delay Impact</span>
          </div>
          <p className="text-2xl font-display font-bold text-ink-900 dark:text-white">
            +{bottlenecks.reduce((s, b) => s + b.expectedDelay, 0)} min
          </p>
        </div>
      </div>

      {/* Bottleneck Cards */}
      <div className="space-y-4">
        {bottlenecks.map((b, i) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`card-surface border-2 overflow-hidden ${
              b.severity === 'critical' ? 'border-danger-200 dark:border-danger-500/40' : 'border-warning-200 dark:border-warning-500/40'
            }`}
          >
            <div className={`p-1 ${b.severity === 'critical' ? 'bg-gradient-to-r from-danger-50 dark:from-danger-500/20 to-transparent' : 'bg-gradient-to-r from-warning-50 dark:from-warning-500/20 to-transparent'}`}>
              <div className="bg-white dark:bg-ink-900 p-6 rounded-xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${b.severity === 'critical' ? 'bg-danger-100 dark:bg-danger-500/20' : 'bg-warning-100 dark:bg-warning-500/20'}`}>
                      <AlertTriangle className={`w-6 h-6 ${b.severity === 'critical' ? 'text-danger-600 dark:text-danger-400' : 'text-warning-600 dark:text-warning-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-ink-900 dark:text-white text-lg">{b.centreName}</h3>
                        <Badge variant={b.severity === 'critical' ? 'danger' : 'warning'} size="sm">
                          {b.severity === 'critical' ? 'Critical' : 'Warning'}
                        </Badge>
                      </div>
                      <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">Counter #{b.counter} — Processing anomaly detected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-danger-500 dark:text-danger-400 animate-pulse" />
                    <span className="text-xs text-ink-500 dark:text-ink-400">Live detection</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <div className="rounded-xl bg-ink-50 dark:bg-ink-800 p-4">
                    <p className="text-xs text-ink-500 dark:text-ink-400 mb-1">Processing Time</p>
                    <p className="text-2xl font-display font-bold text-warning-600 dark:text-warning-400">+{b.processingTimeAboveNormal}%</p>
                    <p className="text-xs text-ink-500 dark:text-ink-500 mt-1">above baseline</p>
                  </div>
                  <div className="rounded-xl bg-ink-50 dark:bg-ink-800 p-4">
                    <p className="text-xs text-ink-500 dark:text-ink-400 mb-1">Expected Delay Impact</p>
                    <p className="text-2xl font-display font-bold text-danger-600 dark:text-danger-400">+{b.expectedDelay} min</p>
                    <p className="text-xs text-ink-500 dark:text-ink-500 mt-1">queue drag</p>
                  </div>
                  <div className="rounded-xl bg-ink-50 dark:bg-ink-800 p-4">
                    <p className="text-xs text-ink-500 dark:text-ink-400 mb-1">Affected Farmers</p>
                    <p className="text-2xl font-display font-bold text-ink-900 dark:text-white">~{b.expectedDelay * 2}</p>
                    <p className="text-xs text-ink-500 dark:text-ink-500 mt-1">in line</p>
                  </div>
                </div>

                {/* AI Recommendation */}
                <div className="rounded-xl bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-500/10 dark:to-accent-500/10 border border-primary-200 dark:border-primary-500/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <span className="text-sm font-bold text-primary-700 dark:text-primary-300">AI Recommended Action</span>
                  </div>
                  <p className="text-ink-900 dark:text-white font-semibold mb-3">{b.recommendedAction}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApplyAction(b)}
                    >
                      Apply Action <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismiss(b)}
                      className="text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {bottlenecks.length === 0 && (
        <div className="card-surface p-12 text-center">
          <ShieldAlert className="w-12 h-12 text-success-500 dark:text-success-400 mx-auto mb-3" />
          <p className="text-ink-900 dark:text-white font-semibold">No active bottlenecks detected</p>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">All centres and counters are operating within optimal throughput parameters.</p>
        </div>
      )}
    </div>
  );
}
