import { tryCreateInsForgeServerClient } from "@/lib/insforge/server";
import { getAccessToken } from "@/lib/auth/cookies";
import type {
  Category,
  CourseDetail,
  CourseFilters,
  CourseLevel,
  CourseListItem,
  CourseAccessType,
  LessonDetail,
  LessonInstructions,
  LessonSummary,
  ModuleWithLessons,
  YouTubeSourcePublic,
} from "@/types/catalog";

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

async function getCatalogClient() {
  const token = await getAccessToken();
  return tryCreateInsForgeServerClient(token);
}

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: (row.description as string | null) ?? null,
    imageUrl: (row.image_url as string | null) ?? null,
    icon: (row.icon as string | null) ?? null,
    sortOrder: Number(row.sort_order ?? 0),
  };
}

function mapCourseListItem(
  row: Record<string, unknown>,
  lessonCount = 0,
): CourseListItem {
  const categoryRow = row.categories as Record<string, unknown> | null | undefined;
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    shortDescription: (row.short_description as string | null) ?? null,
    thumbnailUrl: (row.thumbnail_url as string | null) ?? null,
    level: (row.level as CourseLevel | null) ?? null,
    language: String(row.language ?? "fr"),
    estimatedDurationMinutes: Number(row.estimated_duration_minutes ?? 0),
    accessType: (row.access_type as CourseAccessType) ?? "subscription",
    isFeatured: Boolean(row.is_featured),
    category: categoryRow
      ? {
          id: String(categoryRow.id),
          name: String(categoryRow.name),
          slug: String(categoryRow.slug),
        }
      : null,
    lessonCount,
  };
}

function mapLessonSummary(row: Record<string, unknown>): LessonSummary {
  return {
    id: String(row.id),
    moduleId: String(row.module_id),
    title: String(row.title),
    slug: (row.slug as string | null) ?? null,
    lessonType: String(row.lesson_type),
    estimatedDurationMinutes: Number(row.estimated_duration_minutes ?? 0),
    sortOrder: Number(row.sort_order ?? 0),
    isPreview: Boolean(row.is_preview),
    isRequired: Boolean(row.is_required),
  };
}

function mapInstructions(row: Record<string, unknown> | null): LessonInstructions | null {
  if (!row) return null;
  return {
    objective: (row.objective as string | null) ?? null,
    summary: (row.summary as string | null) ?? null,
    keyPoints: asStringArray(row.key_points),
    steps: asStringArray(row.steps),
    expectedResult: (row.expected_result as string | null) ?? null,
    commonMistakes: asStringArray(row.common_mistakes),
    tips: asStringArray(row.tips),
  };
}

function mapYouTube(row: Record<string, unknown> | null): YouTubeSourcePublic | null {
  if (!row) return null;
  return {
    youtubeVideoId: String(row.youtube_video_id),
    videoUrl: String(row.video_url),
    channelName: (row.channel_name as string | null) ?? null,
    channelUrl: (row.channel_url as string | null) ?? null,
    originalTitle: (row.original_title as string | null) ?? null,
    thumbnailUrl: (row.thumbnail_url as string | null) ?? null,
    embedStatus: String(row.embed_status ?? "unknown"),
  };
}

async function countLessonsForCourse(
  client: NonNullable<Awaited<ReturnType<typeof getCatalogClient>>>,
  courseId: string,
): Promise<number> {
  const { data: modules } = await client.database
    .from("modules")
    .select("id")
    .eq("course_id", courseId);

  const moduleIds = Array.isArray(modules)
    ? modules.map((m) => String((m as { id: string }).id))
    : [];
  if (moduleIds.length === 0) return 0;

  const { data: lessons } = await client.database
    .from("lessons")
    .select("id")
    .in("module_id", moduleIds)
    .eq("status", "published");

  return Array.isArray(lessons) ? lessons.length : 0;
}

