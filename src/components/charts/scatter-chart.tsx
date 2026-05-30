"use client";

import {
  Scatter,
  ScatterChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

type Point = { x: number; y: number; label?: string };

export function SimpleScatter({
  data,
  xLabel,
  yLabel,
}: {
  data: Point[];
  xLabel: string;
  yLabel: string;
}) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-500">Not enough data</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ScatterChart>
        <XAxis type="number" dataKey="x" name={xLabel} tick={{ fill: "#a1a1aa", fontSize: 11 }} />
        <YAxis type="number" dataKey="y" name={yLabel} tick={{ fill: "#a1a1aa", fontSize: 11 }} />
        <ZAxis range={[40, 40]} />
        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid #3f3f46",
            borderRadius: 8,
          }}
        />
        <Scatter data={data} fill="#10b981" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
