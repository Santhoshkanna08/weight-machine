import React from 'react';
import { Scale, TrendingUp, TrendingDown, Minus, Clock, Activity, ShieldCheck } from 'lucide-react';
import { WeightStats } from '../types/weight';

interface CurrentWeightCardProps {
  stats: WeightStats;
  unit: 'kg' | 'lbs';
  ratedCapacityKg?: number;
}

export const CurrentWeightCard: React.FC<CurrentWeightCardProps> = ({
  stats,
  unit,
  ratedCapacityKg = 100,
}) => {
  // Unit conversion factor
  const factor = unit === 'lbs' ? 2.20462 : 1;
  const isInitialLoading = stats.lastUpdated === '--';
  const displayCurrent = isInitialLoading ? '--' : (stats.currentWeight * factor).toFixed(1);
  const displayAverage = isInitialLoading ? '--' : (stats.avgWeight * factor).toFixed(1);
  const displayDelta = isInitialLoading ? '--' : (stats.weightDelta * factor).toFixed(1);
  const displayPrev = isInitialLoading ? '--' : (stats.previousWeight * factor).toFixed(1);
  const ratedCapacity = (ratedCapacityKg * factor).toFixed(0);

  // Load percentage for capacity bar
  const loadPercentage = Math.min(100, Math.max(0, (stats.currentWeight / ratedCapacityKg) * 100));

  const isPositive = stats.weightDelta > 0;
  const isNegative = stats.weightDelta < 0;

  // Format last updated timestamp
  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts;
      return d.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  return (
    <div
      id="card-current-weight"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-7 shadow-sm relative overflow-hidden transition-all h-full flex flex-col justify-between"
    >
      {/* Background subtle gauge indicator */}
      <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
        <Scale className="w-52 h-52 text-slate-900 dark:text-slate-100" />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Card Header & Status */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Primary Sensor Feed
              </span>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Current Table Weight
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Load Stable</span>
          </div>
        </div>

        {/* Primary Readings: Current Weight & Average Weight */}
        <div className="my-3 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Main Huge Current Weight (8 cols) */}
          <div className="sm:col-span-7">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Current Weight
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-6xl sm:text-7xl font-extrabold tracking-tight text-slate-950 dark:text-white font-mono">
                {displayCurrent}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {unit}
              </span>
            </div>
          </div>

          {/* Average Weight Card Box (5 cols) */}
          <div className="sm:col-span-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 flex flex-col justify-center">
            <div className="flex items-center justify-between gap-2 mb-1 text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium">Average Weight</span>
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {displayAverage}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-400">
                {unit}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Computed across session
            </span>
          </div>
        </div>

        {/* Delta, Last Updated & Capacity Indicator */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Delta & Timestamp */}
          <div className="flex items-center gap-2.5">
            <div
              className={`p-1.5 rounded-md ${isPositive
                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                  : isNegative
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                }`}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : isNegative ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Change (from {displayPrev} {unit}):
                </span>
                <span
                  className={`text-xs font-mono font-semibold ${isPositive
                      ? 'text-amber-600 dark:text-amber-400'
                      : isNegative
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-500'
                    }`}
                >
                  {isPositive ? `+${displayDelta}` : displayDelta} {unit}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                <Clock className="w-3 h-3 text-emerald-500" />
                <span>Last Updated: {formatTime(stats.lastUpdated)}</span>
              </div>
            </div>
          </div>

          {/* Table Capacity Load Bar */}
          <div className="flex flex-col justify-center">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Rated Load Capacity ({ratedCapacity} {unit} max)
              </span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                {loadPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${loadPercentage > 85
                    ? 'bg-red-500'
                    : loadPercentage > 60
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                style={{ width: `${loadPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
