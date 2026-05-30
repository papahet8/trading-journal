import Link from "next/link";
import { format } from "date-fns";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";

export default async function JournalIndexPage() {
  const user = await getSessionUser();
  if (!user?.id) return null;

  const logs = await prisma.dailyLog.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 20,
  });

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Journal</h1>
        <Link href={`/journal/${today}`} className="text-emerald-400 hover:underline">
          Today&apos;s entry →
        </Link>
      </div>
      <div className="space-y-3">
        {logs.length === 0 && (
          <p className="text-zinc-500">No journal entries yet.</p>
        )}
        {logs.map((log) => (
          <Link key={log.id} href={`/journal/${format(log.date, "yyyy-MM-dd")}`}>
            <Card className="hover:border-emerald-800">
              <p className="font-medium">{format(log.date, "EEEE, MMM d, yyyy")}</p>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                {log.lessonsLearned || log.wentWell || "No notes"}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
