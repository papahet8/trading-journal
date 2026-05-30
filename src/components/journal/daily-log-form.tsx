"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

type DailyLogData = {
  date: string;
  wakeUpTime?: string | null;
  gym?: boolean;
  meditation?: boolean;
  reading?: boolean;
  deepWorkMinutes?: number | null;
  screenTimeMinutes?: number | null;
  wentWell?: string | null;
  wentWrong?: string | null;
  marketObservations?: string | null;
  lessonsLearned?: string | null;
  journalCompleted?: boolean;
};

export function DailyLogForm({ initial }: { initial?: DailyLogData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: initial?.date ?? new Date().toISOString().slice(0, 10),
    wakeUpTime: initial?.wakeUpTime ?? "",
    gym: initial?.gym ?? false,
    meditation: initial?.meditation ?? false,
    reading: initial?.reading ?? false,
    deepWorkMinutes: initial?.deepWorkMinutes?.toString() ?? "",
    screenTimeMinutes: initial?.screenTimeMinutes?.toString() ?? "",
    wentWell: initial?.wentWell ?? "",
    wentWrong: initial?.wentWrong ?? "",
    marketObservations: initial?.marketObservations ?? "",
    lessonsLearned: initial?.lessonsLearned ?? "",
    journalCompleted: initial?.journalCompleted ?? true,
  });

  const update = (key: string, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/daily-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        deepWorkMinutes: form.deepWorkMinutes ? Number(form.deepWorkMinutes) : null,
        screenTimeMinutes: form.screenTimeMinutes ? Number(form.screenTimeMinutes) : null,
      }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily routine</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Date</Label>
            <Input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
          </div>
          <div>
            <Label>Wake-up time</Label>
            <Input type="time" value={form.wakeUpTime} onChange={(e) => update("wakeUpTime", e.target.value)} />
          </div>
          {(["gym", "meditation", "reading"] as const).map((habit) => (
            <label key={habit} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form[habit]}
                onChange={(e) => update(habit, e.target.checked)}
              />
              {habit.charAt(0).toUpperCase() + habit.slice(1)}
            </label>
          ))}
          <div>
            <Label>Deep work (minutes)</Label>
            <Input type="number" value={form.deepWorkMinutes} onChange={(e) => update("deepWorkMinutes", e.target.value)} />
          </div>
          <div>
            <Label>Screen time (minutes)</Label>
            <Input type="number" value={form.screenTimeMinutes} onChange={(e) => update("screenTimeMinutes", e.target.value)} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reflection</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <Label>What went well</Label>
            <Textarea value={form.wentWell} onChange={(e) => update("wentWell", e.target.value)} />
          </div>
          <div>
            <Label>What went wrong</Label>
            <Textarea value={form.wentWrong} onChange={(e) => update("wentWrong", e.target.value)} />
          </div>
          <div>
            <Label>Market observations</Label>
            <Textarea value={form.marketObservations} onChange={(e) => update("marketObservations", e.target.value)} />
          </div>
          <div>
            <Label>Lessons learned</Label>
            <Textarea value={form.lessonsLearned} onChange={(e) => update("lessonsLearned", e.target.value)} />
          </div>
        </div>
      </Card>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save journal"}
      </Button>
    </form>
  );
}
