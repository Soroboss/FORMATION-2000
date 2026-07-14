import { getAdminDbClient } from "@/lib/admin/client";

export type AuditEntry = {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
};

export async function writeAuditLog(input: {
  actorUserId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    const client = await getAdminDbClient();
    await client.database.from("audit_logs").insert({
      actor_user_id: input.actorUserId,
      action: input.action,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      old_values: input.oldValues ?? null,
      new_values: input.newValues ?? null,
    });
  } catch {
    // Audit must never break the primary mutation path.
  }
}

export async function listAuditLogs(limit = 50): Promise<AuditEntry[]> {
  const client = await getAdminDbClient();
  const { data, error } = await client.database
    .from("audit_logs")
    .select("id, actor_user_id, action, entity_type, entity_id, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !Array.isArray(data)) return [];
  return data.map((row) => ({
    id: String(row.id),
    actorUserId: (row.actor_user_id as string | null) ?? null,
    action: String(row.action),
    entityType: (row.entity_type as string | null) ?? null,
    entityId: (row.entity_id as string | null) ?? null,
    createdAt: String(row.created_at),
  }));
}
