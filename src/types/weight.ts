/**
 * Core type definitions for ESP32 Smart Weight Table
 * Designed for direct mapping to future Supabase `weight_data` table schema.
 */

export interface WeightRecord {
  id: number;
  table_id: string;
  weight: number; // in kilograms (kg)
  timestamp: string; // ISO-8601 string or format "2026-08-19T10:05:01"
}

export interface WeightStats {
  currentWeight: number;
  previousWeight: number;
  weightDelta: number;
  maxWeight: number;
  minWeight: number;
  avgWeight: number;
  totalReadings: number;
  lastUpdated: string;
  unit: 'kg' | 'lbs';
}

export interface DeviceInfo {
  deviceId: string;
  tableId: string;
  sensor: string;
  connection: string;
  // 'Not Connected' = ESP32 not yet paired; 'Online'/'Offline' derived from Supabase timestamp in future
  status: 'Online' | 'Offline' | 'Calibrating' | 'Not Connected' | 'Data received';
  lastDataReceived: string;
  ipAddress: string;
  wifiSsid: string;
  signalStrengthDbm: number;
  samplingRateHz: number;
  tareOffset: number;
  calibrationFactor: number;
  uptimeSeconds: number;
}

export type TimeRangeFilter = '1h' | '6h' | '24h' | '7d';

export interface ChartDataPoint {
  timeLabel: string;
  timestamp: string;
  weight: number;
  rawAdc?: number;
}

export interface TableFilterOptions {
  searchQuery: string;
  startDate?: string;
  endDate?: string;
  sortOrder: 'desc' | 'asc';
  page: number;
  pageSize: number;
}
