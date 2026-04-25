"use client";

import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/constants/routes";
import { Badge } from "@/Components/ui/Badge";
import { Button } from "@/Components/ui/Button";
import { SkeletonTableRow } from "@/Components/ui/Skeleton";
import { StatusChip } from "@/Components/shared/StatusChip";
import { SeverityBadge } from "@/Components/shared/SeverityBadge";
import type { CaseSummary } from "@/types/case.types";

interface RecentCasesTableProps {
  cases: CaseSummary[];
  isLoading?: boolean;
  className?: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const drVariant = (status: string) => {
  switch (status) {
    case "PDR":
      return "critical" as const;
    case "Severe":
      return "high" as const;
    case "Moderate":
      return "medium" as const;
    case "Mild":
      return "low" as const;
    default:
      return "none" as const;
  }
};

export const RecentCasesTable = ({
  cases,
  isLoading,
  className,
}: RecentCasesTableProps) => {
  const router = useRouter();

  return (
    <div
      className={cn(
        "bg-(--bg-surface) border border-(--border) rounded-[10px] overflow-hidden",
        className,
      )}
    >
      <div className="px-6 py-3 border-b border-[var(--border)]">
        <h3 className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
          Recent Cases
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--bg-elevated)]">
              {[
                "Patient",
                "Status",
                "DR Status",
                "Priority",
                "Submitted",
                "",
              ].map((h) => (
                <th
                  key={h || "action"}
                  className="px-4 py-2.5 text-left font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonTableRow key={i} columns={6} />
              ))}

            {!isLoading &&
              cases.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--bg-subtle)] cursor-pointer transition-colors duration-100"
                  onClick={() => router.push(ROUTES.CASE_DETAIL(c.id))}
                >
                  <td className="px-4 py-2.5 text-sm text-[var(--text-primary)]">
                    {c.patientName}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusChip status={c.status} />
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={drVariant(c.drStatus)} size="sm">
                      {c.drStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <SeverityBadge tier={c.priorityTier} />
                  </td>
                  <td className="px-4 py-2.5 text-xs text-[var(--text-muted)] font-mono">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="px-4 py-2.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      rightIcon={<ExternalLink size={12} />}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        router.push(ROUTES.CASE_DETAIL(c.id));
                      }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
