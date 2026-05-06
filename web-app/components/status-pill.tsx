import { cn } from "@/lib/utils";
import type { MetricStatus } from "@/lib/types";

interface StatusPillProps {
  status: MetricStatus;
  className?: string;
}

const labelMap: Record<MetricStatus, string> = {
  ok: "Ok",
  warn: "Warning",
  error: "Error",
  nodata: "No data",
};

const colorMap: Record<MetricStatus, string> = {
  ok: "bg-[#7DC97F] text-black",
  warn: "bg-[#F5A623] text-black",
  error: "bg-red-500 text-white",
  nodata: "bg-gray-300 text-gray-600",
};

export function StatusPill({ status, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-bold",
        colorMap[status],
        className
      )}
    >
      {labelMap[status]}
    </span>
  );
}
