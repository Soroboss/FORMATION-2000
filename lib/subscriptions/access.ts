import { userHasPremiumAccess } from "@/server/repositories/payments";

/**
 * Server-side premium access check — never trust the client.
 */
export async function canAccessPremiumContent(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  return userHasPremiumAccess(userId);
}

export function canWatchLesson(input: {
  isPreview: boolean;
  courseAccessType: "free" | "subscription" | "purchase";
  hasPremiumAccess: boolean;
}): boolean {
  if (input.isPreview) return true;
  if (input.courseAccessType === "free") return true;
  return input.hasPremiumAccess;
}
