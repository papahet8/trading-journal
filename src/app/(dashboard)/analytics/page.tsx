import { getSessionUser } from "@/lib/auth";
import {
  getUserTrades,
  getSetupStats,
  getWeekdayPerformance,
  getTagStats,
  getCorrelations,
  getHeatmapData,
} from "@/lib/analytics";
import { formatPercent, formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PnlHeatmap } from "@/components/charts/pnl-heatmap";
import { SimpleScatter } from "@/components/charts/scatter-chart";
import { WeekdayChart, MoodWinRateChart } from "@/components/charts/analytics-charts";

export default async function AnalyticsPage() {
  const user = await getSessionUser();
  if (!user?.id) return null;

  const trades = await getUserTrades(user.id);
  const setups = getSetupStats(trades);
  const weekdays = getWeekdayPerformance(trades);
  const tagStats = await getTagStats(user.id);
  const correlations = await getCorrelations(user.id);
  const heatmap = getHeatmapData(trades, new Date().getFullYear());

  const mistakeTags = tagStats.filter((t) =>
    ["Revenge trade", "FOMO", "Overtrading", "Poor execution", "Early exit", "Moved stop"].includes(t.tag)
  );

  const sleepScatter = correlations.points
    .filter((p) => p.sleepQuality != null && p.sleepQuality > 0)
    .map((p) => ({ x: p.sleepQuality!, y: p.pnl, label: p.date }));

  const moodTrades = trades.filter((t) => t.psychology?.moodBefore);
  const moodBuckets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((m) => {
    const subset = moodTrades.filter((t) => t.psychology?.moodBefore === m);
    const wins = subset.filter((t) => t.pnl > 0).length;
    return {
      mood: m,
      winRate: subset.length ? (wins / subset.length) * 100 : 0,
      count: subset.length,
    };
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <Card>
        <CardHeader>
          <CardTitle>Activity heatmap</CardTitle>
        </CardHeader>
        <PnlHeatmap data={heatmap} year={new Date().getFullYear()} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Best performing setups</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-400">
                  <th className="pb-2">Setup</th>
                  <th>Trades</th>
                  <th>Win rate</th>
                  <th>Avg RR</th>
                  <th>P&L</th>
                </tr>
              </thead>
              <tbody>
                {setups.map((s) => (
                  <tr key={s.name} className="border-t border-zinc-800">
                    <td className="py-2">{s.name}</td>
                    <td>{s.count}</td>
                    <td>{formatPercent(s.winRate)}</td>
                    <td>{s.avgRR.toFixed(2)}</td>
                    <td className={s.totalPnL >= 0 ? "text-emerald-400" : "text-red-400"}>
                      {formatCurrency(s.totalPnL)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekday performance</CardTitle>
          </CardHeader>
          <WeekdayChart data={weekdays} />
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mistake & behavior tags</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-400">
                <th className="pb-2">Tag</th>
                <th>Count</th>
                <th>Win rate</th>
                <th>Total P&L</th>
              </tr>
            </thead>
            <tbody>
              {mistakeTags.map((t) => (
                <tr key={t.tag} className="border-t border-zinc-800">
                  <td className="py-2">{t.tag}</td>
                  <td>{t.count}</td>
                  <td>{formatPercent(t.winRate)}</td>
                  <td className={t.totalPnL >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {formatCurrency(t.totalPnL)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sleep quality vs daily P&L</CardTitle>
          </CardHeader>
          <SimpleScatter data={sleepScatter} xLabel="Sleep" yLabel="P&L" />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mood vs win rate</CardTitle>
          </CardHeader>
          <MoodWinRateChart data={moodBuckets} />
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gym vs profit correlation</CardTitle>
        </CardHeader>
        <p className="text-zinc-300">
          On gym days, average profit is{" "}
          <span className="text-emerald-400 font-semibold">
            {correlations.avgNoGymPnL !== 0
              ? `${(((correlations.avgGymPnL - correlations.avgNoGymPnL) / Math.abs(correlations.avgNoGymPnL)) * 100).toFixed(0)}%`
              : "N/A"}{" "}
          </span>
          {correlations.avgGymPnL >= correlations.avgNoGymPnL ? "higher" : "lower"} than non-gym days.
        </p>
      </Card>
    </div>
  );
}
