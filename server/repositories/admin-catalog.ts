import { getAdminDbClient, slugify } from "@/lib/admin/client";
import {
  extractYouTubeVideoId,
  youtubeThumbnailUrl,
  youtubeWatchUrl,
} from "@/lib/youtube/url";
import type { CourseStatus } from "@/types/catalog";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type AdminCourse = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  learningOutcomes: string[];
  requiredTools: string[];
  finalProjectDescription: string | null;
  thumbnailUrl: string | null;
  categoryId: string | null;
  level: string | null;
  accessType: string;
  estimatedDurationMinutes: number;
  isFeatured: boolean;
  status: CourseStatus;
  publishedAt: string | null;
  updatedAt: string;
};

export type AdminModule = {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  sortOrder: number;
};

export type AdminLesson = {
  id: string;
  moduleId: string;
  title: string;
  slug: string | null;
  lessonType: string;
  description: string | null;
  estimatedDurationMinutes: number;
  sortOrder: number;
  isPreview: boolean;
  isRequired: boolean;
  status: string;
  youtubeUrl: string | null;
  channelName: string | null;
};

export async function listAdminCategories(): Promise<AdminCategory[]> {
  const client = await getAdminDbClient();
  const { data } = await client.database
    .from("categories")
    .select("id, name, slug, description, icon, image_url, sort_order, is_active")
    .order("sort_order", { ascending: true });
  if (!Array.isArray(data)) return [];
  return data.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: (row.description as string | null) ?? null,
    icon: (row.icon as string | null) ?? null,
    imageUrl: (row.image_url as string | null) ?? null,
    sortOrder: Number(row.sort_order ?? 0),
    isActive: Boolean(row.is_active),
  }));
}

export async function upsertCategory(input: {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
}): Promise<AdminCategory> {
  const client = await getAdminDbClient();
  const payload = {
    name: input.name,
    slug: input.slug?.trim() || slugify(input.name),
    description: input.description || null,
    icon: input.icon || null,
    image_url: input.imageUrl || null,
    sort_order: input.sortOrder,
    is_active: input.isActive,
  };

  const query = input.id
    ? client.database.from("categories").update(payload).eq("id", input.id)
    : client.database.from("categories").insert(payload);

  const { data, error } = await query
    .select("id, name, slug, description, icon, image_url, sort_order, is_active")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Catégorie impossible à enregistrer");
  return {
    id: String(data.id),
    name: String(data.name),
    slug: String(data.slug),
    description: (data.description as string | null) ?? null,
    icon: (data.icon as string | null) ?? null,
    imageUrl: (data.image_url as string | null) ?? null,
    sortOrder: Number(data.sort_order ?? 0),
    isActive: Boolean(data.is_active),
  };
}

export async function listAdminCourses(): Promise<AdminCourse[]> {
  const client = await getAdminDbClient();
  const { data } = await client.database
    .from("courses")
    .select(
      "id, title, slug, short_description, description, learning_outcomes, required_tools, final_project_description, thumbnail_url, category_id, level, access_type, estimated_duration_minutes, is_featured, status, published_at, updated_at",
    )
    .order("updated_at", { ascending: false });
  if (!Array.isArray(data)) return [];
  return data.map((row) => mapCourse(row as Record<string, unknown>));
}

