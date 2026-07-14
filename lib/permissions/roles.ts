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
  return hasAnyRole(userRoles, ["support", "admin", "super_admin"]);
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
