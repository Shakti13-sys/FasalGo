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
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui';
import { getWaitPrediction, getDynamicWait, connectQueueWebSocket, simulateQueueSpike } from '@/services/queueService';
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
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [pred, cs] = await Promise.all([getWaitPrediction(47, 'c1'), getCentres()]);
        if (isMounted) {
          setPrediction(pred);
          setCentres(cs);
          setEtaHistory([pred.estimatedWait]);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load live queue:', err);
        if (isMounted) setLoading(false);
      }
    })();

    // Establish live WebSocket connection
    try {
      const socket = connectQueueWebSocket(
        'c1',
        (eventData) => {
          if (!isMounted) return;
          setWsConnected(true);

          if (eventData.event === 'QUEUE_UPDATED' || eventData.event === 'QUEUE_ADVANCED' || eventData.event === 'INITIAL_QUEUE_STATE') {
            const currentServing = eventData.currently_serving || 32;
            getDynamicWait(47, currentServing).then((dynamic) => {
              if (!isMounted) return;
              setPrediction(dynamic);
              setEtaHistory((prev) => [...prev.slice(-5), dynamic.estimatedWait]);
            });
          }

          if (eventData.event === 'CONGESTION_ALERT') {
            setRerouteTriggered(true);
            setPrevEta((prev) => prev || 25);
            setPrediction((curr) => curr ? { ...curr, estimatedWait: 52, status: 'delayed', farmersAhead: 25 } : null);
            setEtaHistory((prev) => [...prev.slice(-5), 52]);
            addNotification({
              id: 'n-reroute-' + Date.now(),
              type: 'queue',
              title: 'Queue Congestion Alert',
              message: 'Jaipur APMC queue has increased unexpectedly. AI recommends switching to Kishangarh Grain Mandi.',
              timestamp: 'Just now',
              read: false,
            });
          }
        },
        () => {
          if (isMounted) setWsConnected(false);
        }
      );
      wsRef.current = socket;
    } catch (err) {
      console.warn('WebSocket connection setup failed:', err);
    }

    return () => {
      isMounted = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [addNotification]);

  const handleSimulateSpike = async () => {
    if (!prediction) return;
    try {
      await simulateQueueSpike('c1', 52);
      setPrevEta(prediction.estimatedWait);
      setPrediction({ ...prediction, estimatedWait: 52, status: 'delayed', farmersAhead: 25 });
      setEtaHistory((prev) => [...prev.slice(-5), 52]);
      setRerouteTriggered(true);
      showToast('warning', 'Queue increased at Jaipur APMC. AI is evaluating alternative centres...');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSwitchCentre = () => {
    setRerouted(true);
    setRerouteTriggered(false);
    const alt = centres.find((c) => c.id === 'c4') || centres[3] || {
      id: 'c4',
      name: 'Centre D — Sinnar Grain Yard',
      waitTime: 14,
      queue: 12,
      distance: 18.2,
      activeCounters: 4,
      totalCounters: 4,
    };
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
    showToast('success', 'SMS alerts enabled. We will alert you 10 minutes before your turn.');
  };

  if (loading) {
    return <div className="skeleton rounded-2xl h-96" />;
  }

  const altCentre = centres.find((c) => c.id === 'c4') || centres[3] || {
    id: 'c4',
    name: 'Centre D — Sinnar Grain Yard',
    waitTime: 14,
    queue: 12,
    distance: 18.2,
    activeCounters: 4,
    totalCounters: 4,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h1 className="text-2xl font-display font-bold text-ink-900 dark:text-white">Live Queue</h1>
          </div>
          <p className="text-ink-500 dark:text-ink-400">Real-time queue tracking with AI-powered dynamic ETA recalculation.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success-50 dark:bg-success-950/40 border border-success-200 dark:border-success-800 text-xs font-bold text-success-700 dark:text-success-300">
            <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
            <span>{wsConnected ? 'LIVE WEBSOCKET' : 'REAL-TIME CONNECTED'}</span>
          </div>
        </div>
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
                    <p className="font-bold text-ink-900 dark:text-ink-100">Jaipur APMC congestion increasing</p>
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
                        <p className="text-sm font-bold text-teal-700 dark:text-teal-400">FasalGo AI recommended alternative</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-ink-900 dark:text-ink-100">{altCentre.name}</p>
                          <p className="text-sm text-ink-500 dark:text-ink-400">{altCentre.distance} km · {altCentre.activeCounters}/{altCentre.totalCounters} counters active</p>
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
                <p className="text-5xl font-display font-extrabold text-ink-900 dark:text-white tabular-nums">#{prediction?.token || 47}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide">Currently Serving</p>
                <div className="flex items-center justify-end gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-3 h-3 rounded-full bg-success-500"
                  />
                  <p className="text-5xl font-display font-extrabold text-primary-600 dark:text-primary-400 tabular-nums">#{prediction?.currentlyServing || 32}</p>
                </div>
              </div>
            </div>

            {/* Queue Visualization */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-ink-700 dark:text-ink-300">Live Queue Position</span>
                <Badge variant={prediction?.status === 'on-track' ? 'success' : prediction?.status === 'delayed' ? 'danger' : 'success'}>
                  {prediction?.status === 'on-track' ? 'On Track' : prediction?.status === 'delayed' ? 'Delayed' : 'Ahead of Schedule'}
                </Badge>
              </div>

              {/* Animated queue sequence */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-3 scrollbar-thin">
                {Array.from({ length: Math.max(1, (prediction?.token || 47) - (prediction?.currentlyServing || 32) + 1) }, (_, i) => {
                  const num = (prediction?.currentlyServing || 32) + i;
                  const isCurrent = num === (prediction?.currentlyServing || 32);
                  const isUser = num === (prediction?.token || 47);
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

            {/* Stats */}
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

            {/* Dynamic ETA Updates */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-ink-700 dark:text-ink-300 mb-3">Live ETA Dynamics</p>
              <div className="flex items-end gap-2 h-24">
                {etaHistory.map((eta, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.min(100, (eta / 60) * 100)}%` }}
                      transition={{ duration: 0.5 }}
                      className={`w-full rounded-t-lg ${eta > 35 ? 'bg-danger-400 dark:bg-danger-500' : 'bg-primary-400 dark:bg-primary-500'}`}
                    />
                    <span className="text-xs text-ink-500 dark:text-ink-400">{eta}m</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications CTA */}
            <div className={`p-4 rounded-xl border-2 transition-all ${notifyEnabled ? 'border-success-200 dark:border-success-900 bg-success-50 dark:bg-success-950/30' : 'border-ink-200 dark:border-ink-700 surface-subtle'}`}>
              <div className="flex items-center gap-3">
                {notifyEnabled ? (
                  <CheckCircle2 className="w-5 h-5 text-success-600 dark:text-success-400 flex-shrink-0" />
                ) : (
                  <Bell className="w-5 h-5 text-ink-500 dark:text-ink-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                    {notifyEnabled ? 'Turn alerts enabled' : "You don't need to stand in the physical queue"}
                  </p>
                  <p className="text-xs text-ink-500 dark:text-ink-400">
                    {notifyEnabled ? "We'll send an alert 10 minutes before your token is called." : 'Get notified via SMS when your turn approaches'}
                  </p>
                </div>
                {!notifyEnabled && (
                  <Button size="sm" onClick={handleNotify}>Alert Me</Button>
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
              <p className="text-4xl font-display font-bold text-teal-600 dark:text-teal-400 mb-2">{prediction?.confidence || 89}%</p>
              <ProgressBar value={prediction?.confidence || 89} max={100} color="bg-teal-500" />
              <p className="text-xs text-ink-500 dark:text-ink-400 mt-2">Computed from active counter velocity and processing drag</p>
            </div>
          </Card>

          {!rerouteTriggered && (
            <Card>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                  <p className="text-sm font-bold text-ink-900 dark:text-ink-100">Trigger Congestion Spike</p>
                </div>
                <p className="text-xs text-ink-500 dark:text-ink-400 mb-3">Test AI dynamic rerouting when sudden rush occurs at this centre.</p>
                <Button variant="outline" size="sm" className="w-full" onClick={handleSimulateSpike}>
                  Simulate Queue Surge
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
