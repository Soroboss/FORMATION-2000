"use client";

import { useEffect, useRef, useState } from "react";
import { youtubeEmbedUrl, youtubeWatchUrl } from "@/lib/youtube/url";

type YouTubeLessonPlayerProps = {
  videoId: string;
  lessonId: string;
  title: string;
  channelName?: string | null;
  channelUrl?: string | null;
  startAt?: number;
  onProgress?: (seconds: number) => void;
  onEnded?: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        config: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
          };
        },
      ) => YTPlayer;
      PlayerState: { ENDED: number; PLAYING: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YTPlayer = {
  getCurrentTime: () => number;
  destroy: () => void;
};

let apiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);
    }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    if (window.YT?.Player) resolve();
  });

  return apiPromise;
}

export function YouTubeLessonPlayer({
  videoId,
  lessonId,
  title,
  channelName,
  channelUrl,
  startAt = 0,
  onProgress,
  onEnded,
}: YouTubeLessonPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;

    async function mount() {
      try {
        await loadYouTubeApi();
        if (cancelled || !containerRef.current || !window.YT?.Player) {
          setUseFallback(true);
          return;
        }

        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId,
          playerVars: {
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            start: Math.max(0, Math.floor(startAt)),
          },
          events: {
            onReady: () => {
              if (!cancelled) setReady(true);
            },
            onStateChange: (event) => {
              if (event.data === window.YT?.PlayerState.ENDED) {
                onEnded?.();
              }
            },
          },
        });

        interval = setInterval(() => {
          const seconds = playerRef.current?.getCurrentTime?.();
          if (typeof seconds === "number" && !Number.isNaN(seconds)) {
            onProgress?.(seconds);
          }
        }, 5000);
      } catch {
        if (!cancelled) setUseFallback(true);
      }
    }

    void mount();

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      try {
        playerRef.current?.destroy();
      } catch {
        // ignore
      }
      playerRef.current = null;
    };
  }, [videoId, lessonId, startAt, onEnded, onProgress]);

  const watchUrl = youtubeWatchUrl(videoId);

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900 shadow-lg">
        {useFallback ? (
          <iframe
            title={title}
            src={youtubeEmbedUrl(videoId, startAt)}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <div ref={containerRef} className="absolute inset-0 h-full w-full" />
        )}
        {!ready && !useFallback ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white/80">
            Chargement du lecteur vidéo…
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          {channelName ? (
            <p>
              Crédit :{" "}
              {channelUrl ? (
                <a
                  href={channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-700 underline"
                >
                  {channelName}
                </a>
              ) : (
                <span className="font-medium text-slate-800">{channelName}</span>
              )}
            </p>
          ) : (
            <p>Vidéo intégrée via le lecteur officiel de la source.</p>
          )}
        </div>
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Voir la source
        </a>
      </div>
    </div>
  );
}
