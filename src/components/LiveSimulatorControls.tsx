import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Sliders,
  Sparkles,
  Zap,
  Check,
} from 'lucide-react';

interface LiveSimulatorControlsProps {
  currentWeight: number;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onPushWeight: (weight: number) => void;
  onResetData: () => void;
  unit: 'kg' | 'lbs';
}

export const LiveSimulatorControls: React.FC<LiveSimulatorControlsProps> = ({
  currentWeight,
  isStreaming,
  onToggleStreaming,
  onPushWeight,
  onResetData,
  unit,
}) => {
  const [customVal, setCustomVal] = useState<string>('23.6');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const presets = [
    { label: 'Tare / Zero', weight: 0.0, icon: '0' },
    { label: '+3.5 kg Laptop', weight: Number((currentWeight + 3.5).toFixed(1)), icon: '💻' },
    { label: '+8.0 kg Books', weight: Number((currentWeight + 8.0).toFixed(1)), icon: '📚' },
    { label: '23.6 kg Base Load', weight: 23.6, icon: '📦' },
    { label: '48.2 kg Heavy Load', weight: 48.2, icon: '🏋️' },
  ];

  const handleApplyWeight = (w: number, label: string) => {
    onPushWeight(w);
    setFeedbackMsg(`Applied ${w} kg (${label})`);
    setTimeout(() => setFeedbackMsg(null), 2000);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customVal);
    if (!isNaN(val) && val >= 0) {
      handleApplyWeight(val, 'Custom');
    }
  };

  return (
    <div
      id="section-simulator-controls"
      className="bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wide text-white uppercase flex items-center gap-2">
              ESP32 Hardware Simulator
              <span className="text-[10px] lowercase font-normal px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Demo Mode
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Test real-time dashboard responsiveness before connecting physical ESP32 load cells
            </p>
          </div>
        </div>

        {feedbackMsg && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
            <Check className="w-3.5 h-3.5" />
            <span>{feedbackMsg}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Preset quick simulation buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium mr-1">Simulate Table Load:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyWeight(p.weight, p.label)}
              className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Custom Weight Input & Reset */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleCustomSubmit} className="flex items-center gap-1.5">
            <input
              type="number"
              step="0.1"
              min="0"
              max="150"
              value={customVal}
              onChange={(e) => setCustomVal(e.target.value)}
              className="w-20 px-2 py-1 text-xs font-mono bg-slate-950 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              placeholder="0.0"
            />
            <span className="text-xs text-slate-400 font-mono">kg</span>
            <button
              type="submit"
              className="px-2.5 py-1 rounded text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              Push
            </button>
          </form>

          <button
            onClick={onResetData}
            className="p-1 rounded text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            title="Reset to default mock dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
