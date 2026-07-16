import { describe, expect, it } from "vitest";
import { deriveCatalogSections, rankCoursesByRelevance } from "@/lib/catalog/sections";
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

describe("rankCoursesByRelevance", () => {
  it("place les mises en avant en premier", () => {
    const list = [course("a"), course("b", { isFeatured: true }), course("c")];
    const ranked = rankCoursesByRelevance(list);
    expect(ranked[0]!.id).toBe("b");
  });

  it("départage les non mises en avant par popularité", () => {
    const list = [course("a"), course("b"), course("c")];
    const ranked = rankCoursesByRelevance(list, ["c", "a"]);
    expect(ranked.map((c) => c.id)).toEqual(["c", "a", "b"]);
  });

  it("garde l’ordre d’entrée (récence) quand tout est égal", () => {
    const list = [course("a"), course("b"), course("c")];
    const ranked = rankCoursesByRelevance(list, []);
    expect(ranked.map((c) => c.id)).toEqual(["a", "b", "c"]);
  });

  it("combine mise en avant puis popularité", () => {
    const list = [
      course("a"),
      course("b", { isFeatured: true }),
      course("c", { isFeatured: true }),
      course("d"),
    ];
    // c plus populaire que b ; d plus populaire que a
    const ranked = rankCoursesByRelevance(list, ["c", "d"]);
    expect(ranked.map((x) => x.id)).toEqual(["c", "b", "d", "a"]);
  });
});
