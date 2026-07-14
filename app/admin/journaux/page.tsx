import { listAuditLogs } from "@/lib/audit/write";

export default async function AdminJournauxPage() {
  const logs = await listAuditLogs(100);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Journaux d&apos;audit</h1>
        <p className="mt-1 text-sm text-slate-600">Actions admin sensibles.</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entité</th>
              <th className="px-4 py-3">Acteur</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-slate-100">
                <td className="px-4 py-3 text-xs">
                  {new Date(log.createdAt).toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                <td className="px-4 py-3 text-xs">
                  {log.entityType}
                  {log.entityId ? `:${log.entityId.slice(0, 8)}` : ""}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {log.actorUserId?.slice(0, 8) ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">Aucun événement pour le moment.</p>
        ) : null}
      </div>
    </section>
  );
}
