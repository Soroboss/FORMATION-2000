"use client";

import { useId, useRef, useState } from "react";
import { ImagePlus, Upload } from "lucide-react";

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
 * Champ bannière bien visible : zone cliquable + aperçu + import fichier.
 */
export function ImageUploadField({
  name = "imageFile",
  currentUrl = null,
  label = "Image de couverture",
  hint = "JPEG, PNG, WebP ou GIF — 5 Mo max. Cliquez sur la zone pour choisir un fichier.",
  className,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const displaySrc = preview ?? currentUrl ?? null;

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
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="rounded-brand bg-brand-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
          Import photo
        </span>
      </div>

      <button
        type="button"
        onClick={openPicker}
        className="group relative flex w-full max-w-xl flex-col items-center justify-center overflow-hidden rounded-soft border-2 border-dashed border-brand-400 bg-white transition hover:border-brand-600 hover:bg-brand-50"
        style={{ minHeight: "9rem" }}
      >
        {displaySrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displaySrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div
          className={`relative z-10 flex flex-col items-center gap-2 px-4 py-6 text-center ${
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
          <span className="text-xs text-ink-muted">{hint}</span>
        </div>
      </button>

      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="block w-full max-w-xl text-sm text-ink file:mr-3 file:cursor-pointer file:rounded-brand file:border-0 file:bg-brand-600 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
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

      {fileName ? (
        <p className="text-sm font-medium text-emerald-800">
          ✓ Photo sélectionnée : {fileName} — cliquez Enregistrer pour l’envoyer.
        </p>
      ) : (
        <p className="text-xs text-ink-muted">
          Utilisez la zone ou le bouton « Choisir un fichier » ci-dessus.
        </p>
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
