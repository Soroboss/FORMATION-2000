import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getPaymentByInternalReference } from "@/server/repositories/payments";
import { tryGetPaymentAsUser } from "@/server/repositories/payments-status";

export async function GET(
  _request: Request,
  context: { params: Promise<{ reference: string }> },
) {
  const start = Date.now();
  const { reference } = await context.params;

  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Connexion requise." } },
        { status: 401 },
      );
    }

    let payment = await tryGetPaymentAsUser(reference, session.user.id);

    if (!payment) {
      try {
        const privileged = await getPaymentByInternalReference(reference);
        if (privileged && privileged.userId === session.user.id) {
          payment = privileged;
        }
      } catch {
        // ignore missing service key
      }
    }

    if (!payment) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Paiement introuvable." } },
        { status: 404 },
      );
    }

    console.log(
      JSON.stringify({
        level: "info",
        msg: "payment_status",
        route: "/api/payments/[reference]/status",
        reference,
        status: payment.status,
        ms: Date.now() - start,
      }),
    );

    return NextResponse.json({ data: payment });
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "payment_status_failed",
        route: "/api/payments/[reference]/status",
        reference,
        error: error instanceof Error ? error.message : String(error),
        ms: Date.now() - start,
      }),
    );
    return NextResponse.json(
      { error: { code: "STATUS_FAILED", message: "Impossible de lire le statut." } },
      { status: 500 },
    );
  }
}
