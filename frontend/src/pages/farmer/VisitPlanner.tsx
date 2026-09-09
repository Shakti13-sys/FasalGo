import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MapPin,
  Clock,
  Check,
  ArrowRight,
  Calendar,
  Gauge,
  Users,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, CongestionBadge } from '@/components/ui/Badge';
import { ConfidenceBar } from '@/components/ui';
import { getRecommendations, getBestTime } from '@/services/recommendationService';
import { useApp } from '@/context/AppContext';
import type { CentreRecommendation, BestTimeSlot } from '@/types';

export default function VisitPlanner() {
  const { showToast } = useApp();
  const [recommendations, setRecommendations] = useState<CentreRecommendation[]>([]);
  const [bestTime, setBestTime] = useState<BestTimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    (async () => {
      const [recs, time] = await Promise.all([getRecommendations(), getBestTime()]);
      setRecommendations(recs);
      setBestTime(time);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton rounded-2xl h-12 w-80" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="skeleton rounded-2xl h-96" />
          <div className="skeleton rounded-2xl h-96" />
          <div className="skeleton rounded-2xl h-96" />
        </div>
      </div>
    );
  }

  const selected = recommendations[selectedIdx];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-teal-500" />
          <h1 className="text-2xl font-display font-bold text-ink-900 dark:text-white">AI Visit Planner</h1>
        </div>
        <p className="text-ink-500 dark:text-ink-400">Where &amp; When Should I Go? — AI-analyzed recommendation based on distance, queue, counters, and congestion.</p>
      </div>

      {/* Best Time Card — Time Intelligence Strip */}
      {bestTime && (
        <Card className="overflow-hidden" elevated>
          <div className="relative p-6 bg-gradient-to-r from-primary-50 to-teal-50 dark:from-primary-950/40 dark:to-teal-950/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/8 rounded-full blur-2xl" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <span className="text-sm font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wide">Best Time to Visit</span>
                </div>
                <h2 className="text-3xl font-display font-extrabold text-ink-900 dark:text-white">
                  {bestTime.start} – {bestTime.end}
                </h2>
                <p className="text-ink-500 dark:text-ink-400 mt-1">Expected wait: <span className="font-bold text-primary-700 dark:text-primary-400">{bestTime.expectedWaitMin}–{bestTime.expectedWaitMax} min</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-500 dark:text-ink-400 mb-1">Confidence</p>
                <p className="text-3xl font-display font-bold text-success-700 dark:text-success-400">{bestTime.confidence}%</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Centre Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display font-bold text-lg text-ink-900 dark:text-ink-100">AI-Ranked Centres</h2>
          {recommendations.map((rec, i) => (
            <motion.div
              key={rec.centre.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                hover
                onClick={() => setSelectedIdx(i)}
                className={`overflow-hidden ${selectedIdx === i ? 'ring-2 ring-teal-400 dark:ring-teal-500' : ''}`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${rec.isTop ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-600/20' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400'}`}>
                        {rec.centre.name.split(' ')[1]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-ink-900 dark:text-ink-100">{rec.centre.name}</h3>
                          {rec.isTop && (
                            <Badge variant="ai" size="sm">
                              <Sparkles className="w-3 h-3" /> Best Choice
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-ink-500 dark:text-ink-400">{rec.centre.distance} km · {rec.centre.address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-ink-500 dark:text-ink-400">AI Score</p>
                      <p className="text-xl font-display font-bold text-teal-600 dark:text-teal-400">{rec.score}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <Stat icon={Clock} label="Wait" value={`${rec.centre.waitTime} min`} />
                    <Stat icon={Users} label="Queue" value={`${rec.centre.queue}`} />
                    <Stat icon={Gauge} label="Counters" value={`${rec.centre.activeCounters}/${rec.centre.totalCounters}`} />
                    <Stat icon={Zap} label="Speed" value={`${rec.centre.processingSpeed}/hr`} />
                  </div>

                  <AnimatePresence>
                    {selectedIdx === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 border-t border-ink-100 dark:border-ink-800">
                          <p className="text-sm font-bold text-ink-700 dark:text-ink-300 mb-3">Why {rec.centre.name.split(' — ')[0]}?</p>
                          <div className="space-y-2">
                            {rec.reasons.map((reason, ri) => (
                              <motion.div
                                key={reason}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: ri * 0.08 }}
                                className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-400"
                              >
                                <div className="w-5 h-5 rounded-full bg-success-100 dark:bg-success-950/40 flex items-center justify-center flex-shrink-0">
                                  <Check className="w-3 h-3 text-success-600 dark:text-success-400" />
                                </div>
                                {reason}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-4 flex items-center justify-between">
                    <CongestionBadge level={rec.centre.congestion} />
                    {rec.isTop && (
                      <Link
                        to="/book-slot"
                        onClick={() => showToast('success', `Selected ${rec.centre.name} for booking`)}
                        className="flex items-center gap-2 text-sm font-semibold text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                      >
                        Start My Visit <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          <Card className="overflow-hidden sticky top-20" elevated>
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wide">AI Recommendation</span>
              </div>
              <h3 className="text-xl font-display font-bold">{selected?.centre.name}</h3>
              <p className="text-teal-100 text-sm mt-1">{selected?.centre.distance} km away</p>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-ink-500 dark:text-ink-400 mb-1">Expected Wait</p>
                <p className="text-2xl font-display font-bold text-primary-700 dark:text-primary-400">
                  {bestTime?.expectedWaitMin}–{bestTime?.expectedWaitMax} min
                </p>
              </div>

              <div>
                <p className="text-xs text-ink-500 dark:text-ink-400 mb-1">Recommended Time</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-ink-500 dark:text-ink-400" />
                  <p className="font-bold text-ink-900 dark:text-ink-100">{bestTime?.start} – {bestTime?.end}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-ink-500 dark:text-ink-400 mb-2">Confidence Score</p>
                <ConfidenceBar value={bestTime?.confidence || 0} />
              </div>

              <div className="pt-4 border-t border-ink-100 dark:border-ink-800">
                <p className="text-sm font-bold text-ink-700 dark:text-ink-300 mb-3">Why this recommendation?</p>
                <div className="space-y-2">
                  {selected?.reasons.map((r) => (
                    <div key={r} className="flex items-start gap-2 text-sm text-ink-600 dark:text-ink-400">
                      <Check className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
                      {r}
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/book-slot"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
              >
                Start My Visit <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink-50 dark:bg-ink-800/60 p-3">
      <Icon className="w-4 h-4 text-ink-500 dark:text-ink-400 mb-1" />
      <p className="text-xs text-ink-500 dark:text-ink-400">{label}</p>
      <p className="font-bold text-ink-900 dark:text-ink-100 text-sm">{value}</p>
    </div>
  );
}
