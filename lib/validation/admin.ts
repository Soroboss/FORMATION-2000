import { z } from "zod";

export const categoryUpsertSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(120),
  slug: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  icon: z.string().trim().max(40).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

export const courseUpsertSchema = z.object({
  title: z.string().trim().min(3, "Titre trop court").max(200),
  slug: z.string().trim().min(2).max(200).optional(),
  shortDescription: z.string().trim().max(500).optional().or(z.literal("")),
  description: z.string().trim().max(10000).optional().or(z.literal("")),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional().or(z.literal("")),
  accessType: z.enum(["free", "subscription", "purchase"]).default("subscription"),
  estimatedDurationMinutes: z.coerce.number().int().min(0).default(0),
  isFeatured: z.coerce.boolean().default(false),
  status: z
    .enum(["draft", "in_review", "validated", "scheduled", "published", "archived"])
    .default("draft"),
});

export const moduleUpsertSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0),
});

export const lessonUpsertSchema = z.object({
  moduleId: z.string().uuid(),
  title: z.string().trim().min(2).max(200),
  slug: z.string().trim().max(200).optional().or(z.literal("")),
  lessonType: z
    .enum(["youtube", "text", "exercise", "quiz", "resource", "project", "external_link", "owned_video"])
    .default("youtube"),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  estimatedDurationMinutes: z.coerce.number().int().min(0).default(0),
  sortOrder: z.coerce.number().int().min(0),
  isPreview: z.coerce.boolean().default(false),
  isRequired: z.coerce.boolean().default(true),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  youtubeUrl: z.string().trim().max(500).optional().or(z.literal("")),
  channelName: z.string().trim().max(200).optional().or(z.literal("")),
  channelUrl: z.string().trim().max(500).optional().or(z.literal("")),
  originalTitle: z.string().trim().max(300).optional().or(z.literal("")),
});

/** Ajout rapide d’une vidéo YouTube (parcours admin guidé). */
export const quickAddVideoLessonSchema = z
  .object({
    courseId: z.string().uuid(),
    moduleId: z.string().uuid().optional().or(z.literal("")),
    title: z.string().trim().min(2, "Titre trop court").max(200),
    youtubeUrl: z.string().trim().min(8, "Lien YouTube requis").max(500),
    visibility: z.enum(["subscribers", "preview", "draft"]).default("subscribers"),
    instructions: z.string().trim().max(5000).optional().or(z.literal("")),
    exerciseTitle: z.string().trim().max(200).optional().or(z.literal("")),
    exerciseInstructions: z.string().trim().max(5000).optional().or(z.literal("")),
    publishCourse: z.coerce.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    const hasExerciseTitle = Boolean(data.exerciseTitle?.trim());
    const hasExerciseBody = Boolean(data.exerciseInstructions?.trim());
    if (hasExerciseTitle !== hasExerciseBody) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pour un exercice, renseignez le titre et les consignes",
        path: hasExerciseTitle ? ["exerciseInstructions"] : ["exerciseTitle"],
      });
    }
  });

/** Création rapide d’une ou plusieurs formations (titre + lien YouTube). */
export const bulkCreateFormationItemSchema = z.object({
  title: z.string().trim().min(2, "Titre trop court").max(200),
  youtubeUrl: z.string().trim().min(8, "Lien YouTube requis").max(500),
  visibility: z.enum(["subscribers", "preview", "draft"]).default("subscribers"),
});

export const bulkCreateFormationsSchema = z.object({
  items: z
    .array(bulkCreateFormationItemSchema)
    .min(1, "Ajoutez au moins une formation")
    .max(30, "Maximum 30 formations à la fois"),
});

export const memberStatusSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(["active", "suspended", "deleted"]),
});

export const assignRoleSchema = z.object({
  userId: z.string().uuid(),
  roleKey: z.enum(["learner", "curator", "instructor", "support", "admin", "super_admin"]),
});

export const inviteCollaboratorSchema = z.object({
  firstName: z.string().trim().min(2, "Prénom trop court").max(80),
  lastName: z.string().trim().min(2, "Nom trop court").max(80),
  email: z.string().trim().email("E-mail invalide").max(200),
  password: z
    .string()
    .min(8, "Mot de passe : 8 caractères minimum")
    .max(128),
  roleKey: z.enum(["curator", "instructor", "support", "admin", "super_admin"]),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
});

export const extendSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid(),
  days: z.coerce.number().int().min(1).max(365).default(30),
});

export const reviewSubmissionSchema = z.object({
  submissionId: z.string().uuid(),
  status: z.enum(["approved", "rejected", "needs_changes"]),
  score: z.coerce.number().min(0).max(100).optional(),
  reviewComment: z.string().trim().max(5000).optional().or(z.literal("")),
});

export const settingUpdateSchema = z.object({
  key: z.string().trim().min(1).max(100),
  value: z.string().trim().min(1).max(5000),
});
