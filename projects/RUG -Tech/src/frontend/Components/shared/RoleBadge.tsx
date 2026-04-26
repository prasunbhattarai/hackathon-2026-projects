"use client";

import { cn } from "@/lib/cn";
import { UserRole } from "@/types/auth.types";

const labels: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "Super Admin",
  [UserRole.DOCTOR]: "Doctor",
};

function roleClasses(role: UserRole) {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/25";
    case UserRole.DOCTOR:
      return "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/25";
    default:
      return "bg-transparent text-[var(--text-muted)] border-[var(--border-strong)]";
  }
}

export function RoleBadge({
  role,
  size = "sm",
  className,
}: {
  role: UserRole;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[999px] border font-condensed font-medium uppercase tracking-[0.08em]",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        roleClasses(role),
        className,
      )}
    >
      {labels[role]}
    </span>
  );
}