export async function listCategories(): Promise<Category[]> {
  const client = await getCatalogClient();
  if (!client) return [];

  const { data, error } = await client.database
    .from("categories")
    .select("id, name, slug, description, image_url, icon, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !Array.isArray(data)) return [];
  return data.map((row) => mapCategory(row as Record<string, unknown>));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const client = await getCatalogClient();
  if (!client) return null;

  const { data, error } = await client.database
    .from("categories")
    .select("id, name, slug, description, image_url, icon, sort_order")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;
  return mapCategory(data as Record<string, unknown>);
}

export async function listCourses(filters: CourseFilters = {}): Promise<CourseListItem[]> {
  const client = await getCatalogClient();
  if (!client) return [];

  let query = client.database
    .from("courses")
    .select(
      "id, title, slug, short_description, thumbnail_url, level, language, estimated_duration_minutes, access_type, is_featured, category_id, categories(id, name, slug)",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (filters.level) {
    query = query.eq("level", filters.level);
  }
  if (filters.featured) {
    query = query.eq("is_featured", true);
  }
  if (filters.q) {
    query = query.ilike("title", `%${filters.q}%`);
  }
  if (filters.categorySlug) {
    const category = await getCategoryBySlug(filters.categorySlug);
    if (!category) return [];
    query = query.eq("category_id", category.id);
  }

  const { data, error } = await query;
  if (error || !Array.isArray(data)) return [];

  const items: CourseListItem[] = [];
  for (const row of data) {
    const record = row as Record<string, unknown>;
    const lessonCount = await countLessonsForCourse(client, String(record.id));
    items.push(mapCourseListItem(record, lessonCount));
  }
  return items;
}

export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  return getCourseDetail({ slug });
}

export async function getCourseById(id: string): Promise<CourseDetail | null> {
  return getCourseDetail({ id });
}

async function getCourseDetail(filter: { slug?: string; id?: string }): Promise<CourseDetail | null> {
  const client = await getCatalogClient();
  if (!client) return null;

  let query = client.database
    .from("courses")
    .select(
      "id, title, slug, short_description, description, thumbnail_url, level, language, estimated_duration_minutes, learning_outcomes, prerequisites, required_tools, final_project_description, access_type, is_featured, categories(id, name, slug)",
    )
    .eq("status", "published");

  if (filter.slug) query = query.eq("slug", filter.slug);
  if (filter.id) query = query.eq("id", filter.id);

  const { data: course, error } = await query.maybeSingle();

  if (error || !course) return null;
  const courseRow = course as Record<string, unknown>;

  const { data: modules } = await client.database
    .from("modules")
    .select("id, title, description, sort_order")
    .eq("course_id", courseRow.id)
    .order("sort_order", { ascending: true });

  const moduleRows = Array.isArray(modules) ? modules : [];
  const moduleIds = moduleRows.map((m) => String((m as { id: string }).id));

  let lessonRows: Record<string, unknown>[] = [];
  if (moduleIds.length > 0) {
    const { data: lessons } = await client.database
      .from("lessons")
      .select(
        "id, module_id, title, slug, lesson_type, estimated_duration_minutes, sort_order, is_preview, is_required, status",
      )
      .in("module_id", moduleIds)
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    lessonRows = Array.isArray(lessons) ? (lessons as Record<string, unknown>[]) : [];
  }

  const modulesWithLessons: ModuleWithLessons[] = moduleRows.map((mod) => {
    const m = mod as Record<string, unknown>;
    return {
      id: String(m.id),
      title: String(m.title),
      description: (m.description as string | null) ?? null,
      sortOrder: Number(m.sort_order ?? 0),
      lessons: lessonRows
        .filter((l) => String(l.module_id) === String(m.id))
        .map(mapLessonSummary),
    };
  });

  const lessonCount = modulesWithLessons.reduce((acc, m) => acc + m.lessons.length, 0);
  const base = mapCourseListItem(courseRow, lessonCount);

  return {
    ...base,
    description: (courseRow.description as string | null) ?? null,
    learningOutcomes: asStringArray(courseRow.learning_outcomes),
    prerequisites: asStringArray(courseRow.prerequisites),
    requiredTools: asStringArray(courseRow.required_tools),
    finalProjectDescription: (courseRow.final_project_description as string | null) ?? null,
    modules: modulesWithLessons,
  };
}

export async function getLessonDetail(input: {
  courseSlug: string;
  lessonId: string;
}): Promise<{ course: CourseDetail; lesson: LessonDetail } | null> {
  const course = await getCourseBySlug(input.courseSlug);
  if (!course) return null;

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const summary = allLessons.find((l) => l.id === input.lessonId);
  if (!summary) return null;

  const client = await getCatalogClient();
  if (!client) return null;

  const { data: lessonRow } = await client.database
    .from("lessons")
    .select("id, module_id, title, slug, lesson_type, description, estimated_duration_minutes, sort_order, is_preview, is_required")
    .eq("id", input.lessonId)
    .eq("status", "published")
    .maybeSingle();

  if (!lessonRow) return null;

  const { data: youtubeRow } = await client.database
    .from("youtube_sources")
    .select(
      "youtube_video_id, video_url, channel_name, channel_url, original_title, thumbnail_url, embed_status",
    )
    .eq("lesson_id", input.lessonId)
    .maybeSingle();

  const { data: instructionsRow } = await client.database
    .from("lesson_instructions")
    .select("objective, summary, key_points, steps, expected_result, common_mistakes, tips")
    .eq("lesson_id", input.lessonId)
    .maybeSingle();

  const lesson: LessonDetail = {
    ...mapLessonSummary(lessonRow as Record<string, unknown>),
    description: ((lessonRow as Record<string, unknown>).description as string | null) ?? null,
    youtube: mapYouTube((youtubeRow as Record<string, unknown> | null) ?? null),
    instructions: mapInstructions((instructionsRow as Record<string, unknown> | null) ?? null),
  };

  return { course, lesson };
}

export function findAdjacentLessons(
  course: CourseDetail,
  lessonId: string,
): { previous: LessonSummary | null; next: LessonSummary | null } {
  const flat = course.modules.flatMap((m) => m.lessons);
  const index = flat.findIndex((l) => l.id === lessonId);
  if (index < 0) return { previous: null, next: null };
  return {
    previous: flat[index - 1] ?? null,
    next: flat[index + 1] ?? null,
  };
}

/** Resolve /app/formations/{slug}/lecons/{lessonId} from a lesson id. */
export async function getLessonAppPath(lessonId: string): Promise<string | null> {
  const client = await getCatalogClient();
  if (!client) return null;

  const { data: lesson } = await client.database
    .from("lessons")
    .select("id, module_id")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson) return null;

  const moduleId = String((lesson as { module_id: string }).module_id);
  const { data: mod } = await client.database
    .from("modules")
    .select("id, course_id")
    .eq("id", moduleId)
    .maybeSingle();
  if (!mod) return null;

  const courseId = String((mod as { course_id: string }).course_id);
  const { data: course } = await client.database
    .from("courses")
    .select("id, slug")
    .eq("id", courseId)
    .maybeSingle();
  if (!course) return null;

  return `/app/formations/${String((course as { slug: string }).slug)}/lecons/${lessonId}`;
}
