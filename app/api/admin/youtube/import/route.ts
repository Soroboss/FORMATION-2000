import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit/write";
import { extractYouTubeVideoId, youtubeWatchUrl, youtubeThumbnailUrl } from "@/lib/youtube/url";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const body = (await request.json()) as {
      url?: string;
      channelName?: string;
      channelUrl?: string;
      originalTitle?: string;
    };
    const videoId = body.url ? extractYouTubeVideoId(body.url) : null;
    if (!videoId) {
      return NextResponse.json(
        { error: { code: "INVALID_URL", message: "Lien YouTube invalide." } },
        { status: 400 },
      );
    }

    const preview = {
      youtubeVideoId: videoId,
      videoUrl: youtubeWatchUrl(videoId),
      thumbnailUrl: youtubeThumbnailUrl(videoId),
      channelName: body.channelName ?? null,
      channelUrl: body.channelUrl ?? null,
      originalTitle: body.originalTitle ?? null,
      embedStatus: "unknown",
    };

    await writeAuditLog({
      actorUserId: session.user.id,
      action: "youtube.import.preview",
      entityType: "youtube",
      entityId: videoId,
      newValues: preview,
    });

    return NextResponse.json({ data: preview });
  } catch (error) {
    const message = error instanceof Error ? error.message : "IMPORT_FAILED";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: { code: message, message } }, { status });
  }
}
