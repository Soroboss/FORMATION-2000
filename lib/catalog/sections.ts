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

/**
 * Classe les formations d’une catégorie par pertinence :
 * 1) mises en avant, 2) les plus suivies, 3) les plus récentes (ordre d’entrée).
 * `courses` doit déjà être trié du plus récent au plus ancien (départage stable).
 */
export function rankCoursesByRelevance(
  courses: CourseListItem[],
  popularCourseIds: string[] = [],
): CourseListItem[] {
  const popRank = new Map(popularCourseIds.map((id, index) => [id, index]));
  const FAR = Number.MAX_SAFE_INTEGER;

  return courses
    .map((course, index) => ({ course, index }))
    .sort((a, b) => {
      if (a.course.isFeatured !== b.course.isFeatured) {
        return a.course.isFeatured ? -1 : 1;
      }
      const ra = popRank.has(a.course.id) ? popRank.get(a.course.id)! : FAR;
      const rb = popRank.has(b.course.id) ? popRank.get(b.course.id)! : FAR;
      if (ra !== rb) return ra - rb;
      return a.index - b.index;
    })
    .map((entry) => entry.course);
}
