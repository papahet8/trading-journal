import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoalsManager } from "@/components/goals/goals-manager";

export default async function GoalsPage() {
  const user = await getSessionUser();
  if (!user?.id) return null;

  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Goals</h1>
      <GoalsManager initial={goals} />
    </div>
  );
}
