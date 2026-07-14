import { describe, expect, it } from "vitest";
import { updateProfileSchema } from "@/lib/validation/auth";

describe("updateProfileSchema", () => {
  it("valide un profil", () => {
    const parsed = updateProfileSchema.safeParse({
      firstName: "Ada",
      lastName: "Lovelace",
      displayName: "Ada L.",
      whatsapp: "+225 07 57 22 87 31",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.whatsapp).toBe("+2250757228731");
    }
  });

  it("rejette un WhatsApp trop court", () => {
    const parsed = updateProfileSchema.safeParse({
      firstName: "Ada",
      lastName: "Lovelace",
      displayName: "",
      whatsapp: "123",
    });
    expect(parsed.success).toBe(false);
  });
});
