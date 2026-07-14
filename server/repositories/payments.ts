import {
  createInsForgeServiceClient,
  tryCreateInsForgeServerClient,
  tryCreateInsForgeServiceClient,
} from "@/lib/insforge/server";
import { getAccessToken } from "@/lib/auth/cookies";
import {
  computeSubscriptionWindow,
  isSubscriptionAccessValid,
} from "@/lib/payments/subscription-dates";
import type { Plan, Payment, Subscription, SubscriptionStatus, PaymentStatus } from "@/types/payments";

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function mapPlan(row: Record<string, unknown>): Plan {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: (row.description as string | null) ?? null,
    priceAmount: Number(row.price_amount),
    currency: String(row.currency ?? "XOF"),
    durationDays: Number(row.duration_days ?? 30),
    isActive: Boolean(row.is_active),
    features: asStringArray(row.features),
  };
}

function mapSubscription(row: Record<string, unknown>): Subscription {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    planId: String(row.plan_id),
    status: row.status as SubscriptionStatus,
    startsAt: (row.starts_at as string | null) ?? null,
    endsAt: (row.ends_at as string | null) ?? null,
    graceEndsAt: (row.grace_ends_at as string | null) ?? null,
    cancelledAt: (row.cancelled_at as string | null) ?? null,
    source: (row.source as string | null) ?? null,
  };
}

function mapPayment(row: Record<string, unknown>): Payment {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    subscriptionId: (row.subscription_id as string | null) ?? null,
    planId: (row.plan_id as string | null) ?? null,
    provider: String(row.provider),
    providerReference: (row.provider_reference as string | null) ?? null,
    internalReference: String(row.internal_reference),
    amount: Number(row.amount),
    currency: String(row.currency ?? "XOF"),
    status: row.status as PaymentStatus,
    paymentMethod: (row.payment_method as string | null) ?? null,
    confirmedAt: (row.confirmed_at as string | null) ?? null,
    failedAt: (row.failed_at as string | null) ?? null,
    initiatedAt: String(row.initiated_at ?? row.created_at),
  };
}

function requireServiceClient() {
  const client = tryCreateInsForgeServiceClient();
  if (!client) {
    throw new Error(
      "INSFORGE_SERVICE_KEY is required for payment operations. Configure .env.local.",
    );
  }
  return client;
}

export async function listActivePlans(): Promise<Plan[]> {
  const token = await getAccessToken();
  const client = tryCreateInsForgeServerClient(token) ?? tryCreateInsForgeServiceClient();
  if (!client) return [];

  const { data, error } = await client.database
    .from("plans")
    .select("id, name, slug, description, price_amount, currency, duration_days, is_active, features")
    .eq("is_active", true)
    .order("price_amount", { ascending: true });

  if (error || !Array.isArray(data)) return [];
  return data.map((row) => mapPlan(row as Record<string, unknown>));
}

export async function getPlanBySlug(slug: string): Promise<Plan | null> {
  const plans = await listActivePlans();
  return plans.find((p) => p.slug === slug) ?? null;
}

export async function getPlanById(id: string): Promise<Plan | null> {
  const client = tryCreateInsForgeServiceClient() ?? tryCreateInsForgeServerClient();
  if (!client) return null;

  const { data, error } = await client.database
    .from("plans")
    .select("id, name, slug, description, price_amount, currency, duration_days, is_active, features")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapPlan(data as Record<string, unknown>);
}

export async function getLatestSubscriptionForUser(userId: string): Promise<Subscription | null> {
  const token = await getAccessToken();
  const client = tryCreateInsForgeServerClient(token) ?? tryCreateInsForgeServiceClient();
  if (!client) return null;

  const { data, error } = await client.database
    .from("subscriptions")
    .select("id, user_id, plan_id, status, starts_at, ends_at, grace_ends_at, cancelled_at, source")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !Array.isArray(data) || data.length === 0) return null;
  return mapSubscription(data[0] as Record<string, unknown>);
}

