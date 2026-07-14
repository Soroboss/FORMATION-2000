import { describe, expect, it } from "vitest";
import {
  categoryUpsertSchema,
  courseUpsertSchema,
  activateLearnerAccessSchema,
  extendSubscriptionSchema,
  lessonUpsertSchema,
  updateSupportTicketSchema,
} from "@/lib/validation/admin";
import { slugify } from "@/lib/admin/slug";
import { extractYouTubeVideoId } from "@/lib/youtube/url";

describe("admin validation", () => {
  it("valide une catégorie", () => {
    const parsed = categoryUpsertSchema.safeParse({
      name: "IA pratique",
      sortOrder: 1,
      isActive: true,
    });
    expect(parsed.success).toBe(true);
  });

  it("valide une formation", () => {
    const parsed = courseUpsertSchema.safeParse({
      title: "Bases HTML",
      accessType: "subscription",
      status: "draft",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejette un titre trop court", () => {
    const parsed = courseUpsertSchema.safeParse({
      title: "ab",
      accessType: "free",
    });
    expect(parsed.success).toBe(false);
  });

  it("valide une leçon YouTube", () => {
    const parsed = lessonUpsertSchema.safeParse({
      moduleId: "11111111-1111-4111-8111-111111111111",
      title: "Intro",
      sortOrder: 0,
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
    expect(parsed.success).toBe(true);
  });

  it("prolonge un abonnement", () => {
    const parsed = extendSubscriptionSchema.safeParse({
      subscriptionId: "11111111-1111-4111-8111-111111111111",
      days: 30,
    });
    expect(parsed.success).toBe(true);
  });

  it("active l'accès d'un apprenant", () => {
    const parsed = activateLearnerAccessSchema.safeParse({
      userId: "11111111-1111-4111-8111-111111111111",
      days: 30,
      note: "Paiement Orange reçu",
    });
    expect(parsed.success).toBe(true);
  });

  it("valide un changement de statut support", () => {
    const parsed = updateSupportTicketSchema.safeParse({
      ticketId: "11111111-1111-4111-8111-111111111111",
      status: "in_progress",
    });
    expect(parsed.success).toBe(true);
  });
});

describe("admin helpers", () => {
  it("slugifie un titre français", () => {
    expect(slugify("Création de sites web")).toBe("creation-de-sites-web");
  });

  it("extrait un id YouTube valide", () => {
    expect(extractYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
});
