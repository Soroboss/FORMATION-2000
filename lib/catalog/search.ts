/**
 * Recherche catalogue : normalisation FR + matching multi-mots.
 * Un cours matche si chaque token (mot ≥ 2 car.) apparaît dans le texte indexé.
 */

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s+-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeSearchQuery(query: string): string[] {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];
  const tokens = normalized.split(" ").filter((t) => t.length >= 2);
  return tokens.length > 0 ? tokens : [normalized];
}

export type CourseSearchable = {
  title: string;
  shortDescription?: string | null;
  description?: string | null;
  slug?: string | null;
  categoryName?: string | null;
  learningOutcomes?: string[];
  requiredTools?: string[];
};

export function buildCourseSearchHaystack(course: CourseSearchable): string {
  return normalizeSearchText(
    [
      course.title,
      course.shortDescription ?? "",
      course.description ?? "",
      course.slug ?? "",
      course.categoryName ?? "",
      ...(course.learningOutcomes ?? []),
      ...(course.requiredTools ?? []),
    ].join(" "),
  );
}

export function courseMatchesSearchQuery(course: CourseSearchable, query: string): boolean {
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) return true;
  const haystack = buildCourseSearchHaystack(course);
  return tokens.every((token) => haystack.includes(token));
}

/** Score de pertinence (plus haut = mieux) pour trier les résultats. */
export function scoreCourseSearchMatch(course: CourseSearchable, query: string): number {
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) return 0;

  const title = normalizeSearchText(course.title);
  const shortDesc = normalizeSearchText(course.shortDescription ?? "");
  const category = normalizeSearchText(course.categoryName ?? "");
  const haystack = buildCourseSearchHaystack(course);

  let score = 0;
  for (const token of tokens) {
    if (title === tokenizeSearchQuery(query).join(" ") && tokens.length === 1) score += 100;
    if (title.startsWith(token)) score += 40;
    if (title.includes(token)) score += 25;
    if (category.includes(token)) score += 15;
    if (shortDesc.includes(token)) score += 10;
    if (haystack.includes(token)) score += 5;
  }
  // Bonus phrase entière dans le titre
  const phrase = normalizeSearchText(query);
  if (phrase && title.includes(phrase)) score += 50;
  return score;
}
