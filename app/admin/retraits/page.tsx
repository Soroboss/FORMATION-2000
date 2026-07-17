import { listTakedownRequests } from "@/server/repositories/takedown";
import { updateTakedownAction } from "@/server/actions/takedown";
import { AdminEmptyState, AdminPageHeader } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded-brand border border-canvas-border bg-canvas-card px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  pending: { label: "En attente", tone: "bg-action-50 text-action-700" },
  in_review: { label: "En cours", tone: "bg-brand-50 text-brand-700" },
  accepted: { label: "Acceptée", tone: "bg-progress-50 text-progress-700" },
  rejected: { label: "Refusée", tone: "bg-red-50 text-red-700" },
};

export default async function AdminRetraitsPage() {
  const requests = await listTakedownRequests();

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Retraits de contenu"
        description="Demandes de retrait envoyées par les créateurs et ayants droit."
      />

      {requests.length === 0 ? (
        <AdminEmptyState
          title="Aucune demande"
          description="Les demandes de retrait de contenu apparaîtront ici."
        />
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => {
            const meta = STATUS_LABEL[req.status] ?? STATUS_LABEL.pending;
            return (
              <li key={req.id} className="ui-card space-y-4 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{req.creatorName}</p>
                    <p className="text-sm text-ink-muted">{req.creatorEmail}</p>
                    <a
                      href={req.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block break-all text-sm font-medium text-brand-600 hover:underline"
                    >
                      {req.videoUrl}
                    </a>
                  </div>
                  <span className={`inline-flex rounded-soft px-2 py-1 text-xs font-semibold ${meta?.tone}`}>
                    {meta?.label}
                  </span>
                </div>

                <p className="whitespace-pre-wrap rounded-soft bg-canvas p-3 text-sm text-ink">
                  {req.reason}
                </p>

                <p className="text-xs text-ink-muted">
                  Reçue le {new Date(req.createdAt).toLocaleString("fr-FR")}
                </p>

                <form action={updateTakedownAction} className="grid gap-3 border-t border-canvas-border pt-4 sm:grid-cols-[180px_1fr_auto] sm:items-end">
                  <input type="hidden" name="id" value={req.id} />
                  <div>
                    <label className="mb-1 block text-xs font-medium text-ink-muted">Statut</label>
                    <select name="status" defaultValue={req.status} className={inputClass}>
                      <option value="pending">En attente</option>
                      <option value="in_review">En cours</option>
                      <option value="accepted">Acceptée</option>
                      <option value="rejected">Refusée</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-ink-muted">Note interne</label>
                    <input name="adminNote" defaultValue={req.adminNote ?? ""} className={inputClass} />
                  </div>
                  <Button type="submit" size="sm" variant="secondary">Mettre à jour</Button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
