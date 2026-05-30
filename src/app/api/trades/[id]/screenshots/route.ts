import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ScreenshotPhase } from "@/generated/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { phase, url } = await req.json();

  const trade = await prisma.trade.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!trade) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const screenshot = await prisma.tradeScreenshot.upsert({
    where: { tradeId_phase: { tradeId: id, phase: phase as ScreenshotPhase } },
    create: { tradeId: id, phase: phase as ScreenshotPhase, url },
    update: { url },
  });

  return NextResponse.json(screenshot);
}