export async function getAdminCourse(id: string): Promise<AdminCourse | null> {
  const client = await getAdminDbClient();
  const { data } = await client.database
    .from("courses")
    .select(
      "id, title, slug, short_description, description, learning_outcomes, required_tools, final_project_description, thumbnail_url, category_id, level, access_type, estimated_duration_minutes, is_featured, status, published_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return mapCourse(data as Record<string, unknown>);
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function mapCourse(row: Record<string, unknown>): AdminCourse {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    shortDescription: (row.short_description as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    learningOutcomes: asStringArray(row.learning_outcomes),
    requiredTools: asStringArray(row.required_tools),
    finalProjectDescription: (row.final_project_description as string | null) ?? null,
    thumbnailUrl: (row.thumbnail_url as string | null) ?? null,
    categoryId: (row.category_id as string | null) ?? null,
    level: (row.level as string | null) ?? null,
    accessType: String(row.access_type ?? "subscription"),
    estimatedDurationMinutes: Number(row.estimated_duration_minutes ?? 0),
    isFeatured: Boolean(row.is_featured),
    status: row.status as CourseStatus,
    publishedAt: (row.published_at as string | null) ?? null,
    updatedAt: String(row.updated_at),
  };
}

export async function upsertCourse(input: {
  id?: string;
  title: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  learningOutcomes?: string[];
  requiredTools?: string[];
  finalProjectDescription?: string;
  thumbnailUrl?: string;
  categoryId?: string;
  level?: string;
  accessType: string;
  estimatedDurationMinutes: number;
  isFeatured: boolean;
  status: CourseStatus;
  authorUserId?: string;
}): Promise<AdminCourse> {
  const client = await getAdminDbClient();
  const slug = input.slug?.trim() || slugify(input.title);
  const payload: Record<string, unknown> = {
    title: input.title,
    slug,
    short_description: input.shortDescription || null,
    description: input.description || null,
    learning_outcomes: input.learningOutcomes ?? [],
    required_tools: input.requiredTools ?? [],
    final_project_description: input.finalProjectDescription || null,
    thumbnail_url: input.thumbnailUrl || null,
    category_id: input.categoryId || null,
    level: input.level || null,
    access_type: input.accessType,
    estimated_duration_minutes: input.estimatedDurationMinutes,
    is_featured: input.isFeatured,
    status: input.status,
  };
  if (input.status === "published") {
    payload.published_at = new Date().toISOString();
  } else if (input.status === "archived" || input.status === "draft") {
    // keep existing published_at when demoting; only set on publish
  }
  if (!input.id && input.authorUserId) {
    payload.author_user_id = input.authorUserId;
  }

  const query = input.id
    ? client.database.from("courses").update(payload).eq("id", input.id)
    : client.database.from("courses").insert(payload);

  const { data, error } = await query
    .select(
      "id, title, slug, short_description, description, learning_outcomes, required_tools, final_project_description, thumbnail_url, category_id, level, access_type, estimated_duration_minutes, is_featured, status, published_at, updated_at",
    )
    .single();

  if (error || !data) throw new Error(error?.message ?? "Formation impossible à enregistrer");

  const course = mapCourse(data as Record<string, unknown>);

  if (input.categoryId) {
    await client.database
      .from("course_categories")
      .upsert({ course_id: course.id, category_id: input.categoryId });
  }

  return course;
}

export async function publishCourse(id: string): Promise<AdminCourse> {
  const client = await getAdminDbClient();
  const { data, error } = await client.database
    .from("courses")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id)
    .select(
      "id, title, slug, short_description, description, category_id, level, access_type, estimated_duration_minutes, is_featured, status, published_at, updated_at",
    )
    .single();
  if (error || !data) throw new Error(error?.message ?? "Publication impossible");
  return mapCourse(data as Record<string, unknown>);
}

export async function deleteCourse(id: string): Promise<void> {
  const client = await getAdminDbClient();
  const { error } = await client.database.from("courses").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listModulesForCourse(courseId: string): Promise<AdminModule[]> {
  const client = await getAdminDbClient();
  const { data } = await client.database
    .from("modules")
    .select("id, course_id, title, description, sort_order")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });
  if (!Array.isArray(data)) return [];
  return data.map((row) => ({
    id: String(row.id),
    courseId: String(row.course_id),
    title: String(row.title),
    description: (row.description as string | null) ?? null,
    sortOrder: Number(row.sort_order ?? 0),
  }));
}

export async function upsertModule(input: {
  id?: string;
  courseId: string;
  title: string;
  description?: string;
  sortOrder: number;
}): Promise<AdminModule> {
  const client = await getAdminDbClient();
  const payload = {
    course_id: input.courseId,
    title: input.title,
    description: input.description || null,
    sort_order: input.sortOrder,
  };
  const query = input.id
    ? client.database.from("modules").update(payload).eq("id", input.id)
    : client.database.from("modules").insert(payload);
  const { data, error } = await query
    .select("id, course_id, title, description, sort_order")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Module impossible à enregistrer");
  return {
    id: String(data.id),
    courseId: String(data.course_id),
    title: String(data.title),
    description: (data.description as string | null) ?? null,
    sortOrder: Number(data.sort_order ?? 0),
  };
}

