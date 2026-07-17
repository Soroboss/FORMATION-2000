import { getAdminDbClient } from "@/lib/admin/client";
import { addDays } from "@/lib/payments/subscription-dates";

export type AdminSubscription = {
  id: string;
  userId: string;
  planId: string;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  source: string | null;
};

export type AdminPayment = {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  internalReference: string;
  initiatedAt: string;
  confirmedAt: string | null;
};

export async function listAdminSubscriptions(limit = 100): Promise<AdminSubscription[]> {
  const client = await getAdminDbClient();
  const { data } = await client.database
    .from("subscriptions")
    .select("id, user_id, plan_id, status, starts_at, ends_at, source")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!Array.isArray(data)) return [];
  return data.map((row) => ({
    id: String(row.id),
    userId: String(row.user_id),
    planId: String(row.plan_id),
    status: String(row.status),
    startsAt: (row.starts_at as string | null) ?? null,
    endsAt: (row.ends_at as string | null) ?? null,
    source: (row.source as string | null) ?? null,
  }));
}

export async function listAdminPayments(limit = 100): Promise<AdminPayment[]> {
  const client = await getAdminDbClient();
  const { data } = await client.database
    .from("payments")
    .select(
      "id, user_id, amount, currency, status, provider, internal_reference, initiated_at, confirmed_at, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!Array.isArray(data)) return [];
  return data.map((row) => ({
    id: String(row.id),
    userId: String(row.user_id),
    amount: Number(row.amount),
    currency: String(row.currency ?? "XOF"),
    status: String(row.status),
    provider: String(row.provider),
    internalReference: String(row.internal_reference),
    initiatedAt: String(row.initiated_at ?? row.created_at),
    confirmedAt: (row.confirmed_at as string | null) ?? null,
  }));
}

export type FinancePayment = {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  providerFee: number;
  netAmount: number;
  internalReference: string;
  confirmedAt: string | null;
  initiatedAt: string;
};

export async function listFinancePayments(limit = 2000): Promise<FinancePayment[]> {
  const client = await getAdminDbClient();
  const { data } = await client.database
    .from("payments")
    .select(
      "id, user_id, amount, currency, status, provider, provider_fee, net_amount, internal_reference, confirmed_at, initiated_at, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!Array.isArray(data)) return [];
  return data.map((row) => {
    const amount = Number(row.amount) || 0;
    const providerFee = row.provider_fee == null ? 0 : Number(row.provider_fee) || 0;
    const netAmount =
      row.net_amount == null ? amount - providerFee : Number(row.net_amount) || 0;
    return {
      id: String(row.id),
      userId: String(row.user_id),
      amount,
      currency: String(row.currency ?? "XOF"),
      status: String(row.status),
      provider: String(row.provider),
      providerFee,
      netAmount,
      internalReference: String(row.internal_reference),
      confirmedAt: (row.confirmed_at as string | null) ?? null,
      initiatedAt: String(row.initiated_at ?? row.created_at),
    };
  });
}

export type AdminPaymentDetail = {
  id: string;
  userId: string;
  subscriptionId: string | null;
  provider: string;
  providerReference: string | null;
  status: string;
  amount: number;
  currency: string;
};

export async function getAdminPayment(id: string): Promise<AdminPaymentDetail | null> {
  const client = await getAdminDbClient();
  const { data } = await client.database
    .from("payments")
    .select(
      "id, user_id, subscription_id, provider, provider_reference, status, amount, currency",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const row = data as Record<string, unknown>;
  return {
    id: String(row.id),
    userId: String(row.user_id),
    subscriptionId: (row.subscription_id as string | null) ?? null,
    provider: String(row.provider),
    providerReference: (row.provider_reference as string | null) ?? null,
    status: String(row.status),
    amount: Number(row.amount),
    currency: String(row.currency ?? "XOF"),
  };
}

/** Révoque l'abonnement lié à un remboursement (statut + fin immédiate). */
export async function markSubscriptionRefunded(subscriptionId: string): Promise<void> {
  const client = await getAdminDbClient();
  await client.database
    .from("subscriptions")
    .update({ status: "refunded", ends_at: new Date().toISOString(), grace_ends_at: null })
    .eq("id", subscriptionId);
}

export async function markPaymentRefunded(paymentId: string): Promise<void> {
  const client = await getAdminDbClient();
  const { error } = await client.database
    .from("payments")
    .update({ status: "refunded" })
    .eq("id", paymentId);
  if (error) throw new Error(error.message);
}

export async function extendSubscription(subscriptionId: string, days: number) {
  const client = await getAdminDbClient();
  const { data: current, error: readError } = await client.database
    .from("subscriptions")
    .select("id, ends_at, status")
    .eq("id", subscriptionId)
    .single();
  if (readError || !current) throw new Error(readError?.message ?? "Abonnement introuvable");

  const base = current.ends_at ? new Date(String(current.ends_at)) : new Date();
  const now = new Date();
  const from = base.getTime() > now.getTime() ? base : now;
  const endsAt = addDays(from, days).toISOString();

  const { data, error } = await client.database
    .from("subscriptions")
    .update({ ends_at: endsAt, status: "active" })
    .eq("id", subscriptionId)
    .select("id, user_id, plan_id, status, starts_at, ends_at, source")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Prolongation impossible");
  return {
    id: String(data.id),
    userId: String(data.user_id),
    planId: String(data.plan_id),
    status: String(data.status),
    startsAt: (data.starts_at as string | null) ?? null,
    endsAt: (data.ends_at as string | null) ?? null,
    source: (data.source as string | null) ?? null,
  };
}
