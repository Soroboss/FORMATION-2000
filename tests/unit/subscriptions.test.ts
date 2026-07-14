import { describe, expect, it } from "vitest";
import {
  addDays,
  computeSubscriptionWindow,
  isSubscriptionAccessValid,
} from "@/lib/payments/subscription-dates";

describe("subscription dates", () => {
  it("prolonge depuis la date de fin si l'abonnement est encore actif", () => {
    const confirmedAt = new Date("2026-07-13T10:00:00.000Z");
    const currentEndsAt = new Date("2026-07-20T10:00:00.000Z");
    const window = computeSubscriptionWindow({
      confirmedAt,
      currentEndsAt,
      durationDays: 30,
      now: confirmedAt,
    });

    expect(window.extended).toBe(true);
    expect(window.endsAt.toISOString()).toBe(addDays(currentEndsAt, 30).toISOString());
  });

  it("reparte de la confirmation si l'abonnement est expiré", () => {
    const confirmedAt = new Date("2026-07-13T10:00:00.000Z");
    const currentEndsAt = new Date("2026-07-01T10:00:00.000Z");
    const window = computeSubscriptionWindow({
      confirmedAt,
      currentEndsAt,
      durationDays: 30,
      now: confirmedAt,
    });

    expect(window.extended).toBe(false);
    expect(window.startsAt.toISOString()).toBe(confirmedAt.toISOString());
    expect(window.endsAt.toISOString()).toBe(addDays(confirmedAt, 30).toISOString());
  });

  it("calcule une période de grâce optionnelle", () => {
    const confirmedAt = new Date("2026-07-13T10:00:00.000Z");
    const window = computeSubscriptionWindow({
      confirmedAt,
      durationDays: 30,
      graceDays: 2,
      now: confirmedAt,
    });

    expect(window.graceEndsAt?.toISOString()).toBe(addDays(window.endsAt, 2).toISOString());
  });

  it("valide l'accès actif et grace_period", () => {
    const now = new Date("2026-07-13T12:00:00.000Z");
    expect(
      isSubscriptionAccessValid({
        status: "active",
        endsAt: new Date("2026-07-20T12:00:00.000Z"),
        now,
      }),
    ).toBe(true);
    expect(
      isSubscriptionAccessValid({
        status: "active",
        endsAt: new Date("2026-07-10T12:00:00.000Z"),
        now,
      }),
    ).toBe(false);
    expect(
      isSubscriptionAccessValid({
        status: "grace_period",
        endsAt: new Date("2026-07-10T12:00:00.000Z"),
        graceEndsAt: new Date("2026-07-14T12:00:00.000Z"),
        now,
      }),
    ).toBe(true);
  });
});
