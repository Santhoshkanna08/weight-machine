import React from 'react';
import { WifiOff, Radio, Activity, Clock, Info } from 'lucide-react';
import { DeviceInfo } from '../types/weight';

interface ConnectionStatusCardProps {
  deviceInfo: DeviceInfo;
}

/**
 * ConnectionStatusCard
 *
 * CURRENT STATE: ESP32 is not connected.
 * Always shows "⚪ Waiting for ESP32" regardless of database contents.
 *
 * FUTURE STATE (once real ESP32 sends data):
 *   - Derive status from latest `weight_data` row timestamp:
 *       < 60 s ago  → 🟢 Online
 *       > 60 s ago  → 🔴 Offline
 *       no rows     → ⚪ Waiting for ESP32
 */
export const ConnectionStatusCard: React.FC<ConnectionStatusCardProps> = ({ deviceInfo: _deviceInfo }) => {
  return (
    <div
      id="card-connection-status"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm transition-all h-full flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Device Status
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ESP32 hardware connection
              </p>
            </div>
          </div>

          {/* Status badge — always gray/neutral until real ESP32 connects */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400 dark:bg-slate-500" />
            </span>
            <span>Waiting for ESP32</span>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-2.5">
          {/* Last Data Received */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium">Last Data Received</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 italic">
              No data yet
            </span>
          </div>

          {/* Wi-Fi Signal */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Radio className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium">Wi-Fi Signal (RSSI)</span>
            </div>
            <span className="font-mono text-xs text-slate-400 dark:text-slate-500 italic">
              Awaiting device
            </span>
          </div>

          {/* Telemetry Rate */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium">Telemetry Rate</span>
            </div>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500 italic">
              Awaiting device
            </span>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Waiting for ESP32 connection</span>
        </span>
        <span className="font-mono text-slate-500">Realtime Active</span>
      </div>
    </div>
  );
};
