import { describe, expect, it } from "vitest";
import {
  buildPaymentsCsv,
  computeFinanceSummary,
} from "@/lib/admin/finance";
import type { FinancePayment } from "@/server/repositories/admin-payments";

function payment(overrides: Partial<FinancePayment> = {}): FinancePayment {
  return {
    id: "p1",
    userId: "u1",
    amount: 2000,
    currency: "XOF",
    status: "successful",
    provider: "cinetpay",
    providerFee: 60,
    netAmount: 1940,
    internalReference: "REF-1",
    confirmedAt: "2026-07-10T10:00:00.000Z",
    initiatedAt: "2026-07-10T09:59:00.000Z",
    ...overrides,
  };
}

describe("computeFinanceSummary", () => {
  it("n'agrège que les paiements encaissés", () => {
    const now = new Date("2026-07-17T00:00:00.000Z");
    const summary = computeFinanceSummary(
      [
        payment({ id: "a" }),
        payment({ id: "b", status: "failed", confirmedAt: null }),
        payment({ id: "c", status: "pending", confirmedAt: null }),
      ],
      now,
    );
    expect(summary.settledCount).toBe(1);
    expect(summary.failedCount).toBe(1);
    expect(summary.pendingCount).toBe(1);
    expect(summary.grossTotal).toBe(2000);
    expect(summary.feesTotal).toBe(60);
    expect(summary.netTotal).toBe(1940);
  });

  it("calcule le net sur 30 jours et par fournisseur", () => {
    const now = new Date("2026-07-17T00:00:00.000Z");
    const summary = computeFinanceSummary(
      [
        payment({ id: "a", confirmedAt: "2026-07-10T10:00:00.000Z" }),
        payment({
          id: "b",
          provider: "manual",
          confirmedAt: "2026-01-01T10:00:00.000Z",
          initiatedAt: "2026-01-01T10:00:00.000Z",
        }),
      ],
      now,
    );
    expect(summary.last30Count).toBe(1);
    expect(summary.last30Net).toBe(1940);
    expect(summary.byProvider).toHaveLength(2);
    expect(summary.byMonth.length).toBeGreaterThanOrEqual(2);
  });

  it("considère un paiement confirmé sans statut successful", () => {
    const summary = computeFinanceSummary([
      payment({ status: "captured", confirmedAt: "2026-07-01T10:00:00.000Z" }),
    ]);
    expect(summary.settledCount).toBe(1);
  });
});

describe("buildPaymentsCsv", () => {
  it("génère un en-tête et une ligne par paiement", () => {
    const csv = buildPaymentsCsv([payment(), payment({ id: "p2", internalReference: "REF;2" })]);
    const lines = csv.split("\r\n");
    expect(lines[0]).toContain("reference");
    expect(lines).toHaveLength(3);
    expect(lines[2]).toContain('"REF;2"');
  });
});
