import { listYoutubeHealthIssues } from "@/server/repositories/admin-youtube";
import { AdminEmptyState, AdminPageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const FALLBACK_STATUS = { label: "À vérifier", tone: "bg-action-50 text-action-700" };

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  unknown: { label: "Non vérifié", tone: "bg-canvas text-ink-muted" },
  unavailable: { label: "Indisponible", tone: "bg-red-50 text-red-700" },
  embedding_disabled: { label: "Intégration désactivée", tone: "bg-action-50 text-action-700" },
  private: { label: "Privée", tone: "bg-red-50 text-red-700" },
  deleted: { label: "Supprimée", tone: "bg-red-50 text-red-700" },
  geo_restricted: { label: "Restreinte (géo)", tone: "bg-action-50 text-action-700" },
  needs_review: FALLBACK_STATUS,
};

export default async function AdminSanteVideosPage() {
  const issues = await listYoutubeHealthIssues();

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Santé des vidéos"
        description="Vidéos YouTube signalées comme indisponibles, privées ou supprimées. Contrôle automatique chaque semaine."
      />

      {issues.length === 0 ? (
        <AdminEmptyState
          title="Toutes les vidéos sont saines"
          description="Aucune vidéo problématique détectée lors du dernier contrôle."
        />
      ) : (
        <div className="ui-card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-canvas-border bg-canvas/60 text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Vidéo</th>
                <th className="px-4 py-3">Chaîne</th>
                <th className="px-4 py-3">État</th>
                <th className="px-4 py-3">Vérifiée</th>
                <th className="px-4 py-3 text-right">Lien</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => {
                const meta = STATUS_LABEL[issue.status] ?? FALLBACK_STATUS;
                return (
                  <tr key={issue.id} className="border-b border-canvas-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{issue.title ?? issue.videoId}</p>
                      <p className="font-mono text-xs text-ink-muted">{issue.videoId}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{issue.channelName ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-soft px-2 py-1 text-xs font-semibold ${meta.tone}`}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {issue.updatedAt
                        ? new Date(issue.updatedAt).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={issue.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                      >
                        Ouvrir
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
