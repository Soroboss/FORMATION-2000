"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/session";
import { hasAnyRole } from "@/lib/permissions/roles";
import { normalizeCouponCode, type CouponDiscountType } from "@/lib/coupons/apply";
import { createCoupon, setCouponActive } from "@/server/repositories/coupons";
import { writeAuditLog } from "@/lib/audit/write";

export type CouponActionResult = { success: boolean; error?: string };

function parseIntOrNull(value: FormDataEntryValue | null): number | null {
  const str = String(value ?? "").trim();
  if (!str) return null;
  const n = Number(str);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

function parseDateOrNull(value: FormDataEntryValue | null): string | null {
  const str = String(value ?? "").trim();
  if (!str) return null;
  const date = new Date(str);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function createCouponAction(
  formData: FormData,
): Promise<CouponActionResult> {
  try {
    const session = await requireAdminSession();
    if (!hasAnyRole(session.roles, ["admin", "super_admin"])) {
      return { success: false, error: "Seuls les administrateurs gèrent les coupons." };
    }

    const code = normalizeCouponCode(String(formData.get("code") ?? ""));
    if (code.length < 3) {
      return { success: false, error: "Le code doit comporter au moins 3 caractères." };
    }

    const discountType = String(formData.get("discountType") ?? "percent") as CouponDiscountType;
    if (discountType !== "percent" && discountType !== "fixed") {
      return { success: false, error: "Type de réduction invalide." };
    }

    const discountValue = parseIntOrNull(formData.get("discountValue"));
    if (!discountValue) {
      return { success: false, error: "La valeur de réduction est requise." };
    }
    if (discountType === "percent" && discountValue > 100) {
      return { success: false, error: "Un pourcentage ne peut pas dépasser 100." };
    }

    const planId = String(formData.get("planId") ?? "").trim() || null;

    await createCoupon({
      code,
      description: String(formData.get("description") ?? "").trim() || null,
      discountType,
      discountValue,
      currency: String(formData.get("currency") ?? "XOF").trim() || "XOF",
      planId,
      minAmount: parseIntOrNull(formData.get("minAmount")),
      maxRedemptions: parseIntOrNull(formData.get("maxRedemptions")),
      startsAt: parseDateOrNull(formData.get("startsAt")),
      endsAt: parseDateOrNull(formData.get("endsAt")),
      createdBy: session.user.id,
    });

    await writeAuditLog({
      actorUserId: session.user.id,
      action: "coupon.create",
      entityType: "coupon",
      newValues: { code, discountType, discountValue },
    });

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error && error.message.toLowerCase().includes("duplicate")
        ? "Ce code promo existe déjà."
        : "Création du coupon impossible.";
    return { success: false, error: message };
  }
}

export async function toggleCouponAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();
  if (!hasAnyRole(session.roles, ["admin", "super_admin"])) {
    throw new Error("FORBIDDEN");
  }
  const id = String(formData.get("id") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "") === "true";
  if (!id) return;

  await setCouponActive(id, isActive);
  await writeAuditLog({
    actorUserId: session.user.id,
    action: isActive ? "coupon.activate" : "coupon.deactivate",
    entityType: "coupon",
    entityId: id,
  });
  revalidatePath("/admin/coupons");
}
