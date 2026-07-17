export type CouponDiscountType = "percent" | "fixed";

export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  currency: string;
  planId: string | null;
  minAmount: number | null;
  maxRedemptions: number | null;
  redeemedCount: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
};

export type CouponContext = {
  planId: string;
  amount: number;
  currency: string;
  now?: Date;
  alreadyRedeemedByUser?: boolean;
};

export type CouponEvaluation =
  | { valid: true; discount: number; finalAmount: number }
  | { valid: false; reason: string };

/** Réduction brute (bornée au montant) pour un coupon donné. */
export function computeDiscount(coupon: Coupon, amount: number): number {
  const raw =
    coupon.discountType === "percent"
      ? Math.floor((amount * coupon.discountValue) / 100)
      : coupon.discountValue;
  return Math.max(0, Math.min(raw, amount));
}

/**
 * Valide un coupon dans le contexte d'un paiement et calcule le montant final.
 * Toute la logique est pure pour être testable et rejouable côté serveur.
 */
export function evaluateCoupon(coupon: Coupon, ctx: CouponContext): CouponEvaluation {
  const now = ctx.now ?? new Date();

  if (!coupon.isActive) {
    return { valid: false, reason: "Ce code promo n'est plus actif." };
  }
  if (coupon.startsAt && new Date(coupon.startsAt).getTime() > now.getTime()) {
    return { valid: false, reason: "Ce code promo n'est pas encore valable." };
  }
  if (coupon.endsAt && new Date(coupon.endsAt).getTime() < now.getTime()) {
    return { valid: false, reason: "Ce code promo a expiré." };
  }
  if (
    coupon.maxRedemptions != null &&
    coupon.redeemedCount >= coupon.maxRedemptions
  ) {
    return { valid: false, reason: "Ce code promo a atteint sa limite d'utilisation." };
  }
  if (ctx.alreadyRedeemedByUser) {
    return { valid: false, reason: "Vous avez déjà utilisé ce code promo." };
  }
  if (coupon.planId && coupon.planId !== ctx.planId) {
    return { valid: false, reason: "Ce code promo ne s'applique pas à cette offre." };
  }
  if (coupon.currency !== ctx.currency) {
    return { valid: false, reason: "Ce code promo ne s'applique pas à cette devise." };
  }
  if (coupon.minAmount != null && ctx.amount < coupon.minAmount) {
    return { valid: false, reason: "Le montant est insuffisant pour ce code promo." };
  }

  const discount = computeDiscount(coupon, ctx.amount);
  const finalAmount = ctx.amount - discount;
  if (finalAmount <= 0) {
    return {
      valid: false,
      reason:
        "Ce code couvre la totalité du montant. Contactez le support pour un accès offert.",
    };
  }

  return { valid: true, discount, finalAmount };
}

/** Normalise un code promo (majuscules, sans espaces superflus). */
export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}
