import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill";
import type { MetricStatus } from "@/lib/types";

interface MetricCardProps {
  label: string;
  value: number;
  unit: string;
  status: MetricStatus;
}

export function MetricCard({ label, value, unit, status }: MetricCardProps) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 p-4 sm:p-6 bg-card text-card-foreground rounded-2xl">
      <p className="text-xs font-bold uppercase tracking-widest text-card-foreground/60">{label}</p>
      <p className="font-black text-card-foreground leading-none">
        <span className="text-4xl">{value}</span>
        <span className="text-xl ml-1">{unit}</span>
      </p>
      <StatusPill status={status} />
    </Card>
  );
}
