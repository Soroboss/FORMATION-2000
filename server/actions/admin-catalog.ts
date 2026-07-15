"use server";

import { revalidatePath } from "next/cache";
import { requireCatalogWriteSession } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit/write";
import {
  categoryUpsertSchema,
  courseUpsertSchema,
  lessonUpsertSchema,
  moduleUpsertSchema,
  quickAddVideoLessonSchema,
  bulkCreateFormationsSchema,
} from "@/lib/validation/admin";
import {
  createReadyFormation,
  deleteCourse,
  deleteLesson,
  ensureDefaultModule,
  getAdminCourse,
  listLessonsForModule,
  nextLessonSortOrder,
  publishCourse,
  upsertAssignmentForLesson,
  upsertCategory,
  upsertCourse,
  upsertLesson,
  upsertLessonInstructions,
  upsertModule,
} from "@/server/repositories/admin-catalog";
import type { CourseStatus } from "@/types/catalog";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import {
  getImageFileFromFormData,
  uploadAdminMediaImage,
  type MediaFolder,
} from "@/lib/storage/media";

function formString(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

function formBool(fd: FormData, key: string) {
  const v = fd.get(key);
  return v === "on" || v === "true" || v === "1";
}

function safeReturnTo(value: string, fallback: string): string {
  if (value.startsWith("/admin") && !value.startsWith("//")) return value;
  return fallback;
}

/** Upload fichier prioritaire, sinon URL collée, sinon URL existante. */
async function resolveImageUrl(
  formData: FormData,
  folder: MediaFolder,
): Promise<string | undefined> {
  const file = getImageFileFromFormData(formData, "imageFile");
  if (file) {
    const uploaded = await uploadAdminMediaImage(file, folder);
    return uploaded.url;
  }
  const pasted = formString(formData, "imageUrl") || formString(formData, "thumbnailUrl");
  if (pasted) return pasted;
  const existing = formString(formData, "existingImageUrl");
  return existing || undefined;
}

function revalidateCoursePaths(course: { id: string; slug: string }) {
  revalidatePath("/admin/formations");
  revalidatePath(`/admin/formations/${course.id}`);
  revalidatePath("/formations");
  revalidatePath(`/formations/${course.slug}`);
  revalidatePath(`/app/formations/${course.slug}`);
  revalidatePath("/app/catalogue");
  revalidatePath("/categories");
}

export async function saveCategoryAction(formData: FormData): Promise<void> {
  const back = safeReturnTo(formString(formData, "returnTo"), "/admin/categories");
  try {
    const session = await requireCatalogWriteSession();
    const imageUrl = await resolveImageUrl(formData, "categories");
    const parsed = categoryUpsertSchema.safeParse({
      name: formString(formData, "name"),
      slug: formString(formData, "slug") || undefined,
      description: formString(formData, "description"),
      icon: formString(formData, "icon"),
      imageUrl: imageUrl ?? "",
      sortOrder: formString(formData, "sortOrder") || 0,
      isActive: formBool(formData, "isActive"),
    });
    if (!parsed.success) {
      redirect(
        `${back}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Données invalides")}`,
      );
    }
    const id = formString(formData, "id") || undefined;
    const category = await upsertCategory({
      id,
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      icon: parsed.data.icon,
      imageUrl: parsed.data.imageUrl,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    });
    await writeAuditLog({
      actorUserId: session.user.id,
      action: id ? "category.update" : "category.create",
      entityType: "category",
      entityId: category.id,
      newValues: { name: category.name, slug: category.slug, imageUrl: category.imageUrl },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/formations");
    revalidatePath("/categories");
    revalidatePath("/app/catalogue");
    redirect(`${back}?ok=${encodeURIComponent("Catégorie enregistrée")}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : String(error);
    redirect(`${back}?error=${encodeURIComponent(message)}`);
  }
}

export async function saveCourseAction(formData: FormData): Promise<void> {
  const id = formString(formData, "id") || undefined;
  const back = id
    ? safeReturnTo(formString(formData, "returnTo"), `/admin/formations/${id}`)
    : safeReturnTo(formString(formData, "returnTo"), "/admin/formations");
  try {
    const session = await requireCatalogWriteSession();
    const thumbnailUrl = await resolveImageUrl(formData, "courses");
    const parsed = courseUpsertSchema.safeParse({
      title: formString(formData, "title"),
      slug: formString(formData, "slug") || undefined,
      shortDescription: formString(formData, "shortDescription"),
      description: formString(formData, "description"),
      learningOutcomes: formString(formData, "learningOutcomes"),
      requiredTools: formString(formData, "requiredTools"),
      finalProjectDescription: formString(formData, "finalProjectDescription"),
      thumbnailUrl: thumbnailUrl ?? "",
      categoryId: formString(formData, "categoryId") || undefined,
      level: formString(formData, "level") || undefined,
      accessType: formString(formData, "accessType") || "subscription",
      estimatedDurationMinutes: formString(formData, "estimatedDurationMinutes") || 0,
      isFeatured: formBool(formData, "isFeatured"),
      status: formString(formData, "status") || "draft",
    });
    if (!parsed.success) {
      redirect(
        `${back}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Données invalides")}`,
      );
    }
    const learningOutcomes = (parsed.data.learningOutcomes ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const requiredTools = (parsed.data.requiredTools ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const course = await upsertCourse({
      id,
      title: parsed.data.title,
      slug: parsed.data.slug,
      shortDescription: parsed.data.shortDescription,
      description: parsed.data.description,
      learningOutcomes,
      requiredTools,
      finalProjectDescription: parsed.data.finalProjectDescription,
      thumbnailUrl: parsed.data.thumbnailUrl,
      categoryId: parsed.data.categoryId || undefined,
      level: parsed.data.level || undefined,
      accessType: parsed.data.accessType,
      estimatedDurationMinutes: parsed.data.estimatedDurationMinutes,
      isFeatured: parsed.data.isFeatured,
      status: parsed.data.status as CourseStatus,
      authorUserId: session.user.id,
    });
    await writeAuditLog({
      actorUserId: session.user.id,
      action: id ? "course.update" : "course.create",
      entityType: "course",
      entityId: course.id,
      newValues: { title: course.title, status: course.status },
    });
    revalidateCoursePaths(course);
    redirect(
      `/admin/formations/${course.id}?ok=${encodeURIComponent("Formation enregistrée")}`,
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : String(error);
    redirect(`${back}?error=${encodeURIComponent(message)}`);
  }
}

export async function publishCourseAction(formData: FormData): Promise<void> {
  const courseId = formString(formData, "id");
  const back = courseId
    ? safeReturnTo(
        formString(formData, "returnTo"),
        `/admin/formations/${courseId}`,
      )
    : "/admin/formations";
  try {
    const session = await requireCatalogWriteSession();
    if (!courseId) {
      redirect(`${back}?error=${encodeURIComponent("ID manquant")}`);
    }
    const course = await publishCourse(courseId);
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "course.publish",
      entityType: "course",
      entityId: courseId,
    });
    revalidateCoursePaths(course);
    redirect(`${back}?ok=${encodeURIComponent("Formation publiée")}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : String(error);
    redirect(`${back}?error=${encodeURIComponent(message)}`);
  }
}

export async function deleteCourseAction(formData: FormData): Promise<void> {
  const back = safeReturnTo(formString(formData, "returnTo"), "/admin/formations");
  try {
    const session = await requireCatalogWriteSession();
    const id = formString(formData, "id");
    if (!id) {
      redirect(`${back}?error=${encodeURIComponent("ID manquant")}`);
    }
    const existing = await getAdminCourse(id);
    await deleteCourse(id);
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "course.delete",
      entityType: "course",
      entityId: id,
    });
    revalidatePath("/admin/formations");
    revalidatePath("/formations");
    revalidatePath("/app/catalogue");
    if (existing?.slug) {
      revalidatePath(`/formations/${existing.slug}`);
      revalidatePath(`/app/formations/${existing.slug}`);
    }
    redirect(`${back}?ok=${encodeURIComponent("Formation supprimée")}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : String(error);
    redirect(`${back}?error=${encodeURIComponent(message)}`);
  }
}

export async function saveModuleAction(formData: FormData): Promise<void> {
  const courseId = formString(formData, "courseId");
  const back = courseId ? `/admin/formations/${courseId}` : "/admin/formations";
  try {
    const session = await requireCatalogWriteSession();
    const parsed = moduleUpsertSchema.safeParse({
      courseId,
      title: formString(formData, "title"),
      description: formString(formData, "description"),
      sortOrder: formString(formData, "sortOrder") || 0,
    });
    if (!parsed.success) {
      redirect(
        `${back}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Données invalides")}`,
      );
    }
    const id = formString(formData, "id") || undefined;
    const mod = await upsertModule({ id, ...parsed.data });
    await writeAuditLog({
      actorUserId: session.user.id,
      action: id ? "module.update" : "module.create",
      entityType: "module",
      entityId: mod.id,
    });
    revalidatePath(`/admin/formations/${parsed.data.courseId}`);
    redirect(`${back}?ok=${encodeURIComponent("Module enregistré")}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : String(error);
    redirect(`${back}?error=${encodeURIComponent(message)}`);
  }
}

export async function saveLessonAction(formData: FormData): Promise<void> {
  const courseId = formString(formData, "courseId");
  const back = courseId ? `/admin/formations/${courseId}` : "/admin/formations";
  try {
    const session = await requireCatalogWriteSession();
    const lessonType = formString(formData, "lessonType") || "youtube";
    const youtubeUrl = formString(formData, "youtubeUrl");
    const statusRaw = formString(formData, "status");
    const parsed = lessonUpsertSchema.safeParse({
      moduleId: formString(formData, "moduleId"),
      title: formString(formData, "title"),
      slug: formString(formData, "slug"),
      lessonType,
      description: formString(formData, "description"),
      estimatedDurationMinutes: formString(formData, "estimatedDurationMinutes") || 0,
      sortOrder: formString(formData, "sortOrder") || 0,
      isPreview: formBool(formData, "isPreview"),
      isRequired: formBool(formData, "isRequired"),
      status: statusRaw || (youtubeUrl ? "published" : "draft"),
      youtubeUrl,
      channelName: formString(formData, "channelName"),
      channelUrl: formString(formData, "channelUrl"),
      originalTitle: formString(formData, "originalTitle"),
    });
    if (!parsed.success) {
      redirect(
        `${back}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Données invalides")}`,
      );
    }
    if (parsed.data.lessonType === "youtube" && !parsed.data.youtubeUrl) {
      redirect(`${back}?error=${encodeURIComponent("Ajoutez le lien YouTube de la vidéo")}`);
    }
    const id = formString(formData, "id") || undefined;
    const lesson = await upsertLesson({ id, ...parsed.data });
    await writeAuditLog({
      actorUserId: session.user.id,
      action: id ? "lesson.update" : "lesson.create",
      entityType: "lesson",
      entityId: lesson.id,
      newValues: { title: lesson.title, youtubeUrl: lesson.youtubeUrl },
    });
    if (courseId) {
      revalidatePath(`/admin/formations/${courseId}`);
      const course = await getAdminCourse(courseId);
      if (course) revalidateCoursePaths(course);
    }
    redirect(
      `${back}?ok=${encodeURIComponent(id ? "Leçon mise à jour" : "Leçon enregistrée")}`,
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : String(error);
    redirect(`${back}?error=${encodeURIComponent(message)}`);
  }
}

export async function deleteLessonAction(formData: FormData): Promise<void> {
  const courseId = formString(formData, "courseId");
  const back = courseId ? `/admin/formations/${courseId}` : "/admin/formations";
  try {
    const session = await requireCatalogWriteSession();
    const lessonId = formString(formData, "lessonId");
    if (!lessonId) {
      redirect(`${back}?error=${encodeURIComponent("Leçon introuvable")}`);
    }
    await deleteLesson(lessonId);
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "lesson.delete",
      entityType: "lesson",
      entityId: lessonId,
    });
    if (courseId) {
      revalidatePath(`/admin/formations/${courseId}`);
      const course = await getAdminCourse(courseId);
      if (course) revalidateCoursePaths(course);
    }
    redirect(`${back}?ok=${encodeURIComponent("Leçon supprimée")}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : String(error);
    redirect(`${back}?error=${encodeURIComponent(message)}`);
  }
}

/**
 * Parcours guidé : titre + lien YouTube + visibilité (+ consignes / exercice optionnels).
 * Crée un module par défaut si besoin.
 */
export async function quickAddVideoLessonAction(formData: FormData): Promise<void> {
  const courseId = formString(formData, "courseId");
  const back = courseId
    ? `/admin/formations/${courseId}`
    : "/admin/formations";

  try {
    const session = await requireCatalogWriteSession();
    const parsed = quickAddVideoLessonSchema.safeParse({
      courseId,
      moduleId: formString(formData, "moduleId") || undefined,
      title: formString(formData, "title"),
      youtubeUrl: formString(formData, "youtubeUrl"),
      visibility: formString(formData, "visibility") || "subscribers",
      instructions: formString(formData, "instructions"),
      exerciseTitle: formString(formData, "exerciseTitle"),
      exerciseInstructions: formString(formData, "exerciseInstructions"),
      publishCourse: formBool(formData, "publishCourse"),
    });
    if (!parsed.success) {
      redirect(
        `${back}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Données invalides")}`,
      );
    }

    const { title, youtubeUrl, visibility } = parsed.data;
    const targetModule = parsed.data.moduleId
      ? { id: parsed.data.moduleId }
      : await ensureDefaultModule(parsed.data.courseId);

    const existingLessons = await listLessonsForModule(targetModule.id);
    const orphan = existingLessons.find(
      (l) => !l.youtubeUrl && l.title.trim().toLowerCase() === title.trim().toLowerCase(),
    );
    const status = visibility === "draft" ? "draft" : "published";
    const isPreview = visibility === "preview";

    const lesson = await upsertLesson({
      id: orphan?.id,
      moduleId: targetModule.id,
      title,
      lessonType: "youtube",
      estimatedDurationMinutes: orphan?.estimatedDurationMinutes ?? 0,
      sortOrder: orphan?.sortOrder ?? nextLessonSortOrder(existingLessons),
      isPreview,
      isRequired: true,
      status,
      youtubeUrl,
    });

    if (parsed.data.instructions?.trim()) {
      await upsertLessonInstructions({
        lessonId: lesson.id,
        summary: parsed.data.instructions.trim(),
        objective: title,
      });
    }

    if (parsed.data.exerciseTitle?.trim() && parsed.data.exerciseInstructions?.trim()) {
      await upsertAssignmentForLesson({
        courseId: parsed.data.courseId,
        moduleId: targetModule.id,
        lessonId: lesson.id,
        title: parsed.data.exerciseTitle.trim(),
        instructions: parsed.data.exerciseInstructions.trim(),
      });
    }

    if (parsed.data.publishCourse) {
      await publishCourse(parsed.data.courseId);
    }

    await writeAuditLog({
      actorUserId: session.user.id,
      action: "lesson.quick_add_video",
      entityType: "lesson",
      entityId: lesson.id,
      newValues: {
        title: lesson.title,
        youtubeUrl: lesson.youtubeUrl,
        visibility,
        publishedCourse: parsed.data.publishCourse,
      },
    });

    const course = await getAdminCourse(parsed.data.courseId);
    if (course) revalidateCoursePaths(course);
    redirect(
      `/admin/formations/${parsed.data.courseId}?ok=${encodeURIComponent("Vidéo ajoutée")}`,
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : String(error);
    redirect(`${back}?error=${encodeURIComponent(message)}`);
  }
}

export type BulkCreateFormationsState = {
  ok: boolean;
  message: string;
  created?: number;
};

/**
 * Crée plusieurs formations d’un coup (titre + lien YouTube + visibilité).
 * Chaque ligne = formation publiée + vidéo pour abonnés (sauf brouillon).
 */
export async function bulkCreateFormationsAction(
  _prev: BulkCreateFormationsState,
  formData: FormData,
): Promise<BulkCreateFormationsState> {
  try {
    const session = await requireCatalogWriteSession();
    let items: unknown;
    try {
      items = JSON.parse(formString(formData, "payload") || "[]");
    } catch {
      return { ok: false, message: "Données invalides" };
    }

    const categoryIdRaw = formString(formData, "categoryId");
    const parsed = bulkCreateFormationsSchema.safeParse({
      items,
      categoryId: categoryIdRaw || undefined,
    });
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Vérifiez les lignes",
      };
    }

    const created: string[] = [];
    for (const item of parsed.data.items) {
      const result = await createReadyFormation({
        title: item.title,
        youtubeUrl: item.youtubeUrl,
        visibility: item.visibility,
        authorUserId: session.user.id,
        categoryId: parsed.data.categoryId,
      });
      created.push(result.courseId);
      await writeAuditLog({
        actorUserId: session.user.id,
        action: "course.bulk_create",
        entityType: "course",
        entityId: result.courseId,
        newValues: {
          title: item.title,
          youtubeUrl: item.youtubeUrl,
          visibility: item.visibility,
          categoryId: parsed.data.categoryId ?? null,
          lessonId: result.lessonId,
        },
      });
    }

    revalidatePath("/admin/formations");
    revalidatePath("/formations");
    revalidatePath("/app");
    revalidatePath("/app/catalogue");
    revalidatePath("/categories");

    redirect(`/admin/formations?created=${created.length}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Création impossible",
    };
  }
}
