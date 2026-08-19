import React, { useState } from 'react';
import {
  Scale,
  Microchip,
  Cpu,
  Wifi,
  Database,
  LayoutDashboard,
  ArrowRight,
  ArrowDown,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const SystemArchitecture: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      title: 'Load Cell',
      subtitle: 'Strain Gauge',
      detail: '4x 50kg half-bridge load cells arranged in a Wheatstone Bridge circuit under the wooden table.',
      icon: Scale,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/50',
      borderColor: 'border-amber-200 dark:border-amber-800/60',
      status: 'Analog Signal (mV)',
    },
    {
      id: 2,
      title: 'HX711',
      subtitle: '24-bit ADC',
      detail: 'High-precision 24-bit Analog-to-Digital Converter with on-chip low-noise programmable amplifier.',
      icon: Microchip,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/50',
      borderColor: 'border-blue-200 dark:border-blue-800/60',
      status: 'Digital I2C / Serial',
    },
    {
      id: 3,
      title: 'ESP32',
      subtitle: 'Microcontroller',
      detail: 'Tensilica Xtensa Dual-Core 240MHz MCU reads raw ADC counts, applies tare calibration, and converts to kg.',
      icon: Cpu,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
      borderColor: 'border-emerald-200 dark:border-emerald-800/60',
      status: 'Calibrated Float (kg)',
    },
    {
      id: 4,
      title: 'Wi-Fi',
      subtitle: '2.4 GHz Network',
      detail: 'Transmits weight telemetry securely via HTTP REST POST or WebSockets over local Wi-Fi router.',
      icon: Wifi,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/50',
      borderColor: 'border-cyan-200 dark:border-cyan-800/60',
      status: 'TCP/IP Packets',
    },
    {
      id: 5,
      title: 'Supabase',
      subtitle: 'PostgreSQL DB',
      detail: 'Cloud-hosted database persisting records into `weight_data` table and broadcasting real-time changes.',
      icon: Database,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
      borderColor: 'border-emerald-200 dark:border-emerald-800/60',
      status: 'Realtime WebSocket',
    },
    {
      id: 6,
      title: 'Dashboard',
      subtitle: 'React / Vite',
      detail: 'Interactive frontend client displaying real-time weight cards, statistical analytics, graphs, and logs.',
      icon: LayoutDashboard,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/50',
      borderColor: 'border-indigo-200 dark:border-indigo-800/60',
      status: 'Live User Interface',
    },
  ];

  return (
    <div
      id="section-system-architecture"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm transition-all"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            System Architecture
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            End-to-end hardware signal pipeline from physical strain to cloud visualization
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Info className="w-3.5 h-3.5 text-emerald-500" />
          <span>Click any block for hardware details</span>
        </div>
      </div>

      {/* Architecture Flow: Desktop horizontal, Mobile vertical/grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 relative">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isSelected = selectedNode === step.id;

          return (
            <React.Fragment key={step.id}>
              <div
                id={`arch-node-${step.id}`}
                onClick={() => setSelectedNode(isSelected ? null : step.id)}
                className={`cursor-pointer rounded-xl p-4 border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? `${step.bgColor} ${step.borderColor} ring-2 ring-emerald-500/50 shadow-md`
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      0{step.id}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-lg ${step.bgColor} border ${step.borderColor} flex items-center justify-center ${step.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {step.title}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {step.subtitle}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                  {step.status}
                </div>
              </div>

              {/* Arrow separator (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center -mx-3 pointer-events-none z-10">
                  <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Selected Node Expanded Details Card */}
      {selectedNode && (
        <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs transition-all">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>
              Stage 0{selectedNode}: {steps.find((s) => s.id === selectedNode)?.title} (
              {steps.find((s) => s.id === selectedNode)?.subtitle})
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            {steps.find((s) => s.id === selectedNode)?.detail}
          </p>
        </div>
      )}
    </div>
  );
};
