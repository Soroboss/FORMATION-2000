import { tryCreateInsForgeServiceClient } from "@/lib/insforge/server";

export type YoutubeEmbedStatus =
  | "unknown"
  | "healthy"
  | "unavailable"
  | "embedding_disabled"
  | "private"
  | "deleted"
  | "geo_restricted"
  | "needs_review";

type SourceRow = {
  id: string;
  lessonId: string;
  videoId: string;
  status: YoutubeEmbedStatus;
};

/**
 * Contrôle la disponibilité d'une vidéo via l'endpoint oEmbed public de YouTube
 * (aucune clé API requise). `null` = résultat non concluant (erreur réseau) :
 * on ne modifie alors pas le statut pour éviter les faux positifs.
 */
export async function classifyYoutubeVideo(
  videoId: string,
  timeoutMs = 5000,
): Promise<YoutubeEmbedStatus | null> {
  const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${videoId}`,
  )}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (res.ok) return "healthy";
    if (res.status === 401) return "private";
    if (res.status === 403) return "embedding_disabled";
    if (res.status === 404) return "deleted";
    return "needs_review";
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      const item = items[index];
      if (item === undefined) continue;
      results[index] = await fn(item);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return results;
}

export async function runYoutubeHealthJob(maxVideos = 300): Promise<{
  checked: number;
  changed: number;
  problems: number;
}> {
  const client = tryCreateInsForgeServiceClient();
  if (!client) {
    throw new Error("INSFORGE_SERVICE_KEY is required for the YouTube health job.");
  }

  const { data } = await client.database
    .from("youtube_sources")
    .select("id, lesson_id, youtube_video_id, embed_status")
    .limit(maxVideos);

  const sources: SourceRow[] = Array.isArray(data)
    ? data.map((row) => ({
        id: String(row.id),
        lessonId: String(row.lesson_id),
        videoId: String(row.youtube_video_id),
        status: String(row.embed_status ?? "unknown") as YoutubeEmbedStatus,
      }))
    : [];

  let changed = 0;
  let problems = 0;

  const evaluations = await mapWithConcurrency(sources, 6, async (source) => ({
    source,
    next: await classifyYoutubeVideo(source.videoId),
  }));

  for (const { source, next } of evaluations) {
    if (next == null) continue;
    if (next !== "healthy") problems += 1;
    if (next !== source.status) {
      await client.database
        .from("youtube_sources")
        .update({ embed_status: next })
        .eq("id", source.id);
      changed += 1;
    }
  }

  return { checked: sources.length, changed, problems };
}
