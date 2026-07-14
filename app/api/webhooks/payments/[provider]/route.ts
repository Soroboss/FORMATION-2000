import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments/provider";
import { processPaymentWebhook } from "@/server/services/payments";

/** CinetPay vérifie que l’URL de notification répond en GET. */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  return NextResponse.json({ ok: true, provider });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const start = Date.now();
  const { provider: providerParam } = await context.params;

  try {
    const provider = getPaymentProvider();
    if (provider.name !== providerParam) {
      return NextResponse.json(
        { error: { code: "PROVIDER_MISMATCH", message: "Fournisseur inconnu." } },
        { status: 404 },
      );
    }

    const event = await provider.parseWebhook(request);

    // Ping / disponibilité — ne traite pas un vrai paiement.
    if (event.eventType === "ping" || event.providerReference === "ping") {
      return NextResponse.json({ ok: true, ping: true });
    }

    const result = await processPaymentWebhook(provider.name, event);

    console.log(
      JSON.stringify({
        level: "info",
        msg: "payment_webhook_processed",
        route: "/api/webhooks/payments/[provider]",
        provider: providerParam,
        eventId: event.eventId,
        status: event.status,
        duplicate: Boolean(result.duplicate),
        ms: Date.now() - start,
      }),
    );

    return NextResponse.json({
      ok: true,
      duplicate: Boolean(result.duplicate),
      paymentId: result.paymentId,
      subscriptionId: result.subscriptionId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status =
      message === "INVALID_WEBHOOK_SECRET"
        ? 401
        : message === "PAYMENT_NOT_FOUND"
          ? 404
          : message.startsWith("INVALID_")
            ? 400
            : 500;

    console.error(
      JSON.stringify({
        level: "error",
        msg: "payment_webhook_failed",
        route: "/api/webhooks/payments/[provider]",
        provider: providerParam,
        error: message,
        ms: Date.now() - start,
      }),
    );

    return NextResponse.json(
      { error: { code: "WEBHOOK_FAILED", message } },
      { status },
    );
  }
}
