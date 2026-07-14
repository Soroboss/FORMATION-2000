import { createHash } from "node:crypto";
import { getPaymentProvider } from "@/lib/payments/provider";
import { createInternalPaymentReference } from "@/lib/payments/subscription-dates";
import { getAppUrl } from "@/lib/utils";
import {
  activateOrExtendSubscription,
  createPaymentRecord,
  findPaymentEvent,
  getPaymentByInternalReference,
  getPaymentByProviderReference,
  getPlanById,
  getPlanBySlug,
  insertPaymentEvent,
  markPaymentEventProcessed,
  updatePaymentStatus,
} from "@/server/repositories/payments";
import type { PaymentWebhookEvent } from "@/types/payments";

function hashPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export async function initializeCheckout(input: {
  userId: string;
  email: string;
  displayName?: string | null;
  planSlug?: string;
}) {
  const plan =
    (input.planSlug ? await getPlanBySlug(input.planSlug) : null) ??
    (await getPlanBySlug("acces-mensuel"));

  if (!plan) {
    throw new Error("PLAN_NOT_FOUND");
  }

  const provider = getPaymentProvider();
  const internalReference = createInternalPaymentReference();
  const appUrl = getAppUrl();

  const session = await provider.initializePayment({
    userId: input.userId,
    planId: plan.id,
    amount: plan.priceAmount,
    currency: plan.currency,
    internalReference,
    customerEmail: input.email,
    customerName: input.displayName ?? undefined,
    successUrl: `${appUrl}/paiement/succes?ref=${internalReference}`,
    cancelUrl: `${appUrl}/paiement/echec?ref=${internalReference}`,
    metadata: {
      planSlug: plan.slug,
      userId: input.userId,
    },
  });

  const payment = await createPaymentRecord({
    userId: input.userId,
    planId: plan.id,
    provider: provider.name,
    providerReference: session.providerReference,
    internalReference,
    amount: plan.priceAmount,
    currency: plan.currency,
    status: "pending",
    metadata: { planSlug: plan.slug },
  });

  return {
    payment,
    plan,
    checkoutUrl: session.checkoutUrl,
    provider: provider.name,
  };
}

export async function processPaymentWebhook(
  providerName: string,
  event: PaymentWebhookEvent,
): Promise<{
  ok: true;
  duplicate?: boolean;
  paymentId?: string;
  subscriptionId?: string;
}> {
  const existingEvent = await findPaymentEvent(providerName, event.eventId);
  if (existingEvent?.processed) {
    return { ok: true, duplicate: true };
  }

  const inserted = await insertPaymentEvent({
    paymentId: null,
    provider: providerName,
    eventId: event.eventId,
    eventType: event.eventType,
    payloadHash: hashPayload(event.raw),
    payload: event.raw,
    processed: false,
  });

  if (inserted === "duplicate") {
    const again = await findPaymentEvent(providerName, event.eventId);
    if (again?.processed) {
      return { ok: true, duplicate: true };
    }
  }

  const payment =
    (await getPaymentByProviderReference(event.providerReference)) ??
    (event.internalReference
      ? await getPaymentByInternalReference(event.internalReference)
      : null);

  if (!payment) {
    throw new Error("PAYMENT_NOT_FOUND");
  }

  // Idempotent success: already activated
  if (payment.status === "successful" && event.status === "successful") {
    await markPaymentEventProcessed(providerName, event.eventId);
    return { ok: true, duplicate: true, paymentId: payment.id };
  }

  if (event.status === "successful") {
    const plan = payment.planId ? await getPlanById(payment.planId) : null;
    if (!plan) throw new Error("PLAN_NOT_FOUND");

    const confirmedAt = event.paidAt ? new Date(event.paidAt) : new Date();
    const subscription = await activateOrExtendSubscription({
      userId: payment.userId,
      planId: plan.id,
      durationDays: plan.durationDays,
      confirmedAt,
      graceDays: 0,
      source: `payment:${payment.internalReference}`,
    });

    await updatePaymentStatus({
      paymentId: payment.id,
      status: "successful",
      confirmedAt: confirmedAt.toISOString(),
      failedAt: null,
      subscriptionId: subscription.id,
    });

    await markPaymentEventProcessed(providerName, event.eventId);

    return {
      ok: true,
      paymentId: payment.id,
      subscriptionId: subscription.id,
    };
  }

  if (event.status === "failed" || event.status === "cancelled" || event.status === "expired") {
    await updatePaymentStatus({
      paymentId: payment.id,
      status: event.status,
      failedAt: new Date().toISOString(),
    });
    await markPaymentEventProcessed(providerName, event.eventId);
    return { ok: true, paymentId: payment.id };
  }

  await updatePaymentStatus({
    paymentId: payment.id,
    status: event.status,
  });
  await markPaymentEventProcessed(providerName, event.eventId);
  return { ok: true, paymentId: payment.id };
}
