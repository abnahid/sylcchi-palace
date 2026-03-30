"use client";

import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  rowKey: (row: T) => string;
  footer?: React.ReactNode;
}

export default function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = "No data found",
  onRowClick,
  rowKey,
  footer,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                {columns.map((col) => (
                  <th key={col.key} className={cn("px-6 py-4", col.className)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 flex min-h-50 items-center justify-center">
        <p className="text-sm text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-semibold">
              {columns.map((col) => (
                <th key={col.key} className={cn("px-6 py-4", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            {data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "group hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-0",
                  onRowClick && "cursor-pointer",
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-6 py-4", col.className)}>
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
}
