/**
 * src/services/weightService.ts
 * ─────────────────────────────
 * All weight-related data access for the ESP32 Smart Weight Table.
 *
 * Data source: Supabase `weight_data` table
 *   Columns: id (int8), table_id (text), weight (float8), timestamp (timestamptz)
 *
 * Architecture:
 *   UI components → App.tsx → weightService.ts → Supabase → weight_data table
 *
 * ┌──────────────────────────────────────────────┐
 * │  FUTURE – Device Status derivation           │
 * │                                              │
 * │  Once ESP32 is connected:                    │
 * │    latest row timestamp < 60 s  → Online     │
 * │    latest row timestamp > 60 s  → Offline    │
 * │    no rows at all               → Not Connected │
 * └──────────────────────────────────────────────┘
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  WeightRecord,
  WeightStats,
  DeviceInfo,
  TimeRangeFilter,
  ChartDataPoint,
  TableFilterOptions,
} from '../types/weight';
import { INITIAL_DEVICE_INFO } from '../data/mockData';

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Map raw Supabase row → typed WeightRecord */
function toRecord(row: Record<string, unknown>): WeightRecord {
  return {
    id: row.id as number,
    table_id: row.table_id as string,
    weight: parseFloat(String(row.weight)),
    timestamp: row.timestamp as string,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats helper (pure, no IO)
// ─────────────────────────────────────────────────────────────────────────────

export function calculateStats(records: WeightRecord[]): WeightStats {
  if (!records.length) {
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
  const weights = records.map((r) => r.weight);

  return {
    currentWeight: +current.toFixed(1),
    previousWeight: +previous.toFixed(1),
    weightDelta: +(current - previous).toFixed(2),
    maxWeight: +Math.max(...weights).toFixed(1),
    minWeight: +Math.min(...weights).toFixed(1),
    avgWeight: +(weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1),
    totalReadings: records.length,
    lastUpdated: records[0].timestamp,
    unit: 'kg',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Latest weight reading
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchCurrentWeight(tableId = 'TABLE-01'): Promise<WeightRecord> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase URL and Publishable Key are missing from your deployment environment settings.');
  }

  const { data, error } = await supabase
    .from('weight_data')
    .select('*')
    .eq('table_id', tableId)
    .order('timestamp', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Database error (fetchCurrentWeight): ${error.message} (${error.code})`);
  }

  if (!data || data.length === 0) {
    return { id: 0, table_id: tableId, weight: 0, timestamp: new Date().toISOString() };
  }

  return toRecord(data[0] as Record<string, unknown>);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Dashboard statistics (derived from last 200 rows)
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchWeightStats(tableId = 'TABLE-01'): Promise<WeightStats> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase URL and Publishable Key are missing from your deployment environment settings.');
  }

  const { data, error } = await supabase
    .from('weight_data')
    .select('*')
    .eq('table_id', tableId)
    .order('timestamp', { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(`Database error (fetchWeightStats): ${error.message} (${error.code})`);
  }

  if (!data || data.length === 0) {
    return calculateStats([]);
  }

  return calculateStats((data as Record<string, unknown>[]).map(toRecord));
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Paginated + filtered weight history
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchWeightHistory(
  tableId = 'TABLE-01',
  options: TableFilterOptions = { searchQuery: '', sortOrder: 'desc', page: 1, pageSize: 10 }
): Promise<{ records: WeightRecord[]; total: number; totalPages: number }> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase URL and Publishable Key are missing from your deployment environment settings.');
  }

  const ascending = options.sortOrder === 'asc';
  const from = (options.page - 1) * options.pageSize;
  const to = from + options.pageSize - 1;

  let query = supabase
    .from('weight_data')
    .select('*', { count: 'exact' })
    .eq('table_id', tableId)
    .order('timestamp', { ascending });

  if (options.startDate) query = query.gte('timestamp', options.startDate);
  if (options.endDate) query = query.lte('timestamp', options.endDate);

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Database error (fetchWeightHistory): ${error.message} (${error.code})`);
  }

  if (!data) {
    return { records: [], total: 0, totalPages: 1 };
  }

  let records = (data as Record<string, unknown>[]).map(toRecord);

  // Client-side text search (weight value or timestamp string)
  if (options.searchQuery.trim()) {
    const q = options.searchQuery.toLowerCase();
    records = records.filter(
      (r) =>
        r.table_id.toLowerCase().includes(q) ||
        String(r.weight).includes(q) ||
        r.timestamp.toLowerCase().includes(q)
    );
  }

  const total = count ?? records.length;
  const totalPages = Math.max(1, Math.ceil(total / options.pageSize));

  return { records, total, totalPages };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Chart time-series data
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchChartData(
  tableId = 'TABLE-01',
  range: TimeRangeFilter = '1h'
): Promise<ChartDataPoint[]> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase URL and Publishable Key are missing from your deployment environment settings.');
  }

  const msMap: Record<TimeRangeFilter, number> = {
    '1h': 1 * 3600_000,
    '6h': 6 * 3600_000,
    '24h': 24 * 3600_000,
    '7d': 7 * 24 * 3600_000,
  };

  const cutoff = new Date(Date.now() - msMap[range]).toISOString();

  const { data, error } = await supabase
    .from('weight_data')
    .select('id, table_id, weight, timestamp')
    .eq('table_id', tableId)
    .gte('timestamp', cutoff)
    .order('timestamp', { ascending: true });

  if (error) {
    throw new Error(`Database error (fetchChartData): ${error.message} (${error.code})`);
  }

  if (!data) {
    return [];
  }

  return (data as Record<string, unknown>[]).map(toRecord).map((r) => {
    const d = new Date(r.timestamp);
    let timeLabel: string;

    if (range === '1h' || range === '6h') {
      timeLabel = d.toLocaleTimeString('en-US', {
        hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
    } else if (range === '24h') {
      timeLabel = d.toLocaleTimeString('en-US', {
        hour12: false, hour: '2-digit', minute: '2-digit',
      });
    } else {
      timeLabel =
        d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
        ' ' +
        d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    }

    return {
      timeLabel,
      timestamp: r.timestamp,
      weight: r.weight,
      rawAdc: Math.round(r.weight * 420.5 + 84210), // approximation for display only
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Device info
//    Static hardware specs come from mockData (they don't change).
//    lastDataReceived is read from the latest Supabase row.
//    Status is kept as 'Not Connected' until real timestamp-based logic is added.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derives a human-readable device status from the latest timestamp.
 *
 * CURRENT BEHAVIOUR: Always returns 'Not Connected'.
 * The presence of database rows does NOT prove the physical ESP32 is running —
 * those rows may have been inserted manually for testing.
 *
 * TODO: Once the ESP32 is live, replace this with timestamp-based logic:
 *   < 60 s ago  → 'Online'
 *   > 60 s ago  → 'Offline'
 *   no rows     → 'Not Connected'
 */
function deriveDeviceStatus(
  _latestTimestamp: string | null
): DeviceInfo['status'] {
  // Always report Not Connected until real ESP32 timestamp logic is implemented.
  return 'Not Connected';
}

export async function fetchDeviceInfo(tableId = 'TABLE-01'): Promise<DeviceInfo> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase URL and Publishable Key are missing from your deployment environment settings.');
  }

  const { data, error } = await supabase
    .from('weight_data')
    .select('timestamp')
    .eq('table_id', tableId)
    .order('timestamp', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Database error (fetchDeviceInfo): ${error.message} (${error.code})`);
  }

  const latestTimestamp = data && data.length > 0 ? (data[0].timestamp as string) : null;
  const status = deriveDeviceStatus(latestTimestamp);

  const lastDataReceived =
    latestTimestamp
      ? new Date(latestTimestamp).toLocaleTimeString('en-GB')
      : '--:--:--';

  return {
    ...INITIAL_DEVICE_INFO,
    tableId,
    status,
    lastDataReceived,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Realtime subscription
//    Notifies all listeners whenever a new row is INSERTed into weight_data.
//    The callback fires with the new WeightRecord; callers re-fetch their data.
// ─────────────────────────────────────────────────────────────────────────────

type WeightCallback = (record: WeightRecord) => void;
const subscribers = new Set<WeightCallback>();
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

function ensureRealtimeChannel() {
  if (realtimeChannel) return;

  realtimeChannel = supabase
    .channel('weight_data_inserts')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'weight_data' },
      (payload) => {
        const record = toRecord(payload.new as Record<string, unknown>);
        subscribers.forEach((cb) => cb(record));
      }
    )
    .subscribe((status, err) => {
      if (err) console.error('[Supabase Realtime] error:', err);
      else console.log('[Supabase Realtime] status:', status);
    });
}

/**
 * Subscribe to live weight_data inserts.
 * Returns an unsubscribe function — call it on component unmount.
 */
export function subscribeToWeightUpdates(callback: WeightCallback): () => void {
  if (!isSupabaseConfigured) {
    return () => { };
  }

  subscribers.add(callback);
  ensureRealtimeChannel();

  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0 && realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Simulator — inserts a test row directly into Supabase
//    Used by the Live Simulator toolbar in the UI.
// ─────────────────────────────────────────────────────────────────────────────

export async function pushSimulatedReading(
  weight: number,
  tableId = 'TABLE-01'
): Promise<WeightRecord> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase URL and Publishable Key are missing from your deployment environment settings.');
  }

  const { data, error } = await supabase
    .from('weight_data')
    .insert({ table_id: tableId, weight: +Math.max(0, weight).toFixed(1) })
    .select()
    .single();

  if (error || !data) {
    console.error('[weightService] pushSimulatedReading:', error?.message);
    return { id: 0, table_id: tableId, weight, timestamp: new Date().toISOString() };
  }

  return toRecord(data as Record<string, unknown>);
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. resetMockData — no-op in Supabase mode
//    (Kept so App.tsx import doesn't break; safe to remove later)
// ─────────────────────────────────────────────────────────────────────────────

export function resetMockData(): void {
  console.info(
    '[weightService] resetMockData() is a no-op in Supabase mode. ' +
    'Delete rows from the Supabase dashboard if you need to reset.'
  );
}
