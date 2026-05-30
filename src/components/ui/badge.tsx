import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "danger" | "outline";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-zinc-700 text-zinc-200",
        variant === "success" && "bg-emerald-900/50 text-emerald-300",
        variant === "danger" && "bg-red-900/50 text-red-300",
        variant === "outline" && "border border-zinc-600 text-zinc-300",
        className
      )}
      {...props}
    />
  );
}
