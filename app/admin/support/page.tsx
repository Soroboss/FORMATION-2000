import { AdminEmptyState, AdminPageHeader, StatusBadge } from "@/components/admin/ui";
import { updateSupportTicketAction } from "@/server/actions/admin-ops";
import { listSupportTicketsForStaff } from "@/server/repositories/support";

const STATUS_OPTIONS = [
  { value: "open", label: "Ouvert" },
  { value: "in_progress", label: "En cours" },
  { value: "resolved", label: "Résolu" },
  { value: "closed", label: "Fermé" },
] as const;

function ticketStatusLabel(status: string): string {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

export default async function AdminSupportPage() {
  const tickets = await listSupportTicketsForStaff();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Support"
        description="Tickets ouverts par les apprenants. Mettez à jour le statut au fil du traitement."
      />

      {tickets.length === 0 ? (
        <AdminEmptyState
          title="Aucun ticket"
          description="Les demandes créées depuis /app/support apparaîtront ici."
        />
      ) : (
        <ul className="space-y-4">
          {tickets.map((ticket) => (
            <li key={ticket.id} className="ui-card space-y-3 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-semibold text-ink">{ticket.subject}</h2>
                  <p className="mt-1 text-xs text-ink-muted">
                    {new Date(ticket.createdAt).toLocaleString("fr-FR")}
                    {ticket.category ? ` · ${ticket.category}` : ""}
                    {ticket.userId ? (
                      <>
                        {" · "}
                        <a
                          href={`/admin/membres/${ticket.userId}`}
                          className="font-medium text-brand-600 hover:underline"
                        >
                          Voir le membre
                        </a>
                      </>
                    ) : null}
                  </p>
                </div>
                <StatusBadge value={ticket.status} label={ticketStatusLabel(ticket.status)} />
              </div>
              <p className="whitespace-pre-wrap text-sm text-ink">{ticket.message}</p>
              <form action={updateSupportTicketAction} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="ticketId" value={ticket.id} />
                <label className="text-sm">
                  <span className="sr-only">Statut</span>
                  <select
                    name="status"
                    defaultValue={ticket.status}
                    className="rounded-soft border border-canvas-border px-3 py-2 text-sm"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Mettre à jour
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
