import { getAccessToken } from "@/lib/auth/cookies";
import { tryCreateInsForgeServerClient } from "@/lib/insforge/server";

export type SupportTicket = {
  id: string;
  subject: string;
  category: string | null;
  status: string;
  message: string;
  createdAt: string;
};

export async function createSupportTicket(input: {
  userId: string;
  subject: string;
  category?: string;
  message: string;
}): Promise<SupportTicket> {
  const token = await getAccessToken();
  const client = tryCreateInsForgeServerClient(token);
  if (!client) throw new Error("Client InsForge indisponible");

  const { data, error } = await client.database
    .from("support_tickets")
    .insert({
      user_id: input.userId,
      subject: input.subject,
      category: input.category || null,
      message: input.message,
      status: "open",
      priority: "normal",
    })
    .select("id, subject, category, status, message, created_at")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Ticket impossible à créer");
  return {
    id: String(data.id),
    subject: String(data.subject),
    category: (data.category as string | null) ?? null,
    status: String(data.status),
    message: String(data.message),
    createdAt: String(data.created_at),
  };
}

export async function listSupportTicketsForUser(userId: string): Promise<SupportTicket[]> {
  const token = await getAccessToken();
  const client = tryCreateInsForgeServerClient(token);
  if (!client) return [];
  const { data } = await client.database
    .from("support_tickets")
    .select("id, subject, category, status, message, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (!Array.isArray(data)) return [];
  return data.map((row) => ({
    id: String(row.id),
    subject: String(row.subject),
    category: (row.category as string | null) ?? null,
    status: String(row.status),
    message: String(row.message),
    createdAt: String(row.created_at),
  }));
}
