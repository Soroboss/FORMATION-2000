import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminStatCard,
  StatusBadge,
} from "@/components/admin/ui";
import { listSupportTicketsForStaff } from "@/server/repositories/support";

export const dynamic = "force-dynamic";

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
  const open = tickets.filter((t) => t.status === "open").length;
  const inProgress = tickets.filter((t) => t.status === "in_progress").length;
  const resolved = tickets.filter(
    (t) => t.status === "resolved" || t.status === "closed",
  ).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={LifeBuoy}
        title="Support"
        description="Tickets ouverts par les apprenants. Ouvrez un ticket pour répondre dans le fil."
      />

      {tickets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard label="Tickets" value={tickets.length} />
          <AdminStatCard label="Ouverts" value={open} tone="warning" />
          <AdminStatCard label="En cours" value={inProgress} tone="info" />
          <AdminStatCard label="Résolus" value={resolved} tone="success" />
        </div>
      ) : null}

      {tickets.length === 0 ? (
        <AdminEmptyState
          title="Aucun ticket"
          description="Les demandes créées depuis /app/support apparaîtront ici."
        />
      ) : (
        <ul className="space-y-3">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Link
                href={`/admin/support/${ticket.id}`}
                className="ui-card block space-y-2 p-4 transition hover:border-brand-300 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-ink">{ticket.subject}</h2>
                    <p className="mt-1 text-xs text-ink-muted">
                      {new Date(ticket.createdAt).toLocaleString("fr-FR")}
                      {ticket.category ? ` · ${ticket.category}` : ""}
                    </p>
                  </div>
                  <StatusBadge value={ticket.status} label={ticketStatusLabel(ticket.status)} />
                </div>
                <p className="line-clamp-2 text-sm text-ink-muted">{ticket.message}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
