import { describe, expect, it } from "vitest";
import {
  assertSandboxPaymentsAllowed,
  getLaunchReadiness,
  isProductionRuntime,
  isSandboxPaymentAllowed,
} from "@/lib/launch/safety";

describe("launch safety", () => {
  it("ne traite pas le build local comme production Vercel", () => {
    const prevVercel = process.env.VERCEL_ENV;
    const prevForce = process.env.FORCE_PRODUCTION_GUARDS;
    delete process.env.VERCEL_ENV;
    delete process.env.FORCE_PRODUCTION_GUARDS;
    expect(isProductionRuntime()).toBe(false);
    expect(isSandboxPaymentAllowed()).toBe(true);
    process.env.VERCEL_ENV = prevVercel;
    process.env.FORCE_PRODUCTION_GUARDS = prevForce;
  });

  it("bloque le sandbox en production Vercel sans override", () => {
    const prevVercel = process.env.VERCEL_ENV;
    const prevAllow = process.env.ALLOW_SANDBOX_IN_PRODUCTION;
    const prevProvider = process.env.PAYMENT_PROVIDER;
    process.env.VERCEL_ENV = "production";
    process.env.PAYMENT_PROVIDER = "sandbox";
    delete process.env.ALLOW_SANDBOX_IN_PRODUCTION;
    expect(isSandboxPaymentAllowed()).toBe(false);
    expect(() => assertSandboxPaymentsAllowed("test")).toThrow(/disabled in production/);
    process.env.VERCEL_ENV = prevVercel;
    process.env.ALLOW_SANDBOX_IN_PRODUCTION = prevAllow;
    process.env.PAYMENT_PROVIDER = prevProvider;
  });

  it("signale les secrets manquants dans readiness", () => {
    const prev = {
      url: process.env.NEXT_PUBLIC_APP_URL,
      inf: process.env.NEXT_PUBLIC_INSFORGE_URL,
      anon: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
      svc: process.env.INSFORGE_SERVICE_KEY,
    };
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_INSFORGE_URL;
    delete process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
    delete process.env.INSFORGE_SERVICE_KEY;
    const readiness = getLaunchReadiness();
    expect(readiness.ok).toBe(false);
    expect(readiness.issues.length).toBeGreaterThan(0);
    process.env.NEXT_PUBLIC_APP_URL = prev.url;
    process.env.NEXT_PUBLIC_INSFORGE_URL = prev.inf;
    process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY = prev.anon;
    process.env.INSFORGE_SERVICE_KEY = prev.svc;
  });
});
