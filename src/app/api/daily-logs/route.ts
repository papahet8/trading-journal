import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dailyLogSchema } from "@/lib/validators";
import { saveDisciplineScore } from "@/lib/analytics";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (date) {
    const log = await prisma.dailyLog.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: new Date(date),
        },
      },
    });
    return NextResponse.json(log);
  }

  const logs = await prisma.dailyLog.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 30,
  });
  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = dailyLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const log = await prisma.dailyLog.upsert({
    where: {
      userId_date: {
        userId: session.user.id,
        date: new Date(d.date),
      },
    },
    create: {
      userId: session.user.id,
      date: new Date(d.date),
      wakeUpTime: d.wakeUpTime,
      gym: d.gym,
      meditation: d.meditation,
      reading: d.reading,
      deepWorkMinutes: d.deepWorkMinutes,
      screenTimeMinutes: d.screenTimeMinutes,
      wentWell: d.wentWell,
      wentWrong: d.wentWrong,
      marketObservations: d.marketObservations,
      lessonsLearned: d.lessonsLearned,
      journalCompleted: d.journalCompleted,
    },
    update: {
      wakeUpTime: d.wakeUpTime,
      gym: d.gym,
      meditation: d.meditation,
      reading: d.reading,
      deepWorkMinutes: d.deepWorkMinutes,
      screenTimeMinutes: d.screenTimeMinutes,
      wentWell: d.wentWell,
      wentWrong: d.wentWrong,
      marketObservations: d.marketObservations,
      lessonsLearned: d.lessonsLearned,
      journalCompleted: d.journalCompleted,
    },
  });

  await saveDisciplineScore(session.user.id, new Date(d.date));
  return NextResponse.json(log);
}
