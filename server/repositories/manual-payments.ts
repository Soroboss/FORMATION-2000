import { getAccessToken } from "@/lib/auth/cookies";
import {
  tryCreateInsForgeServerClient,
  tryCreateInsForgeServiceClient,
} from "@/lib/insforge/server";
import {
  resolveManualPaymentConfig,
  type ManualPaymentConfig,
} from "@/lib/payments/manual-config";

export type ManualPaymentRequest = {
  id: string;
  userId: string;
  planId: string | null;
  amount: number;
  currency: string;
  payerPhone: string;
  payerName: string | null;
  network: string | null;
  transactionRef: string | null;
  note: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
};

function mapRow(row: Record<string, unknown>): ManualPaymentRequest {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    planId: (row.plan_id as string | null) ?? null,
    amount: Number(row.amount),
    currency: String(row.currency ?? "XOF"),
    payerPhone: String(row.payer_phone),
    payerName: (row.payer_name as string | null) ?? null,
    network: (row.network as string | null) ?? null,
    transactionRef: (row.transaction_ref as string | null) ?? null,
    note: (row.note as string | null) ?? null,
    status: row.status as ManualPaymentRequest["status"],
    reviewedBy: (row.reviewed_by as string | null) ?? null,
    reviewedAt: (row.reviewed_at as string | null) ?? null,
    reviewNote: (row.review_note as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}

async function userClient() {
  const token = await getAccessToken();
  return tryCreateInsForgeServerClient(token);
}

export async function getManualPaymentConfig(): Promise<ManualPaymentConfig> {
  const client =
    (await userClient()) ?? tryCreateInsForgeServiceClient() ?? tryCreateInsForgeServerClient();
  if (!client) return resolveManualPaymentConfig();

  const { data } = await client.database
    .from("app_settings")
    .select("value")
    .eq("key", "manual_payment.config")
    .maybeSingle();

  return resolveManualPaymentConfig(data?.value);
}

export async function createManualPaymentRequest(input: {
  userId: string;
  planId?: string;
  amount: number;
  currency: string;
  payerPhone: string;
  payerName?: string;
  network?: string;
  transactionRef?: string;
  note?: string;
}): Promise<ManualPaymentRequest> {
  const client = await userClient();
  if (!client) throw new Error("Client InsForge indisponible");

  const { data, error } = await client.database
    .from("manual_payment_requests")
    .insert({
      user_id: input.userId,
      plan_id: input.planId ?? null,
      amount: input.amount,
      currency: input.currency,
      payer_phone: input.payerPhone,
      payer_name: input.payerName ?? null,
      network: input.network ?? null,
      transaction_ref: input.transactionRef ?? null,
      note: input.note ?? null,
      status: "pending",
    })
    .select(
      "id, user_id, plan_id, amount, currency, payer_phone, payer_name, network, transaction_ref, note, status, reviewed_by, reviewed_at, review_note, created_at",
    )
    .single();

  if (error || !data) throw new Error(error?.message ?? "Demande impossible à enregistrer");
  return mapRow(data as Record<string, unknown>);
}

export async function listManualPaymentRequestsForUser(
  userId: string,
): Promise<ManualPaymentRequest[]> {
  const client = await userClient();
  if (!client) return [];
  const { data } = await client.database
    .from("manual_payment_requests")
    .select(
      "id, user_id, plan_id, amount, currency, payer_phone, payer_name, network, transaction_ref, note, status, reviewed_by, reviewed_at, review_note, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (!Array.isArray(data)) return [];
  return data.map((row) => mapRow(row as Record<string, unknown>));
}

export async function listPendingManualPaymentRequests(
  limit = 50,
): Promise<ManualPaymentRequest[]> {
  const client = await userClient();
  if (!client) return [];
  const { data } = await client.database
    .from("manual_payment_requests")
    .select(
      "id, user_id, plan_id, amount, currency, payer_phone, payer_name, network, transaction_ref, note, status, reviewed_by, reviewed_at, review_note, created_at",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(limit);
  if (!Array.isArray(data)) return [];
  return data.map((row) => mapRow(row as Record<string, unknown>));
}

export async function getManualPaymentRequest(id: string): Promise<ManualPaymentRequest | null> {
  const client = await userClient();
  if (!client) return null;
  const { data } = await client.database
    .from("manual_payment_requests")
    .select(
      "id, user_id, plan_id, amount, currency, payer_phone, payer_name, network, transaction_ref, note, status, reviewed_by, reviewed_at, review_note, created_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return mapRow(data as Record<string, unknown>);
}

export async function updateManualPaymentRequestStatus(input: {
  id: string;
  status: "approved" | "rejected";
  reviewedBy: string;
  reviewNote?: string;
  paymentId?: string;
  subscriptionId?: string;
}): Promise<ManualPaymentRequest> {
  const client = await userClient();
  if (!client) throw new Error("Client InsForge indisponible");

  const { data, error } = await client.database
    .from("manual_payment_requests")
    .update({
      status: input.status,
      reviewed_by: input.reviewedBy,
      reviewed_at: new Date().toISOString(),
      review_note: input.reviewNote ?? null,
      payment_id: input.paymentId ?? null,
      subscription_id: input.subscriptionId ?? null,
    })
    .eq("id", input.id)
    .select(
      "id, user_id, plan_id, amount, currency, payer_phone, payer_name, network, transaction_ref, note, status, reviewed_by, reviewed_at, review_note, created_at",
    )
    .single();

  if (error || !data) throw new Error(error?.message ?? "Mise à jour impossible");
  return mapRow(data as Record<string, unknown>);
}
