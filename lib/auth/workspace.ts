import { cookies } from "next/headers";

/** Cookie : un admin consulte volontairement l’espace apprenant. */
export const LEARNER_PREVIEW_COOKIE = "learnoon_learner_preview";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 8, // 8 h
};

export async function isLearnerPreviewActive(): Promise<boolean> {
  const value = (await cookies()).get(LEARNER_PREVIEW_COOKIE)?.value;
  return value === "1";
}

export async function enableLearnerPreview(): Promise<void> {
  const store = await cookies();
  store.set(LEARNER_PREVIEW_COOKIE, "1", cookieOptions);
}

export async function disableLearnerPreview(): Promise<void> {
  const store = await cookies();
  store.delete(LEARNER_PREVIEW_COOKIE);
}
