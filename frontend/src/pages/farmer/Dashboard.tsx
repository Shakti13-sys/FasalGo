import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Ticket,
  Users,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Truck,
  Wallet,
  Flame,
  CheckCircle2,
  MapPin,
  Gauge,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, CongestionBadge } from '@/components/ui/Badge';
import { ProgressBar, ConfidenceBar, AnimatedCounter } from '@/components/ui';
import { getWaitPrediction } from '@/services/queueService';
import { getRecommendations, getBestTime } from '@/services/recommendationService';
import { getCentres } from '@/services/centreService';
import { useApp } from '@/context/AppContext';
import type { WaitTimePrediction, CentreRecommendation, BestTimeSlot, ProcurementCentre } from '@/types';

export default function Dashboard() {
  const { farmer, showToast } = useApp();
  const [prediction, setPrediction] = useState<WaitTimePrediction | null>(null);
  const [recommendation, setRecommendation] = useState<CentreRecommendation | null>(null);
  const [bestTime, setBestTime] = useState<BestTimeSlot | null>(null);
  const [centres, setCentres] = useState<ProcurementCentre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [pred, recs, time, cs] = await Promise.all([
        getWaitPrediction(47),
        getRecommendations(),
        getBestTime(),
        getCentres(),
      ]);
      setPrediction(pred);
      setRecommendation(recs[0]);
      setBestTime(time);
      setCentres(cs);
      setLoading(false);
    })();
  }, []);

  const queueProgress = prediction
    ? ((prediction.token - prediction.farmersAhead) / prediction.token) * 100
    : 0;

  if (loading) {
    return (
      <div className="grid lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton rounded-2xl h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Smart Visit Plan Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-teal-500" />
        <h1 className="text-2xl font-display font-bold text-ink-900 dark:text-white">Your Smart Visit Plan</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* AI Wait-Time Card — Signature Component */}
        <Card className="lg:col-span-2 overflow-hidden" elevated>
          <div className="relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/8 dark:bg-teal-500/10 rounded-full blur-3xl" />
            <div className="relative p-6 lg:p-8">
              {/* AI Live Indicator */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-teal-500" />
                    <div className="absolute inset-0 rounded-full bg-teal-500 animate-ping opacity-60" />
                  </div>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Expected Wait</span>
                </div>
                <Badge variant="success" size="sm">
                  <CheckCircle2 className="w-3.5 h-3.5" /> On Track
                </Badge>
              </div>

              {/* Big number + key stats */}
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-6xl font-display font-extrabold text-ink-900 dark:text-white tabular-nums">
                    {prediction?.estimatedWait}
                    <span className="text-2xl text-ink-500 dark:text-ink-400 font-bold ml-2">min</span>
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-500" />
                      <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">{prediction?.confidence}% confidence</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-ink-500 dark:text-ink-400" />
                      <span className="text-sm text-ink-500 dark:text-ink-400">{prediction?.farmersAhead} ahead</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-500 dark:text-ink-400 mb-1">Currently Serving</p>
                  <p className="text-3xl font-display font-bold text-ink-700 dark:text-ink-300">#{prediction?.currentlyServing}</p>
                  <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">Your Token <span className="font-bold text-primary-600 dark:text-primary-400">#{prediction?.token}</span></p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-ink-500 dark:text-ink-400">Queue Progress</span>
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {prediction?.farmersAhead} farmers ahead
                  </span>
                </div>
                <ProgressBar value={queueProgress} max={100} color="bg-gradient-to-r from-teal-400 to-primary-500" height="h-3" />
                <div className="flex items-center justify-between mt-2 text-xs text-ink-500 dark:text-ink-400">
                  <span>#{prediction?.currentlyServing}</span>
                  <span>Your turn #{prediction?.token}</span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-primary-50 dark:bg-primary-950/40 p-4">
                  <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400 mb-2" />
                  <p className="text-xs text-ink-500 dark:text-ink-400 mb-1">Est. Wait</p>
                  <p className="text-2xl font-display font-bold text-primary-700 dark:text-primary-400">
                    <AnimatedCounter value={prediction?.estimatedWait || 0} suffix=" min" />
                  </p>
                </div>
                <div className="rounded-xl bg-teal-50 dark:bg-teal-950/40 p-4">
                  <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400 mb-2" />
                  <p className="text-xs text-ink-500 dark:text-ink-400 mb-1">Est. Turn</p>
                  <p className="text-2xl font-display font-bold text-teal-700 dark:text-teal-400">{prediction?.estimatedTurn}</p>
                </div>
                <div className="rounded-xl bg-success-50 dark:bg-success-950/40 p-4">
                  <Gauge className="w-5 h-5 text-success-600 dark:text-success-400 mb-2" />
                  <p className="text-xs text-ink-500 dark:text-ink-400 mb-1">Counters</p>
                  <p className="text-2xl font-display font-bold text-success-700 dark:text-success-400">3/4</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Link
                  to="/live-queue"
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold py-3 rounded-xl hover:bg-primary-700 transition-colors"
                >
                  Track Live Queue <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => showToast('info', 'We will notify you when your turn is 10 minutes away.')}
                  className="px-5 py-3 rounded-xl border-2 border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-300 font-semibold hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                >
                  Notify Me
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Smart Centre Recommendation */}
        <Card className="overflow-hidden" elevated>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/40 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-xs font-bold text-ink-500 dark:text-ink-400 uppercase tracking-wider">Best Option For You</span>
            </div>
            <h3 className="text-lg font-bold text-ink-900 dark:text-ink-100 mt-2 mb-1">{recommendation?.centre.name}</h3>
            <p className="text-sm text-ink-500 dark:text-ink-400 mb-4">{recommendation?.centre.distance} km away · {recommendation?.centre.waitTime} min wait</p>

            <div className="flex items-center gap-2 mb-4">
              <CongestionBadge level={recommendation?.centre.congestion || 'low'} />
            </div>

            {/* Why this centre? */}
            <div className="space-y-2 mb-4">
              <p className="text-xs font-bold text-ink-500 dark:text-ink-400 uppercase tracking-wide">Why?</p>
              {recommendation?.reasons.slice(0, 4).map((r) => (
                <div key={r} className="flex items-start gap-2 text-sm text-ink-600 dark:text-ink-400">
                  <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
                  {r}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-ink-100 dark:border-ink-800">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-ink-500 dark:text-ink-400">Best Time</span>
                <span className="font-bold text-ink-900 dark:text-ink-100">{bestTime?.start} – {bestTime?.end}</span>
              </div>
              <ConfidenceBar value={bestTime?.confidence || 0} />
            </div>

            <Link
              to="/visit-planner"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 font-semibold hover:bg-teal-100 dark:hover:bg-teal-950/60 transition-colors mt-4"
            >
              View Full Plan <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Sparkles, label: 'AI Visit Planner', to: '/visit-planner', color: 'from-teal-400 to-teal-600' },
          { icon: Truck, label: 'Procurement', to: '/procurement', color: 'from-primary-400 to-primary-600' },
          { icon: Wallet, label: 'Payment', to: '/payment', color: 'from-success-400 to-success-600' },
          { icon: Flame, label: 'Heatmap', to: '/heatmap', color: 'from-secondary-400 to-secondary-600' },
        ].map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={action.to}
                className="block card-surface p-5 hover:shadow-lg transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-semibold text-ink-900 dark:text-ink-100 text-sm">{action.label}</p>
                <ArrowRight className="w-4 h-4 text-ink-500 dark:text-ink-400 mt-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Nearby Centres */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-ink-900 dark:text-ink-100">Nearby Procurement Centres</h3>
            <Link to="/find-centre" className="text-sm font-semibold text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {centres.slice(0, 3).map((centre, i) => (
              <motion.div
                key={centre.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl border border-ink-100 dark:border-ink-800 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-primary-50/30 dark:hover:bg-primary-950/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-ink-100 dark:bg-ink-800 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-ink-500 dark:text-ink-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900 dark:text-ink-100">{centre.name}</p>
                    <p className="text-sm text-ink-500 dark:text-ink-400">{centre.distance} km · {centre.activeCounters}/{centre.totalCounters} counters</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-ink-900 dark:text-ink-100">{centre.waitTime} min</p>
                    <p className="text-xs text-ink-500 dark:text-ink-400">wait</p>
                  </div>
                  <CongestionBadge level={centre.congestion} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
