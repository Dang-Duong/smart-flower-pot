"use client";

import { Suspense, useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RangeDropdownClient } from "@/components/charts/range-dropdown-client";
import type { Reading } from "@/lib/types";

interface AreaChartCardProps {
  title: string;
  data: Reading[];
  highlightT?: string;
  showRangeDropdown?: boolean;
  defaultRange?: string;
  rangeParamKey?: string;
  unit?: string;
}

export function AreaChartCard({
  title,
  data,
  highlightT,
  showRangeDropdown = true,
  defaultRange = "weekly",
  rangeParamKey,
  unit = "",
}: AreaChartCardProps) {
  const uid = useId();
  const gradientId = `gradient-${uid}`;
  const highlightValue = data.find((d) => d.t === highlightT)?.value;

  return (
    <Card className="bg-card text-card-foreground rounded-2xl h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
        <CardTitle className="text-base font-black">{title}</CardTitle>
        {showRangeDropdown && rangeParamKey && (
          <Suspense fallback={<div className="w-28 h-8 bg-gray-200 rounded-lg animate-pulse" />}>
            <RangeDropdownClient paramKey={rangeParamKey} defaultValue={defaultRange} />
          </Suspense>
        )}
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <div className="bg-white rounded-xl px-2 pt-2 pb-0">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} margin={{ top: 24, right: 16, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818CF8" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#818CF8" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis
                dataKey="t"
                tick={{ fontSize: 11, fill: "#888" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#333",
                }}
                formatter={(v) => [`${v}${unit}`, title]}
              />
              {highlightT && (
                <ReferenceLine
                  x={highlightT}
                  stroke="#6366F1"
                  strokeWidth={2}
                  label={{
                    value: highlightValue != null ? `${highlightValue}${unit}` : highlightT,
                    position: "top",
                    fill: "#6366F1",
                    fontSize: 11,
                    fontWeight: "bold",
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="value"
                stroke="#6366F1"
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 5, fill: "#fff", stroke: "#6366F1", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
