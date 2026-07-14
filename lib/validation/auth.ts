import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Le prénom est requis.")
    .max(80, "Prénom trop long."),
  lastName: z
    .string()
    .trim()
    .min(1, "Le nom est requis.")
    .max(80, "Nom trop long."),
  email: z.email("Adresse e-mail invalide."),
  whatsapp: z
    .string()
    .trim()
    .min(8, "Le numéro WhatsApp est requis.")
    .max(20, "Numéro WhatsApp trop long.")
    .regex(/^\+?[\d\s.-]{8,20}$/, "Numéro WhatsApp invalide.")
    .transform((value) => value.replace(/[^\d+]/g, "")),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
    .max(128, "Mot de passe trop long."),
  acceptTerms: z.literal(true, {
    message: "Vous devez accepter les conditions d'utilisation.",
  }),
});

export const loginSchema = z.object({
  email: z.email("Adresse e-mail invalide."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Adresse e-mail invalide."),
});

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Le prénom est requis.")
    .max(80, "Prénom trop long."),
  lastName: z
    .string()
    .trim()
    .min(1, "Le nom est requis.")
    .max(80, "Nom trop long."),
  displayName: z.string().trim().max(120, "Nom affiché trop long."),
  whatsapp: z
    .string()
    .trim()
    .min(8, "Le numéro WhatsApp est requis.")
    .max(20, "Numéro WhatsApp trop long.")
    .regex(/^\+?[\d\s.-]{8,20}$/, "Numéro WhatsApp invalide.")
    .transform((value) => value.replace(/[^\d+]/g, "")),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
      .max(128, "Mot de passe trop long."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
