import { listAuditLogs } from "@/lib/audit/write";
import { AdminEmptyState, AdminPageHeader } from "@/components/admin/ui";

export default async function AdminJournauxPage() {
  const logs = await listAuditLogs(100);

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Journaux d’audit"
        description="Actions admin sensibles (création, publication, rôles, paiements…)."
      />

      {logs.length === 0 ? (
        <AdminEmptyState
          title="Aucun événement"
          description="Les actions administrateur seront journalisées ici."
        />
      ) : (
        <div className="ui-card overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-canvas-border bg-canvas/60 text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entité</th>
                <th className="px-4 py-3">Acteur</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-canvas-border last:border-0">
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {new Date(log.createdAt).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink">{log.action}</td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {log.entityType}
                    {log.entityId ? `:${log.entityId.slice(0, 8)}` : ""}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                    {log.actorUserId?.slice(0, 8) ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
