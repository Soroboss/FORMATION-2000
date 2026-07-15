export const ROLE_KEYS = [
  "learner",
  "curator",
  "instructor",
  "support",
  "admin",
  "super_admin",
] as const;

export type RoleKey = (typeof ROLE_KEYS)[number];

export const PERMISSION_KEYS = [
  "profile:read_own",
  "profile:update_own",
  "admin:access",
  "admin:members",
  "admin:roles",
  "admin:settings",
  "admin:finances",
  "admin:audit",
  "content:create",
  "content:publish",
  "support:tickets",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

const ROLE_RANK: Record<RoleKey, number> = {
  learner: 1,
  curator: 2,
  instructor: 3,
  support: 4,
  admin: 5,
  super_admin: 6,
};

export function hasRole(userRoles: readonly string[], required: RoleKey): boolean {
  return userRoles.includes(required);
}

export function hasAnyRole(userRoles: readonly string[], required: readonly RoleKey[]): boolean {
  return required.some((role) => userRoles.includes(role));
}

export function isStaff(userRoles: readonly string[]): boolean {
  return hasAnyRole(userRoles, ["curator", "instructor", "support", "admin", "super_admin"]);
}

export function canAccessAdmin(userRoles: readonly string[]): boolean {
  return hasAnyRole(userRoles, [
    "curator",
    "instructor",
    "support",
    "admin",
    "super_admin",
  ]);
}

/** Création / édition formations, modules, leçons, catégories. */
export function canWriteCatalogContent(userRoles: readonly string[]): boolean {
  return hasAnyRole(userRoles, ["curator", "instructor", "admin", "super_admin"]);
}

/** Accueil après connexion selon le type de compte. */
export function defaultHomeForRoles(userRoles: readonly string[]): string {
  return canAccessAdmin(userRoles) ? "/admin/tableau-de-bord" : "/app/tableau-de-bord";
}

/**
 * Résout la redirection post-login :
 * - compte admin → espace admin par défaut (sauf next déjà vers /admin)
 * - compte apprenant → espace apprenant (jamais /admin)
 */
export function resolvePostLoginPath(
  requested: string | null | undefined,
  userRoles: readonly string[],
): string {
  const fallback = defaultHomeForRoles(userRoles);
  if (!requested || !requested.startsWith("/") || requested.startsWith("//")) {
    return fallback;
  }

  if (canAccessAdmin(userRoles)) {
    if (requested.startsWith("/admin")) return requested;
    // Un admin qui demande /app le fera via le mode aperçu apprenant.
    if (requested.startsWith("/app")) return requested;
    return fallback;
  }

  if (requested.startsWith("/admin")) return fallback;
  return requested;
}

export function highestRole(userRoles: readonly string[]): RoleKey | null {
  let best: RoleKey | null = null;
  let bestRank = 0;

  for (const role of userRoles) {
    if ((ROLE_KEYS as readonly string[]).includes(role)) {
      const key = role as RoleKey;
      const rank = ROLE_RANK[key];
      if (rank > bestRank) {
        best = key;
        bestRank = rank;
      }
    }
  }

  return best;
}

/** Rôles d’équipe (hors apprenant pur). */
export const STAFF_ROLE_KEYS = [
  "curator",
  "instructor",
  "support",
  "admin",
  "super_admin",
] as const satisfies readonly RoleKey[];

export const ROLE_DESCRIPTIONS: Record<RoleKey, string> = {
  learner: "Accès formations (espace apprenant uniquement).",
  curator: "Peut préparer / organiser du contenu pédagogique.",
  instructor: "Peut créer et publier des formations / leçons.",
  support: "Accès admin limité (support, consultation membres).",
  admin: "Gestion complète : contenus, membres, paiements, paramètres.",
  super_admin: "Tous les droits, y compris attribution des rôles admin.",
};

export const PERMISSION_DESCRIPTIONS: Record<PermissionKey, string> = {
  "profile:read_own": "Lire son propre profil",
  "profile:update_own": "Modifier son propre profil",
  "admin:access": "Entrer dans l’espace administration",
  "admin:members": "Voir et gérer les membres",
  "admin:roles": "Attribuer / retirer des rôles",
  "admin:settings": "Modifier les paramètres application",
  "admin:finances": "Voir paiements et abonnements",
  "admin:audit": "Consulter les journaux d’audit",
  "content:create": "Créer du contenu (formations)",
  "content:publish": "Publier du contenu",
  "support:tickets": "Gérer le support",
};

export function canManageMemberRoles(actorRoles: readonly string[]): boolean {
  return hasAnyRole(actorRoles, ["admin", "super_admin"]);
}

/** Rôles qu’un acteur a le droit d’attribuer / retirer. */
export function assignableRolesForActor(actorRoles: readonly string[]): RoleKey[] {
  if (hasRole(actorRoles, "super_admin")) {
    return [...ROLE_KEYS];
  }
  if (hasRole(actorRoles, "admin")) {
    return ["learner", "curator", "instructor", "support"];
  }
  return [];
}

export function assertCanAssignRole(
  actorRoles: readonly string[],
  targetRole: RoleKey,
): void {
  if (!canManageMemberRoles(actorRoles)) {
    throw new Error("Seuls les administrateurs peuvent gérer les rôles.");
  }
  const allowed = assignableRolesForActor(actorRoles);
  if (!allowed.includes(targetRole)) {
    throw new Error(
      "Permission insuffisante pour attribuer ce rôle. Un super admin est requis.",
    );
  }
}
