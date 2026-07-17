import { tryCreateInsForgeServiceClient } from "@/lib/insforge/server";
import { getAdminDbClient } from "@/lib/admin/client";
import type { Coupon, CouponDiscountType } from "@/lib/coupons/apply";

function requireServiceClient() {
  const client = tryCreateInsForgeServiceClient();
  if (!client) {
    throw new Error("INSFORGE_SERVICE_KEY is required for coupon operations.");
  }
  return client;
}

const COUPON_COLUMNS =
  "id, code, description, discount_type, discount_value, currency, plan_id, min_amount, max_redemptions, redeemed_count, starts_at, ends_at, is_active, created_at, updated_at";

function mapCoupon(row: Record<string, unknown>): Coupon {
  return {
    id: String(row.id),
    code: String(row.code),
    description: (row.description as string | null) ?? null,
    discountType: String(row.discount_type) as CouponDiscountType,
    discountValue: Number(row.discount_value),
    currency: String(row.currency ?? "XOF"),
    planId: (row.plan_id as string | null) ?? null,
    minAmount: row.min_amount == null ? null : Number(row.min_amount),
    maxRedemptions: row.max_redemptions == null ? null : Number(row.max_redemptions),
    redeemedCount: Number(row.redeemed_count ?? 0),
    startsAt: (row.starts_at as string | null) ?? null,
    endsAt: (row.ends_at as string | null) ?? null,
    isActive: Boolean(row.is_active),
  };
}

export type AdminCoupon = Coupon & { createdAt: string };

/** Lecture service pour la validation au paiement. */
export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const client = requireServiceClient();
  const { data, error } = await client.database
    .from("coupons")
    .select(COUPON_COLUMNS)
    .eq("code", code)
    .maybeSingle();
  if (error || !data) return null;
  return mapCoupon(data as Record<string, unknown>);
}

export async function hasUserRedeemedCoupon(
  couponId: string,
  userId: string,
): Promise<boolean> {
  const client = requireServiceClient();
  const { data } = await client.database
    .from("coupon_redemptions")
    .select("id")
    .eq("coupon_id", couponId)
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}

/** Enregistre l'utilisation d'un coupon (idempotent via contrainte unique). */
export async function recordCouponRedemption(input: {
  couponId: string;
  userId: string;
  paymentId: string | null;
  amountDiscounted: number;
}): Promise<void> {
  const client = requireServiceClient();
  const { error } = await client.database.from("coupon_redemptions").insert([
    {
      coupon_id: input.couponId,
      user_id: input.userId,
      payment_id: input.paymentId,
      amount_discounted: input.amountDiscounted,
    },
  ]);

  if (error) {
    // Déjà enregistré (webhook rejoué) → ne pas ré-incrémenter.
    if (String(error.message).toLowerCase().includes("duplicate") || error.code === "23505") {
      return;
    }
    throw new Error(error.message);
  }

  const { data: current } = await client.database
    .from("coupons")
    .select("redeemed_count")
    .eq("id", input.couponId)
    .maybeSingle();
  const next = Number((current as { redeemed_count?: number } | null)?.redeemed_count ?? 0) + 1;
  await client.database
    .from("coupons")
    .update({ redeemed_count: next })
    .eq("id", input.couponId);
}

// --- Administration ---

export async function listCoupons(): Promise<AdminCoupon[]> {
  const client = await getAdminDbClient();
  const { data } = await client.database
    .from("coupons")
    .select(COUPON_COLUMNS)
    .order("created_at", { ascending: false });
  if (!Array.isArray(data)) return [];
  return data.map((row) => ({
    ...mapCoupon(row as Record<string, unknown>),
    createdAt: String((row as { created_at?: string }).created_at ?? ""),
  }));
}

export async function createCoupon(input: {
  code: string;
  description: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  currency: string;
  planId: string | null;
  minAmount: number | null;
  maxRedemptions: number | null;
  startsAt: string | null;
  endsAt: string | null;
  createdBy: string;
}): Promise<AdminCoupon> {
  const client = await getAdminDbClient();
  const { data, error } = await client.database
    .from("coupons")
    .insert([
      {
        code: input.code,
        description: input.description,
        discount_type: input.discountType,
        discount_value: input.discountValue,
        currency: input.currency,
        plan_id: input.planId,
        min_amount: input.minAmount,
        max_redemptions: input.maxRedemptions,
        starts_at: input.startsAt,
        ends_at: input.endsAt,
        created_by: input.createdBy,
      },
    ])
    .select(COUPON_COLUMNS)
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "Création du coupon impossible");
  }
  return {
    ...mapCoupon(data as Record<string, unknown>),
    createdAt: String((data as { created_at?: string }).created_at ?? ""),
  };
}

export async function setCouponActive(id: string, isActive: boolean): Promise<void> {
  const client = await getAdminDbClient();
  const { error } = await client.database
    .from("coupons")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
