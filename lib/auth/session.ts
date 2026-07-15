import { createInsForgeServerClient } from "@/lib/insforge/server";
import {
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
  setAuthCookies,
} from "@/lib/auth/cookies";
import {
  canAccessAdmin,
  canWriteCatalogContent,
  type RoleKey,
} from "@/lib/permissions/roles";
import { readEmailVerifiedFlag } from "@/lib/auth/email-verification";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  /** null = inconnu (InsForge ne renvoie pas le flag) ; false = non vérifié */
  emailVerified: boolean | null;
};

export type SessionProfile = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  status: string;
};

export type AppSession = {
  user: AuthUser;
  profile: SessionProfile | null;
  roles: RoleKey[];
};

async function refreshSession(refreshToken: string): Promise<string | null> {
  const client = createInsForgeServerClient();
  const { data, error } = await client.auth.refreshSession({ refreshToken });

  if (error || !data?.accessToken) {
    return null;
  }

  if (data.refreshToken) {
    await setAuthCookies(data.accessToken, data.refreshToken);
  } else {
    await setAuthCookies(data.accessToken, refreshToken);
  }

  return data.accessToken;
}

async function loadSessionForToken(accessToken: string): Promise<AppSession | null> {
  const client = createInsForgeServerClient(accessToken);
  const { data, error } = await client.auth.getCurrentUser();

  if (error || !data?.user) {
    return null;
  }

  const user: AuthUser = {
    id: data.user.id,
    email: data.user.email,
    emailVerified: readEmailVerifiedFlag(data.user),
    name:
      (typeof data.user.profile === "object" &&
      data.user.profile &&
      "name" in data.user.profile &&
      typeof data.user.profile.name === "string"
        ? data.user.profile.name
        : null) ?? null,
  };

  const { data: profileRows } = await client.database
    .from("profiles")
    .select("id, first_name, last_name, display_name, email, phone, status")
    .eq("id", user.id)
    .limit(1);

  const profileRow = Array.isArray(profileRows) ? profileRows[0] : null;

  const profile: SessionProfile | null = profileRow
    ? {
        id: profileRow.id as string,
        firstName: (profileRow.first_name as string | null) ?? null,
        lastName: (profileRow.last_name as string | null) ?? null,
        displayName: (profileRow.display_name as string | null) ?? null,
        email: (profileRow.email as string | null) ?? null,
        phone: (profileRow.phone as string | null) ?? null,
        status: (profileRow.status as string) ?? "active",
      }
    : null;

  const roles: RoleKey[] = [];
  const { data: userRoleRows } = await client.database
    .from("user_roles")
    .select("role_id")
    .eq("user_id", user.id);

  const roleIds = Array.isArray(userRoleRows)
    ? userRoleRows
        .map((row) => row.role_id as string | undefined)
        .filter((id): id is string => Boolean(id))
    : [];

  if (roleIds.length > 0) {
    const { data: roleRows } = await client.database
      .from("roles")
      .select("key")
      .in("id", roleIds);

    if (Array.isArray(roleRows)) {
      for (const row of roleRows) {
        const key = row.key as string | undefined;
        if (key) roles.push(key as RoleKey);
      }
    }
  }

  if (roles.length === 0) {
    roles.push("learner");
  }

  return { user, profile, roles };
}

export async function getSession(): Promise<AppSession | null> {
  try {
    let accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    if (!accessToken && refreshToken) {
      accessToken = (await refreshSession(refreshToken)) ?? undefined;
    }

    if (!accessToken) {
      return null;
    }

    let session = await loadSessionForToken(accessToken);

    // Access token expiré / invalide → tenter un refresh une fois
    if (!session && refreshToken) {
      const refreshed = await refreshSession(refreshToken);
      if (refreshed) {
        session = await loadSessionForToken(refreshed);
      }
    }

    if (!session) {
      await clearAuthCookies();
      return null;
    }

    return session;
  } catch {
    try {
      await clearAuthCookies();
    } catch {
      // ignore
    }
    return null;
  }
}

export async function requireSession(): Promise<AppSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireAdminSession(): Promise<AppSession> {
  const session = await requireSession();
  if (!canAccessAdmin(session.roles)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function requireCatalogWriteSession(): Promise<AppSession> {
  const session = await requireAdminSession();
  if (!canWriteCatalogContent(session.roles)) {
    throw new Error(
      "Votre rôle ne permet pas de modifier le catalogue (support : consultation uniquement).",
    );
  }
  return session;
}
