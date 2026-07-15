import { describe, expect, it, beforeEach } from "vitest";
import { buildContentSecurityPolicy, securityHeaders } from "@/lib/security/headers";
import {
  __resetRateLimitStoreForTests,
  checkRateLimit,
} from "@/lib/security/rate-limit";
import { redactSecrets } from "@/lib/observability/log";
import { safeInternalPath } from "@/lib/utils";
import {
  mustVerifyEmailForLearnerApp,
  readEmailVerifiedFlag,
} from "@/lib/auth/email-verification";
import { lessonProgressSchema } from "@/lib/validation/api";
import type { AppSession } from "@/lib/auth/session";

describe("CSP / security headers", () => {
  it("autorise YouTube et bloque object", () => {
    const csp = buildContentSecurityPolicy({
      appUrl: "https://learnoon.example",
      insforgeUrl: "https://2ipa33bu.eu-central.insforge.app",
    });
    expect(csp).toContain("https://www.youtube-nocookie.com");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("2ipa33bu.eu-central.insforge.app");
  });

  it("expose les en-têtes de sécurité attendus", () => {
    const headers = securityHeaders();
    const keys = headers.map((h) => h.key);
    expect(keys).toContain("Content-Security-Policy");
    expect(keys).toContain("X-Frame-Options");
    expect(keys).toContain("Strict-Transport-Security");
  });
});

describe("rate limit", () => {
  beforeEach(() => {
    __resetRateLimitStoreForTests();
  });

  it("autorise jusqu'à la limite puis bloque", () => {
    const now = 1_000_000;
    expect(checkRateLimit({ key: "t", limit: 2, windowMs: 60_000, now }).allowed).toBe(true);
    expect(checkRateLimit({ key: "t", limit: 2, windowMs: 60_000, now }).allowed).toBe(true);
    expect(checkRateLimit({ key: "t", limit: 2, windowMs: 60_000, now }).allowed).toBe(false);
  });

  it("réinitialise après la fenêtre", () => {
    const now = 1_000_000;
    checkRateLimit({ key: "w", limit: 1, windowMs: 1000, now });
    expect(checkRateLimit({ key: "w", limit: 1, windowMs: 1000, now: now + 1001 }).allowed).toBe(
      true,
    );
  });
});

describe("safeInternalPath", () => {
  it("bloque les redirections ouvertes", () => {
    expect(safeInternalPath("https://evil.com")).toBe("/app/tableau-de-bord");
    expect(safeInternalPath("//evil.com")).toBe("/app/tableau-de-bord");
    expect(safeInternalPath("/admin/formations")).toBe("/admin/formations");
  });
});

describe("redactSecrets", () => {
  it("masque les clés sensibles", () => {
    const redacted = redactSecrets({
      password: "secret",
      token: "abc",
      ok: "visible",
      nested: { api_key: "ik_xxx" },
    }) as Record<string, unknown>;
    expect(redacted.password).toBe("[redacted]");
    expect(redacted.token).toBe("[redacted]");
    expect(redacted.ok).toBe("visible");
    expect((redacted.nested as Record<string, unknown>).api_key).toBe("[redacted]");
  });
});

describe("email verification", () => {
  const baseSession: AppSession = {
    user: { id: "u1", email: "a@b.com", emailVerified: false, name: null },
    profile: null,
    roles: ["learner"],
  };

  it("lit les drapeaux InsForge", () => {
    expect(readEmailVerifiedFlag({ emailVerified: true })).toBe(true);
    expect(readEmailVerifiedFlag({ email_verified: false })).toBe(false);
    expect(readEmailVerifiedFlag({ profile: { emailVerified: true } })).toBe(true);
    expect(readEmailVerifiedFlag({})).toBeNull();
  });

  it("bloque l’app apprenant si e-mail non vérifié", () => {
    expect(mustVerifyEmailForLearnerApp(baseSession)).toBe(true);
    expect(
      mustVerifyEmailForLearnerApp({
        ...baseSession,
        user: { ...baseSession.user, emailVerified: true },
      }),
    ).toBe(false);
    expect(
      mustVerifyEmailForLearnerApp({
        ...baseSession,
        roles: ["support"],
      }),
    ).toBe(false);
  });
});

describe("API validation", () => {
  it("valide la progression leçon", () => {
    const ok = lessonProgressSchema.safeParse({
      courseSlug: "intro",
      lessonId: "550e8400-e29b-41d4-a716-446655440000",
      action: "complete",
      progressPercent: 100,
    });
    expect(ok.success).toBe(true);
    const bad = lessonProgressSchema.safeParse({ courseSlug: "", lessonId: "x", action: "nope" });
    expect(bad.success).toBe(false);
  });
});
