import React from 'react';
import { Cpu, Wifi, Radio, Scale, Layers, Server } from 'lucide-react';
import { DeviceInfo } from '../types/weight';

interface DeviceInfoCardProps {
  deviceInfo: DeviceInfo;
  currentWeight: number;
  unit: 'kg' | 'lbs';
}

export const DeviceInfoCard: React.FC<DeviceInfoCardProps> = ({
  deviceInfo,
  currentWeight,
  unit,
}) => {
  const factor = unit === 'lbs' ? 2.20462 : 1;
  const displayWeight = (currentWeight * factor).toFixed(1);

  const isNotConnected = deviceInfo.status === 'Not Connected';
  const isOnline = deviceInfo.status === 'Online';
  const isDataReceived = deviceInfo.status === 'Data received';

  // Status badge style
  const statusColor = isOnline
    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
    : isDataReceived
      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800'
      : isNotConnected
        ? 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
        : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800';

  const fields = [
    {
      id: 'field-device-id',
      label: 'Device ID',
      value: deviceInfo.deviceId,
      icon: Cpu,
      isMono: true,
      highlight: false,
    },
    {
      id: 'field-table-id',
      label: 'Table ID',
      value: deviceInfo.tableId,
      icon: Layers,
      isMono: true,
      highlight: false,
    },
    {
      id: 'field-sensor',
      label: 'Sensor',
      value: deviceInfo.sensor,
      icon: Radio,
      isMono: false,
      highlight: false,
    },
    {
      id: 'field-connection',
      label: 'Connection',
      // Hide RSSI until real device is online
      value: deviceInfo.status === 'Online'
        ? `${deviceInfo.connection} (${deviceInfo.signalStrengthDbm} dBm)`
        : deviceInfo.connection,
      icon: Wifi,
      isMono: false,
      highlight: false,
    },
    {
      id: 'field-status',
      label: 'Status',
      value: deviceInfo.status,
      icon: Server,
      isMono: false,
      highlight: true,
      statusColor,
    },
    {
      id: 'field-last-received',
      label: 'Last Data Received',
      // TODO (Supabase): replace with real timestamp from latest weight_data row
      value: isNotConnected ? 'No data yet' : deviceInfo.lastDataReceived,
      icon: Cpu,
      isMono: true,
      highlight: false,
      dimmed: isNotConnected,
    },
    {
      id: 'field-current-weight',
      label: 'Current Weight',
      value: `${displayWeight} ${unit}`,
      note: isNotConnected ? '(demo data)' : undefined,
      icon: Scale,
      isMono: true,
      highlight: true,
      statusColor:
        'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 font-bold',
    },
  ];

  return (
    <div
      id="section-device-info"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm transition-all h-full"
    >
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              Device Information
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Node hardware specs &amp; load amplifier configuration
            </p>
          </div>
        </div>

        {/* Firmware badge — greyed out while not connected */}
        <span
          className={`text-[11px] font-mono px-2 py-0.5 rounded border font-medium ${deviceInfo.status !== 'Online'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-300 dark:border-slate-700'
              : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80'
            }`}
        >
          {deviceInfo.status !== 'Online' ? 'Firmware Unknown' : 'Firmware v1.2.0'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {fields.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              id={item.id}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>

              {item.highlight ? (
                <div className="flex items-center gap-1.5">
                  {item.note && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                      {item.note}
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded border ${item.statusColor || ''} ${item.isMono ? 'font-mono' : ''
                      }`}
                  >
                    {item.value}
                  </span>
                </div>
              ) : (
                <span
                  className={`text-xs font-medium text-right ${(item as { dimmed?: boolean }).dimmed
                    ? 'text-slate-400 dark:text-slate-500 italic'
                    : 'text-slate-800 dark:text-slate-200'
                    } ${item.isMono ? 'font-mono font-semibold' : ''}`}
                >
                  {item.value}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
