import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusTone } from "@/lib/admin/labels";

const TONE_CLASS = {
  neutral: "bg-canvas text-ink-muted",
  success: "bg-progress-50 text-progress-700",
  warning: "bg-action-50 text-action-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-brand-50 text-brand-700",
} as const;

export function AdminPageHeader({
  title,
  description,
  actions,
  icon: Icon,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="ui-card flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
      <div className="flex items-center gap-3.5">
        {Icon ? (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-brand bg-brand-50 text-brand-600">
            <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
          </span>
        ) : null}
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
          {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminStatCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const valueTone =
    tone === "success"
      ? "text-progress-700"
      : tone === "warning"
        ? "text-action-700"
        : tone === "danger"
          ? "text-red-700"
          : tone === "info"
            ? "text-brand-700"
            : "text-ink";
  return (
    <div className="ui-card p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className={cn("mt-2 font-display text-2xl font-bold", valueTone)}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}

export function StatusBadge({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-soft px-2 py-1 text-xs font-semibold",
        TONE_CLASS[statusTone(value)],
      )}
    >
      {label}
    </span>
  );
}

export function AdminEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="ui-card border-dashed p-6 text-center sm:p-8">
      <p className="font-display font-semibold text-ink">{title}</p>
      {description ? <p className="mt-2 text-sm text-ink-muted">{description}</p> : null}
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex h-10 items-center rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
