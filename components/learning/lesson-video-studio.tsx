"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Expand, Minimize2, StickyNote, X } from "lucide-react";
import { LessonNotesPad } from "@/features/learning/lesson-notes-pad";
import { youtubeEmbedUrl, youtubeWatchUrl } from "@/lib/youtube/url";
import { cn } from "@/lib/utils";

type LessonVideoStudioProps = {
  videoId: string;
  lessonId: string;
  title: string;
  channelName?: string | null;
  channelUrl?: string | null;
  courseSlug: string;
  initialNote: string;
  showNotes: boolean;
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

/**
 * Branded lesson studio around the official YouTube IFrame API embed.
 * Views still count for the creator; we only dress the surrounding UX.
 * Theater mode uses CSS overlay so the player never remounts mid-watch.
 */
export function LessonVideoStudio({
  videoId,
  lessonId,
  title,
  channelName,
  channelUrl,
  courseSlug,
  initialNote,
  showNotes,
  startAt = 0,
  onProgress,
  onEnded,
}: LessonVideoStudioProps) {
  const mountId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const onProgressRef = useRef(onProgress);
  const onEndedRef = useRef(onEnded);
  onProgressRef.current = onProgress;
  onEndedRef.current = onEnded;

  const [ready, setReady] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [theater, setTheater] = useState(false);
  const [notesOpen, setNotesOpen] = useState(true);

  const destroyPlayer = useCallback(() => {
    try {
      playerRef.current?.destroy();
    } catch {
      // ignore
    }
    playerRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;

    async function mount() {
      destroyPlayer();
      setReady(false);
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
            iv_load_policy: 3,
            fs: 1,
            start: Math.max(0, Math.floor(startAt)),
          },
          events: {
            onReady: () => {
              if (!cancelled) setReady(true);
            },
            onStateChange: (event) => {
              if (event.data === window.YT?.PlayerState.ENDED) {
                onEndedRef.current?.();
              }
            },
          },
        });

        interval = setInterval(() => {
          const seconds = playerRef.current?.getCurrentTime?.();
          if (typeof seconds === "number" && !Number.isNaN(seconds)) {
            onProgressRef.current?.(seconds);
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
      destroyPlayer();
    };
  }, [videoId, lessonId, startAt, destroyPlayer]);

  useEffect(() => {
    if (!theater) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTheater(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [theater]);

  const watchUrl = youtubeWatchUrl(videoId);
  const credit = channelName ?? "Créateur YouTube";

  return (
    <>
      {theater ? (
        <div className="aspect-video w-full rounded-2xl bg-[#0c0a09]/35" aria-hidden />
      ) : null}

      <div
        className={cn(
          theater
            ? "fixed inset-0 z-50 flex items-center justify-center bg-[#070605]/92 p-3 backdrop-blur-md sm:p-6"
            : "relative",
        )}
      >
        <div
          className={cn(
            "w-full overflow-hidden rounded-2xl border border-[#2a241c] bg-[#0c0a09] shadow-[0_24px_80px_-32px_rgba(20,12,4,0.7)]",
            theater && "max-h-[100dvh] max-w-7xl border-white/10",
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/70">
                Studio de leçon
              </p>
              <p className="truncate text-sm font-semibold text-white">{title}</p>
            </div>
            {theater ? (
              <button
                type="button"
                onClick={() => setTheater(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/15"
                aria-label="Fermer le mode agrandi"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div
            className={cn(
              "grid",
              showNotes && notesOpen
                ? "lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.72fr)]"
                : "grid-cols-1",
            )}
          >
            <div className="min-w-0">
              <div
                className={cn(
                  "relative overflow-hidden bg-black",
                  theater ? "aspect-video max-h-[min(68vh,700px)] w-full" : "aspect-video w-full",
                )}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-[1] ring-1 ring-inset ring-white/10"
                />
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
                  <div
                    id={`yt-mount-${mountId}`}
                    ref={containerRef}
                    className="absolute inset-0 h-full w-full"
                  />
                )}
                {!ready && !useFallback ? (
                  <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-2 bg-[#0c0a09]/90 text-sm text-white/80">
                    <span className="h-8 w-8 animate-pulse rounded-full bg-amber-500/30" />
                    Préparation du studio…
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-[#1a1612] px-3 py-2.5">
                <div className="min-w-0 text-xs text-white/65 sm:text-sm">
                  <span className="font-medium text-white/90">Contenu partenaire</span>
                  {" · "}
                  {channelUrl ? (
                    <a
                      href={channelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-amber-200/90 underline-offset-2 hover:underline"
                    >
                      {credit}
                    </a>
                  ) : (
                    <span className="font-medium text-white/80">{credit}</span>
                  )}
                  <span className="hidden text-white/40 sm:inline">
                    {" "}
                    — vues créditées à la chaîne
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {showNotes ? (
                    <button
                      type="button"
                      onClick={() => setNotesOpen((v) => !v)}
                      className={cn(
                        "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition",
                        notesOpen
                          ? "bg-amber-500/20 text-amber-100"
                          : "bg-white/5 text-white/80 hover:bg-white/10",
                      )}
                    >
                      <StickyNote className="h-3.5 w-3.5" aria-hidden />
                      {notesOpen ? "Masquer notes" : "Notes"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setTheater((v) => !v)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/15"
                  >
                    {theater ? (
                      <>
                        <Minimize2 className="h-3.5 w-3.5" aria-hidden />
                        Réduire
                      </>
                    ) : (
                      <>
                        <Expand className="h-3.5 w-3.5" aria-hidden />
                        Agrandir
                      </>
                    )}
                  </button>
                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center rounded-lg border border-white/15 px-3 text-xs font-semibold text-white/80 hover:bg-white/5"
                    title="Ouvre la vidéo sur YouTube (crédite le créateur)"
                  >
                    Source
                  </a>
                </div>
              </div>
            </div>

            {showNotes && notesOpen ? (
              <div
                className={cn(
                  "border-t border-white/10 p-3 lg:border-l lg:border-t-0",
                  theater && "max-h-[min(68vh,700px)] overflow-hidden",
                )}
              >
                <LessonNotesPad
                  courseSlug={courseSlug}
                  lessonId={lessonId}
                  initialNote={initialNote}
                  variant="side"
                  className={theater ? "h-full min-h-[280px]" : "min-h-[260px] lg:h-full lg:min-h-[320px]"}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
