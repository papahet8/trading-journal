"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Tag = { id: string; name: string };
type TradeData = {
  id?: string;
  instrument?: string;
  marketType?: string;
  direction?: string;
  entryPrice?: number;
  exitPrice?: number;
  quantity?: number;
  stopLoss?: number | null;
  target?: number | null;
  riskReward?: number | null;
  brokerageCharges?: number;
  setupType?: string | null;
  timeframe?: string | null;
  strategy?: string | null;
  confidence?: number | null;
  executionRating?: number | null;
  tradedAt?: string;
  notes?: string | null;
  tags?: { tag: Tag }[];
  psychology?: {
    moodBefore?: number | null;
    energyBefore?: number | null;
    confidenceBefore?: number | null;
    sleepQuality?: number | null;
    emotionalAfter?: string | null;
    followedRules?: boolean | null;
    mistake?: string | null;
  } | null;
  screenshots?: { phase: string; url: string }[];
};

export function TradeForm({ initial }: { initial?: TradeData }) {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initial?.tags?.map((t) => t.tag.id) ?? []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [screenshots, setScreenshots] = useState<Record<string, string>>({
    BEFORE: initial?.screenshots?.find((s) => s.phase === "BEFORE")?.url ?? "",
    DURING: initial?.screenshots?.find((s) => s.phase === "DURING")?.url ?? "",
    AFTER: initial?.screenshots?.find((s) => s.phase === "AFTER")?.url ?? "",
  });

  const [form, setForm] = useState({
    instrument: initial?.instrument ?? "",
    marketType: initial?.marketType ?? "EQUITY",
    direction: initial?.direction ?? "LONG",
    entryPrice: initial?.entryPrice?.toString() ?? "",
    exitPrice: initial?.exitPrice?.toString() ?? "",
    quantity: initial?.quantity?.toString() ?? "",
    stopLoss: initial?.stopLoss?.toString() ?? "",
    target: initial?.target?.toString() ?? "",
    brokerageCharges: initial?.brokerageCharges?.toString() ?? "0",
    setupType: initial?.setupType ?? "",
    timeframe: initial?.timeframe ?? "",
    strategy: initial?.strategy ?? "",
    confidence: initial?.confidence?.toString() ?? "",
    executionRating: initial?.executionRating?.toString() ?? "",
    tradedAt: initial?.tradedAt
      ? new Date(initial.tradedAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    notes: initial?.notes ?? "",
    moodBefore: initial?.psychology?.moodBefore?.toString() ?? "",
    energyBefore: initial?.psychology?.energyBefore?.toString() ?? "",
    confidenceBefore: initial?.psychology?.confidenceBefore?.toString() ?? "",
    sleepQuality: initial?.psychology?.sleepQuality?.toString() ?? "",
    emotionalAfter: initial?.psychology?.emotionalAfter ?? "",
    followedRules: initial?.psychology?.followedRules ?? true,
    mistake: initial?.psychology?.mistake ?? "",
  });

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then(setTags);
  }, []);

  const update = (key: string, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const uploadScreenshot = async (phase: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) {
      setScreenshots((s) => ({ ...s, [phase]: data.url }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      instrument: form.instrument,
      marketType: form.marketType,
      direction: form.direction,
      entryPrice: Number(form.entryPrice),
      exitPrice: Number(form.exitPrice),
      quantity: Number(form.quantity),
      stopLoss: form.stopLoss ? Number(form.stopLoss) : null,
      target: form.target ? Number(form.target) : null,
      brokerageCharges: Number(form.brokerageCharges) || 0,
      setupType: form.setupType || null,
      timeframe: form.timeframe || null,
      strategy: form.strategy || null,
      confidence: form.confidence ? Number(form.confidence) : null,
      executionRating: form.executionRating ? Number(form.executionRating) : null,
      tradedAt: new Date(form.tradedAt).toISOString(),
      notes: form.notes || null,
      tagIds: selectedTags,
      psychology: {
        moodBefore: form.moodBefore ? Number(form.moodBefore) : null,
        energyBefore: form.energyBefore ? Number(form.energyBefore) : null,
        confidenceBefore: form.confidenceBefore ? Number(form.confidenceBefore) : null,
        sleepQuality: form.sleepQuality ? Number(form.sleepQuality) : null,
        emotionalAfter: form.emotionalAfter || null,
        followedRules: form.followedRules,
        mistake: form.mistake || null,
      },
    };

    const url = initial?.id ? `/api/trades/${initial.id}` : "/api/trades";
    const method = initial?.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ? JSON.stringify(data.error) : "Failed to save");
      setLoading(false);
      return;
    }

    const trade = await res.json();
    for (const [phase, url] of Object.entries(screenshots)) {
      if (url) {
        await fetch(`/api/trades/${trade.id}/screenshots`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phase, url }),
        });
      }
    }

    router.push(`/trades/${trade.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      {error && <p className="text-sm text-red-400">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Trade details</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Instrument / Symbol</Label>
            <Input required value={form.instrument} onChange={(e) => update("instrument", e.target.value)} />
          </div>
          <div>
            <Label>Market type</Label>
            <Select value={form.marketType} onChange={(e) => update("marketType", e.target.value)}>
              <option value="EQUITY">Equity</option>
              <option value="OPTIONS">Options</option>
              <option value="FUTURES">Futures</option>
              <option value="CRYPTO">Crypto</option>
              <option value="FOREX">Forex</option>
            </Select>
          </div>
          <div>
            <Label>Direction</Label>
            <Select value={form.direction} onChange={(e) => update("direction", e.target.value)}>
              <option value="LONG">Long</option>
              <option value="SHORT">Short</option>
            </Select>
          </div>
          <div>
            <Label>Date & time</Label>
            <Input type="datetime-local" value={form.tradedAt} onChange={(e) => update("tradedAt", e.target.value)} />
          </div>
          <div>
            <Label>Entry price</Label>
            <Input type="number" step="any" required value={form.entryPrice} onChange={(e) => update("entryPrice", e.target.value)} />
          </div>
          <div>
            <Label>Exit price</Label>
            <Input type="number" step="any" required value={form.exitPrice} onChange={(e) => update("exitPrice", e.target.value)} />
          </div>
          <div>
            <Label>Quantity</Label>
            <Input type="number" step="any" required value={form.quantity} onChange={(e) => update("quantity", e.target.value)} />
          </div>
          <div>
            <Label>Brokerage & charges</Label>
            <Input type="number" step="any" value={form.brokerageCharges} onChange={(e) => update("brokerageCharges", e.target.value)} />
          </div>
          <div>
            <Label>Stop loss</Label>
            <Input type="number" step="any" value={form.stopLoss} onChange={(e) => update("stopLoss", e.target.value)} />
          </div>
          <div>
            <Label>Target</Label>
            <Input type="number" step="any" value={form.target} onChange={(e) => update("target", e.target.value)} />
          </div>
          <div>
            <Label>Setup type</Label>
            <Input value={form.setupType} onChange={(e) => update("setupType", e.target.value)} />
          </div>
          <div>
            <Label>Timeframe</Label>
            <Input value={form.timeframe} onChange={(e) => update("timeframe", e.target.value)} placeholder="5m, 1h, D" />
          </div>
          <div>
            <Label>Strategy</Label>
            <Input value={form.strategy} onChange={(e) => update("strategy", e.target.value)} />
          </div>
          <div>
            <Label>Confidence (1-10)</Label>
            <Input type="number" min={1} max={10} value={form.confidence} onChange={(e) => update("confidence", e.target.value)} />
          </div>
          <div>
            <Label>Execution rating (1-10)</Label>
            <Input type="number" min={1} max={10} value={form.executionRating} onChange={(e) => update("executionRating", e.target.value)} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Psychology</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Mood before (1-10)</Label>
            <Input type="number" min={1} max={10} value={form.moodBefore} onChange={(e) => update("moodBefore", e.target.value)} />
          </div>
          <div>
            <Label>Energy (1-10)</Label>
            <Input type="number" min={1} max={10} value={form.energyBefore} onChange={(e) => update("energyBefore", e.target.value)} />
          </div>
          <div>
            <Label>Confidence before (1-10)</Label>
            <Input type="number" min={1} max={10} value={form.confidenceBefore} onChange={(e) => update("confidenceBefore", e.target.value)} />
          </div>
          <div>
            <Label>Sleep quality (1-10)</Label>
            <Input type="number" min={1} max={10} value={form.sleepQuality} onChange={(e) => update("sleepQuality", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Emotional state after</Label>
            <Input value={form.emotionalAfter} onChange={(e) => update("emotionalAfter", e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="followedRules"
              checked={form.followedRules}
              onChange={(e) => update("followedRules", e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="followedRules">Followed rules?</Label>
          </div>
          <div className="sm:col-span-2">
            <Label>Mistake (if any)</Label>
            <Textarea value={form.mistake} onChange={(e) => update("mistake", e.target.value)} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className="rounded-full"
            >
              <Badge variant={selectedTags.includes(tag.id) ? "success" : "outline"}>
                {tag.name}
              </Badge>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Screenshots</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["BEFORE", "DURING", "AFTER"] as const).map((phase) => (
            <div key={phase}>
              <Label>{phase}</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadScreenshot(phase, file);
                }}
              />
              {screenshots[phase] && (
                <img src={screenshots[phase]} alt={phase} className="mt-2 h-24 w-full rounded object-cover" />
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Label>Notes</Label>
        <Textarea className="mt-2" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : initial?.id ? "Update trade" : "Save trade"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
