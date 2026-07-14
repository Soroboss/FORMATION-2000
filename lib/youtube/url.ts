const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

const WATCH_RE =
  /(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function isValidYouTubeVideoId(id: string): boolean {
  return YOUTUBE_ID_RE.test(id);
}

/**
 * Extract a YouTube video id from common URL formats.
 * Returns null if the URL/domain/id is invalid.
 */
export function extractYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (isValidYouTubeVideoId(trimmed)) {
    return trimmed;
  }

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    if (host !== "youtube.com" && host !== "m.youtube.com" && host !== "youtu.be" && host !== "youtube-nocookie.com") {
      return null;
    }

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
      return isValidYouTubeVideoId(id) ? id : null;
    }

    const v = url.searchParams.get("v");
    if (v && isValidYouTubeVideoId(v)) {
      return v;
    }

    const match = trimmed.match(WATCH_RE);
    const fromPath = match?.[1];
    return fromPath && isValidYouTubeVideoId(fromPath) ? fromPath : null;
  } catch {
    return null;
  }
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function youtubeEmbedUrl(videoId: string, startAt = 0): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  if (startAt > 0) {
    params.set("start", String(Math.floor(startAt)));
  }
  // Privacy-enhanced domain when compatible — official YouTube embed still.
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
