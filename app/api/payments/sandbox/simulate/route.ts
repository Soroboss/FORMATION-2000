import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { assertSandboxPaymentsAllowed, isProductionRuntime } from "@/lib/launch/safety";
import { processPaymentWebhook } from "@/server/services/payments";
import { getPaymentByInternalReference } from "@/server/repositories/payments";

/**
 * Dev / soft-launch helper only.
 * Spec: never simulate a successful payment in real production.
 */
export async function POST(request: NextRequest) {
  const start = Date.now();

  try {
    if (isProductionRuntime() && process.env.ALLOW_SANDBOX_IN_PRODUCTION !== "true") {
      return NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Simulation de paiement interdite en production.",
          },
        },
        { status: 403 },
      );
    }
    assertSandboxPaymentsAllowed("sandbox.simulate");
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: error instanceof Error ? error.message : "Sandbox disabled",
        },
      },
      { status: 403 },
    );
  }

  if ((process.env.PAYMENT_PROVIDER ?? "sandbox") !== "sandbox") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Sandbox simulation disabled." } },
      { status: 403 },
    );
  }

  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Connexion requise." } },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      internalReference?: string;
      providerReference?: string;
      status?: "successful" | "failed";
      amount?: number;
      currency?: string;
    };

    if (!body.internalReference || !body.providerReference || !body.status) {
      return NextResponse.json(
        { error: { code: "INVALID_BODY", message: "Payload invalide." } },
        { status: 400 },
      );
    }

    const payment = await getPaymentByInternalReference(body.internalReference);
    if (!payment || payment.userId !== session.user.id) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Paiement introuvable." } },
        { status: 404 },
      );
    }

    const eventId = `sandbox_evt_${body.internalReference}_${body.status}`;
    const result = await processPaymentWebhook("sandbox", {
      eventId,
      eventType: body.status,
      providerReference: body.providerReference,
      internalReference: body.internalReference,
      status: body.status,
      amount: body.amount,
      currency: body.currency,
      paidAt: body.status === "successful" ? new Date().toISOString() : null,
      raw: body,
    });

    console.log(
      JSON.stringify({
        level: "info",
        msg: "sandbox_simulate",
        route: "/api/payments/sandbox/simulate",
        status: body.status,
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
    console.error(
      JSON.stringify({
        level: "error",
        msg: "sandbox_simulate_failed",
        route: "/api/payments/sandbox/simulate",
        error: error instanceof Error ? error.message : String(error),
        ms: Date.now() - start,
      }),
    );
    return NextResponse.json(
      {
        error: {
          code: "SIMULATE_FAILED",
          message: error instanceof Error ? error.message : "Simulation impossible",
        },
      },
      { status: 500 },
    );
  }
}
