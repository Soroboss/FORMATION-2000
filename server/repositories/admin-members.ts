import { getAdminDbClient } from "@/lib/admin/client";
import { tryCreateInsForgeServiceClient } from "@/lib/insforge/server";
import type { PermissionKey, RoleKey } from "@/lib/permissions/roles";
import { isStaff } from "@/lib/permissions/roles";

export type AdminMember = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  roles: RoleKey[];
};

export type RolePermissionMatrixRow = {
  key: RoleKey;
  name: string;
  description: string | null;
  permissions: PermissionKey[];
};

function mapProfile(
  p: Record<string, unknown>,
  roles: RoleKey[],
): AdminMember {
  return {
    id: String(p.id),
    email: (p.email as string | null) ?? null,
    firstName: (p.first_name as string | null) ?? null,
    lastName: (p.last_name as string | null) ?? null,
    displayName: (p.display_name as string | null) ?? null,
    phone: (p.phone as string | null) ?? null,
    status: String(p.status ?? "active"),
    createdAt: String(p.created_at),
    lastLoginAt: (p.last_login_at as string | null) ?? null,
    roles: roles.length > 0 ? roles : ["learner"],
  };
}

async function loadRolesByUserIds(
  userIds: string[],
): Promise<Map<string, RoleKey[]>> {
  const client = await getAdminDbClient();
  const rolesByUser = new Map<string, RoleKey[]>();
  if (userIds.length === 0) return rolesByUser;

  const { data: roles } = await client.database.from("roles").select("id, key");
  const roleById = new Map(
    Array.isArray(roles) ? roles.map((r) => [String(r.id), String(r.key) as RoleKey]) : [],
  );

  const { data: userRoles } = await client.database
    .from("user_roles")
    .select("user_id, role_id")
    .in("user_id", userIds);

  if (Array.isArray(userRoles)) {
    for (const row of userRoles) {
      const uid = String(row.user_id);
      const key = roleById.get(String(row.role_id));
      if (!key) continue;
      const list = rolesByUser.get(uid) ?? [];
      list.push(key);
      rolesByUser.set(uid, list);
    }
  }
  return rolesByUser;
}

export async function listMembers(limit = 200): Promise<AdminMember[]> {
  const client = await getAdminDbClient();
  const { data: profiles, error } = await client.database
    .from("profiles")
    .select(
      "id, email, first_name, last_name, display_name, phone, status, created_at, last_login_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  if (!Array.isArray(profiles) || profiles.length === 0) return [];

  const ids = profiles.map((p) => String(p.id));
  const rolesByUser = await loadRolesByUserIds(ids);

  return profiles.map((p) =>
    mapProfile(p as Record<string, unknown>, rolesByUser.get(String(p.id)) ?? []),
  );
}

export async function listStaffMembers(limit = 200): Promise<AdminMember[]> {
  const members = await listMembers(limit);
  return members.filter((m) => isStaff(m.roles));
}

export async function getMember(userId: string): Promise<AdminMember | null> {
  const client = await getAdminDbClient();
  const { data, error } = await client.database
    .from("profiles")
    .select(
      "id, email, first_name, last_name, display_name, phone, status, created_at, last_login_at",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const rolesByUser = await loadRolesByUserIds([userId]);
  return mapProfile(data as Record<string, unknown>, rolesByUser.get(userId) ?? []);
}

export async function updateMemberStatus(userId: string, status: string): Promise<void> {
  const client = await getAdminDbClient();
  const { error } = await client.database
    .from("profiles")
    .update({ status })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function assignRole(userId: string, roleKey: RoleKey): Promise<void> {
  const client = await getAdminDbClient();
  const { data: role, error: roleError } = await client.database
    .from("roles")
    .select("id")
    .eq("key", roleKey)
    .single();
  if (roleError || !role) throw new Error("Rôle introuvable");

  const { error } = await client.database.from("user_roles").upsert(
    { user_id: userId, role_id: role.id },
    { onConflict: "user_id,role_id" },
  );
  if (error) throw new Error(error.message);
}

export async function removeRole(userId: string, roleKey: RoleKey): Promise<void> {
  const client = await getAdminDbClient();
  const { data: role } = await client.database
    .from("roles")
    .select("id")
    .eq("key", roleKey)
    .single();
  if (!role) return;
  const { error } = await client.database
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role_id", role.id);
  if (error) throw new Error(error.message);
}

export async function countUsersWithRole(roleKey: RoleKey): Promise<number> {
  const client = await getAdminDbClient();
  const { data: role } = await client.database
    .from("roles")
    .select("id")
    .eq("key", roleKey)
    .maybeSingle();
  if (!role) return 0;
  const { data, error } = await client.database
    .from("user_roles")
    .select("user_id")
    .eq("role_id", role.id);
  if (error) throw new Error(error.message);
  return Array.isArray(data) ? data.length : 0;
}

export async function createCollaborator(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  whatsapp?: string;
  roleKey: RoleKey;
}): Promise<AdminMember> {
  const privileged = tryCreateInsForgeServiceClient();
  if (!privileged) {
    throw new Error(
      "Clé service InsForge manquante (INSFORGE_SERVICE_KEY) — impossible de créer un compte.",
    );
  }

  const displayName = `${input.firstName} ${input.lastName}`.trim();
  const { data, error } = await privileged.auth.signUp({
    email: input.email.toLowerCase(),
    password: input.password,
    name: displayName,
  });

  if (error) {
    throw new Error(error.message ?? "Création du compte impossible");
  }

  const userId = data?.user?.id;
  if (!userId) {
    throw new Error("Compte créé sans identifiant utilisateur");
  }

  const { error: profileError } = await privileged.database
    .from("profiles")
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      display_name: displayName,
      email: input.email.toLowerCase(),
      phone: input.whatsapp || null,
      status: "active",
    })
    .eq("id", userId);

  if (profileError) {
    throw new Error(profileError.message);
  }

  await assignRole(userId, input.roleKey);

  const member = await getMember(userId);
  if (!member) {
    throw new Error("Collaborateur créé mais introuvable");
  }
  return member;
}

export async function listRolePermissionMatrix(): Promise<RolePermissionMatrixRow[]> {
  const client = await getAdminDbClient();

  const [{ data: roles }, { data: permissions }, { data: links }] = await Promise.all([
    client.database.from("roles").select("id, key, name, description").order("key"),
    client.database.from("permissions").select("id, key"),
    client.database.from("role_permissions").select("role_id, permission_id"),
  ]);

  const permById = new Map(
    Array.isArray(permissions)
      ? permissions.map((p) => [String(p.id), String(p.key) as PermissionKey])
      : [],
  );

  const permsByRoleId = new Map<string, PermissionKey[]>();
  if (Array.isArray(links)) {
    for (const row of links) {
      const roleId = String(row.role_id);
      const perm = permById.get(String(row.permission_id));
      if (!perm) continue;
      const list = permsByRoleId.get(roleId) ?? [];
      list.push(perm);
      permsByRoleId.set(roleId, list);
    }
  }

  if (!Array.isArray(roles)) return [];

  return roles.map((r) => ({
    key: String(r.key) as RoleKey,
    name: String(r.name),
    description: (r.description as string | null) ?? null,
    permissions: permsByRoleId.get(String(r.id)) ?? [],
  }));
}
