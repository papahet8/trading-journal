import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { tradeSchema } from "@/lib/validators";
import { calculateRiskReward } from "@/lib/trade";
import { Direction } from "@/generated/prisma";
import { saveDisciplineScore } from "@/lib/analytics";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const marketType = searchParams.get("marketType");

  const trades = await prisma.trade.findMany({
    where: {
      userId: session.user.id,
      ...(symbol ? { instrument: { contains: symbol, mode: "insensitive" } } : {}),
      ...(marketType ? { marketType: marketType as never } : {}),
    },
    include: {
      tags: { include: { tag: true } },
      screenshots: true,
      psychology: true,
    },
    orderBy: { tradedAt: "desc" },
  });

  return NextResponse.json(trades);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = tradeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const rr =
    d.riskReward ??
    calculateRiskReward(
      d.direction as Direction,
      d.entryPrice,
      d.stopLoss,
      d.target
    );

  const trade = await prisma.trade.create({
    data: {
      userId: session.user.id,
      instrument: d.instrument,
      marketType: d.marketType,
      direction: d.direction,
      entryPrice: d.entryPrice,
      exitPrice: d.exitPrice,
      quantity: d.quantity,
      stopLoss: d.stopLoss,
      target: d.target,
      riskReward: rr,
      brokerageCharges: d.brokerageCharges,
      setupType: d.setupType,
      timeframe: d.timeframe,
      strategy: d.strategy,
      confidence: d.confidence,
      executionRating: d.executionRating,
      tradedAt: new Date(d.tradedAt),
      notes: d.notes,
      tags: {
        create: d.tagIds.map((tagId) => ({ tagId })),
      },
      ...(d.psychology
        ? {
            psychology: {
              create: {
                moodBefore: d.psychology.moodBefore,
                energyBefore: d.psychology.energyBefore,
                confidenceBefore: d.psychology.confidenceBefore,
                sleepQuality: d.psychology.sleepQuality,
                emotionalAfter: d.psychology.emotionalAfter,
                followedRules: d.psychology.followedRules,
                mistake: d.psychology.mistake,
              },
            },
          }
        : {}),
    },
  });

  await saveDisciplineScore(session.user.id, new Date(d.tradedAt));

  return NextResponse.json(trade);
}
