import { getAccessToken } from "@/lib/auth/cookies";
import { tryCreateInsForgeServerClient } from "@/lib/insforge/server";

export type SupportTicket = {
  id: string;
  subject: string;
  category: string | null;
  status: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
};

export type SupportMessage = {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
};

async function clientOrThrow() {
  const token = await getAccessToken();
  const client = tryCreateInsForgeServerClient(token);
  if (!client) throw new Error("Client InsForge indisponible");
  return client;
}

function mapTicket(row: Record<string, unknown>): SupportTicket & { userId?: string | null } {
  return {
    id: String(row.id),
    subject: String(row.subject),
    category: (row.category as string | null) ?? null,
    status: String(row.status),
    message: String(row.message),
    createdAt: String(row.created_at),
    updatedAt: row.updated_at != null ? String(row.updated_at) : undefined,
    userId: row.user_id != null ? String(row.user_id) : null,
  };
}

function mapMessage(row: Record<string, unknown>): SupportMessage {
  return {
    id: String(row.id),
    ticketId: String(row.ticket_id),
    senderId: String(row.sender_id),
    message: String(row.message),
    isInternal: Boolean(row.is_internal),
    createdAt: String(row.created_at),
  };
}

export async function createSupportTicket(input: {
  userId: string;
  subject: string;
  category?: string;
  message: string;
}): Promise<SupportTicket> {
  const client = await clientOrThrow();

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
    .select("id, subject, category, status, message, created_at, updated_at, user_id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Ticket impossible à créer");

  const ticketId = String(data.id);
  const { error: msgError } = await client.database.from("support_messages").insert({
    ticket_id: ticketId,
    sender_id: input.userId,
    message: input.message,
    is_internal: false,
  });

  if (msgError) {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "support_message_seed_failed",
        error: msgError.message,
        ticketId,
      }),
    );
  }

  return mapTicket(data as Record<string, unknown>);
}

export async function listSupportTicketsForUser(userId: string): Promise<SupportTicket[]> {
  const token = await getAccessToken();
  const client = tryCreateInsForgeServerClient(token);
  if (!client) return [];
  const { data } = await client.database
    .from("support_tickets")
    .select("id, subject, category, status, message, created_at, updated_at, user_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (!Array.isArray(data)) return [];
  return data.map((row) => mapTicket(row as Record<string, unknown>));
}

export type AdminSupportTicket = SupportTicket & { userId: string | null };

export async function listSupportTicketsForStaff(limit = 100): Promise<AdminSupportTicket[]> {
  const token = await getAccessToken();
  const client = tryCreateInsForgeServerClient(token);
  if (!client) return [];
  const { data } = await client.database
    .from("support_tickets")
    .select("id, subject, category, status, message, created_at, updated_at, user_id")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!Array.isArray(data)) return [];
  return data.map((row) => {
    const ticket = mapTicket(row as Record<string, unknown>);
    return { ...ticket, userId: ticket.userId ?? null };
  });
}

export async function getSupportTicketForUser(input: {
  ticketId: string;
  userId: string;
}): Promise<SupportTicket | null> {
  const token = await getAccessToken();
  const client = tryCreateInsForgeServerClient(token);
  if (!client) return null;
  const { data } = await client.database
    .from("support_tickets")
    .select("id, subject, category, status, message, created_at, updated_at, user_id")
    .eq("id", input.ticketId)
    .eq("user_id", input.userId)
    .maybeSingle();
  if (!data) return null;
  return mapTicket(data as Record<string, unknown>);
}

export async function getSupportTicketForStaff(
  ticketId: string,
): Promise<AdminSupportTicket | null> {
  const token = await getAccessToken();
  const client = tryCreateInsForgeServerClient(token);
  if (!client) return null;
  const { data } = await client.database
    .from("support_tickets")
    .select("id, subject, category, status, message, created_at, updated_at, user_id")
    .eq("id", ticketId)
    .maybeSingle();
  if (!data) return null;
  const ticket = mapTicket(data as Record<string, unknown>);
  return { ...ticket, userId: ticket.userId ?? null };
}

export async function listSupportMessages(
  ticketId: string,
  opts?: { includeInternal?: boolean },
): Promise<SupportMessage[]> {
  const token = await getAccessToken();
  const client = tryCreateInsForgeServerClient(token);
  if (!client) return [];

  let query = client.database
    .from("support_messages")
    .select("id, ticket_id, sender_id, message, is_internal, created_at")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (!opts?.includeInternal) {
    query = query.eq("is_internal", false);
  }

  const { data } = await query;
  if (!Array.isArray(data)) return [];
  return data.map((row) => mapMessage(row as Record<string, unknown>));
}

export async function addSupportMessage(input: {
  ticketId: string;
  senderId: string;
  message: string;
  isInternal?: boolean;
}): Promise<SupportMessage> {
  const client = await clientOrThrow();

  const { data, error } = await client.database
    .from("support_messages")
    .insert({
      ticket_id: input.ticketId,
      sender_id: input.senderId,
      message: input.message,
      is_internal: Boolean(input.isInternal),
    })
    .select("id, ticket_id, sender_id, message, is_internal, created_at")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Message impossible à envoyer");

  await client.database
    .from("support_tickets")
    .update({
      updated_at: new Date().toISOString(),
      ...(input.isInternal
        ? {}
        : {
            // keep legacy preview field in sync with last public message
            message: input.message,
          }),
    })
    .eq("id", input.ticketId);

  return mapMessage(data as Record<string, unknown>);
}

export async function updateSupportTicketStatus(input: {
  ticketId: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  actorUserId: string;
}): Promise<{ userId: string | null }> {
  const client = await clientOrThrow();

  const { data: existing } = await client.database
    .from("support_tickets")
    .select("user_id")
    .eq("id", input.ticketId)
    .maybeSingle();

  const patch: Record<string, unknown> = {
    status: input.status,
    assigned_to: input.actorUserId,
  };
  if (input.status === "resolved" || input.status === "closed") {
    patch.resolved_at = new Date().toISOString();
  }

  const { error } = await client.database
    .from("support_tickets")
    .update(patch)
    .eq("id", input.ticketId);

  if (error) throw new Error(error.message);

  const userId =
    existing && existing.user_id != null ? String(existing.user_id) : null;
  return { userId };
}