export async function userHasPremiumAccess(userId: string): Promise<boolean> {
  const client = tryCreateInsForgeServiceClient() ?? tryCreateInsForgeServerClient(await getAccessToken());
  if (!client) return false;

  const { data, error } = await client.database
    .from("subscriptions")
    .select("status, ends_at, grace_ends_at")
    .eq("user_id", userId)
    .in("status", ["active", "grace_period"])
    .order("ends_at", { ascending: false })
    .limit(5);

  if (error || !Array.isArray(data)) return false;

  return data.some((row) =>
    isSubscriptionAccessValid({
      status: String((row as { status: string }).status),
      endsAt: (row as { ends_at?: string | null }).ends_at
        ? new Date(String((row as { ends_at: string }).ends_at))
        : null,
      graceEndsAt: (row as { grace_ends_at?: string | null }).grace_ends_at
        ? new Date(String((row as { grace_ends_at: string }).grace_ends_at))
        : null,
    }),
  );
}

export async function listPaymentsForUser(userId: string): Promise<Payment[]> {
  const token = await getAccessToken();
  const client = tryCreateInsForgeServerClient(token) ?? tryCreateInsForgeServiceClient();
  if (!client) return [];

  const { data, error } = await client.database
    .from("payments")
    .select(
      "id, user_id, subscription_id, plan_id, provider, provider_reference, internal_reference, amount, currency, status, payment_method, confirmed_at, failed_at, initiated_at, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !Array.isArray(data)) return [];
  return data.map((row) => mapPayment(row as Record<string, unknown>));
}

export async function getPaymentByInternalReference(
  internalReference: string,
): Promise<Payment | null> {
  const client = requireServiceClient();
  const { data, error } = await client.database
    .from("payments")
    .select(
      "id, user_id, subscription_id, plan_id, provider, provider_reference, internal_reference, amount, currency, status, payment_method, confirmed_at, failed_at, initiated_at, created_at",
    )
    .eq("internal_reference", internalReference)
    .maybeSingle();

  if (error || !data) return null;
  return mapPayment(data as Record<string, unknown>);
}

export async function getPaymentByProviderReference(
  providerReference: string,
): Promise<Payment | null> {
  const client = requireServiceClient();
  const { data, error } = await client.database
    .from("payments")
    .select(
      "id, user_id, subscription_id, plan_id, provider, provider_reference, internal_reference, amount, currency, status, payment_method, confirmed_at, failed_at, initiated_at, created_at",
    )
    .eq("provider_reference", providerReference)
    .maybeSingle();

  if (error || !data) return null;
  return mapPayment(data as Record<string, unknown>);
}

export async function createPaymentRecord(input: {
  userId: string;
  planId: string;
  provider: string;
  providerReference: string;
  internalReference: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  metadata?: Record<string, unknown>;
}): Promise<Payment> {
  const client = requireServiceClient();
  const { data, error } = await client.database
    .from("payments")
    .insert([
      {
        user_id: input.userId,
        plan_id: input.planId,
        provider: input.provider,
        provider_reference: input.providerReference,
        internal_reference: input.internalReference,
        amount: input.amount,
        currency: input.currency,
        status: input.status,
        metadata: input.metadata ?? {},
      },
    ])
    .select(
      "id, user_id, subscription_id, plan_id, provider, provider_reference, internal_reference, amount, currency, status, payment_method, confirmed_at, failed_at, initiated_at, created_at",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to create payment record");
  }

  return mapPayment(data as Record<string, unknown>);
}

export async function updatePaymentStatus(input: {
  paymentId: string;
  status: PaymentStatus;
  confirmedAt?: string | null;
  failedAt?: string | null;
  subscriptionId?: string | null;
}): Promise<void> {
  const client = requireServiceClient();
  const patch: Record<string, unknown> = { status: input.status };
  if (input.confirmedAt !== undefined) patch.confirmed_at = input.confirmedAt;
  if (input.failedAt !== undefined) patch.failed_at = input.failedAt;
  if (input.subscriptionId !== undefined) patch.subscription_id = input.subscriptionId;

  const { error } = await client.database.from("payments").update(patch).eq("id", input.paymentId);
  if (error) throw new Error(error.message);
}

export async function findPaymentEvent(
  provider: string,
  eventId: string,
): Promise<{ id: string; processed: boolean } | null> {
  const client = requireServiceClient();
  const { data, error } = await client.database
    .from("payment_events")
    .select("id, processed")
    .eq("provider", provider)
    .eq("event_id", eventId)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: String((data as { id: string }).id),
    processed: Boolean((data as { processed: boolean }).processed),
  };
}

