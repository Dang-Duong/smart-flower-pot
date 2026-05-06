import type { MetricStatus } from "./types";

type NumericField = "airTemp" | "airMoisture" | "light" | "uvIndex" | "soilMoisture";

const THRESHOLDS: Record<NumericField, { ok: [number, number]; warn: [number, number] }> = {
  airTemp:      { ok: [18, 28],     warn: [12, 33] },
  airMoisture:  { ok: [40, 70],     warn: [30, 80] },
  soilMoisture: { ok: [40, 70],     warn: [25, 80] },
  light:        { ok: [200, 80000], warn: [50, 100000] },
  uvIndex:      { ok: [0, 6],       warn: [0, 8] },
};

export function statusFor(field: NumericField, value: number): MetricStatus {
  const t = THRESHOLDS[field];
  if (value >= t.ok[0] && value <= t.ok[1]) return "ok";
  if (value >= t.warn[0] && value <= t.warn[1]) return "warn";
  return "error";
}

export { THRESHOLDS };
export type { NumericField };
