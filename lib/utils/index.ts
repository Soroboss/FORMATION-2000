import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAppName(): string {
  return process.env.NEXT_PUBLIC_APP_NAME ?? "Learnoon Academy";
}

/** Nom court de marque (navbar compacte, etc.). */
export function getAppShortName(): string {
  return process.env.NEXT_PUBLIC_APP_SHORT_NAME ?? "Learnoon";
}

export function getAppSlogan(): string {
  return (
    process.env.NEXT_PUBLIC_APP_SLOGAN ?? "Apprends aujourd'hui. Réussis demain."
  );
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/** Only allow internal relative redirects to prevent open redirects. */
export function safeInternalPath(path: string | null | undefined, fallback = "/app/tableau-de-bord"): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }
  return path;
}
