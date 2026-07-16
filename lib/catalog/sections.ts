import type { CourseListItem } from "@/types/catalog";

export type CatalogSections = {
  /** Formations mises en avant (is_featured). */
  featured: CourseListItem[];
  /** Dernières formations publiées (ordre d’entrée = plus récent d’abord). */
  newest: CourseListItem[];
  /** Les plus suivies (d’après le nombre d’inscriptions). */
  popular: CourseListItem[];
  /** Catalogue complet. */
  all: CourseListItem[];
};

type DeriveOptions = {
  featuredLimit?: number;
  newestLimit?: number;
  popularLimit?: number;
};

/**
 * Découpe le catalogue en sections « À la une / Nouveautés / Populaires / Tout ».
 * `courses` doit déjà être trié du plus récent au plus ancien.
 * `popularCourseIds` est l’ordre décroissant de popularité (ids).
 */
export function deriveCatalogSections(
  courses: CourseListItem[],
  popularCourseIds: string[] = [],
  opts: DeriveOptions = {},
): CatalogSections {
  const { featuredLimit = 12, newestLimit = 12, popularLimit = 12 } = opts;

  const byId = new Map(courses.map((c) => [c.id, c]));

  const featured = courses.filter((c) => c.isFeatured).slice(0, featuredLimit);

  const newest = courses.slice(0, newestLimit);

  const popular: CourseListItem[] = [];
  const seen = new Set<string>();
  for (const id of popularCourseIds) {
    const course = byId.get(id);
    if (course && !seen.has(id)) {
      popular.push(course);
      seen.add(id);
      if (popular.length >= popularLimit) break;
    }
  }

  return { featured, newest, popular, all: courses };
}
