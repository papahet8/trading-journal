"use client";

import { cn } from "@/lib/utils";

type HeatmapCell = { date: string; value: number; level: number };

export function PnlHeatmap({ data, year }: { data: HeatmapCell[]; year: number }) {
  const weeks: HeatmapCell[][] = [];
  let currentWeek: HeatmapCell[] = [];

  for (const cell of data) {
    const day = new Date(cell.date).getDay();
    if (day === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(cell);
  }
  if (currentWeek.length) weeks.push(currentWeek);

  return (
    <div className="overflow-x-auto">
      <p className="mb-2 text-sm text-zinc-400">{year} trading activity</p>
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((cell) => (
              <div
                key={cell.date}
                title={`${cell.date}: ${cell.value.toFixed(2)}`}
                className={cn(
                  "h-3 w-3 rounded-sm",
                  cell.level === 0 && "bg-zinc-800",
                  cell.level === 1 && "bg-emerald-600",
                  cell.level === -1 && "bg-red-600",
                  cell.level === 0.5 && "bg-zinc-600"
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-emerald-600" /> Profit
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-red-600" /> Loss
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-zinc-800" /> No trade
        </span>
      </div>
    </div>
  );
}
