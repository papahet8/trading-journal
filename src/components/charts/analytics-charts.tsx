"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function WeekdayChart({
  data,
}: {
  data: { day: string; totalPnL: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <XAxis dataKey="day" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
        <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
        <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }} />
        <Bar dataKey="totalPnL" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MoodWinRateChart({
  data,
}: {
  data: { mood: number; winRate: number; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <XAxis dataKey="mood" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
        <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
        <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }} />
        <Bar dataKey="winRate" fill="#6366f1" name="Win rate %" />
      </BarChart>
    </ResponsiveContainer>
  );
}