export async function insertPaymentEvent(input: {
  paymentId: string | null;
  provider: string;
  eventId: string;
  eventType: string;
  payloadHash: string;
  payload: unknown;
  processed: boolean;
}): Promise<"inserted" | "duplicate"> {
  const client = requireServiceClient();
  const { error } = await client.database.from("payment_events").insert([
    {
      payment_id: input.paymentId,
      provider: input.provider,
      event_id: input.eventId,
      event_type: input.eventType,
      payload_hash: input.payloadHash,
      payload: input.payload,
      processed: input.processed,
      processed_at: input.processed ? new Date().toISOString() : null,
    },
  ]);

  if (error) {
    // Unique violation → already seen
    if (String(error.message).toLowerCase().includes("duplicate") || error.code === "23505") {
      return "duplicate";
    }
    throw new Error(error.message);
  }

  return "inserted";
}

export async function markPaymentEventProcessed(provider: string, eventId: string): Promise<void> {
  const client = requireServiceClient();
  await client.database
    .from("payment_events")
    .update({ processed: true, processed_at: new Date().toISOString() })
    .eq("provider", provider)
    .eq("event_id", eventId);
}

export async function activateOrExtendSubscription(input: {
  userId: string;
  planId: string;
  durationDays: number;
  confirmedAt: Date;
  graceDays?: number;
  source: string;
}): Promise<Subscription> {
  const client = requireServiceClient();

  const { data: existingRows } = await client.database
    .from("subscriptions")
    .select("id, user_id, plan_id, status, starts_at, ends_at, grace_ends_at, cancelled_at, source")
    .eq("user_id", input.userId)
    .in("status", ["active", "grace_period", "expired", "pending"])
    .order("ends_at", { ascending: false })
    .limit(1);

  const existing =
    Array.isArray(existingRows) && existingRows[0]
      ? mapSubscription(existingRows[0] as Record<string, unknown>)
      : null;

  const currentEndsAt =
    existing?.endsAt && isSubscriptionAccessValid({
      status: existing.status,
      endsAt: new Date(existing.endsAt),
      graceEndsAt: existing.graceEndsAt ? new Date(existing.graceEndsAt) : null,
      now: input.confirmedAt,
    })
      ? new Date(existing.endsAt)
      : null;

  const window = computeSubscriptionWindow({
    confirmedAt: input.confirmedAt,
    durationDays: input.durationDays,
    currentEndsAt,
    graceDays: input.graceDays ?? 0,
    now: input.confirmedAt,
  });

  if (existing && (existing.status === "active" || existing.status === "grace_period" || existing.status === "expired" || existing.status === "pending")) {
    const { data, error } = await client.database
      .from("subscriptions")
      .update({
        plan_id: input.planId,
        status: "active",
        starts_at: existing.startsAt ?? window.startsAt.toISOString(),
        ends_at: window.endsAt.toISOString(),
        grace_ends_at: window.graceEndsAt?.toISOString() ?? null,
        source: input.source,
        cancelled_at: null,
      })
      .eq("id", existing.id)
      .select("id, user_id, plan_id, status, starts_at, ends_at, grace_ends_at, cancelled_at, source")
      .single();

    if (error || !data) throw new Error(error?.message ?? "Unable to update subscription");
    return mapSubscription(data as Record<string, unknown>);
  }

  const { data, error } = await client.database
    .from("subscriptions")
    .insert([
      {
        user_id: input.userId,
        plan_id: input.planId,
        status: "active",
        starts_at: window.startsAt.toISOString(),
        ends_at: window.endsAt.toISOString(),
        grace_ends_at: window.graceEndsAt?.toISOString() ?? null,
        source: input.source,
      },
    ])
    .select("id, user_id, plan_id, status, starts_at, ends_at, grace_ends_at, cancelled_at, source")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Unable to create subscription");
  return mapSubscription(data as Record<string, unknown>);
}

/** Exported for rare cases needing direct service client construction. */
export function getPaymentsServiceClient() {
  return createInsForgeServiceClient();
}
