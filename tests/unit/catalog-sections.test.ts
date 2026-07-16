import { describe, expect, it } from "vitest";
import { deriveCatalogSections } from "@/lib/catalog/sections";
import type { CourseListItem } from "@/types/catalog";

function course(id: string, opts: Partial<CourseListItem> = {}): CourseListItem {
  return {
    id,
    title: `Cours ${id}`,
    slug: `cours-${id}`,
    shortDescription: null,
    thumbnailUrl: null,
    level: null,
    language: "fr",
    estimatedDurationMinutes: 0,
    accessType: "subscription",
    isFeatured: false,
    category: null,
    lessonCount: 0,
    ...opts,
  };
}

describe("deriveCatalogSections", () => {
  const all = [
    course("a", { isFeatured: true }),
    course("b"),
    course("c", { isFeatured: true }),
    course("d"),
  ];

  it("sépare les mises en avant", () => {
    const s = deriveCatalogSections(all);
    expect(s.featured.map((c) => c.id)).toEqual(["a", "c"]);
  });

  it("newest garde l’ordre d’entrée et respecte la limite", () => {
    const s = deriveCatalogSections(all, [], { newestLimit: 2 });
    expect(s.newest.map((c) => c.id)).toEqual(["a", "b"]);
  });

  it("ordonne les populaires selon les ids fournis et ignore les inconnus", () => {
    const s = deriveCatalogSections(all, ["d", "zzz", "b"]);
    expect(s.popular.map((c) => c.id)).toEqual(["d", "b"]);
  });

  it("popular vide si aucune donnée de popularité", () => {
    const s = deriveCatalogSections(all, []);
    expect(s.popular).toEqual([]);
  });

  it("all renvoie tout le catalogue", () => {
    const s = deriveCatalogSections(all);
    expect(s.all).toHaveLength(4);
  });
});
