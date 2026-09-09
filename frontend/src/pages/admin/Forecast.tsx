import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { getCongestionForecast } from '@/services/aiService';
import { useTheme } from '@/context/AppContext';
import type { QueueForecastPoint } from '@/types';

const levelColor: Record<string, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
};

export default function AdminForecast() {
  const { theme } = useTheme();
  const [forecast, setForecast] = useState<QueueForecastPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const f = await getCongestionForecast();
        setForecast(f || []);
      } catch (err) {
        console.error('Failed to load forecast', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton rounded-2xl h-32" />
        <div className="skeleton rounded-2xl h-96" />
      </div>
    );
  }

  if (!forecast.length) {
    return (
      <div className="card-surface p-12 text-center text-ink-500 dark:text-ink-400">
        No forecast data available right now.
      </div>
    );
  }

  const isDark = theme === 'dark';
  const gridStroke = isDark ? '#33373a' : '#e4e8e4';
  const axisColor = isDark ? '#697569' : '#7a857a';
  const tooltipBg = isDark ? '#1a1c1a' : '#ffffff';
  const tooltipBorder = isDark ? '#3a403a' : '#cdd5cd';
  const tooltipText = isDark ? '#fff' : '#2a2d2a';
  const tooltipLabel = isDark ? '#b0bab0' : '#5c685c';

  const peakHour = forecast.reduce((max, p) => (p.value > max.value ? p : max)).hour;
  const bestHour = forecast.reduce((min, p) => (p.value < min.value ? p : min)).hour;
  const totalFarmers = forecast.reduce((s, p) => s + (p.predictedFarmers || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h1 className="text-2xl font-display font-bold text-ink-900 dark:text-white">Congestion Forecast</h1>
        </div>
        <p className="text-ink-500 dark:text-ink-400">AI-predicted crowd levels for the next 5 hours across all centres.</p>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card-surface p-5">
          <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">Peak Hour</p>
          <p className="text-2xl font-display font-bold text-danger-600 dark:text-danger-400">
            {peakHour}
          </p>
        </div>
        <div className="card-surface p-5">
          <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">Best Time to Visit</p>
          <p className="text-2xl font-display font-bold text-success-600 dark:text-success-400">
            {bestHour}
          </p>
        </div>
        <div className="card-surface p-5">
          <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">Predicted Farmers (Total)</p>
          <p className="text-2xl font-display font-bold text-ink-900 dark:text-white">
            {totalFarmers}
          </p>
        </div>
      </div>

      {/* Area Chart */}
      <div className="card-surface p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="font-display font-bold text-lg text-ink-900 dark:text-white">Next 5 Hours — Congestion Forecast</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={forecast}>
            <defs>
              <linearGradient id="congestionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2f9d5e" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#2f9d5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="hour" stroke={axisColor} tick={{ fill: axisColor, fontSize: 12 }} />
            <YAxis stroke={axisColor} tick={{ fill: axisColor, fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '12px',
                color: tooltipText,
              }}
              labelStyle={{ color: tooltipLabel }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2f9d5e"
              strokeWidth={2}
              fill="url(#congestionGrad)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart with congestion colors */}
      <div className="card-surface p-6">
        <h2 className="font-display font-bold text-lg text-ink-900 dark:text-white mb-6">Predicted Farmers per Hour</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={forecast}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="hour" stroke={axisColor} tick={{ fill: axisColor, fontSize: 12 }} />
            <YAxis stroke={axisColor} tick={{ fill: axisColor, fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '12px',
                color: tooltipText,
              }}
              labelStyle={{ color: tooltipLabel }}
            />
            <Bar dataKey="predictedFarmers" radius={[8, 8, 0, 0]} animationDuration={800}>
              {forecast.map((entry, idx) => (
                <Cell key={idx} fill={levelColor[entry.level] || '#22c55e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          {['low', 'medium', 'high'].map((l) => (
            <div key={l} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: levelColor[l] }} />
              <span className="text-sm text-ink-500 dark:text-ink-400 capitalize">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hour-by-hour breakdown */}
      <div className="card-surface p-6">
        <h2 className="font-display font-bold text-lg text-ink-900 dark:text-white mb-4">Hour-by-Hour Breakdown</h2>
        <div className="space-y-2">
          {forecast.map((p, i) => (
            <motion.div
              key={p.hour}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center justify-between p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-ink-900 dark:text-white font-bold w-16">{p.hour}</span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                  style={{
                    background: `${levelColor[p.level] || '#22c55e'}20`,
                    color: levelColor[p.level] || '#22c55e',
                  }}
                >
                  {p.level}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-ink-500 dark:text-ink-400 text-sm">{p.predictedFarmers} farmers</span>
                <span className="text-ink-900 dark:text-white font-bold">{p.value}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}