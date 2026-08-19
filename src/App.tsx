import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { CurrentWeightCard } from './components/CurrentWeightCard';
import { LiveWeightChart } from './components/LiveWeightChart';
import { WeightHistoryTable } from './components/WeightHistoryTable';
import { DeviceInfoCard } from './components/DeviceInfoCard';
import { ConnectionStatusCard } from './components/ConnectionStatusCard';
import { LiveSimulatorControls } from './components/LiveSimulatorControls';
import { SupabaseGuideModal } from './components/SupabaseGuideModal';
import { AlertTriangle } from 'lucide-react';

import {
  WeightRecord,
  WeightStats,
  DeviceInfo,
  TimeRangeFilter,
  ChartDataPoint,
} from './types/weight';
import {
  fetchWeightStats,
  fetchWeightHistory,
  fetchChartData,
  fetchDeviceInfo,
  subscribeToWeightUpdates,
  pushSimulatedReading,
  resetMockData,
} from './services/weightService';

export default function App() {
  // State
  const [stats, setStats] = useState<WeightStats>({
    currentWeight: 23.6,
    previousWeight: 22.8,
    weightDelta: 0.8,
    maxWeight: 48.2,
    minWeight: 5.4,
    avgWeight: 21.7,
    totalReadings: 45,
    lastUpdated: '2026-08-19T10:05:01',
    unit: 'kg',
  });

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    deviceId: 'ESP32-TABLE-01',
    tableId: 'TABLE-01',
    sensor: 'Load Cell + HX711 (24-bit ADC)',
    connection: 'Wi-Fi 802.11 b/g/n (2.4 GHz)',
    // 'Not Connected' is the safe default until ESP32 is live.
    // fetchDeviceInfo() will update this after each data load.
    status: 'Not Connected',
    lastDataReceived: '--:--:--',
    ipAddress: '192.168.1.142',
    wifiSsid: 'IoT_Lab_Network_5G',
    signalStrengthDbm: -56,
    samplingRateHz: 10,
    tareOffset: 84210,
    calibrationFactor: 420.5,
    uptimeSeconds: 14280,
  });

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('1h');
  const [isChartLoading, setIsChartLoading] = useState<boolean>(false);

  // Table State
  const [historyRecords, setHistoryRecords] = useState<WeightRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();

  // Preferences & Simulation
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load all dashboard data from service layer
  const loadDashboardData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const [fetchedStats, fetchedDev, fetchedChart, fetchedHistory] = await Promise.all([
        fetchWeightStats('TABLE-01'),
        fetchDeviceInfo('TABLE-01'),
        fetchChartData('TABLE-01', timeRange),
        fetchWeightHistory('TABLE-01', {
          searchQuery,
          sortOrder,
          page: currentPage,
          pageSize: 10,
          startDate,
          endDate,
        }),
      ]);

      setStats(fetchedStats);
      setDeviceInfo(fetchedDev);
      setChartData(fetchedChart);
      setHistoryRecords(fetchedHistory.records);
      setTotalRecords(fetchedHistory.total);
      setTotalPages(fetchedHistory.totalPages);
    } catch (err) {
      console.error('Error fetching weight dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Database connection error.');

      // Override status to indicate database error / offline
      setDeviceInfo((prev) => ({
        ...prev,
        status: 'Not Connected',
        lastDataReceived: '--:--:--',
      }));

      // Invalidate dashboard metrics to avoid silently showing stale/fake data
      setStats({
        currentWeight: 0,
        previousWeight: 0,
        weightDelta: 0,
        maxWeight: 0,
        minWeight: 0,
        avgWeight: 0,
        totalReadings: 0,
        lastUpdated: '--',
        unit: 'kg',
      });
      setChartData([]);
      setHistoryRecords([]);
      setTotalRecords(0);
      setTotalPages(1);
    } finally {
      setIsRefreshing(false);
    }
  }, [timeRange, searchQuery, sortOrder, currentPage, startDate, endDate]);

  // Initial load & when table filters change
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Reload chart when time range changes
  const handleRangeChange = async (range: TimeRangeFilter) => {
    setTimeRange(range);
    setIsChartLoading(true);
    try {
      const data = await fetchChartData('TABLE-01', range);
      setChartData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart data.');
    } finally {
      setIsChartLoading(false);
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    const unsubscribe = subscribeToWeightUpdates(() => {
      loadDashboardData();
    });

    return () => {
      unsubscribe();
    };
  }, [loadDashboardData]);

  // Live simulation streamer
  useEffect(() => {
    if (isLiveStreaming) {
      streamIntervalRef.current = setInterval(() => {
        const current = stats.currentWeight;
        const delta = Math.random() * 0.6 - 0.28;
        const nextWeight = Math.max(0, Number((current + delta).toFixed(1)));
        pushSimulatedReading(nextWeight, 'TABLE-01');
      }, 3000);
    } else {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    }

    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, [isLiveStreaming, stats.currentWeight]);

  const handlePushWeight = (targetWeight: number) => {
    pushSimulatedReading(targetWeight, 'TABLE-01');
  };

  const handleResetData = () => {
    resetMockData();
    loadDashboardData();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Header Bar */}
      <Header
        deviceInfo={deviceInfo}
        isLiveStreaming={isLiveStreaming}
        onToggleLiveStream={() => setIsLiveStreaming(!isLiveStreaming)}
        onRefresh={loadDashboardData}
        onOpenSupabaseGuide={() => setIsSupabaseModalOpen(true)}
        unit={unit}
        onToggleUnit={() => setUnit((prev) => (prev === 'kg' ? 'lbs' : 'kg'))}
        isRefreshing={isRefreshing}
      />

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Error Notification Banner */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-xl p-4 flex items-start gap-3 text-red-800 dark:text-red-300">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">Database Sync Error</h3>
              <p className="text-xs text-red-700 dark:text-red-400 mt-1">{error}</p>
              <button
                onClick={loadDashboardData}
                className="mt-2.5 px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/60 dark:hover:bg-red-900 text-xs font-semibold rounded transition-colors border border-red-200/50 dark:border-red-800/50"
              >
                Retry Request
              </button>
            </div>
          </div>
        )}

        {/* Simulation Controls Toolbar */}
        <LiveSimulatorControls
          currentWeight={stats.currentWeight}
          isStreaming={isLiveStreaming}
          onToggleStreaming={() => setIsLiveStreaming(!isLiveStreaming)}
          onPushWeight={handlePushWeight}
          onResetData={handleResetData}
          unit={unit}
        />

        {/* Top Section: Current Weight + Average Weight + Connection Status */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Current Weight (23.6 kg), Average Weight, Last Updated */}
          <div className="lg:col-span-7">
            <CurrentWeightCard stats={stats} unit={unit} ratedCapacityKg={100} />
          </div>

          {/* ESP32 Connection Status Card */}
          <div className="lg:col-span-5">
            <ConnectionStatusCard deviceInfo={deviceInfo} />
          </div>
        </div>

        {/* Live Weight Monitoring Graph */}
        <LiveWeightChart
          data={chartData}
          currentRange={timeRange}
          onRangeChange={handleRangeChange}
          unit={unit}
          isLoading={isChartLoading}
        />

        {/* Table / Device Information Card */}
        <DeviceInfoCard
          deviceInfo={deviceInfo}
          currentWeight={stats.currentWeight}
          unit={unit}
        />

        {/* Weight History Table */}
        <WeightHistoryTable
          records={historyRecords}
          totalRecords={totalRecords}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={10}
          searchQuery={searchQuery}
          sortOrder={sortOrder}
          startDate={startDate}
          endDate={endDate}
          unit={unit}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          onSortToggle={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
          onPageChange={setCurrentPage}
          onDateFilterChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
            setCurrentPage(1);
          }}
          onClearFilters={handleClearFilters}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              ESP32 Smart Weight-Sensing Table
            </span>
            <span className="text-slate-400">|</span>
            <span>ESP32 & HX711 Load Monitoring</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Table ID: TABLE-01</span>
            <span>Last Updated: {stats.lastUpdated}</span>
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Supabase Connected ↗
            </button>
          </div>
        </div>
      </footer>

      {/* Supabase Integration Blueprint Modal */}
      <SupabaseGuideModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}
