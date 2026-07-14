"use client";

import { useState } from "react";

export function CopyVerifyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="mt-2 inline-flex h-9 items-center rounded-brand border border-canvas-border px-3 text-sm font-semibold text-ink hover:bg-canvas"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? "Lien copié" : "Copier le lien de vérification"}
    </button>
  );
}
