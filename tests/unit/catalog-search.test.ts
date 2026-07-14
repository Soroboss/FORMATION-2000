import { describe, expect, it } from "vitest";
import {
  courseMatchesSearchQuery,
  normalizeSearchText,
  scoreCourseSearchMatch,
  tokenizeSearchQuery,
} from "@/lib/catalog/search";

describe("catalog search", () => {
  const htmlCourse = {
    title: "Création de sites web",
    shortDescription: "Bases HTML et CSS",
    description: "Apprenez à créer une page web responsive.",
    categoryName: "Développement web",
    learningOutcomes: ["Créer une page HTML", "Styliser avec CSS"],
    requiredTools: ["VS Code", "Navigateur Chrome"],
  };

  it("normalise les accents", () => {
    expect(normalizeSearchText("Création")).toBe("creation");
  });

  it("tokenise une requête multi-mots", () => {
    expect(tokenizeSearchQuery("site web")).toEqual(["site", "web"]);
  });

  it("trouve une formation par mot-clé hors titre", () => {
    expect(courseMatchesSearchQuery(htmlCourse, "responsive")).toBe(true);
    expect(courseMatchesSearchQuery(htmlCourse, "chrome")).toBe(true);
    expect(courseMatchesSearchQuery(htmlCourse, "develop")).toBe(true);
  });

  it("exige tous les mots de la requête", () => {
    expect(courseMatchesSearchQuery(htmlCourse, "site html")).toBe(true);
    expect(courseMatchesSearchQuery(htmlCourse, "site python")).toBe(false);
  });

  it("classe mieux un match titre", () => {
    const byTitle = scoreCourseSearchMatch(htmlCourse, "sites");
    const byTool = scoreCourseSearchMatch(htmlCourse, "chrome");
    expect(byTitle).toBeGreaterThan(byTool);
  });
});
