"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

type Trade = {
  id: string;
  instrument: string;
  setupType: string | null;
  screenshots: { phase: string; url: string }[];
  tags: { tag: { name: string } }[];
};

export function CompareView({ trades }: { trades: Trade[] }) {
  const withScreenshots = trades.filter((t) => t.screenshots.length > 0);
  const [leftId, setLeftId] = useState(withScreenshots[0]?.id ?? "");
  const [rightId, setRightId] = useState(withScreenshots[1]?.id ?? "");

  const left = withScreenshots.find((t) => t.id === leftId);
  const right = withScreenshots.find((t) => t.id === rightId);

  if (withScreenshots.length < 2) {
    return (
      <p className="text-zinc-500">
        Add screenshots to at least two trades to compare setups.
      </p>
    );
  }

  const renderTrade = (trade: Trade | undefined, label: string) => (
    <Card className="flex-1">
      <p className="mb-2 text-sm font-medium text-zinc-400">{label}</p>
      {trade ? (
        <>
          <p className="font-semibold">{trade.instrument}</p>
          <p className="text-sm text-zinc-500">{trade.setupType ?? "No setup"}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {trade.tags.map((t) => (
              <span key={t.tag.name} className="rounded bg-zinc-800 px-2 py-0.5 text-xs">
                {t.tag.name}
              </span>
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            {trade.screenshots.map((s) => (
              <div key={s.phase}>
                <p className="text-xs text-zinc-500">{s.phase}</p>
                <img src={s.url} alt={s.phase} className="rounded border border-zinc-800" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-zinc-500">Select a trade</p>
      )}
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="text-sm text-zinc-400">Left trade</label>
          <Select value={leftId} onChange={(e) => setLeftId(e.target.value)} className="mt-1 min-w-[200px]">
            {withScreenshots.map((t) => (
              <option key={t.id} value={t.id}>
                {t.instrument} — {t.setupType ?? "trade"}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-sm text-zinc-400">Right trade</label>
          <Select value={rightId} onChange={(e) => setRightId(e.target.value)} className="mt-1 min-w-[200px]">
            {withScreenshots.map((t) => (
              <option key={t.id} value={t.id}>
                {t.instrument} — {t.setupType ?? "trade"}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row">
        {renderTrade(left, "Trade A")}
        {renderTrade(right, "Trade B")}
      </div>
    </div>
  );
}
