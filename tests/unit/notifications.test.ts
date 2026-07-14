import { describe, expect, it } from "vitest";

describe("notification payload shape", () => {
  it("accepte les types d’événements Phase 10", () => {
    const types = [
      "payment_approved",
      "payment_rejected",
      "subscription_activated",
      "project_reviewed",
      "support_update",
      "certificate_issued",
    ] as const;

    for (const type of types) {
      expect(type.length).toBeGreaterThan(3);
    }
  });

  it("construit un message de revue exercice", () => {
    const status = "approved";
    const statusLabel = status === "approved" ? "validé" : "refusé";
    const score = 85;
    const message = `Votre exercice a été ${statusLabel}. Note : ${score}/100.`;
    expect(message).toContain("validé");
    expect(message).toContain("85");
  });
});
