import { tryCreateInsForgeServiceClient } from "@/lib/insforge/server";
import { slugify } from "@/lib/admin/slug";
import {
  extractYouTubeVideoId,
  youtubeThumbnailUrl,
  youtubeWatchUrl,
} from "@/lib/youtube/url";
import type { AgentCreateCourseInput } from "@/lib/validation/agent";

type ServiceClient = NonNullable<ReturnType<typeof tryCreateInsForgeServiceClient>>;

export type AgentDraftCourseResult = {
  id: string;
  title: string;
  slug: string;
  status: "draft";
  adminUrl: string;
  categoryId: string | null;
  modules: Array<{
    id: string;
    title: string;
    lessons: Array<{ id: string; title: string; youtubeUrl: string | null }>;
  }>;
};

function requireServiceClient(): ServiceClient {
  const client = tryCreateInsForgeServiceClient();
  if (!client) {
    throw new Error(
      "INSFORGE_SERVICE_KEY manquante — requise pour l’API agent catalogue.",
    );
  }
  return client;
}

async function resolveCategoryId(
  client: ServiceClient,
  input: Pick<AgentCreateCourseInput, "categoryId" | "categorySlug">,
): Promise<string | null> {
  if (input.categoryId) {
    const { data } = await client.database
      .from("categories")
      .select("id")
      .eq("id", input.categoryId)
      .maybeSingle();
    if (!data?.id) throw new Error("Catégorie introuvable (categoryId)");
    return String(data.id);
  }
  if (input.categorySlug) {
    const { data } = await client.database
      .from("categories")
      .select("id")
      .eq("slug", input.categorySlug)
      .maybeSingle();
    if (!data?.id) throw new Error(`Catégorie introuvable (slug: ${input.categorySlug})`);
    return String(data.id);
  }
  return null;
}

