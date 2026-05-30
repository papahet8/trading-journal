import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tags = await prisma.tag.findMany({
    where: {
      OR: [{ userId: null }, { userId: session.user.id }],
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(tags);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const tag = await prisma.tag.create({
    data: {
      name: name.trim(),
      category: "CUSTOM",
      userId: session.user.id,
    },
  });

  return NextResponse.json(tag);
}
