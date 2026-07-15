import {
  createInsForgeServerClient,
  tryCreateInsForgeServiceClient,
} from "@/lib/insforge/server";
import { getAccessToken } from "@/lib/auth/cookies";

export const MEDIA_BUCKET = "media";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 Mo
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type MediaFolder = "categories" | "courses";

function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

export function assertValidImageFile(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error("Format image non supporté (JPEG, PNG, WebP ou GIF).");
  }
  if (file.size <= 0) {
    throw new Error("Fichier image vide.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image trop lourde (max 5 Mo).");
  }
}

export function getImageFileFromFormData(formData: FormData, key = "imageFile"): File | null {
  const value = formData.get(key);
  if (!(value instanceof File) || value.size === 0) return null;
  return value;
}

/**
 * Upload d’une image admin vers le bucket public InsForge `media`.
 * Préférer la clé service (bypass RLS) ; sinon token staff authentifié.
 */
export async function uploadAdminMediaImage(
  file: File,
  folder: MediaFolder,
): Promise<{ url: string; key: string }> {
  assertValidImageFile(file);

  const privileged = tryCreateInsForgeServiceClient();
  const token = privileged ? undefined : await getAccessToken();
  if (!privileged && !token) {
    throw new Error("Session ou clé service manquante pour l’upload.");
  }

  const client = privileged ?? createInsForgeServerClient(token);
  const ext = extensionForMime(file.type);
  const key = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { data, error } = await client.storage.from(MEDIA_BUCKET).upload(key, file);
  if (error || !data?.url) {
    throw new Error(error?.message ?? "Upload image impossible.");
  }

  return {
    url: String(data.url),
    key: String(data.key ?? key),
  };
}
