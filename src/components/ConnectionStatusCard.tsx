import React from 'react';
import { Wifi, CheckCircle2, AlertTriangle, Radio, Activity, Clock, ShieldCheck } from 'lucide-react';
import { DeviceInfo } from '../types/weight';

interface ConnectionStatusCardProps {
  deviceInfo: DeviceInfo;
}

export const ConnectionStatusCard: React.FC<ConnectionStatusCardProps> = ({ deviceInfo }) => {
  const isOnline = deviceInfo.status === 'Online';

  return (
    <div
      id="card-connection-status"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm transition-all h-full flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                ESP32 Connection
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Network link & heartbeat telemetry
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {isOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isOnline ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              />
            </span>
            <span>{isOnline ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        {/* Primary metrics grid */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium">Last Data Received</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {deviceInfo.lastDataReceived}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Radio className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium">Wi-Fi Signal (RSSI)</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs text-slate-800 dark:text-slate-200">
              <span>{deviceInfo.signalStrengthDbm} dBm</span>
              <span className="text-[10px] text-emerald-500 font-semibold">(Excellent)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium">Telemetry Rate</span>
            </div>
            <span className="text-xs font-mono text-slate-800 dark:text-slate-200">
              {deviceInfo.samplingRateHz} Hz (Continuous)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Heartbeat synced</span>
        </span>
        <span className="font-mono">Supabase Realtime Ready</span>
      </div>
    </div>
  );
};
