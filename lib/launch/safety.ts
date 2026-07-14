/**
 * Production / launch safety helpers.
 * Never activate subscriptions from client redirects alone.
 * Never allow sandbox payment simulation in real production.
 */

/** True only on real Vercel Production (not local `next build`, not Preview). */
export function isProductionRuntime(): boolean {
  if (process.env.VERCEL_ENV === "production") return true;
  if (process.env.FORCE_PRODUCTION_GUARDS === "true") return true;
  return false;
}

export function isSandboxPaymentAllowed(): boolean {
  const provider = (process.env.PAYMENT_PROVIDER ?? "sandbox").toLowerCase();
  if (provider !== "sandbox") return false;
  if (!isProductionRuntime()) return true;
  return process.env.ALLOW_SANDBOX_IN_PRODUCTION === "true";
}

/** Throws if sandbox checkout/simulation must be blocked. */
export function assertSandboxPaymentsAllowed(context: string): void {
  if (!isSandboxPaymentAllowed()) {
    throw new Error(
      `Sandbox payments are disabled in production (${context}). Configure a real PAYMENT_PROVIDER or set ALLOW_SANDBOX_IN_PRODUCTION=true for an explicit soft-launch.`,
    );
  }
}

export function getLaunchReadiness(): {
  ok: boolean;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];

  if (!process.env.NEXT_PUBLIC_APP_URL) issues.push("NEXT_PUBLIC_APP_URL manquant");
  if (!process.env.NEXT_PUBLIC_INSFORGE_URL) issues.push("NEXT_PUBLIC_INSFORGE_URL manquant");
  if (!process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY) {
    issues.push("NEXT_PUBLIC_INSFORGE_ANON_KEY manquant");
  }
  if (!process.env.INSFORGE_SERVICE_KEY) {
    issues.push("INSFORGE_SERVICE_KEY manquant");
  }

  const provider = (process.env.PAYMENT_PROVIDER ?? "sandbox").toLowerCase();
  if (isProductionRuntime() && provider === "sandbox" && !isSandboxPaymentAllowed()) {
    issues.push("PAYMENT_PROVIDER=sandbox interdit en production sans ALLOW_SANDBOX_IN_PRODUCTION");
  }
  if (provider === "sandbox") {
    warnings.push("Paiements en mode sandbox (pas de Mobile Money réel)");
  }
  if (
    !process.env.PAYMENT_WEBHOOK_SECRET ||
    process.env.PAYMENT_WEBHOOK_SECRET.includes("change-me")
  ) {
    warnings.push("PAYMENT_WEBHOOK_SECRET faible ou placeholder");
  }
  if (isProductionRuntime() && process.env.NEXT_PUBLIC_APP_URL?.includes("localhost")) {
    issues.push("NEXT_PUBLIC_APP_URL pointe encore vers localhost");
  }

  return { ok: issues.length === 0, issues, warnings };
}
