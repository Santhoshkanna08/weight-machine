import { WeightRecord, DeviceInfo } from '../types/weight';

/**
 * Initial mock dataset representing data from the ESP32 HX711 Load Cell sensor.
 * Future Supabase table: `weight_data`
 * Schema: id (int), table_id (text), weight (float8), timestamp (timestamptz)
 */

export const INITIAL_DEVICE_INFO: DeviceInfo = {
  deviceId: 'ESP32-TABLE-01',
  tableId: 'TABLE-01',
  sensor: 'Load Cell + HX711 (24-bit ADC)',
  connection: 'Wi-Fi 802.11 b/g/n (2.4 GHz)',
  status: 'Online',
  lastDataReceived: '10:05:01',
  ipAddress: '192.168.1.142',
  wifiSsid: 'IoT_Lab_Network_5G',
  signalStrengthDbm: -56,
  samplingRateHz: 10,
  tareOffset: 84210,
  calibrationFactor: 420.5,
  uptimeSeconds: 14280,
};

// Generate realistic mock records leading up to 2026-08-19 10:05:01
export function generateMockHistory(): WeightRecord[] {
  const baseDate = new Date('2026-08-19T10:05:01');
  const records: WeightRecord[] = [];

  // Base profile of weight readings simulating items placed on, moved, or lifted from table
  // Most recent readings:
  const recentProfiles = [
    { offsetSec: 0, weight: 23.6 },
    { offsetSec: 3, weight: 22.8 },
    { offsetSec: 6, weight: 21.9 },
    { offsetSec: 9, weight: 23.4 },
    { offsetSec: 12, weight: 23.6 },
    { offsetSec: 15, weight: 23.5 },
    { offsetSec: 20, weight: 21.4 },
    { offsetSec: 30, weight: 19.2 },
    { offsetSec: 45, weight: 18.5 },
    { offsetSec: 60, weight: 18.2 },
    { offsetSec: 90, weight: 15.0 },
    { offsetSec: 120, weight: 12.4 },
    { offsetSec: 180, weight: 8.5 },
    { offsetSec: 240, weight: 5.4 },
    { offsetSec: 300, weight: 14.8 },
    { offsetSec: 360, weight: 28.5 },
    { offsetSec: 420, weight: 34.2 },
    { offsetSec: 480, weight: 42.1 },
    { offsetSec: 540, weight: 48.2 },
    { offsetSec: 600, weight: 45.0 },
    { offsetSec: 720, weight: 38.6 },
    { offsetSec: 900, weight: 29.3 },
    { offsetSec: 1200, weight: 25.1 },
    { offsetSec: 1800, weight: 22.4 },
    { offsetSec: 2400, weight: 20.0 },
    { offsetSec: 3600, weight: 18.5 }, // 1 hr ago
  ];

  let idCounter = 100;

  // Add fine-grained recent points
  recentProfiles.forEach((item) => {
    const d = new Date(baseDate.getTime() - item.offsetSec * 1000);
    records.push({
      id: idCounter--,
      table_id: 'TABLE-01',
      weight: item.weight,
      timestamp: d.toISOString().replace('Z', '').split('.')[0],
    });
  });

  // Add historical points spanning 7 days for range filtering
  const hourlySteps = [
    { hoursAgo: 2, weight: 19.8 },
    { hoursAgo: 3, weight: 16.4 },
    { hoursAgo: 4, weight: 24.1 },
    { hoursAgo: 5, weight: 31.0 },
    { hoursAgo: 6, weight: 27.5 },
    { hoursAgo: 8, weight: 14.2 },
    { hoursAgo: 10, weight: 9.8 },
    { hoursAgo: 12, weight: 21.0 },
    { hoursAgo: 16, weight: 35.6 },
    { hoursAgo: 20, weight: 41.2 },
    { hoursAgo: 24, weight: 26.8 }, // 1 day ago
    { hoursAgo: 36, weight: 18.9 },
    { hoursAgo: 48, weight: 22.3 }, // 2 days ago
    { hoursAgo: 60, weight: 30.5 },
    { hoursAgo: 72, weight: 15.7 }, // 3 days ago
    { hoursAgo: 96, weight: 28.4 }, // 4 days ago
    { hoursAgo: 120, weight: 33.1 }, // 5 days ago
    { hoursAgo: 144, weight: 19.0 }, // 6 days ago
    { hoursAgo: 168, weight: 24.5 }, // 7 days ago
  ];

  hourlySteps.forEach((step) => {
    const d = new Date(baseDate.getTime() - step.hoursAgo * 3600 * 1000);
    records.push({
      id: idCounter--,
      table_id: 'TABLE-01',
      weight: step.weight,
      timestamp: d.toISOString().replace('Z', '').split('.')[0],
    });
  });

  // Sort descending by timestamp initially
  return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const INITIAL_MOCK_RECORDS = generateMockHistory();
