import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DailyLogForm } from "@/components/journal/daily-log-form";
import { format } from "date-fns";

export default async function JournalDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const user = await getSessionUser();
  if (!user?.id) return null;
  const { date } = await params;

  const log = await prisma.dailyLog.findUnique({
    where: {
      userId_date: { userId: user.id, date: new Date(date) },
    },
  });

  const initial = log
    ? {
        date,
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
    : { date };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        Journal — {format(new Date(date), "MMMM d, yyyy")}
      </h1>
      <DailyLogForm initial={initial} />
    </div>
  );
}
