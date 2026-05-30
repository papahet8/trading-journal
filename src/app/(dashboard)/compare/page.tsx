import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CompareView } from "@/components/compare/compare-view";

export default async function ComparePage() {
  const user = await getSessionUser();
  if (!user?.id) return null;

  const trades = await prisma.trade.findMany({
    where: { userId: user.id },
    include: {
      screenshots: true,
      tags: { include: { tag: true } },
    },
    orderBy: { tradedAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Compare setups</h1>
      <p className="mb-6 text-zinc-400">
        Side-by-side chart screenshots — good setups vs bad setups
      </p>
      <CompareView trades={trades} />
    </div>
  );
}
