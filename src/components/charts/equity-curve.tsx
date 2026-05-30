"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

type Point = { date: string; equity: number };

export function EquityCurve({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">No trades yet</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
        <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid #3f3f46",
            borderRadius: 8,
          }}
          formatter={(v) => [formatCurrency(Number(v)), "Equity"]}
        />
        <Line
          type="monotone"
          dataKey="equity"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
