import { describe, expect, it } from "vitest";
import {
  canAccessAdmin,
  hasAnyRole,
  hasRole,
  highestRole,
  isStaff,
} from "@/lib/permissions/roles";
import { safeInternalPath } from "@/lib/utils";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

describe("roles", () => {
  it("détecte le rôle learner", () => {
    expect(hasRole(["learner"], "learner")).toBe(true);
    expect(hasRole(["learner"], "admin")).toBe(false);
  });

  it("autorise l'admin et le support au back-office", () => {
    expect(canAccessAdmin(["learner"])).toBe(false);
    expect(canAccessAdmin(["support"])).toBe(true);
    expect(canAccessAdmin(["admin"])).toBe(true);
    expect(canAccessAdmin(["super_admin"])).toBe(true);
  });

  it("identifie le staff", () => {
    expect(isStaff(["learner"])).toBe(false);
    expect(isStaff(["curator"])).toBe(true);
    expect(hasAnyRole(["instructor", "learner"], ["admin", "instructor"])).toBe(true);
  });

  it("retourne le rôle le plus élevé", () => {
    expect(highestRole(["learner", "admin"])).toBe("admin");
    expect(highestRole([])).toBeNull();
  });
});

describe("safeInternalPath", () => {
  it("rejette les redirections ouvertes", () => {
    expect(safeInternalPath("https://evil.com")).toBe("/app/tableau-de-bord");
    expect(safeInternalPath("//evil.com")).toBe("/app/tableau-de-bord");
    expect(safeInternalPath("/app/profil")).toBe("/app/profil");
  });
});

describe("auth validation", () => {
  it("valide une inscription correcte", () => {
    const result = registerSchema.safeParse({
      firstName: "Awa",
      lastName: "Koné",
      email: "awa@example.com",
      whatsapp: "+2250700000000",
      password: "motdepasse",
      acceptTerms: true,
    });
    expect(result.success).toBe(true);
  });

  it("exige un numéro WhatsApp à l'inscription", () => {
    const result = registerSchema.safeParse({
      firstName: "Awa",
      lastName: "Koné",
      email: "awa@example.com",
      whatsapp: "",
      password: "motdepasse",
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it("refuse un e-mail invalide à la connexion", () => {
    const result = loginSchema.safeParse({
      email: "pas-un-email",
      password: "x",
    });
    expect(result.success).toBe(false);
  });
});
