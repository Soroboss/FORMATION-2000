import Link from "next/link";
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
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="ui-card flex flex-wrap items-end justify-between gap-4 p-5 sm:p-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
        {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
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
