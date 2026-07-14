import { describe, expect, it } from "vitest";

/** Mirror of endsAtInDaysWindow for unit testing without DB. */
function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addUtcDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function endsAtInDaysWindow(endsAt: Date, now: Date, days: number): boolean {
  const target = addUtcDays(startOfUtcDay(now), days);
  const end = addUtcDays(target, 1);
  return endsAt >= target && endsAt < end;
}

describe("expiration reminder windows", () => {
  const now = new Date("2026-07-14T12:00:00.000Z");

  it("détecte J-7", () => {
    const endsAt = new Date("2026-07-21T09:00:00.000Z");
    expect(endsAtInDaysWindow(endsAt, now, 7)).toBe(true);
    expect(endsAtInDaysWindow(endsAt, now, 3)).toBe(false);
  });

  it("détecte J-1", () => {
    const endsAt = new Date("2026-07-15T18:30:00.000Z");
    expect(endsAtInDaysWindow(endsAt, now, 1)).toBe(true);
  });

  it("ignore une expiration trop lointaine", () => {
    const endsAt = new Date("2026-08-01T00:00:00.000Z");
    expect(endsAtInDaysWindow(endsAt, now, 7)).toBe(false);
  });
});
