import {
  WeightRecord,
  WeightStats,
  DeviceInfo,
  TimeRangeFilter,
  ChartDataPoint,
  TableFilterOptions,
} from '../types/weight';
import { supabase } from './supabaseClient';
import { INITIAL_DEVICE_INFO } from '../data/mockData';

/**
 * ==============================================================================
 * ESP32 Smart Weight Table — Supabase Live Data Service
 * ==============================================================================
 * All functions now query the `weight_data` table in Supabase.
 * Real-time updates are delivered via Supabase Realtime (Postgres changes).
 * ==============================================================================
 */

// ---------------------------------------------------------------------------
// Subscribers for real-time weight updates
// ---------------------------------------------------------------------------
const subscribers: Set<(record: WeightRecord) => void> = new Set();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a raw Supabase row to the WeightRecord shape */
function rowToRecord(row: Record<string, unknown>): WeightRecord {
  return {
    id: row.id as number,
    table_id: row.table_id as string,
    weight: parseFloat(row.weight as string),
    timestamp: row.timestamp as string,
  };
}

/** Compute stats from an array of WeightRecord */
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

// ---------------------------------------------------------------------------
// Fetch latest single reading
// ---------------------------------------------------------------------------
export async function fetchCurrentWeight(tableId = 'TABLE-01'): Promise<WeightRecord> {
  const { data, error } = await supabase
    .from('weight_data')
    .select('*')
    .eq('table_id', tableId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    console.warn('[weightService] fetchCurrentWeight error:', error?.message);
    return { id: 0, table_id: tableId, weight: 0, timestamp: new Date().toISOString() };
  }

  return rowToRecord(data);
}

// ---------------------------------------------------------------------------
// Fetch dashboard statistics
// ---------------------------------------------------------------------------
export async function fetchWeightStats(tableId = 'TABLE-01'): Promise<WeightStats> {
  const { data, error } = await supabase
    .from('weight_data')
    .select('*')
    .eq('table_id', tableId)
    .order('timestamp', { ascending: false })
    .limit(200);

  if (error || !data) {
    console.warn('[weightService] fetchWeightStats error:', error?.message);
    return calculateStats([]);
  }

  return calculateStats(data.map(rowToRecord));
}

// ---------------------------------------------------------------------------
// Fetch paginated + filtered weight history
// ---------------------------------------------------------------------------
export async function fetchWeightHistory(
  tableId = 'TABLE-01',
  options: TableFilterOptions = { searchQuery: '', sortOrder: 'desc', page: 1, pageSize: 10 }
): Promise<{ records: WeightRecord[]; total: number; totalPages: number }> {
  const ascending = options.sortOrder === 'asc';

  let query = supabase
    .from('weight_data')
    .select('*', { count: 'exact' })
    .eq('table_id', tableId)
    .order('timestamp', { ascending });

  if (options.startDate) query = query.gte('timestamp', options.startDate);
  if (options.endDate) query = query.lte('timestamp', options.endDate);

  // Pagination
  const from = (options.page - 1) * options.pageSize;
  const to = from + options.pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error || !data) {
    console.warn('[weightService] fetchWeightHistory error:', error?.message);
    return { records: [], total: 0, totalPages: 1 };
  }

  let records = data.map(rowToRecord);

  // Client-side text search (weight / timestamp text match)
  if (options.searchQuery.trim()) {
    const q = options.searchQuery.toLowerCase();
    records = records.filter(
      (r) =>
        r.table_id.toLowerCase().includes(q) ||
        r.weight.toString().includes(q) ||
        r.timestamp.toLowerCase().includes(q)
    );
  }

  const total = count ?? records.length;
  const totalPages = Math.max(1, Math.ceil(total / options.pageSize));

  return { records, total, totalPages };
}

// ---------------------------------------------------------------------------
// Fetch chart time-series data
// ---------------------------------------------------------------------------
export async function fetchChartData(
  tableId = 'TABLE-01',
  range: TimeRangeFilter = '1h'
): Promise<ChartDataPoint[]> {
  const durationMap: Record<TimeRangeFilter, number> = {
    '1h': 1 * 3600 * 1000,
    '6h': 6 * 3600 * 1000,
    '24h': 24 * 3600 * 1000,
    '7d': 7 * 24 * 3600 * 1000,
  };

  const cutoff = new Date(Date.now() - durationMap[range]).toISOString();

  const { data, error } = await supabase
    .from('weight_data')
    .select('*')
    .eq('table_id', tableId)
    .gte('timestamp', cutoff)
    .order('timestamp', { ascending: true });

  if (error || !data) {
    console.warn('[weightService] fetchChartData error:', error?.message);
    return [];
  }

  return data.map(rowToRecord).map((record) => {
    const d = new Date(record.timestamp);
    let timeLabel = '';

    if (range === '1h' || range === '6h') {
      timeLabel = d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } else if (range === '24h') {
      timeLabel = d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
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

// ---------------------------------------------------------------------------
// Device info (static + enriched from latest reading)
// ---------------------------------------------------------------------------
export async function fetchDeviceInfo(tableId = 'TABLE-01'): Promise<DeviceInfo> {
  const { data } = await supabase
    .from('weight_data')
    .select('timestamp')
    .eq('table_id', tableId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  const lastTime = data
    ? new Date(data.timestamp as string).toLocaleTimeString('en-GB')
    : '--:--:--';

  return {
    ...INITIAL_DEVICE_INFO,
    tableId,
    lastDataReceived: lastTime,
  };
}

// ---------------------------------------------------------------------------
// Real-time subscription via Supabase Realtime
// ---------------------------------------------------------------------------
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

export function subscribeToWeightUpdates(callback: (record: WeightRecord) => void): () => void {
  subscribers.add(callback);

  // Only create the channel once
  if (!realtimeChannel) {
    realtimeChannel = supabase
      .channel('realtime:weight_data')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'weight_data' },
        (payload) => {
          const record = rowToRecord(payload.new as Record<string, unknown>);
          subscribers.forEach((cb) => cb(record));
        }
      )
      .subscribe((status) => {
        console.log('[Supabase Realtime] status:', status);
      });
  }

  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0 && realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
  };
}

// ---------------------------------------------------------------------------
// Push a simulated reading directly to Supabase (used by test simulator)
// ---------------------------------------------------------------------------
export async function pushSimulatedReading(weight: number, tableId = 'TABLE-01'): Promise<WeightRecord> {
  const { data, error } = await supabase
    .from('weight_data')
    .insert({ table_id: tableId, weight: Number(Math.max(0, weight).toFixed(1)) })
    .select()
    .single();

  if (error || !data) {
    console.error('[weightService] pushSimulatedReading error:', error?.message);
    return { id: 0, table_id: tableId, weight, timestamp: new Date().toISOString() };
  }

  return rowToRecord(data);
}

// ---------------------------------------------------------------------------
// Reset — clears mock; in Supabase mode this is a no-op (data lives in DB)
// ---------------------------------------------------------------------------
export function resetMockData() {
  console.info('[weightService] resetMockData is a no-op in Supabase mode.');
}
