import { getAdminDbClient } from "@/lib/admin/client";

export type YoutubeHealthIssue = {
  id: string;
  lessonId: string;
  videoId: string;
  videoUrl: string;
  title: string | null;
  channelName: string | null;
  status: string;
  updatedAt: string | null;
};

const HEALTHY_STATUSES = ["healthy"];

export async function listYoutubeHealthIssues(): Promise<YoutubeHealthIssue[]> {
  const client = await getAdminDbClient();
  const { data } = await client.database
    .from("youtube_sources")
    .select(
      "id, lesson_id, youtube_video_id, video_url, original_title, channel_name, embed_status, updated_at",
    )
    .order("updated_at", { ascending: false })
    .limit(500);

  if (!Array.isArray(data)) return [];
  return data
    .map((row) => ({
      id: String(row.id),
      lessonId: String(row.lesson_id),
      videoId: String(row.youtube_video_id),
      videoUrl: String(row.video_url ?? `https://www.youtube.com/watch?v=${row.youtube_video_id}`),
      title: (row.original_title as string | null) ?? null,
      channelName: (row.channel_name as string | null) ?? null,
      status: String(row.embed_status ?? "unknown"),
      updatedAt: (row.updated_at as string | null) ?? null,
    }))
    .filter((row) => !HEALTHY_STATUSES.includes(row.status));
}
