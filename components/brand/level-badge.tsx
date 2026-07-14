import { cn } from "@/lib/utils";

const levels = {
  debutant: {
    label: "Débutant",
    className: "bg-brand-600 text-white",
  },
  intermediaire: {
    label: "Intermédiaire",
    className: "bg-action-500 text-white",
  },
  expert: {
    label: "Expert",
    className: "bg-progress-500 text-white",
  },
} as const;

export type LevelBadgeKey = keyof typeof levels;

type LevelBadgeProps = {
  level: LevelBadgeKey | string;
  className?: string;
};

function normalizeLevel(level: string): LevelBadgeKey | null {
  const key = level
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
  if (key.includes("debut") || key === "beginner") return "debutant";
  if (key.includes("inter") || key === "intermediate") return "intermediaire";
  if (key.includes("expert") || key.includes("avance") || key === "advanced") return "expert";
  return null;
}

/** Badges niveau selon la charte (bleu / orange / vert). */
export function LevelBadge({ level, className }: LevelBadgeProps) {
  const key = normalizeLevel(level);
  const config = key ? levels[key] : null;
  if (!config) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-ink",
          className,
        )}
      >
        {level}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        config.className,
        className,
      )}
    >
      <span aria-hidden className="inline-block h-2 w-2 rounded-[1px] bg-white/90" />
      {config.label}
    </span>
  );
}
