import { z } from "zod";

export const lessonProgressSchema = z.object({
  courseSlug: z.string().trim().min(1, "Formation requise").max(200),
  lessonId: z.string().uuid("Leçon invalide"),
  action: z.enum(["start", "update", "complete"]),
  lastPositionSeconds: z.coerce.number().int().min(0).max(86_400).optional(),
  progressPercent: z.coerce.number().min(0).max(100).optional(),
});

export const paymentInitializeSchema = z.object({
  planSlug: z.string().trim().min(1).max(80).optional(),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().email("E-mail invalide").max(200),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Code à 6 chiffres requis"),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().email("E-mail invalide").max(200),
});
