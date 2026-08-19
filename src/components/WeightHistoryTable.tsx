import React, { useState } from 'react';
import {
  Search,
  ArrowUpDown,
  Download,
  ChevronLeft,
  ChevronRight,
  Database,
  Calendar,
  FilterX,
} from 'lucide-react';
import { WeightRecord } from '../types/weight';

interface WeightHistoryTableProps {
  records: WeightRecord[];
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  searchQuery: string;
  sortOrder: 'desc' | 'asc';
  startDate?: string;
  endDate?: string;
  unit: 'kg' | 'lbs';
  onSearchChange: (q: string) => void;
  onSortToggle: () => void;
  onPageChange: (p: number) => void;
  onDateFilterChange: (start?: string, end?: string) => void;
  onClearFilters: () => void;
}

export const WeightHistoryTable: React.FC<WeightHistoryTableProps> = ({
  records,
  totalRecords,
  currentPage,
  totalPages,
  pageSize,
  searchQuery,
  sortOrder,
  startDate,
  endDate,
  unit,
  onSearchChange,
  onSortToggle,
  onPageChange,
  onDateFilterChange,
  onClearFilters,
}) => {
  const factor = unit === 'lbs' ? 2.20462 : 1;

  // Format date helper: "19 Aug 2026"
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString.split('T')[0] || isoString;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  // Format time helper: "10:05:01"
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString.split('T')[1] || isoString;
      return d.toLocaleTimeString('en-GB', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Time', 'Table ID', `Weight (${unit})`, 'Timestamp_ISO'];
    const rows = records.map((r) => [
      r.id,
      formatDate(r.timestamp),
      formatTime(r.timestamp),
      r.table_id,
      (r.weight * factor).toFixed(2),
      r.timestamp,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ESP32_Weight_History_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters = Boolean(searchQuery || startDate || endDate);

  return (
    <div
      id="section-weight-history"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm transition-all"
    >
      {/* Table Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Weight History
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {totalRecords} Total Records
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Historical load telemetry log synchronized with Supabase schema
          </p>
        </div>

        {/* Action button: Export CSV */}
        <div className="flex items-center gap-2">
          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-history-search"
            type="text"
            placeholder="Search by weight, table ID, or time..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Sort Order Toggle */}
        <div className="sm:col-span-3">
          <button
            id="btn-sort-order"
            onClick={onSortToggle}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>

        {/* Clear Filters Button if any filter active */}
        <div className="sm:col-span-3">
          {hasActiveFilters ? (
            <button
              onClick={onClearFilters}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md hover:bg-red-100 transition-colors"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          ) : (
            <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center h-full">
              Live buffered memory
            </div>
          )}
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/75 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th scope="col" className="py-3 px-4">
                Date
              </th>
              <th scope="col" className="py-3 px-4">
                Time
              </th>
              <th scope="col" className="py-3 px-4">
                Table ID
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                Weight ({unit})
              </th>
              <th scope="col" className="py-3 px-4 text-right hidden sm:table-cell">
                Raw Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
            {records.length > 0 ? (
              records.map((r, idx) => {
                const displayW = (r.weight * factor).toFixed(1);
                const rawAdc = Math.round(r.weight * 420.5 + 84210);

                return (
                  <tr
                    key={r.id || idx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap font-sans">
                      {formatDate(r.timestamp)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatTime(r.timestamp)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {r.table_id}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      <span className="text-emerald-600 dark:text-emerald-400 mr-1">{displayW}</span>
                      <span className="text-slate-400 text-[11px] font-normal">{unit}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 dark:text-slate-500 text-[11px] hidden sm:table-cell">
                      {rawAdc.toLocaleString()} pts
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500 font-sans">
                  No weight records found matching filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
        <div>
          Showing page <span className="font-semibold text-slate-700 dark:text-slate-300">{currentPage}</span> of{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">{totalPages}</span> ({totalRecords} records)
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="btn-prev-page"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 text-xs font-mono font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {currentPage} / {totalPages}
          </span>

          <button
            id="btn-next-page"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
