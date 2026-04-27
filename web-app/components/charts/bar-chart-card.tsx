"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Reading } from "@/lib/types";

interface BarChartCardProps {
  title: string;
  data: Reading[];
  unit?: string;
}

export function BarChartCard({ title, data, unit = "" }: BarChartCardProps) {
  return (
    <Card className="bg-card text-card-foreground rounded-2xl h-full">
      {title && (
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-base font-black">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={`px-2 pb-4 ${!title ? "pt-4" : ""}`}>
        <div className="bg-white rounded-xl px-2 pt-2 pb-0">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} margin={{ top: 5, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
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
                formatter={(v) => [`${v}${unit}`, title || "Value"]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={index} fill="#818CF8" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
