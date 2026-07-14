import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAppName(): string {
  return process.env.NEXT_PUBLIC_APP_NAME ?? "Académie 2000";
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
