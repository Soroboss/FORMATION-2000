import type {
  InitializePaymentInput,
  PaymentProvider,
  PaymentSession,
  PaymentVerification,
  PaymentWebhookEvent,
  RefundResult,
} from "@/types/payments";
import { getAppUrl } from "@/lib/utils";

/**
 * Local / preview payment provider.
 * Never activates subscriptions from the browser redirect alone —
 * confirmation goes through the signed webhook endpoint.
 */
export class SandboxPaymentProvider implements PaymentProvider {
  readonly name = "sandbox";

  async initializePayment(input: InitializePaymentInput): Promise<PaymentSession> {
    const providerReference = `sandbox_${input.internalReference}`;
    const checkoutUrl = new URL("/paiement/sandbox", getAppUrl());
    checkoutUrl.searchParams.set("ref", input.internalReference);
    checkoutUrl.searchParams.set("provider_ref", providerReference);
    checkoutUrl.searchParams.set("amount", String(input.amount));
    checkoutUrl.searchParams.set("currency", input.currency);

    return {
      provider: this.name,
      providerReference,
      checkoutUrl: checkoutUrl.toString(),
      status: "pending",
    };
  }

  async verifyPayment(reference: string): Promise<PaymentVerification> {
    // Sandbox has no remote API — status lives in our DB / webhook.
    return {
      providerReference: reference,
      status: "pending",
      paidAt: null,
    };
  }

  async parseWebhook(request: Request): Promise<PaymentWebhookEvent> {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;
    const headerSecret = request.headers.get("x-academie-webhook-secret");

    if (!secret || headerSecret !== secret) {
      throw new Error("INVALID_WEBHOOK_SECRET");
    }

    const body = (await request.json()) as {
      eventId?: string;
      eventType?: string;
      providerReference?: string;
      internalReference?: string;
      status?: string;
      amount?: number;
      currency?: string;
      paidAt?: string | null;
    };

    if (!body.eventId || !body.providerReference || !body.status) {
      throw new Error("INVALID_WEBHOOK_PAYLOAD");
    }

    const allowed = new Set([
      "initiated",
      "pending",
      "successful",
      "failed",
      "cancelled",
      "expired",
      "refunded",
      "partially_refunded",
    ]);

    if (!allowed.has(body.status)) {
      throw new Error("INVALID_PAYMENT_STATUS");
    }

    return {
      eventId: body.eventId,
      eventType: body.eventType ?? body.status,
      providerReference: body.providerReference,
      internalReference: body.internalReference,
      status: body.status as PaymentWebhookEvent["status"],
      amount: body.amount,
      currency: body.currency,
      paidAt: body.paidAt ?? null,
      raw: body,
    };
  }

  async refundPayment(reference: string): Promise<RefundResult> {
    return { status: "refunded", providerReference: reference };
  }
}
