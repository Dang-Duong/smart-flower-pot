import type { HistoryRow } from "@/lib/types";

interface HistoryTableProps {
  rows: HistoryRow[];
}

export function HistoryTable({ rows }: HistoryTableProps) {
  return (
    <div className="flex flex-col w-full">
      <div className="grid grid-cols-4 px-5 py-2.5 border-b border-gray-200 sticky top-0 bg-card z-10">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Time</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-400">Temp</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">Humidity</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-yellow-500">Light</span>
      </div>
      {rows.map((row, i) => (
        <div
          key={i}
          style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}
          className="grid grid-cols-4 px-5 py-2.5 border-b border-gray-100 last:border-0 hover:bg-black/[0.03] transition-colors animate-in fade-in slide-in-from-top-1 duration-300 [animation-fill-mode:both]"
        >
          <span className="text-xs font-mono text-gray-400">{row.time}</span>
          <span className="text-xs font-mono font-semibold text-orange-500">{row.temperature} °C</span>
          <span className="text-xs font-mono font-semibold text-blue-500">{row.humidity} %</span>
          <span className="text-xs font-mono font-semibold text-yellow-600">{row.light} lx</span>
        </div>
      ))}
    </div>
  );
}
