import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "brand" | "progress" | "action";

const ICON_TONE: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-600",
  progress: "bg-progress-50 text-progress-600",
  action: "bg-action-50 text-action-600",
};

type PageHeaderProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  tone?: Tone;
};

/** En-tête de page unifié pour l’espace apprenant. */
export function PageHeader({ icon: Icon, title, subtitle, action, tone = "brand" }: PageHeaderProps) {
  return (
    <div className="ui-card flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-soft",
            ICON_TONE[tone],
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
        <div>
          <h1 className="font-display text-xl font-bold text-ink sm:text-2xl">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-ink-muted">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

const STAT_TONE: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700",
  progress: "bg-progress-50 text-progress-700",
  action: "bg-action-50 text-action-700",
};

type BadgeTone = Tone | "neutral" | "danger";

const BADGE_TONE: Record<BadgeTone, string> = {
  neutral: "bg-canvas text-ink-muted",
  brand: "bg-brand-50 text-brand-700",
  progress: "bg-progress-50 text-progress-700",
  action: "bg-action-50 text-action-700",
  danger: "bg-danger-50 text-danger-700",
};

type StatusBadgeProps = {
  label: string;
  tone?: BadgeTone;
  className?: string;
};

/** Pastille de statut colorée (paiements, projets, support…). */
export function StatusBadge({ label, tone = "neutral", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        BADGE_TONE[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: Tone;
};

/** Carte statistique compacte (progression, totaux, etc.). */
export function StatCard({ label, value, hint, tone = "brand" }: StatCardProps) {
  return (
    <div className="ui-card p-4 sm:p-5">
      <span
        className={cn(
          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
          STAT_TONE[tone],
        )}
      >
        {label}
      </span>
      <p className="mt-3 font-display text-3xl font-bold text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
