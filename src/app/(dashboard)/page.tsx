import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getDashboardStats, getStreaks, computeDisciplineScore } from "@/lib/analytics";
import { prisma } from "@/lib/db";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EquityCurve } from "@/components/charts/equity-curve";
import { PnlHeatmap } from "@/components/charts/pnl-heatmap";
import { startOfDay } from "date-fns";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user?.id) return null;

  const stats = await getDashboardStats(user.id);
  const streaks = await getStreaks(user.id);
  const todayScore = await computeDisciplineScore(user.id, new Date());

  const todayScoreRecord = await prisma.disciplineScore.findUnique({
    where: {
      userId_date: { userId: user.id, date: startOfDay(new Date()) },
    },
  });

  const score = todayScoreRecord?.score ?? todayScore.score;

  const cards = [
    { label: "Today P&L", value: formatCurrency(stats.dailyPnL), positive: stats.dailyPnL >= 0 },
    { label: "Week P&L", value: formatCurrency(stats.weeklyPnL), positive: stats.weeklyPnL >= 0 },
    { label: "Month P&L", value: formatCurrency(stats.monthlyPnL), positive: stats.monthlyPnL >= 0 },
    { label: "Win rate", value: formatPercent(stats.winRate) },
    {
      label: "Profit factor",
      value: stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2),
    },
    { label: "Max drawdown", value: formatCurrency(stats.maxDrawdown) },
    { label: "Avg R:R", value: stats.avgRR.toFixed(2) },
    { label: "Total trades", value: stats.totalTrades.toString() },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-zinc-400">Welcome back, {user.name ?? user.email}</p>
        </div>
        <Link href="/trades/new">
          <Button>Log trade</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-emerald-900/50">
          <CardDescription>Discipline score</CardDescription>
          <p className="text-3xl font-bold text-emerald-400">{score}/100</p>
        </Card>
        <Card>
          <CardDescription>Discipline streak</CardDescription>
          <p className="text-3xl font-bold">{streaks.disciplineStreak} days</p>
        </Card>
        <Card>
          <CardDescription>Journal streak</CardDescription>
          <p className="text-3xl font-bold">{streaks.journalStreak} days</p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardDescription>{c.label}</CardDescription>
            <p
              className={`text-2xl font-semibold ${
                c.positive === false
                  ? "text-red-400"
                  : c.positive
                    ? "text-emerald-400"
                    : ""
              }`}
            >
              {c.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Equity curve</CardTitle>
          </CardHeader>
          <EquityCurve data={stats.equityCurve} />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activity heatmap</CardTitle>
          </CardHeader>
          <PnlHeatmap data={stats.heatmap} year={new Date().getFullYear()} />
        </Card>
      </div>
    </div>
  );
}
