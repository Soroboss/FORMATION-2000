"use client";

import { useId, useRef, useState } from "react";
import { ImagePlus, Upload } from "lucide-react";
import { CoverImage } from "@/components/media/cover-image";
import { COVER_IMAGE_RECOMMENDED, coverImageAlt } from "@/lib/media/cover-image";

type ImageUploadFieldProps = {
  /** Nom du champ fichier envoyé au serveur. */
  name?: string;
  /** URL actuelle conservée si aucun nouvel upload. */
  currentUrl?: string | null;
  /** Libellé affiché (ex. nom catégorie) pour l’accessibilité de l’aperçu. */
  subjectLabel?: string;
  label?: string;
  hint?: string;
  className?: string;
};

const DEFAULT_HINT = `JPEG, PNG ou WebP — ${COVER_IMAGE_RECOMMENDED.card.width}×${COVER_IMAGE_RECOMMENDED.card.height} px recommandé (16:9), 5 Mo max.`;

/**
 * Champ bannière admin : zone cliquable, aperçu optimisé, specs pro.
 */
export function ImageUploadField({
  name = "imageFile",
  currentUrl = null,
  subjectLabel = "couverture",
  label = "Image de couverture",
  hint = DEFAULT_HINT,
  className,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const displaySrc = preview ?? currentUrl ?? null;
  const previewAlt = coverImageAlt(subjectLabel, "category");

  function openPicker() {
    inputRef.current?.click();
  }

  return (
    <div
      className={
        className ??
        "space-y-3 rounded-soft border-2 border-brand-200 bg-brand-50/40 p-4 sm:col-span-2"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={inputId} className="block text-sm font-semibold text-ink">
          {label}
        </label>
        <span className="rounded-brand bg-brand-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
          Import photo
        </span>
      </div>

      <p className="text-xs leading-relaxed text-ink-muted">
        Standard catalogue : ratio {COVER_IMAGE_RECOMMENDED.card.ratio}, minimum{" "}
        {COVER_IMAGE_RECOMMENDED.card.width} px de large. WebP ou JPEG pour un chargement rapide.
      </p>

      <button
        type="button"
        onClick={openPicker}
        aria-label={displaySrc ? "Changer la photo de couverture" : "Importer une photo de couverture"}
        className="group relative flex w-full max-w-xl flex-col items-center justify-center overflow-hidden rounded-soft border-2 border-dashed border-brand-400 bg-white transition hover:border-brand-600 hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        {displaySrc ? (
          <div className="absolute inset-0">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt={previewAlt}
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <CoverImage
                src={displaySrc}
                alt={previewAlt}
                variant="card"
                className="h-full min-h-full"
                overlay="bottom"
              />
            )}
          </div>
        ) : null}
        <div
          className={`relative z-10 flex min-h-[9rem] w-full flex-col items-center justify-center gap-2 px-4 py-6 text-center ${
            displaySrc ? "rounded-soft bg-white/90 px-6 py-4 shadow-sm" : ""
          }`}
        >
          {displaySrc ? (
            <Upload className="h-6 w-6 text-brand-700" aria-hidden />
          ) : (
            <ImagePlus className="h-8 w-8 text-brand-600" aria-hidden />
          )}
          <span className="text-sm font-semibold text-ink">
            {displaySrc ? "Changer la photo" : "Cliquez pour importer une photo"}
          </span>
          <span className="max-w-sm text-xs text-ink-muted">{hint}</span>
        </div>
      </button>

      <input
        ref={inputRef}
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

      <button
        type="button"
        onClick={openPicker}
        className="inline-flex h-10 items-center rounded-brand border border-brand-600 px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50"
      >
        Choisir un fichier
      </button>

      {fileName ? (
        <p className="text-sm font-medium text-emerald-800" role="status">
          Photo sélectionnée : {fileName} — cliquez Enregistrer pour l’envoyer.
        </p>
      ) : currentUrl ? (
        <p className="text-xs text-ink-muted">Image actuelle enregistrée. Importez un fichier pour la remplacer.</p>
      ) : (
        <p className="text-xs text-ink-muted">Aucune image — une bannière améliore la visibilité du catalogue.</p>
      )}

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
