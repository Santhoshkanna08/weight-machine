import React from 'react';
import { Scale, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { WeightStats } from '../types/weight';

interface StatsGridProps {
  stats: WeightStats;
  unit: 'kg' | 'lbs';
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, unit }) => {
  const factor = unit === 'lbs' ? 2.20462 : 1;

  const cards = [
    {
      id: 'stat-current',
      title: 'Current Weight',
      value: (stats.currentWeight * factor).toFixed(1),
      unit: unit,
      subtitle: `Delta: ${stats.weightDelta >= 0 ? '+' : ''}${(stats.weightDelta * factor).toFixed(1)} ${unit}`,
      icon: Scale,
      color: 'emerald',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderLight: 'border-emerald-200 dark:border-emerald-800/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'stat-max',
      title: 'Maximum Weight',
      value: (stats.maxWeight * factor).toFixed(1),
      unit: unit,
      subtitle: 'Peak recorded load',
      icon: ArrowUpRight,
      color: 'amber',
      bgLight: 'bg-amber-50 dark:bg-amber-950/40',
      borderLight: 'border-amber-200 dark:border-amber-800/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      id: 'stat-min',
      title: 'Minimum Weight',
      value: (stats.minWeight * factor).toFixed(1),
      unit: unit,
      subtitle: 'Base / Tare baseline',
      icon: ArrowDownRight,
      color: 'blue',
      bgLight: 'bg-blue-50 dark:bg-blue-950/40',
      borderLight: 'border-blue-200 dark:border-blue-800/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'stat-avg',
      title: 'Average Weight',
      value: (stats.avgWeight * factor).toFixed(1),
      unit: unit,
      subtitle: `Across ${stats.totalReadings} readings`,
      icon: Activity,
      color: 'indigo',
      bgLight: 'bg-indigo-50 dark:bg-indigo-950/40',
      borderLight: 'border-indigo-200 dark:border-indigo-800/40',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div
                className={`w-8 h-8 rounded-lg ${card.bgLight} border ${card.borderLight} flex items-center justify-center ${card.iconColor}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {card.value}
              </span>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 font-mono">
                {card.unit}
              </span>
            </div>

            <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
              {card.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
};
