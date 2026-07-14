import { isSandboxPaymentAllowed } from "@/lib/launch/safety";
import { isCinetPayConfigured } from "@/lib/payments/cinetpay-provider";

export type CheckoutMode = "online" | "manual";

export type CheckoutCapability = {
  mode: CheckoutMode;
  provider: string;
  label: string;
  hint: string;
};

/**
 * Détermine si le bouton « Payer » peut lancer un checkout en ligne,
 * sinon on oriente vers le paiement Mobile Money + WhatsApp.
 */
export function getCheckoutCapability(): CheckoutCapability {
  const provider = (process.env.PAYMENT_PROVIDER ?? "sandbox").toLowerCase();

  if (provider === "cinetpay" && isCinetPayConfigured()) {
    return {
      mode: "online",
      provider: "cinetpay",
      label: "Payer 2 000 FCFA (Mobile Money)",
      hint: "Paiement sécurisé CinetPay (Orange Money, MTN, Wave…).",
    };
  }

  if ((provider === "sandbox" || provider === "") && isSandboxPaymentAllowed()) {
    return {
      mode: "online",
      provider: "sandbox",
      label: "Payer 2 000 FCFA (simulateur)",
      hint: "Mode test sandbox — non utilisé pour de vrais clients.",
    };
  }

  if (provider === "cinetpay" && !isCinetPayConfigured()) {
    return {
      mode: "manual",
      provider: "manual",
      label: "Payer 2 000 FCFA via WhatsApp",
      hint: "CinetPay sélectionné mais clés manquantes — parcours manuel actif.",
    };
  }

  return {
    mode: "manual",
    provider: "manual",
    label: "Payer 2 000 FCFA via WhatsApp",
    hint: "Paiement automatique bientôt — pour l’instant Mobile Money + validation admin.",
  };
}

export function toFriendlyCheckoutError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("Sandbox payments are disabled")) {
    return "Le paiement automatique n’est pas encore actif en production. Utilisez le paiement Mobile Money + WhatsApp.";
  }
  if (message.includes("not configured") || message.includes("CinetPay non configuré")) {
    return "Le moteur de paiement automatique n’est pas encore configuré. Utilisez le paiement Mobile Money + WhatsApp.";
  }
  if (message === "PLAN_NOT_FOUND") {
    return "Aucun plan d’abonnement trouvé. Contactez le support.";
  }
  return message || "Impossible d’initialiser le paiement.";
}
