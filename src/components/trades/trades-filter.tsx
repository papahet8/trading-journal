"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function TradesFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const apply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const symbol = fd.get("symbol") as string;
    const marketType = fd.get("marketType") as string;
    if (symbol) params.set("symbol", symbol);
    if (marketType) params.set("marketType", marketType);
    router.push(`/trades?${params.toString()}`);
  };

  return (
    <form onSubmit={apply} className="flex flex-wrap gap-3">
      <Input
        name="symbol"
        placeholder="Filter symbol..."
        defaultValue={searchParams.get("symbol") ?? ""}
        className="max-w-xs"
      />
      <Select name="marketType" defaultValue={searchParams.get("marketType") ?? ""}>
        <option value="">All markets</option>
        <option value="EQUITY">Equity</option>
        <option value="OPTIONS">Options</option>
        <option value="FUTURES">Futures</option>
        <option value="CRYPTO">Crypto</option>
        <option value="FOREX">Forex</option>
      </Select>
      <Button type="submit" variant="secondary">
        Filter
      </Button>
    </form>
  );
}
