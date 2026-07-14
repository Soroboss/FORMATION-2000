import Image from "next/image";
import Link from "next/link";
import { cn, getAppName } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  className?: string;
  /**
   * `mark` = pictogramme (headers)
   * `full` = logo officiel vertical (auth / paiement)
   */
  variant?: "mark" | "full";
  withTagline?: boolean;
  size?: "sm" | "md" | "lg";
};

const MARK_SIZES = {
  sm: 32,
  md: 40,
  lg: 56,
} as const;

/**
 * Logo Learnoon Academy.
 * - Mark : `/brand/logo-mark.png`
 * - Full : `/brand/logo-official.png`
 */
export function BrandLogo({
  href = "/",
  className,
  variant = "mark",
  withTagline = false,
  size = "md",
}: BrandLogoProps) {
  const appName = getAppName();
  const px = MARK_SIZES[size];

  if (variant === "full") {
    return (
      <Link
        href={href}
        className={cn("inline-flex flex-col items-center justify-center", className)}
        aria-label={appName}
      >
        <Image
          src="/brand/logo-official.png"
          alt="Learnoon Academy — Apprends. Évolue. Réussis."
          width={789}
          height={804}
          className="h-auto w-full object-contain object-center"
          priority
          unoptimized
        />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label={appName}
    >
      <Image
        src="/brand/logo-mark.png"
        alt=""
        width={px}
        height={px}
        className="h-auto w-auto max-h-10 max-w-10 shrink-0 object-contain"
        priority={size === "lg"}
        unoptimized
      />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="font-display text-base font-bold tracking-tight text-brand-600 sm:text-lg">
          Learnoon
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink sm:text-[11px]">
          Academy
        </span>
        {withTagline ? (
          <span className="mt-1 text-[11px] font-medium text-ink-muted">
            <span className="text-brand-600">Apprends.</span>{" "}
            <span className="text-action-500">Évolue.</span>{" "}
            <span className="text-progress-600">Réussis.</span>
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export function LogoMark({
  className,
  size = 36,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/brand/logo-mark.png"
      alt=""
      width={size}
      height={size}
      className={cn("object-contain", className)}
      aria-hidden
      unoptimized
    />
  );
}
