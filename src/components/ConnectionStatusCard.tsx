import React from 'react';
import { WifiOff, AlertTriangle, Radio, Activity, Clock, Info } from 'lucide-react';
import { DeviceInfo } from '../types/weight';

interface ConnectionStatusCardProps {
  deviceInfo: DeviceInfo;
}

/**
 * ConnectionStatusCard
 *
 * Shows the current ESP32 connection status.
 *
 * CURRENT STATE (UI demo / mock data):
 *   - Status is always "Not Connected" because the real ESP32 is not wired up yet.
 *
 * FUTURE STATE (once Supabase is live):
 *   - Derive status from the latest `weight_data` row timestamp:
 *       timestamp within last 60s  →  🟢 Online
 *       timestamp older than 60s   →  🔴 Offline
 *       no rows at all             →  ⚪ Not Connected
 */
export const ConnectionStatusCard: React.FC<ConnectionStatusCardProps> = ({ deviceInfo }) => {
  const isOnline = deviceInfo.status === 'Online';
  const isNotConnected = deviceInfo.status === 'Not Connected';

  // Badge style: green = Online, red = Offline, slate = Not Connected
  const badgeClass = isOnline
    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    : isNotConnected
      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
      : 'bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';

  const dotClass = isOnline
    ? 'bg-emerald-500'
    : isNotConnected
      ? 'bg-slate-400 dark:bg-slate-500'
      : 'bg-red-500';

  const statusLabel = isOnline ? 'Connected' : isNotConnected ? 'Not Connected' : 'Disconnected';

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
                ESP32 Connection
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Network link &amp; heartbeat telemetry
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeClass}`}
          >
            <span className="relative flex h-2 w-2">
              {/* Only animate the dot when truly Online */}
              {isOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${dotClass}`} />
            </span>
            <span>{statusLabel}</span>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-2.5">
          {/* Last Data Received — shows placeholder when not connected */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium">Last Data Received</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
              {/* TODO (Supabase): replace with real timestamp from latest weight_data row */}
              {isNotConnected ? 'No data yet' : deviceInfo.lastDataReceived}
            </span>
          </div>

          {/* Wi-Fi Signal — greyed out until connected */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Radio className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium">Wi-Fi Signal (RSSI)</span>
            </div>
            <span className="font-mono text-xs text-slate-400 dark:text-slate-500 italic">
              {isNotConnected ? 'Awaiting device' : `${deviceInfo.signalStrengthDbm} dBm`}
            </span>
          </div>

          {/* Telemetry Rate — greyed out until connected */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium">Telemetry Rate</span>
            </div>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500 italic">
              {isNotConnected ? 'Awaiting device' : `${deviceInfo.samplingRateHz} Hz (Continuous)`}
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
        {/* TODO (Supabase): show "Realtime Active" once Supabase is wired up */}
        <span className="font-mono text-slate-500">Supabase Not Connected</span>
      </div>
    </div>
  );
};
