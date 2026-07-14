import { getAdminDbClient } from "@/lib/admin/client";
import type { RoleKey } from "@/lib/permissions/roles";

export type AdminMember = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  status: string;
  createdAt: string;
  roles: RoleKey[];
};

export async function listMembers(limit = 100): Promise<AdminMember[]> {
  const client = await getAdminDbClient();
  const { data: profiles } = await client.database
    .from("profiles")
    .select("id, email, first_name, last_name, display_name, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!Array.isArray(profiles) || profiles.length === 0) return [];

  const ids = profiles.map((p) => String(p.id));
  const { data: userRoles } = await client.database
    .from("user_roles")
    .select("user_id, role_id")
    .in("user_id", ids);

  const { data: roles } = await client.database.from("roles").select("id, key");
  const roleById = new Map(
    Array.isArray(roles) ? roles.map((r) => [String(r.id), String(r.key) as RoleKey]) : [],
  );

  const rolesByUser = new Map<string, RoleKey[]>();
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

  return profiles.map((p) => ({
    id: String(p.id),
    email: (p.email as string | null) ?? null,
    firstName: (p.first_name as string | null) ?? null,
    lastName: (p.last_name as string | null) ?? null,
    displayName: (p.display_name as string | null) ?? null,
    status: String(p.status ?? "active"),
    createdAt: String(p.created_at),
    roles: rolesByUser.get(String(p.id)) ?? ["learner"],
  }));
}

export async function getMember(userId: string): Promise<AdminMember | null> {
  const members = await listMembers(500);
  return members.find((m) => m.id === userId) ?? null;
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
