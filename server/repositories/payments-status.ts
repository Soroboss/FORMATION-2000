import { tryCreateInsForgeServerClient } from "@/lib/insforge/server";
import { getAccessToken } from "@/lib/auth/cookies";
import type { Payment, PaymentStatus } from "@/types/payments";

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
    couponCode: (row.coupon_code as string | null) ?? null,
    discountAmount: Number(row.discount_amount ?? 0),
  };
}

export async function tryGetPaymentAsUser(
  internalReference: string,
  userId: string,
): Promise<Payment | null> {
  const token = await getAccessToken();
  const client = tryCreateInsForgeServerClient(token);
  if (!client) return null;

  const { data, error } = await client.database
    .from("payments")
    .select(
      "id, user_id, subscription_id, plan_id, provider, provider_reference, internal_reference, amount, currency, status, payment_method, confirmed_at, failed_at, initiated_at, coupon_code, discount_amount, created_at",
    )
    .eq("internal_reference", internalReference)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapPayment(data as Record<string, unknown>);
}
