import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

/** Redirection sûre vers une page admin/app avec message flash. */
export function redirectWithFlash(
  path: string,
  kind: "ok" | "error",
  message: string,
): never {
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}${kind}=${encodeURIComponent(message)}`);
}

export function safeReturnPath(value: string, fallback: string): string {
  if (
    (value.startsWith("/admin") ||
      value.startsWith("/app") ||
      value.startsWith("/paiement") ||
      value.startsWith("/connexion") ||
      value.startsWith("/formations") ||
      value.startsWith("/categories")) &&
    !value.startsWith("//")
  ) {
    return value;
  }
  return fallback;
}

export function rethrowRedirect(error: unknown): void {
  if (isRedirectError(error)) throw error;
}

export function errorMessage(error: unknown, fallback = "Action impossible"): string {
  return error instanceof Error ? error.message : fallback;
}