async function ensureUniqueSlug(client: ServiceClient, base: string): Promise<string> {
  let candidate = base || `formation-${Date.now().toString(36)}`;
  for (let i = 0; i < 8; i += 1) {
    const { data } = await client.database
      .from("courses")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${Date.now().toString(36).slice(-4)}${i}`;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * Crée une formation complète en brouillon (jamais publiée).
 * Les leçons YouTube sont marquées `published` pour être prêtes dès que tu publies la formation.
 */
export async function createAgentDraftCourse(
  input: AgentCreateCourseInput,
): Promise<AgentDraftCourseResult> {
  const client = requireServiceClient();
  const categoryId = await resolveCategoryId(client, input);
  const baseSlug = slugify(input.slug?.trim() || input.title);
  const slug = await ensureUniqueSlug(client, baseSlug);

  const { data: course, error: courseError } = await client.database
    .from("courses")
    .insert({
      title: input.title,
      slug,
      short_description: input.shortDescription || null,
      description: input.description || null,
      learning_outcomes: input.learningOutcomes ?? [],
      required_tools: input.requiredTools ?? [],
      final_project_description: input.finalProjectDescription || null,
      thumbnail_url: input.thumbnailUrl || null,
      category_id: categoryId,
      level: input.level || null,
      access_type: input.accessType,
      estimated_duration_minutes: input.estimatedDurationMinutes,
      is_featured: input.isFeatured,
      status: "draft",
    })
    .select("id, title, slug, status")
    .single();

  if (courseError || !course) {
    throw new Error(courseError?.message ?? "Impossible de créer la formation");
  }

  const courseId = String(course.id);

  if (categoryId) {
    const { error: linkError } = await client.database.from("course_categories").insert({
      course_id: courseId,
      category_id: categoryId,
    });
    if (linkError) {
      await client.database.from("courses").delete().eq("id", courseId);
      throw new Error(linkError.message);
    }
  }

  const moduleDefs =
    input.modules && input.modules.length > 0
      ? input.modules
      : input.youtubeUrl
        ? [
            {
              title: "Parcours principal",
              description: undefined as string | undefined,
              sortOrder: 0,
              lessons: [
                {
                  title: input.title,
                  youtubeUrl: input.youtubeUrl,
                  estimatedDurationMinutes: input.estimatedDurationMinutes,
                  isPreview: false,
                },
              ],
            },
          ]
        : [
            {
              title: "Parcours principal",
              description: "Module créé automatiquement — ajoutez des leçons depuis l’admin",
              sortOrder: 0,
              lessons: [] as Array<{
                title: string;
                description?: string;
                youtubeUrl?: string;
                estimatedDurationMinutes: number;
                isPreview: boolean;
                sortOrder?: number;
              }>,
            },
          ];

  const modulesResult: AgentDraftCourseResult["modules"] = [];

  for (let mi = 0; mi < moduleDefs.length; mi += 1) {
    const mod = moduleDefs[mi]!;
    const { data: moduleRow, error: moduleError } = await client.database
      .from("modules")
      .insert({
        course_id: courseId,
        title: mod.title,
        description: mod.description || null,
        sort_order: mod.sortOrder ?? mi,
      })
      .select("id, title")
      .single();

    if (moduleError || !moduleRow) {
      await client.database.from("courses").delete().eq("id", courseId);
      throw new Error(moduleError?.message ?? "Impossible de créer le module");
    }

    const moduleId = String(moduleRow.id);
    const lessonsResult: AgentDraftCourseResult["modules"][number]["lessons"] = [];

    for (let li = 0; li < (mod.lessons?.length ?? 0); li += 1) {
      const lesson = mod.lessons![li]!;
      const lessonSlug = slugify(lesson.title) || `lecon-${li + 1}`;
      const { data: lessonRow, error: lessonError } = await client.database
        .from("lessons")
        .insert({
          module_id: moduleId,
          title: lesson.title,
          slug: lessonSlug,
          lesson_type: lesson.youtubeUrl ? "youtube" : "text",
          description: lesson.description || null,
          estimated_duration_minutes: lesson.estimatedDurationMinutes,
          sort_order: lesson.sortOrder ?? li,
          is_preview: lesson.isPreview,
          is_required: true,
          // Contenu prêt : invisible tant que la formation reste en brouillon.
          status: "published",
        })
        .select("id, title")
        .single();

      if (lessonError || !lessonRow) {
        await client.database.from("courses").delete().eq("id", courseId);
        throw new Error(lessonError?.message ?? "Impossible de créer la leçon");
      }

      const lessonId = String(lessonRow.id);
      let youtubeUrl: string | null = null;

      if (lesson.youtubeUrl) {
        const videoId = extractYouTubeVideoId(lesson.youtubeUrl);
        if (!videoId) {
          await client.database.from("courses").delete().eq("id", courseId);
          throw new Error(`Lien YouTube invalide: ${lesson.title}`);
        }
        youtubeUrl = youtubeWatchUrl(videoId);
        const thumb = youtubeThumbnailUrl(videoId);
        const { error: ytError } = await client.database.from("youtube_sources").insert({
          lesson_id: lessonId,
          youtube_video_id: videoId,
          video_url: youtubeUrl,
          channel_name: null,
          channel_url: null,
          original_title: lesson.title,
          thumbnail_url: thumb,
          embed_status: "unknown",
        });
        if (ytError) {
          await client.database.from("courses").delete().eq("id", courseId);
          throw new Error(ytError.message);
        }

        if (mi === 0 && li === 0 && !input.thumbnailUrl) {
          await client.database
            .from("courses")
            .update({ thumbnail_url: thumb })
            .eq("id", courseId);
        }
      }

      lessonsResult.push({
        id: lessonId,
        title: String(lessonRow.title),
        youtubeUrl,
      });
    }

    modulesResult.push({
      id: moduleId,
      title: String(moduleRow.title),
      lessons: lessonsResult,
    });
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const adminUrl = appUrl
    ? `${appUrl}/admin/formations/${courseId}`
    : `/admin/formations/${courseId}`;

  return {
    id: courseId,
    title: String(course.title),
    slug: String(course.slug),
    status: "draft",
    adminUrl,
    categoryId,
    modules: modulesResult,
  };
}

export async function listAgentCategories(): Promise<
  Array<{ id: string; name: string; slug: string; isActive: boolean }>
> {
  const client = requireServiceClient();
  const { data, error } = await client.database
    .from("categories")
    .select("id, name, slug, is_active")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  if (!Array.isArray(data)) return [];
  return data.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    isActive: Boolean(row.is_active),
  }));
}

export async function listAgentDraftCourses(limit = 30): Promise<
  Array<{ id: string; title: string; slug: string; updatedAt: string; adminUrl: string }>
> {
  const client = requireServiceClient();
  const { data, error } = await client.database
    .from("courses")
    .select("id, title, slug, updated_at")
    .eq("status", "draft")
    .order("updated_at", { ascending: false })
    .limit(Math.min(100, Math.max(1, limit)));
  if (error) throw new Error(error.message);
  if (!Array.isArray(data)) return [];
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  return data.map((row) => {
    const id = String(row.id);
    return {
      id,
      title: String(row.title),
      slug: String(row.slug),
      updatedAt: String(row.updated_at),
      adminUrl: appUrl ? `${appUrl}/admin/formations/${id}` : `/admin/formations/${id}`,
    };
  });
}
