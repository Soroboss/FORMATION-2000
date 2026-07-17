"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { toFriendlyCheckoutError } from "@/lib/payments/checkout-mode";
import { initializeCheckout } from "@/server/services/payments";

export type CheckoutActionResult = {
  success: boolean;
  error?: string;
  checkoutUrl?: string;
  fallbackManual?: boolean;
};

export async function startCheckoutAction(formData: FormData): Promise<CheckoutActionResult> {
  try {
    const session = await requireSession();
    const planSlug = String(formData.get("planSlug") ?? "acces-mensuel");
    const couponCode = String(formData.get("couponCode") ?? "").trim() || null;

    const result = await initializeCheckout({
      userId: session.user.id,
      email: session.user.email,
      displayName: session.profile?.displayName ?? session.user.name,
      planSlug,
      couponCode,
    });

    redirect(result.checkoutUrl);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    // Erreurs de code promo : message clair, pas de repli WhatsApp.
    const message = error instanceof Error ? error.message : "";
    if (message.startsWith("COUPON_REJECTED:")) {
      return { success: false, error: message.slice("COUPON_REJECTED:".length) };
    }
    if (message === "COUPON_INVALID") {
      return { success: false, error: "Code promo introuvable." };
    }
    const friendly = toFriendlyCheckoutError(error);
    const fallbackManual =
      friendly.includes("WhatsApp") ||
      friendly.includes("automatique") ||
      friendly.includes("configuré");
    return {
      success: false,
      error: friendly,
      fallbackManual,
    };
  }
}
