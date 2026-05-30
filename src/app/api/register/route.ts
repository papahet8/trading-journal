import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const allowed = process.env.ALLOWED_EMAILS?.split(",").map((e) => e.trim().toLowerCase());
    const email = parsed.data.email.toLowerCase();
    if (allowed?.length && !allowed.includes(email)) {
      return NextResponse.json({ error: "Email not allowed" }, { status: 403 });
    }

    const invite = await prisma.inviteCode.findUnique({
      where: { code: parsed.data.inviteCode },
    });
    if (!invite || invite.usedById) {
      return NextResponse.json({ error: "Invalid or used invite code" }, { status: 400 });
    }
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invite code expired" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        name: parsed.data.name,
        passwordHash,
      },
    });

    await prisma.inviteCode.update({
      where: { id: invite.id },
      data: { usedById: user.id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
