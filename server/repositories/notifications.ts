import { getAccessToken } from "@/lib/auth/cookies";
import {
  tryCreateInsForgeServerClient,
  tryCreateInsForgeServiceClient,
} from "@/lib/insforge/server";

export type AppNotification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
};

function mapNotification(row: Record<string, unknown>): AppNotification {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    type: String(row.type),
    title: String(row.title),
    message: String(row.message),
    actionUrl: (row.action_url as string | null) ?? null,
    readAt: (row.read_at as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}

/**
 * Cross-user create (admin/ops → learner). Prefer service key.
 */
export async function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
}): Promise<AppNotification | null> {
  const client =
    tryCreateInsForgeServiceClient() ??
    tryCreateInsForgeServerClient(await getAccessToken());
  if (!client) return null;

  const { data, error } = await client.database
    .from("notifications")
    .insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      action_url: input.actionUrl ?? null,
    })
    .select("id, user_id, type, title, message, action_url, read_at, created_at")
    .single();

  if (error || !data) {
    console.error("[notifications] create failed", error?.message);
    return null;
  }
  return mapNotification(data as Record<string, unknown>);
}

export async function listNotificationsForUser(
  userId: string,
  limit = 50,
): Promise<AppNotification[]> {
  const token = await getAccessToken();
  const client = tryCreateInsForgeServerClient(token);
  if (!client) return [];

  const { data } = await client.database
    .from("notifications")
    .select("id, user_id, type, title, message, action_url, read_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!Array.isArray(data)) return [];
  return data.map((row) => mapNotification(row as Record<string, unknown>));
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  const token = await getAccessToken();
  const client = tryCreateInsForgeServerClient(token);
  if (!client) return 0;

  const { data } = await client.database
    .from("notifications")
    .select("id")
    .eq("user_id", userId)
    .is("read_at", null);

  return Array.isArray(data) ? data.length : 0;
}

export async function markNotificationRead(input: {
  notificationId: string;
  userId: string;
}): Promise<void> {
  const token = await getAccessToken();
  const client = tryCreateInsForgeServerClient(token);
  if (!client) throw new Error("Client InsForge indisponible");

  const { error } = await client.database
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", input.notificationId)
    .eq("user_id", input.userId);

  if (error) throw new Error(error.message);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const token = await getAccessToken();
  const client = tryCreateInsForgeServerClient(token);
  if (!client) throw new Error("Client InsForge indisponible");

  const { error } = await client.database
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) throw new Error(error.message);
}
