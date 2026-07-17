import { describe, expect, it } from "vitest";
import {
  computeDiscount,
  evaluateCoupon,
  normalizeCouponCode,
  type Coupon,
} from "@/lib/coupons/apply";

function coupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    id: "c1",
    code: "BIENVENUE",
    description: null,
    discountType: "percent",
    discountValue: 20,
    currency: "XOF",
    planId: null,
    minAmount: null,
    maxRedemptions: null,
    redeemedCount: 0,
    startsAt: null,
    endsAt: null,
    isActive: true,
    ...overrides,
  };
}

describe("computeDiscount", () => {
  it("calcule un pourcentage arrondi vers le bas et borné au montant", () => {
    expect(computeDiscount(coupon({ discountType: "percent", discountValue: 20 }), 2000)).toBe(400);
    expect(computeDiscount(coupon({ discountType: "fixed", discountValue: 5000 }), 2000)).toBe(2000);
  });
});

describe("evaluateCoupon", () => {
  const ctx = { planId: "plan-1", amount: 2000, currency: "XOF" };

  it("applique une réduction valide", () => {
    const res = evaluateCoupon(coupon(), ctx);
    expect(res).toEqual({ valid: true, discount: 400, finalAmount: 1600 });
  });

  it("refuse un coupon inactif", () => {
    expect(evaluateCoupon(coupon({ isActive: false }), ctx)).toMatchObject({ valid: false });
  });

  it("refuse un coupon expiré", () => {
    const res = evaluateCoupon(coupon({ endsAt: "2020-01-01T00:00:00.000Z" }), ctx);
    expect(res.valid).toBe(false);
  });

  it("refuse quand la limite d'utilisation est atteinte", () => {
    const res = evaluateCoupon(coupon({ maxRedemptions: 5, redeemedCount: 5 }), ctx);
    expect(res.valid).toBe(false);
  });

  it("refuse quand l'utilisateur a déjà utilisé le coupon", () => {
    const res = evaluateCoupon(coupon(), { ...ctx, alreadyRedeemedByUser: true });
    expect(res.valid).toBe(false);
  });

  it("refuse un coupon lié à une autre offre", () => {
    const res = evaluateCoupon(coupon({ planId: "autre" }), ctx);
    expect(res.valid).toBe(false);
  });

  it("refuse une réduction couvrant 100% du montant", () => {
    const res = evaluateCoupon(coupon({ discountType: "percent", discountValue: 100 }), ctx);
    expect(res.valid).toBe(false);
  });
});

describe("normalizeCouponCode", () => {
  it("met en majuscules et retire les espaces", () => {
    expect(normalizeCouponCode(" promo1 ")).toBe("PROMO1");
  });
});
