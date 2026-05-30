import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getUserTrades } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Suspense } from "react";
import { TradesFilter } from "@/components/trades/trades-filter";

export default async function TradesPage({
  searchParams,
}: {
  searchParams: Promise<{ symbol?: string; marketType?: string }>;
}) {
  const user = await getSessionUser();
  if (!user?.id) return null;
  const params = await searchParams;

  const allTrades = await getUserTrades(user.id);
  const trades = allTrades.filter((t) => {
    if (params.symbol && !t.instrument.toLowerCase().includes(params.symbol.toLowerCase())) {
      return false;
    }
    if (params.marketType && t.marketType !== params.marketType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trades</h1>
        <Link href="/trades/new">
          <Button>Log trade</Button>
        </Link>
      </div>

      <Suspense fallback={null}>
        <TradesFilter />
      </Suspense>

      <div className="space-y-3">
        {trades.length === 0 && (
          <p className="text-zinc-500">No trades yet. Log your first trade.</p>
        )}
        {trades.map((trade) => (
          <Link key={trade.id} href={`/trades/${trade.id}`}>
            <Card className="transition-colors hover:border-emerald-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold">{trade.instrument}</span>
                  <span className="ml-2 text-sm text-zinc-500">
                    {trade.marketType} · {trade.direction}
                  </span>
                </div>
                <span
                  className={`font-mono font-semibold ${
                    trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {formatCurrency(trade.pnl)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                <span>{format(new Date(trade.tradedAt), "MMM d, yyyy HH:mm")}</span>
                {trade.setupType && <span>· {trade.setupType}</span>}
                {trade.tags?.map((tt) => (
                  <Badge key={tt.tagId} variant="outline">
                    {tt.tag.name}
                  </Badge>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
