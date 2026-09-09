import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket,
  Users,
  Clock,
  TrendingUp,
  Bell,
  AlertTriangle,
  ArrowRight,
  ArrowLeftRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui';
import { getWaitPrediction, getDynamicWait } from '@/services/queueService';
import { getCentres } from '@/services/centreService';
import { useApp } from '@/context/AppContext';
import type { WaitTimePrediction, ProcurementCentre } from '@/types';

export default function LiveQueue() {
  const { showToast, addNotification } = useApp();
  const [prediction, setPrediction] = useState<WaitTimePrediction | null>(null);
  const [centres, setCentres] = useState<ProcurementCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [etaHistory, setEtaHistory] = useState<number[]>([]);
  const [rerouteTriggered, setRerouteTriggered] = useState(false);
  const [rerouted, setRerouted] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [prevEta, setPrevEta] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const [pred, cs] = await Promise.all([getWaitPrediction(47), getCentres()]);
      setPrediction(pred);
      setCentres(cs);
      setEtaHistory([pred.estimatedWait]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!prediction || loading) return;
    intervalRef.current = setInterval(async () => {
      if (!rerouteTriggered) {
        const newServing = prediction.currentlyServing + Math.floor(Math.random() * 2) + 1;
        if (newServing >= prediction.token) {
          setPrediction({ ...prediction, currentlyServing: prediction.token, farmersAhead: 0, estimatedWait: 0, status: 'on-track' });
          return;
        }
        const dynamic = await getDynamicWait(prediction.token, newServing);
        setPrevEta(prediction.estimatedWait);
        setPrediction(dynamic);
        setEtaHistory((prev) => [...prev.slice(-5), dynamic.estimatedWait]);

        if (dynamic.estimatedWait > 45 && !rerouteTriggered && etaHistory.length > 3) {
          setRerouteTriggered(true);
          addNotification({
            id: 'n-reroute',
            type: 'queue',
            title: 'Queue Update',
            message: 'Centre A queue has increased significantly. Consider switching to Centre D.',
            timestamp: 'Just now',
            read: false,
          });
        }
      }
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [prediction, loading, rerouteTriggered, etaHistory.length, addNotification]);

  const handleSimulateSpike = () => {
    if (!prediction) return;
    setPrevEta(prediction.estimatedWait);
    setPrediction({ ...prediction, estimatedWait: 52, status: 'delayed', farmersAhead: 25 });
    setEtaHistory((prev) => [...prev.slice(-5), 52]);
    setRerouteTriggered(true);
    showToast('warning', 'Queue increased at Centre A. AI is finding alternatives...');
    addNotification({
      id: 'n-spike',
      type: 'queue',
      title: 'Queue Update',
      message: 'Centre A queue has increased unexpectedly. Consider switching to Centre D.',
      timestamp: 'Just now',
      read: false,
    });
  };

  const handleSwitchCentre = () => {
    setRerouted(true);
    setRerouteTriggered(false);
    const alt = centres.find((c) => c.id === 'c4') || centres[3];
    setPrevEta(prediction?.estimatedWait || null);
    setPrediction({
      ...prediction!,
      estimatedWait: alt.waitTime,
      farmersAhead: alt.queue,
      status: 'on-track',
    });
    setEtaHistory((prev) => [...prev.slice(-5), alt.waitTime]);
    showToast('success', `Switched to ${alt.name}. New wait time: ${alt.waitTime} min`);
  };

  const handleNotify = () => {
    setNotifyEnabled(true);
    showToast('success', 'Notifications enabled. We will alert you 10 minutes before your turn.');
  };

  if (loading) {
    return <div className="skeleton rounded-2xl h-96" />;
  }

  const altCentre = centres.find((c) => c.id === 'c4') || centres[3];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Ticket className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h1 className="text-2xl font-display font-bold text-ink-900 dark:text-white">Live Queue</h1>
        </div>
        <p className="text-ink-500 dark:text-ink-400">Real-time queue tracking with AI-powered dynamic ETA updates.</p>
      </div>

      {/* Reroute Banner — Dynamic Rerouting Wow Moment */}
      <AnimatePresence>
        {rerouteTriggered && !rerouted && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="overflow-hidden border-2 border-secondary-300 dark:border-secondary-700" elevated>
              <div className="p-5 bg-gradient-to-r from-secondary-50 to-danger-50 dark:from-secondary-950/30 dark:to-danger-950/30">
                <div className="flex items-start gap-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-10 h-10 rounded-xl bg-secondary-500 flex items-center justify-center flex-shrink-0"
                  >
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-bold text-ink-900 dark:text-ink-100">Centre A congestion increasing</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-ink-500 dark:text-ink-400">ETA:</span>
                      <span className="text-sm font-bold text-danger-600 dark:text-danger-400">
                        {prevEta && `${prevEta} min`}
                        {prevEta && <ArrowRight className="w-3 h-3 inline mx-1" />}
                        <span className="text-danger-600 dark:text-danger-400">52 min</span>
                      </span>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-4 p-4 rounded-xl bg-white dark:bg-ink-900 border border-success-200 dark:border-success-900"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <motion.div
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Sparkles className="w-4 h-4 text-teal-500" />
                        </motion.div>
                        <p className="text-sm font-bold text-teal-700 dark:text-teal-400">FasalGo found a better option</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-ink-900 dark:text-ink-100">{altCentre.name}</p>
                          <p className="text-sm text-ink-500 dark:text-ink-400">{altCentre.distance} km · {altCentre.activeCounters}/{altCentre.totalCounters} counters</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-display font-bold text-success-700 dark:text-success-400">{altCentre.waitTime} min</p>
                          <p className="text-xs text-success-600 dark:text-success-500 font-semibold">{(52 - altCentre.waitTime)} min faster</p>
                        </div>
                      </div>
                      <Button variant="ai" size="sm" className="w-full mt-3" onClick={handleSwitchCentre}>
                        <ArrowLeftRight className="w-4 h-4" /> Switch Centre
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Queue Display */}
        <Card className="lg:col-span-2 overflow-hidden" elevated>
          <div className="p-6 lg:p-8">
            {/* Token Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide">Your Token</p>
                <p className="text-5xl font-display font-extrabold text-ink-900 dark:text-white tabular-nums">#{prediction?.token}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide">Currently Serving</p>
                <div className="flex items-center justify-end gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-3 h-3 rounded-full bg-success-500"
                  />
                  <p className="text-5xl font-display font-extrabold text-primary-600 dark:text-primary-400 tabular-nums">#{prediction?.currentlyServing}</p>
                </div>
              </div>
            </div>

            {/* Queue Visualization */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-ink-700 dark:text-ink-300">Queue Progress</span>
                <Badge variant={prediction?.status === 'on-track' ? 'success' : prediction?.status === 'delayed' ? 'danger' : 'success'}>
                  {prediction?.status === 'on-track' ? 'On Track' : prediction?.status === 'delayed' ? 'Delayed' : 'Ahead of Schedule'}
                </Badge>
              </div>

              {/* Animated queue sequence */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-3 scrollbar-thin">
                {Array.from({ length: prediction!.token - prediction!.currentlyServing + 1 }, (_, i) => {
                  const num = prediction!.currentlyServing + i;
                  const isCurrent = num === prediction!.currentlyServing;
                  const isUser = num === prediction!.token;
                  return (
                    <motion.div
                      key={num}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                        isUser
                          ? 'bg-primary-600 text-white shadow-lg ring-4 ring-primary-200 dark:ring-primary-900/50'
                          : isCurrent
                          ? 'bg-success-500 text-white shadow-md'
                          : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400'
                      }`}
                    >
                      {isUser ? 'YOU' : num}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Stats with smooth number transitions */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl surface-subtle p-4 text-center">
                <Users className="w-5 h-5 text-ink-500 dark:text-ink-400 mx-auto mb-2" />
                <p className="text-xs text-ink-500 dark:text-ink-400">Farmers Ahead</p>
                <AnimatedNum value={prediction?.farmersAhead || 0} className="text-3xl font-display font-bold text-ink-900 dark:text-ink-100" />
              </div>
              <div className={`rounded-xl p-4 text-center transition-colors ${(prediction?.estimatedWait ?? 0) > 35 ? 'bg-danger-50 dark:bg-danger-950/30' : 'bg-primary-50 dark:bg-primary-950/30'}`}>
                <Clock className={`w-5 h-5 mx-auto mb-2 ${(prediction?.estimatedWait ?? 0) > 35 ? 'text-danger-600 dark:text-danger-400' : 'text-primary-600 dark:text-primary-400'}`} />
                <p className={`text-xs ${(prediction?.estimatedWait ?? 0) > 35 ? 'text-danger-600 dark:text-danger-400' : 'text-primary-600 dark:text-primary-400'}`}>Estimated Wait</p>
                <AnimatedNum value={prediction?.estimatedWait || 0} suffix=" min" className={`text-3xl font-display font-bold tabular-nums ${(prediction?.estimatedWait ?? 0) > 35 ? 'text-danger-700 dark:text-danger-400' : 'text-primary-700 dark:text-primary-400'}`} />
              </div>
              <div className="rounded-xl bg-teal-50 dark:bg-teal-950/30 p-4 text-center">
                <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400 mx-auto mb-2" />
                <p className="text-xs text-teal-600 dark:text-teal-400">Estimated Turn</p>
                <p className="text-3xl font-display font-bold text-teal-700 dark:text-teal-400">{prediction?.estimatedTurn}</p>
              </div>
            </div>

            {/* ETA History Chart */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-ink-700 dark:text-ink-300 mb-3">Dynamic ETA Updates</p>
              <div className="flex items-end gap-2 h-24">
                {etaHistory.map((eta, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(eta / 60) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className={`w-full rounded-t-lg ${eta > 35 ? 'bg-danger-400 dark:bg-danger-500' : 'bg-primary-400 dark:bg-primary-500'}`}
                    />
                    <span className="text-xs text-ink-500 dark:text-ink-400">{eta}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notify CTA */}
            <div className={`p-4 rounded-xl border-2 transition-all ${notifyEnabled ? 'border-success-200 dark:border-success-900 bg-success-50 dark:bg-success-950/30' : 'border-ink-200 dark:border-ink-700 surface-subtle'}`}>
              <div className="flex items-center gap-3">
                {notifyEnabled ? (
                  <CheckCircle2 className="w-5 h-5 text-success-600 dark:text-success-400 flex-shrink-0" />
                ) : (
                  <Bell className="w-5 h-5 text-ink-500 dark:text-ink-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                    {notifyEnabled ? 'Notifications enabled' : "You don't need to stand in the queue continuously"}
                  </p>
                  <p className="text-xs text-ink-500 dark:text-ink-400">
                    {notifyEnabled ? "We'll alert you when your turn is 10 minutes away" : 'Get notified when your turn is near'}
                  </p>
                </div>
                {!notifyEnabled && (
                  <Button size="sm" onClick={handleNotify}>Notify Me</Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Side Panel */}
        <div className="space-y-4">
          <Card elevated>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-teal-500" />
                  <div className="absolute inset-0 rounded-full bg-teal-500 animate-ping opacity-60" />
                </div>
                <p className="text-sm font-bold text-ink-900 dark:text-ink-100">AI Prediction Confidence</p>
              </div>
              <p className="text-4xl font-display font-bold text-teal-600 dark:text-teal-400 mb-2">{prediction?.confidence}%</p>
              <ProgressBar value={prediction?.confidence || 0} max={100} color="bg-teal-500" />
              <p className="text-xs text-ink-500 dark:text-ink-400 mt-2">Based on current processing speed and queue dynamics</p>
            </div>
          </Card>

          {!rerouteTriggered && (
            <Card>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                  <p className="text-sm font-bold text-ink-900 dark:text-ink-100">Demo: Simulate Queue Spike</p>
                </div>
                <p className="text-xs text-ink-500 dark:text-ink-400 mb-3">See how the app handles sudden congestion increases with AI re-routing.</p>
                <Button variant="outline" size="sm" className="w-full" onClick={handleSimulateSpike}>
                  Simulate Queue Increase
                </Button>
              </div>
            </Card>
          )}

          <Card>
            <div className="p-5 space-y-2">
              <Link to="/procurement" className="flex items-center justify-between p-3 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors">
                <span className="text-sm font-semibold text-ink-700 dark:text-ink-300">Track Procurement</span>
                <ArrowRight className="w-4 h-4 text-ink-500 dark:text-ink-400" />
              </Link>
              <Link to="/payment" className="flex items-center justify-between p-3 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors">
                <span className="text-sm font-semibold text-ink-700 dark:text-ink-300">Payment Status</span>
                <ArrowRight className="w-4 h-4 text-ink-500 dark:text-ink-400" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AnimatedNum({ value, suffix, className }: { value: number; suffix?: string; className?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      {value}{suffix}
    </motion.span>
  );
}
