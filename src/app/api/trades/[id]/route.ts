import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { tradeSchema } from "@/lib/validators";
import { calculateRiskReward } from "@/lib/trade";
import { Direction } from "@/generated/prisma";
import { saveDisciplineScore } from "@/lib/analytics";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const trade = await prisma.trade.findFirst({
    where: { id, userId: session.user.id },
    include: {
      tags: { include: { tag: true } },
      screenshots: true,
      psychology: true,
    },
  });

  if (!trade) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(trade);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const parsed = tradeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.trade.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const d = parsed.data;
  const rr =
    d.riskReward ??
    calculateRiskReward(
      d.direction as Direction,
      d.entryPrice,
      d.stopLoss,
      d.target
    );

  await prisma.tradeTag.deleteMany({ where: { tradeId: id } });

  const trade = await prisma.trade.update({
    where: { id },
    data: {
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
      tags: { create: d.tagIds.map((tagId) => ({ tagId })) },
      psychology: d.psychology
        ? {
            upsert: {
              create: {
                moodBefore: d.psychology.moodBefore,
                energyBefore: d.psychology.energyBefore,
                confidenceBefore: d.psychology.confidenceBefore,
                sleepQuality: d.psychology.sleepQuality,
                emotionalAfter: d.psychology.emotionalAfter,
                followedRules: d.psychology.followedRules,
                mistake: d.psychology.mistake,
              },
              update: {
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
        : undefined,
    },
  });

  await saveDisciplineScore(session.user.id, new Date(d.tradedAt));
  return NextResponse.json(trade);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.trade.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.trade.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
