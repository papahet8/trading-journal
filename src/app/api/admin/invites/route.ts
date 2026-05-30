import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const codes = await prisma.inviteCode.findMany({
    include: { usedBy: { select: { email: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(codes);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const code =
    body.code ?? `INV-${randomBytes(4).toString("hex").toUpperCase()}`;

  const invite = await prisma.inviteCode.create({
    data: {
      code,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    },
  });

  return NextResponse.json(invite);
}
