import { createInsForgeServerClient } from "@/lib/insforge/server";
import {
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
  setAuthCookies,
} from "@/lib/auth/cookies";
import { canAccessAdmin, type RoleKey } from "@/lib/permissions/roles";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
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

async function refreshAccessTokenIfNeeded(accessToken?: string): Promise<string | null> {
  if (accessToken) return accessToken;

  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  const client = createInsForgeServerClient();
  const { data, error } = await client.auth.refreshSession({ refreshToken });

  if (error || !data?.accessToken) {
    await clearAuthCookies();
    return null;
  }

  if (data.refreshToken) {
    await setAuthCookies(data.accessToken, data.refreshToken);
  } else {
    await setAuthCookies(data.accessToken, refreshToken);
  }

  return data.accessToken;
}

export async function getSession(): Promise<AppSession | null> {
  try {
    const existingAccess = await getAccessToken();
    const accessToken = await refreshAccessTokenIfNeeded(existingAccess);

    if (!accessToken) return null;

    const client = createInsForgeServerClient(accessToken);
    const { data, error } = await client.auth.getCurrentUser();

    if (error || !data?.user) {
      await clearAuthCookies();
      return null;
    }

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email,
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
  } catch {
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
