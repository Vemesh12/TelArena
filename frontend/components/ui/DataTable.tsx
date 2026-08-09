"use client";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onExportCsv?: () => void;
  title?: string;
}

export function DataTable<T>({
  columns, data, loading, emptyMessage = "No data found", className, onExportCsv, title,
}: DataTableProps<T>) {
  return (
    <div className={cn("card-angular overflow-hidden", className)}>

      {(title || onExportCsv) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          {title && <h3 className="font-display text-sm font-semibold text-text-primary">{title}</h3>}
          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="flex items-center gap-1.5 font-body text-sm font-medium text-accent-cyan hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          )}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={cn(col.width && `w-[${col.width}]`, col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((_, j) => (
                    <td key={j}>
                      <div className="h-4 bg-bg-elevated animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-text-muted font-body text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className={cn(
                  i === 0 && "rank-1",
                  i === 1 && "rank-2",
                  i === 2 && "rank-3",
                )}>
                  {columns.map((col, j) => (
                    <td key={j} className={col.className}>
                      {col.render ? col.render(row, i) : String((row as any)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
