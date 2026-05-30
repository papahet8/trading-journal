"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Invite = {
  id: string;
  code: string;
  usedBy?: { email: string; name: string | null } | null;
  expiresAt?: string | null;
  createdAt: string;
};

export function InvitesAdmin() {
  const [invites, setInvites] = useState<Invite[]>([]);

  const load = () => fetch("/api/admin/invites").then((r) => r.json()).then(setInvites);

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    await fetch("/api/admin/invites", { method: "POST" });
    load();
  };

  return (
    <div className="space-y-4">
      <Button onClick={create}>Generate invite code</Button>
      {invites.map((inv) => (
        <Card key={inv.id}>
          <p className="font-mono font-semibold text-emerald-400">{inv.code}</p>
          <p className="text-sm text-zinc-400">
            {inv.usedBy ? `Used by ${inv.usedBy.email}` : "Available"}
          </p>
        </Card>
      ))}
    </div>
  );
}
