import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Activity, Clock, SlidersHorizontal, Eye } from 'lucide-react';
import { ChartDataPoint, TimeRangeFilter } from '../types/weight';

interface LiveWeightChartProps {
  data: ChartDataPoint[];
  currentRange: TimeRangeFilter;
  onRangeChange: (range: TimeRangeFilter) => void;
  unit: 'kg' | 'lbs';
  isLoading?: boolean;
}

export const LiveWeightChart: React.FC<LiveWeightChartProps> = ({
  data,
  currentRange,
  onRangeChange,
  unit,
  isLoading = false,
}) => {
  const [showAdcValues, setShowAdcValues] = useState(false);
  const factor = unit === 'lbs' ? 2.20462 : 1;

  // Convert weight data points according to selected unit
  const formattedData = data.map((d) => ({
    ...d,
    displayWeight: Number((d.weight * factor).toFixed(1)),
  }));

  // Calculate dynamic min/max domain with breathing room
  const weights = formattedData.map((d) => d.displayWeight);
  const minVal = weights.length ? Math.floor(Math.min(...weights) * 0.8) : 0;
  const maxVal = weights.length ? Math.ceil(Math.max(...weights) * 1.15) : 50;

  const filters: { id: TimeRangeFilter; label: string }[] = [
    { id: '1h', label: '1 Hour' },
    { id: '6h', label: '6 Hours' },
    { id: '24h', label: '24 Hours' },
    { id: '7d', label: '7 Days' },
  ];

  return (
    <div
      id="section-live-chart"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm transition-all"
    >
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Live Weight Monitoring
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              HX711 Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time continuous load-cell weight telemetry graph ({unit})
          </p>
        </div>

        {/* Action Controls & Range Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle ADC counts */}
          <button
            onClick={() => setShowAdcValues(!showAdcValues)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              showAdcValues
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750'
            }`}
            title="Show raw 24-bit HX711 ADC digital counts"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showAdcValues ? 'ADC Counts: ON' : 'Show ADC'}</span>
          </button>

          {/* Time Range Pills */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            {filters.map((f) => (
              <button
                key={f.id}
                id={`filter-range-${f.id}`}
                onClick={() => onRangeChange(f.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  currentRange === f.id
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="w-full h-[320px] sm:h-[360px] relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Activity className="w-4 h-4 animate-spin text-emerald-500" />
              <span>Updating graph series...</span>
            </div>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
            />

            <XAxis
              dataKey="timeLabel"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              minTickGap={28}
            />

            <YAxis
              domain={[minVal, maxVal]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v) => `${v} ${unit}`}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as ChartDataPoint & { displayWeight: number };
                  return (
                    <div className="bg-slate-950 text-slate-100 border border-slate-800 p-3 rounded-lg shadow-lg text-xs font-mono">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1.5 pb-1 border-b border-slate-800">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>{pt.timestamp.replace('T', ' ')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-sm font-bold text-emerald-400">
                        <span>Weight:</span>
                        <span>
                          {pt.displayWeight} {unit}
                        </span>
                      </div>
                      {showAdcValues && pt.rawAdc && (
                        <div className="flex items-center justify-between gap-4 text-[11px] text-indigo-300 mt-1">
                          <span>HX711 Raw ADC:</span>
                          <span>{pt.rawAdc.toLocaleString()} pts</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="displayWeight"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#weightGradient)"
              isAnimationActive={true}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info / Key Sample Benchmarks */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>HX711 Amplified Sensor Curve</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="font-mono text-slate-600 dark:text-slate-400">
              Sample window: {formattedData.length} records
            </span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Resolution: 0.1 {unit} (24-bit Σ-Δ ADC)
        </div>
      </div>
    </div>
  );
};
