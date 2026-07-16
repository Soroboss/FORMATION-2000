/** Ratios recommandés pour bannières catalogue (16:9) et hero (21:9). */
export const COVER_IMAGE_RECOMMENDED = {
  card: { width: 1200, height: 675, ratio: "16:9" },
  hero: { width: 1920, height: 640, ratio: "21:9" },
} as const;

export const COVER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const OPTIMIZABLE_HOST_SUFFIXES = [".insforge.app", "cdn.insforge.dev"] as const;
const OPTIMIZABLE_EXACT_HOSTS = new Set([
  "i.ytimg.com",
  "img.youtube.com",
  "cdn.insforge.dev",
]);

export type CoverImageVariant = "card" | "hero" | "banner" | "fill" | "thumb";

export const COVER_IMAGE_SIZES: Record<CoverImageVariant, string> = {
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  hero: "(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 960px",
  banner: "100vw",
  fill: "(max-width: 640px) 100vw, 400px",
  thumb: "(max-width: 640px) 40vw, 160px",
};

export function canOptimizeImageUrl(url: string | null | undefined): url is string {
  if (!url?.trim()) return false;
  try {
    const { hostname } = new URL(url);
    if (OPTIMIZABLE_EXACT_HOSTS.has(hostname)) return true;
    return OPTIMIZABLE_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
  } catch {
    return false;
  }
}

export function coverImageAlt(label: string, context?: "category" | "course"): string {
  const trimmed = label.trim();
  if (!trimmed) return context === "course" ? "Illustration formation" : "Illustration catégorie";
  return context === "course"
    ? `Illustration — ${trimmed}`
    : `Bannière — ${trimmed}`;
}
