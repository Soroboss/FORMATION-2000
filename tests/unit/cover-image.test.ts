import { describe, expect, it } from "vitest";
import {
  canOptimizeImageUrl,
  coverImageAlt,
  COVER_IMAGE_RECOMMENDED,
} from "@/lib/media/cover-image";

describe("cover image utils", () => {
  it("détecte les hôtes optimisables InsForge", () => {
    expect(
      canOptimizeImageUrl(
        "https://2ipa33bu.eu-central.insforge.app/api/storage/buckets/media/objects/x.jpg",
      ),
    ).toBe(true);
    expect(canOptimizeImageUrl("https://cdn.insforge.dev/storage/app/media/x.jpg")).toBe(true);
    expect(canOptimizeImageUrl("https://i.ytimg.com/vi/abc/hqdefault.jpg")).toBe(true);
  });

  it("refuse les URLs invalides ou hôtes inconnus", () => {
    expect(canOptimizeImageUrl("")).toBe(false);
    expect(canOptimizeImageUrl("not-a-url")).toBe(false);
    expect(canOptimizeImageUrl("https://evil.example/photo.jpg")).toBe(false);
  });

  it("génère un texte alternatif descriptif", () => {
    expect(coverImageAlt("Marketing Digital", "category")).toBe("Bannière — Marketing Digital");
    expect(coverImageAlt("Intro React", "course")).toBe("Illustration — Intro React");
    expect(coverImageAlt("", "category")).toBe("Illustration catégorie");
  });

  it("expose les dimensions recommandées 16:9", () => {
    expect(COVER_IMAGE_RECOMMENDED.card.ratio).toBe("16:9");
    expect(COVER_IMAGE_RECOMMENDED.card.width).toBeGreaterThan(1000);
  });
});
