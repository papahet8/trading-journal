import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { InvitesAdmin } from "@/components/admin/invites-admin";

export default async function AdminInvitesPage() {
  const user = await getSessionUser();
  if (!user?.isAdmin) redirect("/");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Invite codes</h1>
      <InvitesAdmin />
    </div>
  );
}
