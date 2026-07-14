"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit/write";
import {
  categoryUpsertSchema,
  courseUpsertSchema,
  lessonUpsertSchema,
  moduleUpsertSchema,
} from "@/lib/validation/admin";
import {
  deleteCourse,
  publishCourse,
  upsertCategory,
  upsertCourse,
  upsertLesson,
  upsertModule,
} from "@/server/repositories/admin-catalog";
import type { CourseStatus } from "@/types/catalog";

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
      sortOrder: formString(formData, "sortOrder") || 0,
      isActive: formBool(formData, "isActive"),
    });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
    }
    const id = formString(formData, "id") || undefined;
    const category = await upsertCategory({ id, ...parsed.data });
    await writeAuditLog({
      actorUserId: session.user.id,
      action: id ? "category.update" : "category.create",
      entityType: "category",
      entityId: category.id,
      newValues: { name: category.name, slug: category.slug },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/formations");
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
    const course = await upsertCourse({
      id,
      title: parsed.data.title,
      slug: parsed.data.slug,
      shortDescription: parsed.data.shortDescription,
      description: parsed.data.description,
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
    const parsed = lessonUpsertSchema.safeParse({
      moduleId: formString(formData, "moduleId"),
      title: formString(formData, "title"),
      slug: formString(formData, "slug"),
      lessonType: formString(formData, "lessonType") || "youtube",
      description: formString(formData, "description"),
      estimatedDurationMinutes: formString(formData, "estimatedDurationMinutes") || 0,
      sortOrder: formString(formData, "sortOrder") || 0,
      isPreview: formBool(formData, "isPreview"),
      isRequired: formBool(formData, "isRequired"),
      status: formString(formData, "status") || "draft",
      youtubeUrl: formString(formData, "youtubeUrl"),
      channelName: formString(formData, "channelName"),
      channelUrl: formString(formData, "channelUrl"),
      originalTitle: formString(formData, "originalTitle"),
    });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
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