export async function listLessonsForModule(moduleId: string): Promise<AdminLesson[]> {
  const client = await getAdminDbClient();
  const { data } = await client.database
    .from("lessons")
    .select(
      "id, module_id, title, slug, lesson_type, description, estimated_duration_minutes, sort_order, is_preview, is_required, status",
    )
    .eq("module_id", moduleId)
    .order("sort_order", { ascending: true });
  if (!Array.isArray(data)) return [];

  const lessons = data.map((row) => ({
    id: String(row.id),
    moduleId: String(row.module_id),
    title: String(row.title),
    slug: (row.slug as string | null) ?? null,
    lessonType: String(row.lesson_type),
    description: (row.description as string | null) ?? null,
    estimatedDurationMinutes: Number(row.estimated_duration_minutes ?? 0),
    sortOrder: Number(row.sort_order ?? 0),
    isPreview: Boolean(row.is_preview),
    isRequired: Boolean(row.is_required),
    status: String(row.status),
    youtubeUrl: null as string | null,
    channelName: null as string | null,
  }));

  const ids = lessons.map((l) => l.id);
  if (ids.length === 0) return lessons;

  const { data: yt } = await client.database
    .from("youtube_sources")
    .select("lesson_id, video_url, channel_name")
    .in("lesson_id", ids);

  if (Array.isArray(yt)) {
    const map = new Map(
      yt.map((row) => [
        String(row.lesson_id),
        {
          url: String(row.video_url),
          channel: (row.channel_name as string | null) ?? null,
        },
      ]),
    );
    for (const lesson of lessons) {
      const src = map.get(lesson.id);
      if (src) {
        lesson.youtubeUrl = src.url;
        lesson.channelName = src.channel;
      }
    }
  }

  return lessons;
}

export async function upsertLesson(input: {
  id?: string;
  moduleId: string;
  title: string;
  slug?: string;
  lessonType: string;
  description?: string;
  estimatedDurationMinutes: number;
  sortOrder: number;
  isPreview: boolean;
  isRequired: boolean;
  status: string;
  youtubeUrl?: string;
  channelName?: string;
  channelUrl?: string;
  originalTitle?: string;
}): Promise<AdminLesson> {
  const client = await getAdminDbClient();
  const payload = {
    module_id: input.moduleId,
    title: input.title,
    slug: input.slug || slugify(input.title),
    lesson_type: input.lessonType,
    description: input.description || null,
    estimated_duration_minutes: input.estimatedDurationMinutes,
    sort_order: input.sortOrder,
    is_preview: input.isPreview,
    is_required: input.isRequired,
    status: input.status,
  };

  const query = input.id
    ? client.database.from("lessons").update(payload).eq("id", input.id)
    : client.database.from("lessons").insert(payload);

  const { data, error } = await query
    .select(
      "id, module_id, title, slug, lesson_type, description, estimated_duration_minutes, sort_order, is_preview, is_required, status",
    )
    .single();

  if (error || !data) throw new Error(error?.message ?? "Leçon impossible à enregistrer");

  const lessonId = String(data.id);
  let youtubeUrl: string | null = null;
  let channelName: string | null = null;

  if (input.lessonType === "youtube" && input.youtubeUrl) {
    const videoId = extractYouTubeVideoId(input.youtubeUrl);
    if (!videoId) throw new Error("Lien YouTube invalide");
    youtubeUrl = youtubeWatchUrl(videoId);
    channelName = input.channelName || null;
    const ytPayload = {
      lesson_id: lessonId,
      youtube_video_id: videoId,
      video_url: youtubeUrl,
      channel_name: channelName,
      channel_url: input.channelUrl || null,
      original_title: input.originalTitle || input.title,
      thumbnail_url: youtubeThumbnailUrl(videoId),
      embed_status: "unknown",
    };
    const { error: ytError } = await client.database
      .from("youtube_sources")
      .upsert(ytPayload, { onConflict: "lesson_id" });
    if (ytError) throw new Error(ytError.message);

    await maybeSetCourseThumbnailFromModule(input.moduleId, ytPayload.thumbnail_url);
  }

  return {
    id: lessonId,
    moduleId: String(data.module_id),
    title: String(data.title),
    slug: (data.slug as string | null) ?? null,
    lessonType: String(data.lesson_type),
    description: (data.description as string | null) ?? null,
    estimatedDurationMinutes: Number(data.estimated_duration_minutes ?? 0),
    sortOrder: Number(data.sort_order ?? 0),
    isPreview: Boolean(data.is_preview),
    isRequired: Boolean(data.is_required),
    status: String(data.status),
    youtubeUrl,
    channelName,
  };
}

