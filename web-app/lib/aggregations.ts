import type { HistoryRow, Metric, Reading, SensorReading } from "./types";

type NumericField = keyof Pick<SensorReading, "airTemp" | "airMoisture" | "light" | "uvIndex" | "soilMoisture">;

export function latestMetric(readings: SensorReading[], field: NumericField, unit: string): Metric {
  if (readings.length === 0) return { value: 0, unit, status: "ok" };
  return { value: Math.round(readings[0][field]), unit, status: "ok" };
}

export function aggregateByHour(
  readings: SensorReading[],
  field: NumericField,
  { startHour = 9, endHour = 20 } = {},
): Reading[] {
  const today = new Date().toDateString();
  const buckets = new Map<number, number[]>();

  for (const r of readings) {
    const d = new Date(r.createdAt);
    if (d.toDateString() !== today) continue;
    const h = d.getHours();
    if (h < startHour || h > endHour) continue;
    if (!buckets.has(h)) buckets.set(h, []);
    buckets.get(h)!.push(r[field]);
  }

  const result: Reading[] = [];
  for (let h = startHour; h <= endHour; h++) {
    const vals = buckets.get(h);
    const value =
      vals && vals.length > 0
        ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
        : 0;
    result.push({ t: `${h}:00`, value });
  }
  return result;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dayIndex(d: Date): number {
  return d.getDay() === 0 ? 6 : d.getDay() - 1;
}

export function aggregateByDayOfWeek(readings: SensorReading[], field: NumericField): Reading[] {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const buckets = new Map<number, number[]>();

  for (const r of readings) {
    const d = new Date(r.createdAt);
    if (d < cutoff) continue;
    const idx = dayIndex(d);
    if (!buckets.has(idx)) buckets.set(idx, []);
    buckets.get(idx)!.push(r[field]);
  }

  return DAYS.map((t, i) => {
    const vals = buckets.get(i);
    const value =
      vals && vals.length > 0
        ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
        : 0;
    return { t, value };
  });
}

export function toHistoryRows(readings: SensorReading[], limit = 24): HistoryRow[] {
  return readings.slice(0, limit).map((r) => {
    const d = new Date(r.createdAt);
    const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    return {
      time,
      temperature: Math.round(r.airTemp),
      humidity: Math.round(r.soilMoisture),
      light: Math.round(r.light),
    };
  });
}
