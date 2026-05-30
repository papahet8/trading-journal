"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Goal = {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  targetMetric?: string | null;
  targetValue?: number | null;
  currentValue?: number | null;
  period?: string | null;
  active: boolean;
};

export function GoalsManager({ initial }: { initial: Goal[] }) {
  const [goals, setGoals] = useState(initial);
  const [form, setForm] = useState({
    type: "TRADING",
    title: "",
    description: "",
    targetMetric: "",
    targetValue: "",
    period: "weekly",
  });

  const refresh = () => {
    fetch("/api/goals")
      .then((r) => r.json())
      .then(setGoals);
  };

  useEffect(() => {
    setGoals(initial);
  }, [initial]);

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        targetValue: form.targetValue ? Number(form.targetValue) : null,
      }),
    });
    setForm({ type: "TRADING", title: "", description: "", targetMetric: "", targetValue: "", period: "weekly" });
    refresh();
  };

  const toggleActive = async (goal: Goal) => {
    await fetch(`/api/goals/${goal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !goal.active }),
    });
    refresh();
  };

  const deleteGoal = async (id: string) => {
    if (!confirm("Delete goal?")) return;
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    refresh();
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add goal</CardTitle>
        </CardHeader>
        <form onSubmit={addGoal} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Type</Label>
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="TRADING">Trading</option>
              <option value="PERSONAL">Personal</option>
            </Select>
          </div>
          <div>
            <Label>Title</Label>
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Max 2 trades/day" />
          </div>
          <div>
            <Label>Target metric</Label>
            <Input value={form.targetMetric} onChange={(e) => setForm({ ...form, targetMetric: e.target.value })} placeholder="trades_per_day" />
          </div>
          <div>
            <Label>Target value</Label>
            <Input type="number" value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit">Add goal</Button>
          </div>
        </form>
      </Card>

      <div className="space-y-3">
        {goals.map((goal) => {
          const progress =
            goal.targetValue && goal.currentValue != null
              ? Math.min(100, (goal.currentValue / goal.targetValue) * 100)
              : null;
          return (
            <Card key={goal.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Badge variant={goal.type === "TRADING" ? "success" : "outline"}>
                    {goal.type}
                  </Badge>
                  <h3 className="mt-1 font-semibold">{goal.title}</h3>
                  {goal.targetMetric && (
                    <p className="text-sm text-zinc-400">
                      {goal.currentValue ?? 0} / {goal.targetValue ?? "—"} {goal.targetMetric}
                    </p>
                  )}
                  {progress != null && (
                    <div className="mt-2 h-2 w-48 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => toggleActive(goal)}>
                    {goal.active ? "Pause" : "Activate"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteGoal(goal.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
