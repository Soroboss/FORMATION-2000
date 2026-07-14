"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { saveNoteAction } from "@/server/actions/learning";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LessonNotesPadProps = {
  courseSlug: string;
  lessonId: string;
  initialNote: string;
  className?: string;
  /** Compact chrome for side-by-side / theater layouts */
  variant?: "side" | "card";
};

/**
 * Private lesson notes — saves on demand and after a short debounce while typing.
 */
export function LessonNotesPad({
  courseSlug,
  lessonId,
  initialNote,
  className,
  variant = "side",
}: LessonNotesPadProps) {
  const [note, setNote] = useState(initialNote);
  const [savedSnapshot, setSavedSnapshot] = useState(initialNote);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteRef = useRef(note);
  noteRef.current = note;

  useEffect(() => {
    setNote(initialNote);
    setSavedSnapshot(initialNote);
  }, [initialNote, lessonId]);

  function persist(content: string) {
    if (!content.trim()) {
      setStatus("idle");
      return;
    }
    if (content === savedSnapshot) {
      setStatus("saved");
      return;
    }
    setStatus("saving");
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("courseSlug", courseSlug);
      fd.set("lessonId", lessonId);
      fd.set("content", content);
      const res = await saveNoteAction(fd);
      if (!res.success) {
        setStatus("error");
        setError(res.error ?? "Enregistrement impossible");
        return;
      }
      setSavedSnapshot(content);
      setStatus("saved");
    });
  }

  useEffect(() => {
    if (note === savedSnapshot) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      persist(noteRef.current);
    }, 1400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce on note only
  }, [note, savedSnapshot]);

  const dirty = note !== savedSnapshot;
  const statusLabel =
    status === "saving" || pending
      ? "Enregistrement…"
      : status === "saved" && !dirty
        ? "Enregistré"
        : dirty
          ? "Non enregistré"
          : "Prêt";

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col",
        variant === "side"
          ? "rounded-2xl border border-white/10 bg-[#14110e] text-[#f5f0e8]"
          : "rounded-2xl border border-canvas-border bg-white text-ink",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 border-b px-4 py-3",
          variant === "side" ? "border-white/10" : "border-canvas-border",
        )}
      >
        <div>
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.14em]",
              variant === "side" ? "text-amber-200/80" : "text-brand-700",
            )}
          >
            Bloc-notes
          </p>
          <p
            className={cn(
              "mt-0.5 text-sm font-medium",
              variant === "side" ? "text-white" : "text-ink",
            )}
          >
            Notes pendant la vidéo
          </p>
        </div>
        <span
          className={cn(
            "text-[11px] font-medium",
            status === "error"
              ? "text-red-400"
              : variant === "side"
                ? "text-white/50"
                : "text-ink-muted",
          )}
        >
          {status === "error" ? error : statusLabel}
        </span>
      </div>

      <textarea
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setStatus("idle");
        }}
        className={cn(
          "min-h-[220px] flex-1 resize-none bg-transparent px-4 py-3 text-sm leading-relaxed outline-none",
          variant === "side"
            ? "placeholder:text-white/30"
            : "placeholder:text-ink-muted",
        )}
        placeholder="Idées, commandes, points à retenir…"
        aria-label="Notes de leçon"
      />

      <div
        className={cn(
          "flex items-center justify-between gap-2 border-t px-4 py-3",
          variant === "side" ? "border-white/10" : "border-canvas-border",
        )}
      >
        <p
          className={cn(
            "text-[11px]",
            variant === "side" ? "text-white/40" : "text-ink-muted",
          )}
        >
          Privé · auto-sauvegarde
        </p>
        <Button
          type="button"
          size="sm"
          variant={variant === "side" ? "secondary" : "outline"}
          disabled={pending || !note.trim()}
          onClick={() => persist(note)}
          className={
            variant === "side"
              ? "border-white/15 bg-white/10 text-white hover:bg-white/15"
              : undefined
          }
        >
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
