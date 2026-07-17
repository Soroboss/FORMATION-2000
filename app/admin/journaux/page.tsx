import { ScrollText } from "lucide-react";
import { listAuditLogs } from "@/lib/audit/write";
import { AdminEmptyState, AdminPageHeader, AdminStatCard } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

function actionTone(action: string): string {
  if (/(delete|refund|deactivate|reject|archive|suspend)/i.test(action)) {
    return "bg-red-50 text-red-700";
  }
  if (/(create|activate|publish|approve|accept)/i.test(action)) {
    return "bg-progress-50 text-progress-700";
  }
  if (/(update|assign|extend)/i.test(action)) {
    return "bg-brand-50 text-brand-700";
  }
  return "bg-canvas text-ink-muted";
}

export default async function AdminJournauxPage() {
  const logs = await listAuditLogs(100);

  return (
    <section className="space-y-6">
      <AdminPageHeader
        icon={ScrollText}
        title="Journaux d’audit"
        description="Actions admin sensibles (création, publication, rôles, paiements…)."
      />

      {logs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AdminStatCard label="Événements récents" value={logs.length} hint="100 derniers" />
          <AdminStatCard
            label="Dernière action"
            value={logs[0] ? new Date(logs[0].createdAt).toLocaleDateString("fr-FR") : "—"}
            tone="info"
          />
          <AdminStatCard
            label="Types distincts"
            value={new Set(logs.map((l) => l.action)).size}
          />
        </div>
      ) : null}

      {logs.length === 0 ? (
        <AdminEmptyState
          title="Aucun événement"
          description="Les actions administrateur seront journalisées ici."
        />
      ) : (
        <div className="ui-card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
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
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-soft px-2 py-1 font-mono text-xs font-semibold ${actionTone(log.action)}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {log.entityType}
                    {log.entityId ? `:${log.entityId.slice(0, 8)}` : ""}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                    {log.actorUserId?.slice(0, 8) ?? "système"}
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
