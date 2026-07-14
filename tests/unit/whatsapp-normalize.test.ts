import { describe, expect, it } from "vitest";
import { normalizeWhatsAppRecipient } from "@/lib/notify/whatsapp";

describe("normalizeWhatsAppRecipient", () => {
  it("garde un numéro international sans +", () => {
    expect(normalizeWhatsAppRecipient("+225 07 57 22 87 31")).toBe("2250757228731");
  });

  it("préfixe 225 pour un mobile local CI", () => {
    expect(normalizeWhatsAppRecipient("0757228731")).toBe("2250757228731");
  });

  it("rejette un numéro trop court", () => {
    expect(normalizeWhatsAppRecipient("123")).toBeNull();
  });
});
