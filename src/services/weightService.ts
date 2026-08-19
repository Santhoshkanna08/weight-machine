import {
  WeightRecord,
  WeightStats,
  DeviceInfo,
  TimeRangeFilter,
  ChartDataPoint,
  TableFilterOptions,
} from '../types/weight';
import { INITIAL_MOCK_RECORDS, INITIAL_DEVICE_INFO } from '../data/mockData';

/**
 * ==============================================================================
 * ESP32 Smart Weight Table - Data & Service Layer
 * ==============================================================================
 * This service layer acts as the single source of truth for weight sensor data.
 * Currently, it serves high-fidelity simulated/mock ESP32 load-cell readings.
 *
 * ------------------------------------------------------------------------------
 * FUTURE SUPABASE INTEGRATION GUIDE:
 * ------------------------------------------------------------------------------
 * To connect Supabase:
 * 1. Install @supabase/supabase-js: `npm install @supabase/supabase-js`
 * 2. Create a Supabase client instance (e.g., in `src/services/supabaseClient.ts`):
 *      import { createClient } from '@supabase/supabase-js';
 *      export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
 * 3. Replace the mock functions in this file with Supabase queries:
 *      - fetchCurrentWeight:
 *          const { data } = await supabase
 *            .from('weight_data')
 *            .select('*')
 *            .order('timestamp', { ascending: false })
 *            .limit(1)
 *            .single();
 *          return data;
 *
 *      - subscribeToWeightUpdates:
 *          const channel = supabase
 *            .channel('realtime:weight_data')
 *            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'weight_data' },
 *                payload => callback(payload.new as WeightRecord))
 *            .subscribe();
 *          return () => { supabase.removeChannel(channel); };
 * ==============================================================================
 */

// In-memory state for mock lifecycle (simulating local cache or live buffer)
let memoryRecords: WeightRecord[] = [...INITIAL_MOCK_RECORDS];
let memoryDeviceInfo: DeviceInfo = { ...INITIAL_DEVICE_INFO };
const subscribers: Set<(record: WeightRecord) => void> = new Set();

/**
 * Helper to compute stats from a list of records
 */
export function calculateStats(records: WeightRecord[]): WeightStats {
  if (!records || records.length === 0) {
    return {
      currentWeight: 0,
      previousWeight: 0,
      weightDelta: 0,
      maxWeight: 0,
      minWeight: 0,
      avgWeight: 0,
      totalReadings: 0,
      lastUpdated: new Date().toISOString(),
      unit: 'kg',
    };
  }

  const current = records[0].weight;
  const previous = records.length > 1 ? records[1].weight : current;
  const delta = Number((current - previous).toFixed(2));

  const weights = records.map((r) => r.weight);
  const max = Math.max(...weights);
  const min = Math.min(...weights);
  const sum = weights.reduce((acc, val) => acc + val, 0);
  const avg = Number((sum / weights.length).toFixed(1));

  return {
    currentWeight: Number(current.toFixed(1)),
    previousWeight: Number(previous.toFixed(1)),
    weightDelta: delta,
    maxWeight: Number(max.toFixed(1)),
    minWeight: Number(min.toFixed(1)),
    avgWeight: Number(avg.toFixed(1)),
    totalReadings: records.length,
    lastUpdated: records[0].timestamp,
    unit: 'kg',
  };
}

/**
 * Fetch the latest weight reading
 */
export async function fetchCurrentWeight(tableId = 'TABLE-01'): Promise<WeightRecord> {
  // Simulate minimal async delay (50ms)
  await new Promise((resolve) => setTimeout(resolve, 50));
  const filtered = memoryRecords.filter((r) => r.table_id === tableId);
  return filtered[0] || memoryRecords[0];
}

/**
 * Fetch computed statistics for the weight dashboard
 */
export async function fetchWeightStats(tableId = 'TABLE-01'): Promise<WeightStats> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const filtered = memoryRecords.filter((r) => r.table_id === tableId);
  return calculateStats(filtered);
}

/**
 * Fetch paginated & filtered weight history
 */
