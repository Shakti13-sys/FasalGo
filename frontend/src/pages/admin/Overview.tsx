import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Ticket,
  Building2,
  Clock,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, CongestionBadge } from '@/components/ui/Badge';
import { AnimatedCounter, ProgressBar } from '@/components/ui';
import { mockAdminStats, mockBottlenecks } from '@/data/mockData';
import { getCentres } from '@/services/centreService';
import type { ProcurementCentre } from '@/types';

export default function AdminOverview() {
  const [centres, setCentres] = useState<ProcurementCentre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const cs = await getCentres();
      setCentres(cs);
      setLoading(false);
    })();
  }, []);

  const stats = mockAdminStats;

  const statCards = [
    { icon: Users, label: 'Total Farmers', value: stats.totalFarmers, color: 'bg-accent-500', suffix: '' },
    { icon: Ticket, label: 'Active Tokens', value: stats.activeTokens, color: 'bg-primary-500', suffix: '' },
    { icon: Building2, label: 'Active Centres', value: stats.activeCentres, color: 'bg-success-500', suffix: '' },
    { icon: Clock, label: 'Avg Waiting Time', value: stats.avgWaitingTime, color: 'bg-warning-500', suffix: ' min' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-32" />)}
        </div>
        <div className="skeleton rounded-2xl h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20">
            <span className="w-2 h-2 rounded-full bg-success-500 dark:bg-success-400 animate-pulse" />
            <span className="text-xs font-bold text-success-700 dark:text-success-300">LIVE</span>
          </div>
        </div>
        <h1 className="text-2xl font-display font-bold text-ink-900 dark:text-white">Procurement Intelligence Command Center</h1>
        <p className="text-ink-500 dark:text-ink-400 mt-1">Real-time monitoring across all procurement centres.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="card-surface p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <Activity className="w-4 h-4 text-success-500 dark:text-success-400 animate-pulse" />
                </div>
                <p className="text-3xl font-display font-bold text-ink-900 dark:text-white">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Centre Summary */}
        <div className="lg:col-span-2">
          <div className="card-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-ink-900 dark:text-white">Centre Status Summary</h2>
              <Link to="/admin/centres" className="text-sm font-semibold text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {centres.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-ink-700 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-300">
                      {c.name.split(' ')[1]}
                    </div>
                    <div>
                      <p className="font-semibold text-ink-900 dark:text-white text-sm">{c.name}</p>
                      <p className="text-xs text-ink-500 dark:text-ink-400">{c.queue} in queue · {c.activeCounters}/{c.totalCounters} counters</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-ink-900 dark:text-white">{c.waitTime} min</p>
                      <p className="text-xs text-ink-500 dark:text-ink-400">wait</p>
                    </div>
                    <CongestionBadge level={c.congestion} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottleneck Preview */}
        <div>
          <div className="card-surface p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-warning-500" />
              <h2 className="font-display font-bold text-lg text-ink-900 dark:text-white">Bottleneck Alerts</h2>
            </div>
            <div className="space-y-3">
              {mockBottlenecks.map((b) => (
                <div key={b.id} className={`p-4 rounded-xl border ${b.severity === 'critical' ? 'border-danger-200 dark:border-danger-500/30 bg-danger-50 dark:bg-danger-500/10' : 'border-warning-200 dark:border-warning-500/30 bg-warning-50 dark:bg-warning-500/10'}`}>
                  <p className="font-bold text-ink-900 dark:text-white text-sm">{b.centreName}</p>
                  <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">Counter #{b.counter} — {b.processingTimeAboveNormal}% above normal</p>
                  <p className="text-xs text-warning-600 dark:text-warning-400 mt-2">+{b.expectedDelay} min delay expected</p>
                  <div className="mt-2 px-2 py-1 rounded-lg bg-ink-100 dark:bg-ink-800 text-xs text-primary-700 dark:text-primary-300">
                    Action: {b.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
            <Link to="/admin/bottlenecks" className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300">
              View All Bottlenecks <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Farmers Waiting Bar */}
      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent-500 dark:text-accent-400" />
            <h2 className="font-display font-bold text-lg text-ink-900 dark:text-white">Farmers Waiting Distribution</h2>
          </div>
          <span className="text-sm text-ink-500 dark:text-ink-400">{stats.farmersWaiting} total waiting</span>
        </div>
        <div className="space-y-3">
          {centres.map((c) => (
            <div key={c.id} className="flex items-center gap-4">
              <span className="text-sm text-ink-700 dark:text-ink-300 w-32 truncate">{c.name.split(' — ')[0]}</span>
              <div className="flex-1">
                <ProgressBar
                  value={c.queue}
                  max={70}
                  color={c.congestion === 'low' ? 'bg-success-500' : c.congestion === 'medium' ? 'bg-warning-500' : 'bg-danger-500'}
                  height="h-2"
                />
              </div>
              <span className="text-sm font-bold text-ink-900 dark:text-white w-10 text-right">{c.queue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
