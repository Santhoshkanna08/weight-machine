import React from 'react';
import { Wifi, RefreshCw, Cpu, Database, Activity, Play, Pause } from 'lucide-react';
import { DeviceInfo } from '../types/weight';

interface HeaderProps {
  deviceInfo: DeviceInfo;
  isLiveStreaming: boolean;
  onToggleLiveStream: () => void;
  onRefresh: () => void;
  onOpenSupabaseGuide: () => void;
  unit: 'kg' | 'lbs';
  onToggleUnit: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  deviceInfo,
  isLiveStreaming,
  onToggleLiveStream,
  onRefresh,
  onOpenSupabaseGuide,
  unit,
  onToggleUnit,
  isRefreshing,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: Title & Subtitle */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-mono">
                  Smart Weight Table
                </h1>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {deviceInfo.tableId}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                ESP32-Based Weight Monitoring System
              </p>
            </div>
          </div>

          {/* Right: Controls, Live Stream & Status */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Supabase Schema Guide Button */}
            <button
              id="btn-supabase-guide"
              onClick={onOpenSupabaseGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="View Supabase integration blueprint and SQL schema"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supabase Guide</span>
            </button>

            {/* Live Stream Simulation Toggle */}
            <button
              id="btn-toggle-stream"
              onClick={onToggleLiveStream}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${isLiveStreaming
                ? 'bg-emerald-950/80 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              title={isLiveStreaming ? 'Pause live simulation' : 'Start live sensor simulation'}
            >
              {isLiveStreaming ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Simulating (Live)</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-slate-400" />
                  <span>Start Live Sim</span>
                </>
              )}
            </button>

            {/* Unit Toggle */}
            <button
              id="btn-toggle-unit"
              onClick={onToggleUnit}
              className="px-2.5 py-1.5 rounded-md text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Toggle measurement unit"
            >
              {unit.toUpperCase()}
            </button>

            {/* Refresh Button */}
            <button
              id="btn-refresh-data"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-md text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-50"
              title="Fetch latest reading"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            {/* Divider */}
            <div className="hidden sm:block h-5 w-px bg-slate-800" />

            {/* ESP32 Status Pill or Data Received Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-xs">
              <span className="relative flex h-2.5 w-2.5">
                {deviceInfo.status === 'Online' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${deviceInfo.status === 'Online'
                      ? 'bg-emerald-500'
                      : deviceInfo.status === 'Data received'
                        ? 'bg-blue-500'
                        : deviceInfo.status === 'Not Connected'
                          ? 'bg-slate-500'
                          : 'bg-red-500'
                    }`}
                />
              </span>
              <span
                className={`font-medium ${deviceInfo.status === 'Not Connected' ? 'text-slate-400' : 'text-slate-200'
                  }`}
              >
                {deviceInfo.status === 'Online'
                  ? 'ESP32 Online'
                  : deviceInfo.status === 'Data received'
                    ? 'Data received'
                    : deviceInfo.status === 'Not Connected'
                      ? 'Device Not Connected'
                      : `ESP32 ${deviceInfo.status}`}
              </span>
              {deviceInfo.status !== 'Not Connected' && (
                <span className="text-slate-500 text-[11px] font-mono border-l border-slate-800 pl-2">
                  {deviceInfo.lastDataReceived}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
