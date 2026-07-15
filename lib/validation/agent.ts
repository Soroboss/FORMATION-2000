import { z } from "zod";
import { extractYouTubeVideoId } from "@/lib/youtube/url";

const youtubeUrlSchema = z
  .string()
  .trim()
  .min(8)
  .max(500)
  .refine((value) => Boolean(extractYouTubeVideoId(value)), {
    message: "Lien YouTube invalide",
  });

export const agentLessonSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).optional(),
  youtubeUrl: youtubeUrlSchema.optional(),
  estimatedDurationMinutes: z.coerce.number().int().min(0).max(24 * 60).default(0),
  isPreview: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const agentModuleSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  lessons: z.array(agentLessonSchema).max(50).default([]),
});

/**
 * Création agent : le statut course est toujours forcé en `draft` côté serveur.
 * Aucun champ ne permet de publier.
 */
export const agentCreateCourseSchema = z
  .object({
    title: z.string().trim().min(3, "Titre trop court").max(200),
    slug: z.string().trim().min(2).max(200).optional(),
    shortDescription: z.string().trim().max(500).optional(),
    description: z.string().trim().max(10000).optional(),
    learningOutcomes: z.array(z.string().trim().min(1).max(500)).max(30).optional(),
    requiredTools: z.array(z.string().trim().min(1).max(200)).max(30).optional(),
    finalProjectDescription: z.string().trim().max(5000).optional(),
    thumbnailUrl: z.string().trim().url().max(2000).optional(),
    categoryId: z.string().uuid().optional(),
    categorySlug: z.string().trim().min(2).max(120).optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    accessType: z.enum(["free", "subscription", "purchase"]).default("subscription"),
    estimatedDurationMinutes: z.coerce.number().int().min(0).max(100_000).default(0),
    isFeatured: z.boolean().default(false),
    /** Raccourci : une leçon YouTube dans un module « Parcours principal ». */
    youtubeUrl: youtubeUrlSchema.optional(),
    modules: z.array(agentModuleSchema).max(20).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.categoryId && data.categorySlug) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indiquez categoryId ou categorySlug, pas les deux",
        path: ["categorySlug"],
      });
    }
  });

export type AgentCreateCourseInput = z.infer<typeof agentCreateCourseSchema>;
