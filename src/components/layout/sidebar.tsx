"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Calendar,
  GitCompare,
  LayoutDashboard,
  List,
  LogOut,
  Target,
  Dumbbell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trades", label: "Trades", icon: List },
  { href: "/trades/new", label: "Log Trade", icon: BookOpen },
  { href: "/journal", label: "Journal", icon: Calendar },
  { href: "/habits", label: "Habits", icon: Dumbbell },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/compare", label: "Compare", icon: GitCompare },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="flex w-56 flex-col border-r border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-8">
        <h1 className="text-lg font-bold text-emerald-400">TradeJournal</h1>
        <p className="text-xs text-zinc-500">Personal trading OS</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === href || (href !== "/" && pathname.startsWith(href))
                ? "bg-emerald-900/40 text-emerald-300"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      {session?.user?.isAdmin && (
        <Link
          href="/admin/invites"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800",
            pathname.startsWith("/admin") && "bg-emerald-900/40 text-emerald-300"
          )}
        >
          Admin invites
        </Link>
      )}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </aside>
  );
}
