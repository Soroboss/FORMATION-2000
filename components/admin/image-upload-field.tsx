"use client";

import { useId, useState } from "react";

type ImageUploadFieldProps = {
  /** Nom du champ fichier envoyé au serveur. */
  name?: string;
  /** URL actuelle conservée si aucun nouvel upload. */
  currentUrl?: string | null;
  label?: string;
  hint?: string;
  className?: string;
};

/**
 * Champ bannière : upload fichier prioritaire, URL optionnelle en secours.
 */
export function ImageUploadField({
  name = "imageFile",
  currentUrl = null,
  label = "Image de couverture",
  hint = "Choisissez une image depuis votre appareil (JPEG, PNG, WebP ou GIF — 5 Mo max).",
  className,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const displaySrc = preview ?? currentUrl ?? null;

  return (
    <div className={className ?? "space-y-2 sm:col-span-2"}>
      <span className="block text-sm font-medium text-ink">{label}</span>
      {displaySrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displaySrc}
          alt=""
          className="h-28 w-full max-w-md rounded-soft border border-canvas-border object-cover"
        />
      ) : (
        <div className="flex h-28 max-w-md items-center justify-center rounded-soft border border-dashed border-canvas-border bg-canvas/50 text-xs text-ink-muted">
          Aucune image
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center rounded-brand border border-canvas-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas"
        >
          {fileName || currentUrl ? "Changer l’image…" : "Importer une image…"}
        </label>
        <input
          id={inputId}
          name={name}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (preview) URL.revokeObjectURL(preview);
            if (!file) {
              setPreview(null);
              setFileName(null);
              return;
            }
            setFileName(file.name);
            setPreview(URL.createObjectURL(file));
          }}
        />
      </div>
      {fileName ? (
        <p className="text-xs text-emerald-800">Prêt à envoyer : {fileName}</p>
      ) : null}
      <p className="text-xs text-ink-muted">{hint}</p>
      <input type="hidden" name="existingImageUrl" value={currentUrl ?? ""} />
      <details className="text-sm">
        <summary className="cursor-pointer font-medium text-ink-muted">
          Ou coller une URL (optionnel)
        </summary>
        <input
          name="imageUrl"
          type="url"
          placeholder="https://…"
          defaultValue=""
          className="mt-2 w-full rounded-soft border border-canvas-border px-3 py-2 text-sm"
        />
      </details>
    </div>
  );
}
