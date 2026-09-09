import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, Users, Clock, Gauge, ArrowUpDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { CongestionBadge } from '@/components/ui/Badge';
import { getCentres } from '@/services/centreService';
import type { ProcurementCentre } from '@/types';
import { congestionLabel } from '@/data/mockData';

type SortKey = 'name' | 'queue' | 'waitTime' | 'congestion';

export default function AdminCentres() {
  const [centres, setCentres] = useState<ProcurementCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('waitTime');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    (async () => {
      const cs = await getCentres();
      setCentres(cs);
      setLoading(false);
    })();
  }, []);

  const filtered = centres
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'congestion') {
        const order = { low: 0, medium: 1, high: 2 };
        cmp = order[a.congestion] - order[b.congestion];
      } else cmp = a[sortKey] - b[sortKey];
      return sortAsc ? cmp : -cmp;
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton rounded-2xl h-32" />
        <div className="skeleton rounded-2xl h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h1 className="text-2xl font-display font-bold text-ink-900 dark:text-white">Centre Monitoring</h1>
        </div>
        <p className="text-ink-500 dark:text-ink-400">Live monitoring of all procurement centres with queue and counter status.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500 dark:text-ink-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search centres..."
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-white placeholder:text-ink-400 dark:placeholder:text-ink-600 focus:border-primary-400 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-500/20 outline-none transition-all"
        />
      </div>

      {/* Table */}
      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-100 dark:border-ink-800">
                <th className="text-left px-4 py-4 text-sm font-semibold text-ink-500 dark:text-ink-400 cursor-pointer hover:text-ink-900 dark:hover:text-white" onClick={() => handleSort('name')}>
                  <span className="flex items-center gap-1">Centre <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="text-center px-4 py-4 text-sm font-semibold text-ink-500 dark:text-ink-400 cursor-pointer hover:text-ink-900 dark:hover:text-white" onClick={() => handleSort('queue')}>
                  <span className="flex items-center gap-1 justify-center">Queue <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="text-center px-4 py-4 text-sm font-semibold text-ink-500 dark:text-ink-400">Counters</th>
                <th className="text-center px-4 py-4 text-sm font-semibold text-ink-500 dark:text-ink-400 cursor-pointer hover:text-ink-900 dark:hover:text-white" onClick={() => handleSort('waitTime')}>
                  <span className="flex items-center gap-1 justify-center">Wait <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="text-center px-4 py-4 text-sm font-semibold text-ink-500 dark:text-ink-400">Speed</th>
                <th className="text-center px-4 py-4 text-sm font-semibold text-ink-500 dark:text-ink-400 cursor-pointer hover:text-ink-900 dark:hover:text-white" onClick={() => handleSort('congestion')}>
                  <span className="flex items-center gap-1 justify-center">Congestion <ArrowUpDown className="w-3 h-3" /></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-ink-100/50 dark:border-ink-800/50 hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-ink-700 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-300">
                        {c.name.split(' ')[1]}
                      </div>
                      <div>
                        <p className="font-semibold text-ink-900 dark:text-white text-sm">{c.name}</p>
                        <p className="text-xs text-ink-500 dark:text-ink-500">{c.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-ink-900 dark:text-white font-bold">
                      <Users className="w-3.5 h-3.5 text-ink-400" /> {c.queue}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-ink-900 dark:text-white font-semibold">{c.activeCounters}/{c.totalCounters}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-ink-900 dark:text-white font-bold">
                      <Clock className="w-3.5 h-3.5 text-ink-400" /> {c.waitTime}m
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-ink-700 dark:text-ink-300">
                      <Gauge className="w-3.5 h-3.5 text-ink-500" /> {c.processingSpeed}/hr
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <CongestionBadge level={c.congestion} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-ink-500 dark:text-ink-400">No centres found matching your search.</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card-surface p-5">
          <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">Total in Queue</p>
          <p className="text-2xl font-display font-bold text-ink-900 dark:text-white">{centres.reduce((s, c) => s + c.queue, 0)}</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">Avg Wait Time</p>
          <p className="text-2xl font-display font-bold text-ink-900 dark:text-white">
            {Math.round(centres.reduce((s, c) => s + c.waitTime, 0) / centres.length)} min
          </p>
        </div>
        <div className="card-surface p-5">
          <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">High Congestion Centres</p>
          <p className="text-2xl font-display font-bold text-danger-600 dark:text-danger-400">
            {centres.filter((c) => c.congestion === 'high').length}
          </p>
        </div>
      </div>
    </div>
  );
}
