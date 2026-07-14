import { NextResponse } from "next/server";
import { hasInsForgePublicConfig } from "@/lib/insforge/server";
import { getLaunchReadiness } from "@/lib/launch/safety";
import { getCheckoutCapability } from "@/lib/payments/checkout-mode";
import { logEvent } from "@/lib/observability/log";

export async function GET() {
  const start = Date.now();
  const readiness = getLaunchReadiness();
  const checkout = getCheckoutCapability();
  const insforgeConfigured = hasInsForgePublicConfig();
  const ok = insforgeConfigured && readiness.ok;

  const payload = {
    ok,
    service: "learnoon-academy",
    phase: 10,
    timestamp: new Date().toISOString(),
    checks: {
      insforgePublicConfig: insforgeConfigured,
      serviceKeyConfigured: Boolean(process.env.INSFORGE_SERVICE_KEY),
      paymentProvider: process.env.PAYMENT_PROVIDER ?? "sandbox",
      checkoutMode: checkout.mode,
      launch: readiness,
    },
  };

  logEvent({
    level: ok ? "info" : "warn",
    msg: "healthcheck",
    route: "/api/health",
    ms: Date.now() - start,
    ok,
  });

  return NextResponse.json(payload, { status: ok ? 200 : 503 });
}
