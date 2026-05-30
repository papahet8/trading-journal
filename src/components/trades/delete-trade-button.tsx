"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteTradeButton({ tradeId }: { tradeId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Delete this trade?")) return;
    await fetch(`/api/trades/${tradeId}`, { method: "DELETE" });
    router.push("/trades");
    router.refresh();
  };

  return (
    <Button variant="destructive" onClick={handleDelete}>
      Delete
    </Button>
  );
}