async function maybeSetCourseThumbnailFromModule(
  moduleId: string,
  thumbnailUrl: string,
): Promise<void> {
  const client = await getAdminDbClient();
  const { data: mod } = await client.database
    .from("modules")
    .select("course_id")
    .eq("id", moduleId)
    .maybeSingle();
  if (!mod) return;
  const courseId = String((mod as { course_id: string }).course_id);
  const { data: course } = await client.database
    .from("courses")
    .select("thumbnail_url")
    .eq("id", courseId)
    .maybeSingle();
  if (course && (course as { thumbnail_url: string | null }).thumbnail_url) return;
  await client.database
    .from("courses")
    .update({ thumbnail_url: thumbnailUrl })
    .eq("id", courseId);
}

/** Crée un module « Parcours principal » s’il n’en existe aucun. */
export async function ensureDefaultModule(courseId: string): Promise<AdminModule> {
  const existing = await listModulesForCourse(courseId);
  if (existing[0]) return existing[0];
  return upsertModule({
    courseId,
    title: "Parcours principal",
    description: "Module créé automatiquement pour vos vidéos",
    sortOrder: 0,
  });
}

export async function upsertLessonInstructions(input: {
  lessonId: string;
  summary?: string;
  objective?: string;
}): Promise<void> {
  const client = await getAdminDbClient();
  const summary = input.summary?.trim() || null;
  const objective = input.objective?.trim() || null;
  if (!summary && !objective) return;

  const { error } = await client.database.from("lesson_instructions").upsert(
    {
      lesson_id: input.lessonId,
      summary,
      objective,
      key_points: [],
      steps: [],
      common_mistakes: [],
      tips: [],
    },
    { onConflict: "lesson_id" },
  );
  if (error) throw new Error(error.message);
}

export async function upsertAssignmentForLesson(input: {
  courseId: string;
  moduleId: string;
  lessonId: string;
  title: string;
  instructions: string;
}): Promise<void> {
  const client = await getAdminDbClient();
  const title = input.title.trim();
  const instructions = input.instructions.trim();
  if (!title || !instructions) return;

  const { data: existing } = await client.database
    .from("assignments")
    .select("id")
    .eq("lesson_id", input.lessonId)
    .limit(1)
    .maybeSingle();

  const payload = {
    course_id: input.courseId,
    module_id: input.moduleId,
    lesson_id: input.lessonId,
    title,
    instructions,
    expected_deliverables: [],
    evaluation_criteria: [],
    is_required: true,
  };

  if (existing?.id) {
    const { error } = await client.database
      .from("assignments")
      .update(payload)
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await client.database.from("assignments").insert(payload);
  if (error) throw new Error(error.message);
}

export async function countPublishedLessonsWithVideo(courseId: string): Promise<number> {
  const modules = await listModulesForCourse(courseId);
  let count = 0;
  for (const mod of modules) {
    const lessons = await listLessonsForModule(mod.id);
    count += lessons.filter(
      (l) => l.status === "published" && Boolean(l.youtubeUrl),
    ).length;
  }
  return count;
}

/**
 * Crée une formation complète en une fois : fiche + module + leçon YouTube.
 * Prête pour les abonnés si visibility !== draft.
 */
export async function createReadyFormation(input: {
  title: string;
  youtubeUrl: string;
  visibility: "subscribers" | "preview" | "draft";
  authorUserId: string;
}): Promise<{ courseId: string; lessonId: string; slug: string }> {
  const isDraft = input.visibility === "draft";
  const isPreview = input.visibility === "preview";
  const uniqueSlug = `${slugify(input.title)}-${Date.now().toString(36).slice(-4)}`;

  const course = await upsertCourse({
    title: input.title,
    slug: uniqueSlug,
    accessType: "subscription",
    estimatedDurationMinutes: 0,
    isFeatured: false,
    status: isDraft ? "draft" : "published",
    authorUserId: input.authorUserId,
  });

  const mod = await upsertModule({
    courseId: course.id,
    title: "Parcours principal",
    description: "",
    sortOrder: 0,
  });

  const lesson = await upsertLesson({
    moduleId: mod.id,
    title: input.title,
    lessonType: "youtube",
    estimatedDurationMinutes: 0,
    sortOrder: 0,
    isPreview,
    isRequired: true,
    status: isDraft ? "draft" : "published",
    youtubeUrl: input.youtubeUrl,
  });

  return { courseId: course.id, lessonId: lesson.id, slug: course.slug };
}