export async function fetchWeightHistory(
  tableId = 'TABLE-01',
  options: TableFilterOptions = { searchQuery: '', sortOrder: 'desc', page: 1, pageSize: 10 }
): Promise<{ records: WeightRecord[]; total: number; totalPages: number }> {
  await new Promise((resolve) => setTimeout(resolve, 60));

  let results = memoryRecords.filter((r) => r.table_id === tableId);

  // Search filter (e.g. searching for weight or date)
  if (options.searchQuery.trim()) {
    const q = options.searchQuery.toLowerCase();
    results = results.filter(
      (r) =>
        r.table_id.toLowerCase().includes(q) ||
        r.weight.toString().includes(q) ||
        r.timestamp.toLowerCase().includes(q)
    );
  }

  // Date range filters
  if (options.startDate) {
    results = results.filter((r) => r.timestamp >= options.startDate!);
  }
  if (options.endDate) {
    results = results.filter((r) => r.timestamp <= options.endDate!);
  }

  // Sort
  results.sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return options.sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / options.pageSize));
  const startIndex = (options.page - 1) * options.pageSize;
  const paginated = results.slice(startIndex, startIndex + options.pageSize);

  return {
    records: paginated,
    total,
    totalPages,
  };
}

/**
 * Fetch chart time-series data based on time range filter
 */
export async function fetchChartData(
  tableId = 'TABLE-01',
  range: TimeRangeFilter = '1h'
): Promise<ChartDataPoint[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  const now = new Date('2026-08-19T10:05:01');
  let durationMs = 3600 * 1000; // 1 hour default

  if (range === '6h') durationMs = 6 * 3600 * 1000;
  if (range === '24h') durationMs = 24 * 3600 * 1000;
  if (range === '7d') durationMs = 7 * 24 * 3600 * 1000;

  const cutoffTime = now.getTime() - durationMs;

  const filtered = memoryRecords
    .filter((r) => r.table_id === tableId && new Date(r.timestamp).getTime() >= cutoffTime)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Format chart time labels nicely
  return filtered.map((record) => {
    const d = new Date(record.timestamp);
    let timeLabel = '';

    if (range === '1h' || range === '6h') {
      timeLabel = d.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } else if (range === '24h') {
      timeLabel = d.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      timeLabel = `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}`;
    }

    return {
      timeLabel,
      timestamp: record.timestamp,
      weight: record.weight,
      rawAdc: Math.round(record.weight * 420.5 + 84210),
    };
  });
}

/**
 * Fetch ESP32 hardware and connection status info
 */
export async function fetchDeviceInfo(tableId = 'TABLE-01'): Promise<DeviceInfo> {
  await new Promise((resolve) => setTimeout(resolve, 40));
  const latest = memoryRecords[0];
  const lastTime = latest ? latest.timestamp.split('T')[1] || '10:05:01' : '10:05:01';

  return {
    ...memoryDeviceInfo,
    tableId,
    lastDataReceived: lastTime,
  };
}

/**
 * Subscribe to real-time weight updates.
 * In production with Supabase, this will attach to Supabase Realtime channel.
 */
export function subscribeToWeightUpdates(callback: (record: WeightRecord) => void): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

/**
 * Add a new simulated reading (used by the live test simulator)
 */
export function pushSimulatedReading(weight: number, tableId = 'TABLE-01'): WeightRecord {
  const newId = (memoryRecords[0]?.id || 0) + 1;
  const now = new Date();
  // Keep timestamp format in sync
  const isoTime = now.toISOString().replace('Z', '').split('.')[0];
  const timeFormatted = now.toLocaleTimeString('en-GB');

  const newRecord: WeightRecord = {
    id: newId,
    table_id: tableId,
    weight: Number(Math.max(0, weight).toFixed(1)),
    timestamp: isoTime,
  };

  // Prepend to memory records
  memoryRecords = [newRecord, ...memoryRecords];

  // Update memory device info last time
  memoryDeviceInfo = {
    ...memoryDeviceInfo,
    lastDataReceived: timeFormatted,
    status: 'Online',
  };

  // Notify active listeners
  subscribers.forEach((cb) => cb(newRecord));

  return newRecord;
}

/**
 * Reset memory to initial mock state
 */
export function resetMockData() {
  memoryRecords = [...INITIAL_MOCK_RECORDS];
  memoryDeviceInfo = { ...INITIAL_DEVICE_INFO };
  const latest = memoryRecords[0];
  subscribers.forEach((cb) => cb(latest));
}
