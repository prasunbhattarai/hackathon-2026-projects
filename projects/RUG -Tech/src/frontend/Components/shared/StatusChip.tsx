"use client";

import { cn } from "@/lib/cn";
import { CaseStatus } from "@/types/case.types";

export interface StatusChipProps {
  status: CaseStatus | string;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  [CaseStatus.PROCESSING]: {
    label: "Processing",
    bg: "bg-[var(--accent)]/10",
    text: "text-[var(--accent)]",
    border: "border-[var(--accent)]/25",
  },
  [CaseStatus.QUALITY_FAILED]: {
    label: "Quality Failed",
    bg: "bg-[var(--sev-critical)]/10",
    text: "text-[var(--sev-critical)]",
    border: "border-[var(--sev-critical)]/25",
  },
  [CaseStatus.AWAITING_REVIEW]: {
    label: "Awaiting Review",
    bg: "bg-[var(--sev-high)]/10",
    text: "text-[var(--sev-high)]",
    border: "border-[var(--sev-high)]/25",
  },
  [CaseStatus.APPROVED]: {
    label: "Approved",
    bg: "bg-[var(--success)]/10",
    text: "text-[var(--success)]",
    border: "border-[var(--success)]/25",
  },
  [CaseStatus.REJECTED]: {
    label: "Rejected",
    bg: "bg-[var(--sev-critical)]/10",
    text: "text-[var(--sev-critical)]",
    border: "border-[var(--sev-critical)]/25",
  },
  [CaseStatus.FAILED]: {
    label: "Failed",
    bg: "bg-[var(--sev-critical)]/10",
    text: "text-[var(--sev-critical)]",
    border: "border-[var(--sev-critical)]/25",
  },
};

const fallback = {
  label: "Unknown",
  bg: "bg-[var(--bg-elevated)]",
  text: "text-[var(--text-muted)]",
  border: "border-[var(--border)]",
};

export const StatusChip = ({ status, className }: StatusChipProps) => {
  const cfg = statusConfig[status] ?? fallback;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5",
        "text-[10px] font-condensed font-medium",
        "rounded-[999px] border whitespace-nowrap",
        cfg.bg,
        cfg.text,
        cfg.border,
        className,
      )}
      aria-label={`Case status: ${cfg.label}`}
    >
      <span className="inline-flex items-center gap-1.5">
        <span>{cfg.label}</span>
        {status === CaseStatus.PROCESSING && (
          <span className="inline-flex items-center gap-0.5">
            <span className="w-1 h-1 rounded-full bg-current opacity-60 animate-dot-wave" />
            <span
              className="w-1 h-1 rounded-full bg-current opacity-60 animate-dot-wave"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-1 h-1 rounded-full bg-current opacity-60 animate-dot-wave"
              style={{ animationDelay: "300ms" }}
            />
          </span>
        )}
      </span>
    </span>
  );
};
