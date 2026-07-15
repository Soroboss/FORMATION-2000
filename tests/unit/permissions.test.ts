import { describe, expect, it } from "vitest";
import {
  assertCanAssignRole,
  assignableRolesForActor,
  canAccessAdmin,
  canManageMemberRoles,
  defaultHomeForRoles,
  hasAnyRole,
  hasRole,
  highestRole,
  isStaff,
  resolvePostLoginPath,
} from "@/lib/permissions/roles";
import { safeInternalPath } from "@/lib/utils";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

describe("roles", () => {
  it("détecte le rôle learner", () => {
    expect(hasRole(["learner"], "learner")).toBe(true);
    expect(hasRole(["learner"], "admin")).toBe(false);
  });

  it("autorise l'admin, le support et les rôles contenu au back-office", () => {
    expect(canAccessAdmin(["learner"])).toBe(false);
    expect(canAccessAdmin(["curator"])).toBe(true);
    expect(canAccessAdmin(["instructor"])).toBe(true);
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

  it("oriente l'accueil selon le type de compte", () => {
    expect(defaultHomeForRoles(["learner"])).toBe("/app/tableau-de-bord");
    expect(defaultHomeForRoles(["admin"])).toBe("/admin/tableau-de-bord");
    expect(defaultHomeForRoles(["super_admin"])).toBe("/admin/tableau-de-bord");
  });

  it("sépare les redirections post-login admin / apprenant", () => {
    expect(resolvePostLoginPath(null, ["learner"])).toBe("/app/tableau-de-bord");
    expect(resolvePostLoginPath("/admin/formations", ["learner"])).toBe(
      "/app/tableau-de-bord",
    );
    expect(resolvePostLoginPath(null, ["admin"])).toBe("/admin/tableau-de-bord");
    expect(resolvePostLoginPath("/admin/membres", ["admin"])).toBe("/admin/membres");
    expect(resolvePostLoginPath("/app/catalogue", ["admin"])).toBe("/app/catalogue");
  });

  it("restreint l'attribution des rôles selon l'acteur", () => {
    expect(canManageMemberRoles(["support"])).toBe(false);
    expect(canManageMemberRoles(["admin"])).toBe(true);
    expect(assignableRolesForActor(["admin"])).toEqual([
      "learner",
      "curator",
      "instructor",
      "support",
    ]);
    expect(assignableRolesForActor(["super_admin"])).toContain("admin");
    expect(() => assertCanAssignRole(["admin"], "super_admin")).toThrow(/Permission/);
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
