import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Users, Gauge, Zap, Search, Star, ArrowRight, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, CongestionBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getCentres } from '@/services/centreService';
import { useApp } from '@/context/AppContext';
import type { ProcurementCentre, CongestionLevel } from '@/types';
import { congestionLabel } from '@/data/mockData';

export default function FindCentre() {
  const { showToast } = useApp();
  const [centres, setCentres] = useState<ProcurementCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CongestionLevel | 'all'>('all');
  const [selected, setSelected] = useState<ProcurementCentre | null>(null);

  useEffect(() => {
    (async () => {
      const cs = await getCentres();
      setCentres(cs);
      setLoading(false);
    })();
  }, []);

  const filtered = centres.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || c.congestion === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="skeleton rounded-2xl h-96" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h1 className="text-2xl font-display font-bold text-ink-900 dark:text-white">Find Procurement Centre</h1>
        </div>
        <p className="text-ink-500 dark:text-ink-400">Compare centres by distance, queue, wait time, and congestion.</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500 dark:text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or area..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 focus:border-primary-400 dark:focus:border-primary-600 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/40 outline-none transition-all text-ink-900 dark:text-ink-100 placeholder:text-ink-400 dark:placeholder:text-ink-600"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'low', 'medium', 'high'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${
                filter === f
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-400 border border-ink-200 dark:border-ink-700 hover:border-primary-300 dark:hover:border-primary-700'
              }`}
            >
              {f === 'all' ? 'All' : congestionLabel[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden h-full sticky top-20">
            <div className="relative h-[500px] bg-gradient-to-br from-primary-50 via-ink-50 to-teal-50 dark:from-ink-900 dark:via-ink-950 dark:to-ink-900">
              <div className="absolute inset-0 opacity-20 dark:opacity-10" style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }} />
              <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.12 }}>
                <line x1="0" y1="250" x2="100%" y2="250" stroke="#1a1c1a" strokeWidth="3" />
                <line x1="200" y1="0" x2="200" y2="100%" stroke="#1a1c1a" strokeWidth="3" />
                <line x1="0" y1="100" x2="100%" y2="120" stroke="#1a1c1a" strokeWidth="2" />
                <line x1="350" y1="0" x2="380" y2="100%" stroke="#1a1c1a" strokeWidth="2" />
              </svg>

              {/* User location */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-accent-500 border-2 border-white shadow-lg" />
                  <span className="absolute inset-0 rounded-full bg-accent-400 animate-ping opacity-60" />
                </div>
                <p className="text-xs font-semibold text-ink-700 dark:text-ink-300 bg-white/80 dark:bg-ink-900/80 px-2 py-0.5 rounded-md mt-2 whitespace-nowrap">You</p>
              </div>

              {/* Centre markers */}
              {filtered.map((centre, i) => {
                const top = 15 + (i * 22) % 70;
                const left = 15 + (i * 35) % 70;
                const color = centre.congestion === 'low' ? 'bg-success-500' : centre.congestion === 'medium' ? 'bg-secondary-500' : 'bg-danger-500';
                const isSelected = selected?.id === centre.id;
                return (
                  <motion.button
                    key={centre.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1, type: 'spring' }}
                    onClick={() => setSelected(centre)}
                    className="absolute z-10"
                    style={{ top: `${top}%`, left: `${left}%` }}
                  >
                    <div className="relative">
                      {isSelected && (
                        <span className={`absolute inset-0 rounded-full ${color} animate-ping opacity-60`} />
                      )}
                      <div className={`w-8 h-8 rounded-full ${color} border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold`}>
                        {centre.name.split(' ')[1]}
                      </div>
                    </div>
                  </motion.button>
                );
              })}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-ink-900/90 backdrop-blur rounded-xl p-3 shadow-lg border border-ink-100 dark:border-ink-800">
                <p className="text-xs font-bold text-ink-700 dark:text-ink-300 mb-2">Congestion Level</p>
                <div className="space-y-1.5">
                  {(['low', 'medium', 'high'] as const).map((l) => (
                    <div key={l} className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${l === 'low' ? 'bg-success-500' : l === 'medium' ? 'bg-secondary-500' : 'bg-danger-500'}`} />
                      <span className="text-xs text-ink-600 dark:text-ink-400 capitalize">{congestionLabel[l]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute top-4 right-4 bg-white/90 dark:bg-ink-900/90 backdrop-blur rounded-xl p-2 shadow-lg border border-ink-100 dark:border-ink-800">
                <Navigation className="w-5 h-5 text-accent-600 dark:text-accent-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Centre List */}
        <div className="lg:col-span-3 space-y-4">
          <p className="text-sm text-ink-500 dark:text-ink-400">{filtered.length} centres found</p>
          {filtered.map((centre, i) => (
            <motion.div
              key={centre.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card hover onClick={() => setSelected(centre)} className={selected?.id === centre.id ? 'ring-2 ring-primary-400 dark:ring-primary-500' : ''}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center font-bold text-primary-700 dark:text-primary-400">
                        {centre.name.split(' ')[1]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-ink-900 dark:text-ink-100">{centre.name}</h3>
                          {i === 0 && <Badge variant="primary"><Star className="w-3 h-3 fill-primary-500 text-primary-500" /> Top Pick</Badge>}
                        </div>
                        <p className="text-sm text-ink-500 dark:text-ink-400">{centre.distance} km · {centre.address}</p>
                      </div>
                    </div>
                    <CongestionBadge level={centre.congestion} size="md" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <StatBlock icon={Clock} label="Wait Time" value={`${centre.waitTime} min`} />
                    <StatBlock icon={Users} label="Queue" value={`${centre.queue}`} />
                    <StatBlock icon={Gauge} label="Counters" value={`${centre.activeCounters}/${centre.totalCounters}`} />
                    <StatBlock icon={Zap} label="Speed" value={`${centre.processingSpeed}/hr`} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-400">
                      <MapPin className="w-4 h-4" />
                      {centre.distance} km from you
                    </div>
                    <Link
                      to="/book-slot"
                      onClick={(e) => { e.stopPropagation(); showToast('success', `Selected ${centre.name}`); }}
                      className="flex items-center gap-2 text-sm font-semibold text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                    >
                      Book Slot <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <Card>
              <div className="p-12 text-center">
                <MapPin className="w-12 h-12 text-ink-300 dark:text-ink-700 mx-auto mb-3" />
                <p className="text-ink-500 dark:text-ink-400 font-semibold">No centres found</p>
                <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">Try adjusting your search or filters</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-ink-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-ink-100 dark:border-ink-800"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center font-bold text-xl text-primary-700 dark:text-primary-400">
                  {selected.name.split(' ')[1]}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-ink-900 dark:text-ink-100">{selected.name}</h3>
                  <p className="text-sm text-ink-500 dark:text-ink-400">{selected.address}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="rounded-xl surface-subtle p-3">
                  <p className="text-xs text-ink-500 dark:text-ink-400">Distance</p>
                  <p className="font-bold text-ink-900 dark:text-ink-100">{selected.distance} km</p>
                </div>
                <div className="rounded-xl surface-subtle p-3">
                  <p className="text-xs text-ink-500 dark:text-ink-400">Wait Time</p>
                  <p className="font-bold text-ink-900 dark:text-ink-100">{selected.waitTime} min</p>
                </div>
                <div className="rounded-xl surface-subtle p-3">
                  <p className="text-xs text-ink-500 dark:text-ink-400">Active Counters</p>
                  <p className="font-bold text-ink-900 dark:text-ink-100">{selected.activeCounters}/{selected.totalCounters}</p>
                </div>
                <div className="rounded-xl surface-subtle p-3">
                  <p className="text-xs text-ink-500 dark:text-ink-400">Processing Speed</p>
                  <p className="font-bold text-ink-900 dark:text-ink-100">{selected.processingSpeed}/hr</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <CongestionBadge level={selected.congestion} size="md" />
                <p className="text-sm text-ink-500 dark:text-ink-400">Capacity: {selected.capacity}/hr</p>
              </div>
              <Link to="/book-slot" onClick={() => showToast('success', `Selected ${selected.name}`)}>
                <Button className="w-full">Book Slot at This Centre <ArrowRight className="w-4 h-4" /></Button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatBlock({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg surface-subtle p-3 text-center">
      <Icon className="w-4 h-4 text-ink-500 dark:text-ink-400 mx-auto mb-1" />
      <p className="text-xs text-ink-500 dark:text-ink-400">{label}</p>
      <p className="font-bold text-ink-900 dark:text-ink-100 text-sm">{value}</p>
    </div>
  );
}
