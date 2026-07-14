import { randomUUID } from "node:crypto";

/**
 * Pure date helpers for subscription activation / renewal.
 * All dates are treated as UTC instants (ISO strings or Date).
 */

export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Compute the new subscription window after a confirmed payment.
 *
 * - Still active (endsAt in the future): extend from current endsAt
 * - Expired / missing: start from payment confirmation time
 */
export function computeSubscriptionWindow(input: {
  now?: Date;
  confirmedAt: Date;
  durationDays: number;
  currentEndsAt?: Date | null;
  graceDays?: number;
}): {
  startsAt: Date;
  endsAt: Date;
  graceEndsAt: Date | null;
  extended: boolean;
} {
  const now = input.now ?? new Date();
  const graceDays = input.graceDays ?? 0;
  const currentEndsAt = input.currentEndsAt ?? null;
  const stillActive = Boolean(currentEndsAt && currentEndsAt.getTime() > now.getTime());

  const startsAt = stillActive && currentEndsAt ? currentEndsAt : input.confirmedAt;
  const base = stillActive && currentEndsAt ? currentEndsAt : input.confirmedAt;
  const endsAt = addDays(base, input.durationDays);
  const graceEndsAt = graceDays > 0 ? addDays(endsAt, graceDays) : null;

  return {
    startsAt,
    endsAt,
    graceEndsAt,
    extended: stillActive,
  };
}

export function isSubscriptionAccessValid(input: {
  status: string;
  endsAt: Date | null;
  graceEndsAt?: Date | null;
  now?: Date;
}): boolean {
  const now = input.now ?? new Date();
  if (input.status === "active" && input.endsAt && input.endsAt.getTime() > now.getTime()) {
    return true;
  }
  if (
    input.status === "grace_period" &&
    (input.graceEndsAt ?? input.endsAt) &&
    (input.graceEndsAt ?? input.endsAt)!.getTime() > now.getTime()
  ) {
    return true;
  }
  return false;
}

export function createInternalPaymentReference(): string {
  const rand = randomUUID().replace(/-/g, "").slice(0, 16);
  return `pay_${Date.now()}_${rand}`;
}
