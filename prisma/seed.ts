import { PrismaClient, TagCategory } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_TAGS: { name: string; category: TagCategory }[] = [
  { name: "Revenge trade", category: "BEHAVIOR" },
  { name: "FOMO", category: "BEHAVIOR" },
  { name: "Breakout", category: "SETUP" },
  { name: "Trend-following", category: "SETUP" },
  { name: "Scalping", category: "SETUP" },
  { name: "News-based", category: "SETUP" },
  { name: "Overtrading", category: "MISTAKE" },
  { name: "A+ setup", category: "SETUP" },
  { name: "Reversal", category: "SETUP" },
  { name: "Poor execution", category: "MISTAKE" },
  { name: "Early exit", category: "MISTAKE" },
  { name: "Moved stop", category: "MISTAKE" },
];

async function main() {
  for (const tag of DEFAULT_TAGS) {
    const existing = await prisma.tag.findFirst({
      where: { name: tag.name, userId: null },
    });
    if (!existing) {
      await prisma.tag.create({
        data: { name: tag.name, category: tag.category },
      });
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@tradejournal.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123456";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      passwordHash,
      isAdmin: true,
    },
  });

  const codes = ["FRIEND-001", "FRIEND-002", "FRIEND-003", "FRIEND-004"];
  for (const code of codes) {
    await prisma.inviteCode.upsert({
      where: { code },
      update: {},
      create: { code },
    });
  }

  console.log("Seed complete");
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
  console.log(`Invite codes: ${codes.join(", ")}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
