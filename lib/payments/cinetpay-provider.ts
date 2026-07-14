import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  InitializePaymentInput,
  PaymentProvider,
  PaymentSession,
  PaymentStatus,
  PaymentVerification,
  PaymentWebhookEvent,
  RefundResult,
} from "@/types/payments";
import { getAppUrl } from "@/lib/utils";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Variable manquante : ${name}`);
  return value;
}

function getApiKey(): string {
  return (
    process.env.CINETPAY_API_KEY?.trim() ||
    process.env.PAYMENT_SECRET_KEY?.trim() ||
    ""
  );
}

function getSiteId(): string {
  return (
    process.env.CINETPAY_SITE_ID?.trim() ||
    process.env.PAYMENT_PUBLIC_KEY?.trim() ||
    ""
  );
}

function getHmacSecret(): string {
  return (
    process.env.CINETPAY_SECRET_KEY?.trim() ||
    process.env.PAYMENT_WEBHOOK_SECRET?.trim() ||
    ""
  );
}

export function isCinetPayConfigured(): boolean {
  return Boolean(getApiKey() && getSiteId());
}

function mapCinetPayStatus(code: string | undefined): PaymentStatus {
  switch ((code ?? "").toUpperCase()) {
    case "00":
    case "SUCCESS":
    case "ACCEPTED":
      return "successful";
    case "603":
    case "CANCELLED":
      return "cancelled";
    case "622":
    case "EXPIRED":
      return "expired";
    case "FAILED":
    case "REFUSED":
      return "failed";
    default:
      return "pending";
  }
}

/**
 * Provider Mobile Money / carte via CinetPay (Côte d’Ivoire & Afrique de l’Ouest).
 * Docs : https://docs.cinetpay.com/
 */
export class CinetPayPaymentProvider implements PaymentProvider {
  readonly name = "cinetpay";

  async initializePayment(input: InitializePaymentInput): Promise<PaymentSession> {
    const apikey = getApiKey();
    const siteId = getSiteId();
    if (!apikey || !siteId) {
      throw new Error(
        "CinetPay non configuré. Renseignez CINETPAY_API_KEY et CINETPAY_SITE_ID.",
      );
    }

    // CinetPay XOF : montant multiple de 5 recommandé.
    const amount = Math.max(5, Math.round(input.amount / 5) * 5);
    const appUrl = getAppUrl();
    const notifyUrl = `${appUrl}/api/webhooks/payments/cinetpay`;
    const returnUrl = input.successUrl;

    const nameParts = (input.customerName ?? "Apprenant Learnoon").trim().split(/\s+/);
    const customerName = nameParts[0] || "Apprenant";
    const customerSurname = nameParts.slice(1).join(" ") || "Learnoon";

    const payload = {
      apikey,
      site_id: siteId,
      transaction_id: input.internalReference,
      amount,
      currency: input.currency || "XOF",
      description: `Abonnement Learnoon Academy ${amount} ${input.currency}`,
      notify_url: notifyUrl,
      return_url: returnUrl,
      channels: "ALL",
      lang: "FR",
      metadata: input.internalReference,
      customer_id: input.userId,
      customer_name: customerName,
      customer_surname: customerSurname,
      customer_email: input.customerEmail,
    };

    const response = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    const json = (await response.json()) as {
      code?: string;
      message?: string;
      description?: string;
      data?: { payment_url?: string; payment_token?: string };
    };

    if (!response.ok || json.code !== "201" || !json.data?.payment_url) {
      throw new Error(
        json.description || json.message || "Initialisation CinetPay impossible",
      );
    }

    return {
      provider: this.name,
      providerReference: input.internalReference,
      checkoutUrl: json.data.payment_url,
      status: "pending",
    };
  }

  async verifyPayment(reference: string): Promise<PaymentVerification> {
    const apikey = getApiKey();
    const siteId = getSiteId();
    if (!apikey || !siteId) {
      return { providerReference: reference, status: "pending", paidAt: null };
    }

    const response = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        apikey,
        site_id: siteId,
        transaction_id: reference,
      }),
    });

    const json = (await response.json()) as {
      code?: string;
      data?: {
        status?: string;
        amount?: string | number;
        currency?: string;
        payment_date?: string;
      };
    };

    const status = mapCinetPayStatus(json.data?.status ?? json.code);
    return {
      providerReference: reference,
      status,
      amount: json.data?.amount != null ? Number(json.data.amount) : undefined,
      currency: json.data?.currency,
      paidAt: status === "successful" ? json.data?.payment_date ?? new Date().toISOString() : null,
      raw: json,
    };
  }

  async parseWebhook(request: Request): Promise<PaymentWebhookEvent> {
    // Ping GET de disponibilité (CinetPay)
    if (request.method === "GET") {
      return {
        eventId: `cinetpay_ping_${Date.now()}`,
        eventType: "ping",
        providerReference: "ping",
        status: "pending",
        raw: { ping: true },
      };
    }

    const contentType = request.headers.get("content-type") ?? "";
    let fields: Record<string, string> = {};

    if (contentType.includes("application/json")) {
      const body = (await request.json()) as Record<string, unknown>;
      for (const [k, v] of Object.entries(body)) {
        fields[k] = v == null ? "" : String(v);
      }
    } else {
      const form = await request.formData();
      const next: Record<string, string> = {};
      form.forEach((value, key) => {
        next[key] = String(value);
      });
      fields = next;
    }

    const transactionId = fields.cpm_trans_id || fields.transaction_id || "";
    if (!transactionId) {
      throw new Error("INVALID_WEBHOOK_PAYLOAD");
    }

    const hmacSecret = getHmacSecret();
    const xToken = request.headers.get("x-token");
    if (hmacSecret && xToken) {
      // Concat order from CinetPay docs (common fields)
      const data =
        (fields.cpm_site_id ?? "") +
        (fields.cpm_trans_id ?? "") +
        (fields.cpm_trans_date ?? "") +
        (fields.cpm_amount ?? "") +
        (fields.cpm_currency ?? "") +
        (fields.signature ?? "") +
        (fields.payment_method ?? "") +
        (fields.cel_phone_num ?? "") +
        (fields.cpm_phone_prefixe ?? "") +
        (fields.cpm_language ?? "") +
        (fields.cpm_version ?? "") +
        (fields.cpm_payment_config ?? "") +
        (fields.cpm_page_action ?? "") +
        (fields.cpm_custom ?? "") +
        (fields.cpm_designation ?? "") +
        (fields.cpm_error_message ?? "");

      const expected = createHmac("sha256", hmacSecret).update(data).digest("hex");
      const a = Buffer.from(expected);
      const b = Buffer.from(xToken);
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        // Soft-warn: some dashboards omit secret — still verify via check API below
        console.warn(
          JSON.stringify({
            level: "warn",
            msg: "cinetpay_hmac_mismatch",
            transactionId,
          }),
        );
      }
    }

    // Toujours confirmer auprès de l’API check (référence CinetPay)
    const verified = await this.verifyPayment(transactionId);
    const eventId = `cinetpay_${transactionId}_${verified.status}_${fields.cpm_trans_date ?? "na"}`;

    return {
      eventId,
      eventType: verified.status,
      providerReference: transactionId,
      internalReference: fields.cpm_custom || fields.metadata || transactionId,
      status: verified.status,
      amount: verified.amount,
      currency: verified.currency,
      paidAt: verified.paidAt ?? null,
      raw: fields,
    };
  }

  async refundPayment(reference: string): Promise<RefundResult> {
    return { status: "failed", providerReference: reference };
  }
}

/** Utilisé pour les health-checks / UI admin. */
export function assertCinetPayReady(): void {
  requireEnv("CINETPAY_API_KEY");
  requireEnv("CINETPAY_SITE_ID");
}
