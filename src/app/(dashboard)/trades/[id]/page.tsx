import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculatePnL, decimalToNumber } from "@/lib/trade";
import { formatCurrency } from "@/lib/utils";
import { TradeForm } from "@/components/trades/trade-form";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { DeleteTradeButton } from "@/components/trades/delete-trade-button";

export default async function TradeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user?.id) return null;
  const { id } = await params;

  const trade = await prisma.trade.findFirst({
    where: { id, userId: user.id },
    include: {
      tags: { include: { tag: true } },
      screenshots: true,
      psychology: true,
    },
  });

  if (!trade) notFound();

  const pnl = calculatePnL({
    direction: trade.direction,
    entryPrice: decimalToNumber(trade.entryPrice),
    exitPrice: decimalToNumber(trade.exitPrice),
    quantity: decimalToNumber(trade.quantity),
    brokerageCharges: decimalToNumber(trade.brokerageCharges),
  });

  const initial = {
    ...trade,
    entryPrice: decimalToNumber(trade.entryPrice),
    exitPrice: decimalToNumber(trade.exitPrice),
    quantity: decimalToNumber(trade.quantity),
    stopLoss: trade.stopLoss ? decimalToNumber(trade.stopLoss) : null,
    target: trade.target ? decimalToNumber(trade.target) : null,
    riskReward: trade.riskReward ? decimalToNumber(trade.riskReward) : null,
    brokerageCharges: decimalToNumber(trade.brokerageCharges),
    tradedAt: trade.tradedAt.toISOString(),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/trades" className="text-sm text-zinc-400 hover:text-zinc-200">
            ← Back to trades
          </Link>
          <h1 className="mt-2 text-2xl font-bold">
            {trade.instrument}{" "}
            <span className={pnl >= 0 ? "text-emerald-400" : "text-red-400"}>
              {formatCurrency(pnl)}
            </span>
          </h1>
          <p className="text-zinc-400">
            {format(trade.tradedAt, "PPpp")} · {trade.marketType} · {trade.direction}
          </p>
        </div>
        <DeleteTradeButton tradeId={trade.id} />
      </div>

      {trade.screenshots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Screenshots</CardTitle>
          </CardHeader>
          <div className="grid gap-4 sm:grid-cols-3">
            {trade.screenshots.map((s) => (
              <div key={s.id}>
                <p className="mb-1 text-xs text-zinc-500">{s.phase}</p>
                <img src={s.url} alt={s.phase} className="rounded-lg border border-zinc-800" />
              </div>
            ))}
          </div>
        </Card>
      )}

      <TradeForm initial={initial} />
    </div>
  );
}
