import type { AppSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions/roles";

/** Lit le drapeau de vérification renvoyé par InsForge (formats possibles). */
export function readEmailVerifiedFlag(user: unknown): boolean | null {
  if (!user || typeof user !== "object") return null;
  const u = user as Record<string, unknown>;
  if (typeof u.emailVerified === "boolean") return u.emailVerified;
  if (typeof u.email_verified === "boolean") return u.email_verified;
  const profile = u.profile;
  if (profile && typeof profile === "object") {
    const p = profile as Record<string, unknown>;
    if (typeof p.emailVerified === "boolean") return p.emailVerified;
    if (typeof p.email_verified === "boolean") return p.email_verified;
  }
  return null;
}

/** Bloque l’espace apprenant si l’e-mail n’est pas vérifié (staff exempté). */
export function mustVerifyEmailForLearnerApp(session: AppSession): boolean {
  if (isStaff(session.roles)) return false;
  return session.user.emailVerified === false;
}
