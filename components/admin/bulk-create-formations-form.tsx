"use client";

import { useActionState, useState } from "react";
import {
  bulkCreateFormationsAction,
  type BulkCreateFormationsState,
} from "@/server/actions/admin-catalog";
import { Button } from "@/components/ui/button";

type Row = {
  key: string;
  title: string;
  youtubeUrl: string;
  visibility: "subscribers" | "preview" | "draft";
};

function emptyRow(): Row {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    youtubeUrl: "",
    visibility: "subscribers",
  };
}

const initialState: BulkCreateFormationsState = {
  ok: false,
  message: "",
};

export function BulkCreateFormationsForm({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [state, action, pending] = useActionState(bulkCreateFormationsAction, initialState);

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key: string) {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.key !== key)));
  }

  const payload = JSON.stringify(
    rows
      .filter((r) => r.title.trim() || r.youtubeUrl.trim())
      .map(({ title, youtubeUrl, visibility }) => ({
        title: title.trim(),
        youtubeUrl: youtubeUrl.trim(),
        visibility,
      })),
  );

  return (
    <form action={action} className="ui-card space-y-4 border-2 border-brand-200 p-5 sm:p-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">
          Créer des formations rapidement
        </h2>
        {!compact ? (
          <p className="mt-1 text-sm text-ink-muted">
            Une ligne = une formation. Titre + lien YouTube. Publié pour les abonnés payants.
          </p>
        ) : (
          <p className="mt-1 text-sm text-ink-muted">
            Remplissez plusieurs lignes, puis créez tout d’un coup.
          </p>
        )}
      </div>

      <input type="hidden" name="payload" value={payload} />

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={row.key}
            className="grid gap-2 rounded-soft border border-canvas-border bg-canvas/40 p-3 sm:grid-cols-[1fr_1.4fr_auto_auto] sm:items-end"
          >
            <label className="block text-sm">
              <span className="font-medium text-ink">Titre {index + 1}</span>
              <input
                value={row.title}
                onChange={(e) => updateRow(row.key, { title: e.target.value })}
                placeholder="Ex. Canva débutant"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-ink">Lien YouTube</span>
              <input
                value={row.youtubeUrl}
                onChange={(e) => updateRow(row.key, { youtubeUrl: e.target.value })}
                placeholder="https://youtu.be/… ou youtube.com/watch?v=…"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-ink">Visibilité</span>
              <select
                value={row.visibility}
                onChange={(e) =>
                  updateRow(row.key, {
                    visibility: e.target.value as Row["visibility"],
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="subscribers">Abonnés</option>
                <option value="preview">Aperçu gratuit</option>
                <option value="draft">Brouillon</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => removeRow(row.key)}
              disabled={rows.length <= 1}
              className="h-10 rounded-brand border border-canvas-border px-3 text-sm font-semibold text-ink-muted hover:bg-white disabled:opacity-40"
              aria-label="Supprimer la ligne"
            >
              Retirer
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setRows((prev) => [...prev, emptyRow()])}
        >
          + Ajouter une ligne
        </Button>
        <Button type="submit" disabled={pending}>
          {pending
            ? "Création…"
            : (() => {
                const n = rows.filter((r) => r.title.trim() && r.youtubeUrl.trim()).length;
                if (n === 0) return "Créer les formations";
                if (n === 1) return "Créer 1 formation";
                return `Créer ${n} formations`;
              })()}
        </Button>
      </div>

      {state.message && !state.ok ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
