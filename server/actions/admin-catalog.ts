"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/session";
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
  ensureDefaultModule,
  listLessonsForModule,
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

function formString(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

function formBool(fd: FormData, key: string) {
  const v = fd.get(key);
  return v === "on" || v === "true" || v === "1";
}

export async function saveCategoryAction(formData: FormData): Promise<void> {
  try {
    const session = await requireAdminSession();
    const parsed = categoryUpsertSchema.safeParse({
      name: formString(formData, "name"),
      slug: formString(formData, "slug") || undefined,
      description: formString(formData, "description"),
      icon: formString(formData, "icon"),
      imageUrl: formString(formData, "imageUrl"),
      sortOrder: formString(formData, "sortOrder") || 0,
      isActive: formBool(formData, "isActive"),
    });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
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
      newValues: { name: category.name, slug: category.slug },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/formations");
    revalidatePath("/categories");
    revalidatePath("/app/catalogue");
    return;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function saveCourseAction(formData: FormData): Promise<void> {
  try {
    const session = await requireAdminSession();
    const parsed = courseUpsertSchema.safeParse({
      title: formString(formData, "title"),
      slug: formString(formData, "slug") || undefined,
      shortDescription: formString(formData, "shortDescription"),
      description: formString(formData, "description"),
      learningOutcomes: formString(formData, "learningOutcomes"),
      requiredTools: formString(formData, "requiredTools"),
      finalProjectDescription: formString(formData, "finalProjectDescription"),
      thumbnailUrl: formString(formData, "thumbnailUrl"),
      categoryId: formString(formData, "categoryId") || undefined,
      level: formString(formData, "level") || undefined,
      accessType: formString(formData, "accessType") || "subscription",
      estimatedDurationMinutes: formString(formData, "estimatedDurationMinutes") || 0,
      isFeatured: formBool(formData, "isFeatured"),
      status: formString(formData, "status") || "draft",
    });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
    }
    const id = formString(formData, "id") || undefined;
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
    revalidatePath("/admin/formations");
    revalidatePath(`/admin/formations/${course.id}`);
    revalidatePath("/formations");
    revalidatePath(`/formations/${course.slug}`);
    revalidatePath(`/app/formations/${course.slug}`);
    revalidatePath("/app/catalogue");
    return;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function publishCourseAction(formData: FormData): Promise<void> {
  try {
    const session = await requireAdminSession();
    const id = formString(formData, "id");
    if (!id) throw new Error("ID manquant");
    await publishCourse(id);
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "course.publish",
      entityType: "course",
      entityId: id,
    });
    revalidatePath("/admin/formations");
    revalidatePath(`/admin/formations/${id}`);
    revalidatePath("/formations");
    return;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function deleteCourseAction(formData: FormData): Promise<void> {
  try {
    const session = await requireAdminSession();
    const id = formString(formData, "id");
    if (!id) throw new Error("ID manquant");
    await deleteCourse(id);
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "course.delete",
      entityType: "course",
      entityId: id,
    });
    revalidatePath("/admin/formations");
    revalidatePath("/formations");
    return;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function saveModuleAction(formData: FormData): Promise<void> {
  try {
    const session = await requireAdminSession();
    const parsed = moduleUpsertSchema.safeParse({
      courseId: formString(formData, "courseId"),
      title: formString(formData, "title"),
      description: formString(formData, "description"),
      sortOrder: formString(formData, "sortOrder") || 0,
    });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
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
    return;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function saveLessonAction(formData: FormData): Promise<void> {
  try {
    const session = await requireAdminSession();
    const courseId = formString(formData, "courseId");
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
      throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
    }
    if (parsed.data.lessonType === "youtube" && !parsed.data.youtubeUrl) {
      throw new Error("Ajoutez le lien YouTube de la vidéo");
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
    if (courseId) revalidatePath(`/admin/formations/${courseId}`);
    return;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Parcours guidé : titre + lien YouTube + visibilité (+ consignes / exercice optionnels).
 * Crée un module par défaut si besoin.
 */
export async function quickAddVideoLessonAction(formData: FormData): Promise<void> {
  try {
    const session = await requireAdminSession();
    const parsed = quickAddVideoLessonSchema.safeParse({
      courseId: formString(formData, "courseId"),
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
      throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
    }

    const { courseId, title, youtubeUrl, visibility } = parsed.data;
    const targetModule = parsed.data.moduleId
      ? { id: parsed.data.moduleId }
      : await ensureDefaultModule(courseId);

    const existingLessons = await listLessonsForModule(targetModule.id);
    const status = visibility === "draft" ? "draft" : "published";
    const isPreview = visibility === "preview";

    const lesson = await upsertLesson({
      moduleId: targetModule.id,
      title,
      lessonType: "youtube",
      estimatedDurationMinutes: 0,
      sortOrder: existingLessons.length,
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
        courseId,
        moduleId: targetModule.id,
        lessonId: lesson.id,
        title: parsed.data.exerciseTitle.trim(),
        instructions: parsed.data.exerciseInstructions.trim(),
      });
    }

    if (parsed.data.publishCourse) {
      await publishCourse(courseId);
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

    revalidatePath(`/admin/formations/${courseId}`);
    revalidatePath("/admin/formations");
    revalidatePath("/formations");
    revalidatePath("/app");
    return;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
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
    const session = await requireAdminSession();
    let items: unknown;
    try {
      items = JSON.parse(formString(formData, "payload") || "[]");
    } catch {
      return { ok: false, message: "Données invalides" };
    }

    const parsed = bulkCreateFormationsSchema.safeParse({ items });
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
          lessonId: result.lessonId,
        },
      });
    }

    revalidatePath("/admin/formations");
    revalidatePath("/formations");
    revalidatePath("/app");

    redirect(`/admin/formations?created=${created.length}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Création impossible",
    };
  }
}
