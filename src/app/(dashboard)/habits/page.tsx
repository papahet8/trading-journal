import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCorrelations } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DailyLogForm } from "@/components/journal/daily-log-form";
import { format } from "date-fns";

export default async function HabitsPage() {
  const user = await getSessionUser();
  if (!user?.id) return null;

  const today = format(new Date(), "yyyy-MM-dd");
  const log = await prisma.dailyLog.findUnique({
    where: { userId_date: { userId: user.id, date: new Date(today) } },
  });

  const correlations = await getCorrelations(user.id);

  const initial = log
    ? {
        date: today,
        wakeUpTime: log.wakeUpTime,
        gym: log.gym,
        meditation: log.meditation,
        reading: log.reading,
        deepWorkMinutes: log.deepWorkMinutes,
        screenTimeMinutes: log.screenTimeMinutes,
        wentWell: log.wentWell,
        wentWrong: log.wentWrong,
        marketObservations: log.marketObservations,
        lessonsLearned: log.lessonsLearned,
        journalCompleted: log.journalCompleted,
      }
    : { date: today };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Habits & routine</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardDescription>Avg P&L on gym days</CardDescription>
          <p className="text-2xl font-semibold text-emerald-400">
            {formatCurrency(correlations.avgGymPnL)}
          </p>
        </Card>
        <Card>
          <CardDescription>Avg P&L on non-gym days</CardDescription>
          <p className="text-2xl font-semibold">
            {formatCurrency(correlations.avgNoGymPnL)}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s routine</CardTitle>
        </CardHeader>
        <DailyLogForm initial={initial} />
      </Card>
    </div>
  );
}
