import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { paymentInitializeSchema } from "@/lib/validation/api";
import { initializeCheckout } from "@/server/services/payments";

export async function POST(request: NextRequest) {
  const start = Date.now();

  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Connexion requise." } },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = paymentInitializeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_BODY",
            message: parsed.error.issues[0]?.message ?? "Données invalides.",
          },
        },
        { status: 400 },
      );
    }

    const result = await initializeCheckout({
      userId: session.user.id,
      email: session.user.email,
      displayName: session.profile?.displayName ?? session.user.name,
      planSlug: parsed.data.planSlug ?? "acces-mensuel",
    });

    console.log(
      JSON.stringify({
        level: "info",
        msg: "payment_initialized",
        route: "/api/payments/initialize",
        provider: result.provider,
        ref: result.payment.internalReference,
        ms: Date.now() - start,
      }),
    );

    return NextResponse.json({
      data: {
        checkoutUrl: result.checkoutUrl,
        internalReference: result.payment.internalReference,
        amount: result.plan.priceAmount,
        currency: result.plan.currency,
        provider: result.provider,
      },
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "payment_initialize_failed",
        route: "/api/payments/initialize",
        error: error instanceof Error ? error.message : String(error),
        ms: Date.now() - start,
      }),
    );

    const message = error instanceof Error ? error.message : "Erreur paiement";
    const status = message.includes("INSFORGE_SERVICE_KEY") ? 503 : 500;
    return NextResponse.json(
      { error: { code: "PAYMENT_INIT_FAILED", message } },
      { status },
    );
  }
}
