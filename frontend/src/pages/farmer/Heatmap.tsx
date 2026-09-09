import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, MapPin, Clock, Users, Gauge, Zap, X, Navigation, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { CongestionBadge } from '@/components/ui/Badge';
import { getCentres } from '@/services/centreService';
import type { ProcurementCentre, CongestionLevel } from '@/types';
import { congestionLabel } from '@/data/mockData';

export default function Heatmap() {
  const [centres, setCentres] = useState<ProcurementCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ProcurementCentre | null>(null);

  useEffect(() => {
    (async () => {
      const cs = await getCentres();
      setCentres(cs);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="skeleton rounded-2xl h-96" />;
  }

  const heatColors: Record<CongestionLevel, string> = {
    low: 'bg-success-500/40',
    medium: 'bg-secondary-500/50',
    high: 'bg-danger-500/60',
  };

  const forecastHours = [
    { time: 'Now', level: 'medium' as CongestionLevel },
    { time: '+1h', level: 'high' as CongestionLevel },
    { time: '+2h', level: 'high' as CongestionLevel },
    { time: '+3h', level: 'medium' as CongestionLevel },
    { time: '+4h', level: 'low' as CongestionLevel },
    { time: '+5h', level: 'low' as CongestionLevel },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
          <h1 className="text-2xl font-display font-bold text-ink-900 dark:text-white">Congestion Heatmap</h1>
        </div>
        <p className="text-ink-500 dark:text-ink-400">Real-time congestion levels across all procurement centres. Click a marker for details.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative h-[500px] bg-gradient-to-br from-primary-50 via-ink-50 to-teal-50 dark:from-ink-900 dark:via-ink-950 dark:to-ink-900">
              <div className="absolute inset-0 opacity-20 dark:opacity-10" style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }} />

              {/* Heat zones */}
              {centres.map((c, i) => {
                const top = 15 + (i * 22) % 65;
                const left = 15 + (i * 35) % 65;
                return (
                  <div
                    key={c.id}
                    className={`absolute rounded-full ${heatColors[c.congestion]} blur-2xl transition-all`}
                    style={{ top: `${top}%`, left: `${left}%`, width: '120px', height: '120px', transform: 'translate(-50%, -50%)' }}
                  />
                );
              })}

              <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.12 }}>
                <line x1="0" y1="250" x2="100%" y2="250" stroke="#1a1c1a" strokeWidth="4" />
                <line x1="200" y1="0" x2="200" y2="100%" stroke="#1a1c1a" strokeWidth="4" />
              </svg>

              {/* Centre markers */}
              {centres.map((c, i) => {
                const top = 15 + (i * 22) % 65;
                const left = 15 + (i * 35) % 65;
                const color = c.congestion === 'low' ? 'bg-success-500' : c.congestion === 'medium' ? 'bg-secondary-500' : 'bg-danger-500';
                const isSelected = selected?.id === c.id;
                return (
                  <motion.button
                    key={c.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1, type: 'spring' }}
                    onClick={() => setSelected(c)}
                    className="absolute z-10"
                    style={{ top: `${top}%`, left: `${left}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <div className="relative">
                      {isSelected && <span className={`absolute inset-0 rounded-full ${color} animate-ping opacity-60`} />}
                      <div className={`w-10 h-10 rounded-full ${color} border-2 border-white shadow-lg flex items-center justify-center text-white text-sm font-bold`}>
                        {c.name.split(' ')[1]}
                      </div>
                      {c.congestion !== 'low' && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white">
                          <span className={`block w-full h-full rounded-full ${color} animate-ping`} />
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}

              {/* User location */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-accent-500 border-2 border-white shadow-lg" />
                  <span className="absolute inset-0 rounded-full bg-accent-400 animate-ping opacity-60" />
                </div>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-ink-900/90 backdrop-blur rounded-xl p-3 shadow-lg border border-ink-100 dark:border-ink-800">
                <p className="text-xs font-bold text-ink-700 dark:text-ink-300 mb-2">Congestion Level</p>
                {(['low', 'medium', 'high'] as const).map((l) => (
                  <div key={l} className="flex items-center gap-2 mb-1">
                    <span className={`w-4 h-4 rounded-full ${l === 'low' ? 'bg-success-500' : l === 'medium' ? 'bg-secondary-500' : 'bg-danger-500'}`} />
                    <span className="text-xs text-ink-600 dark:text-ink-400">{congestionLabel[l]}</span>
                  </div>
                ))}
              </div>

              <div className="absolute top-4 right-4 bg-white/90 dark:bg-ink-900/90 backdrop-blur rounded-xl p-2 shadow-lg border border-ink-100 dark:border-ink-800">
                <Navigation className="w-5 h-5 text-accent-600 dark:text-accent-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Centre List / Details */}
        <div className="space-y-3">
          {selected ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="overflow-hidden" elevated>
                <div className={`p-5 ${selected.congestion === 'low' ? 'bg-success-50 dark:bg-success-950/30' : selected.congestion === 'medium' ? 'bg-secondary-50 dark:bg-secondary-950/30' : 'bg-danger-50 dark:bg-danger-950/30'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-ink-900 dark:text-ink-100 text-lg">{selected.name}</h3>
                      <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">{selected.address}</p>
                    </div>
                    <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-white/60 dark:hover:bg-ink-800/60">
                      <X className="w-4 h-4 text-ink-500 dark:text-ink-400" />
                    </button>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <DetailRow icon={MapPin} label="Distance" value={`${selected.distance} km`} />
                  <DetailRow icon={Users} label="Queue Length" value={`${selected.queue} farmers`} />
                  <DetailRow icon={Clock} label="Wait Time" value={`${selected.waitTime} min`} />
                  <DetailRow icon={Gauge} label="Active Counters" value={`${selected.activeCounters}/${selected.totalCounters}`} />
                  <DetailRow icon={Zap} label="Processing Speed" value={`${selected.processingSpeed} farmers/hr`} />
                  <DetailRow icon={Gauge} label="Capacity" value={`${selected.capacity} farmers/hr`} />
                  <div className="pt-2 border-t border-ink-100 dark:border-ink-800 flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink-700 dark:text-ink-300">Congestion</span>
                    <CongestionBadge level={selected.congestion} size="md" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <>
              <p className="text-sm font-semibold text-ink-500 dark:text-ink-400 px-1">All Centres — Click to view details</p>
              {centres.map((c, i) => (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setSelected(c)}
                  className="w-full text-left"
                >
                  <Card hover>
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-12 rounded-full ${c.congestion === 'low' ? 'bg-success-500' : c.congestion === 'medium' ? 'bg-secondary-500' : 'bg-danger-500'}`} />
                        <div>
                          <p className="font-bold text-ink-900 dark:text-ink-100 text-sm">{c.name}</p>
                          <p className="text-xs text-ink-500 dark:text-ink-400">{c.distance} km · {c.waitTime} min wait</p>
                        </div>
                      </div>
                      <CongestionBadge level={c.congestion} />
                    </div>
                  </Card>
                </motion.button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* 5-hour forecast strip */}
      <Card elevated>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-teal-500" />
            <h3 className="font-display font-bold text-lg text-ink-900 dark:text-ink-100">Next 5 Hours — Forecast</h3>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {forecastHours.map((h, i) => {
              const color = h.level === 'low' ? 'bg-success-500' : h.level === 'medium' ? 'bg-secondary-500' : 'bg-danger-500';
              const bgColor = h.level === 'low' ? 'bg-success-50 dark:bg-success-950/30' : h.level === 'medium' ? 'bg-secondary-50 dark:bg-secondary-950/30' : 'bg-danger-50 dark:bg-danger-950/30';
              return (
                <motion.div
                  key={h.time}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`rounded-xl p-4 text-center ${bgColor}`}
                >
                  <p className="text-xs font-bold text-ink-500 dark:text-ink-400 mb-2">{h.time}</p>
                  <div className={`w-8 h-8 rounded-full ${color} mx-auto mb-2`} />
                  <p className="text-xs font-semibold text-ink-700 dark:text-ink-300 capitalize">{congestionLabel[h.level]}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-ink-500 dark:text-ink-400" />
        <span className="text-sm text-ink-500 dark:text-ink-400">{label}</span>
      </div>
      <span className="text-sm font-bold text-ink-900 dark:text-ink-100">{value}</span>
    </div>
  );
}
