import { tryCreateInsForgeServiceClient } from "@/lib/insforge/server";
import { getAdminDbClient } from "@/lib/admin/client";

export type TakedownStatus = "pending" | "in_review" | "accepted" | "rejected";

export type TakedownRequest = {
  id: string;
  creatorName: string;
  creatorEmail: string;
  videoUrl: string;
  reason: string;
  status: TakedownStatus;
  adminNote: string | null;
  createdAt: string;
  handledAt: string | null;
};

function mapRow(row: Record<string, unknown>): TakedownRequest {
  return {
    id: String(row.id),
    creatorName: String(row.creator_name),
    creatorEmail: String(row.creator_email),
    videoUrl: String(row.video_url),
    reason: String(row.reason),
    status: String(row.status) as TakedownStatus,
    adminNote: (row.admin_note as string | null) ?? null,
    createdAt: String(row.created_at),
    handledAt: (row.handled_at as string | null) ?? null,
  };
}

/** Soumission publique — clé service (aucune session requise). */
export async function createTakedownRequest(input: {
  creatorName: string;
  creatorEmail: string;
  videoUrl: string;
  reason: string;
}): Promise<void> {
  const client = tryCreateInsForgeServiceClient();
  if (!client) throw new Error("INSFORGE_SERVICE_KEY is required.");
  const { error } = await client.database.from("takedown_requests").insert([
    {
      creator_name: input.creatorName,
      creator_email: input.creatorEmail,
      video_url: input.videoUrl,
      reason: input.reason,
      status: "pending",
    },
  ]);
  if (error) throw new Error(error.message);
}

export async function listTakedownRequests(): Promise<TakedownRequest[]> {
  const client = await getAdminDbClient();
  const { data } = await client.database
    .from("takedown_requests")
    .select("id, creator_name, creator_email, video_url, reason, status, admin_note, created_at, handled_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (!Array.isArray(data)) return [];
  return data.map((row) => mapRow(row as Record<string, unknown>));
}

export async function updateTakedownStatus(input: {
  id: string;
  status: TakedownStatus;
  adminNote: string | null;
  handledBy: string;
}): Promise<void> {
  const client = await getAdminDbClient();
  const { error } = await client.database
    .from("takedown_requests")
    .update({
      status: input.status,
      admin_note: input.adminNote,
      handled_by: input.handledBy,
      handled_at: new Date().toISOString(),
    })
    .eq("id", input.id);
  if (error) throw new Error(error.message);
}
