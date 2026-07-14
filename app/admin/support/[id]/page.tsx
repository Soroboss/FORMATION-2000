import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader, StatusBadge } from "@/components/admin/ui";
import {
  replySupportTicketAction,
  updateSupportTicketAction,
} from "@/server/actions/admin-ops";
import {
  getSupportTicketForStaff,
  listSupportMessages,
} from "@/server/repositories/support";

const STATUS_OPTIONS = [
  { value: "open", label: "Ouvert" },
  { value: "in_progress", label: "En cours" },
  { value: "resolved", label: "Résolu" },
  { value: "closed", label: "Fermé" },
] as const;

function ticketStatusLabel(status: string): string {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

export default async function AdminSupportTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await getSupportTicketForStaff(id);
  if (!ticket) notFound();

  const messages = await listSupportMessages(id, { includeInternal: true });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={ticket.subject}
        description={`Ticket ${ticketStatusLabel(ticket.status)}${ticket.category ? ` · ${ticket.category}` : ""}`}
      />

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/admin/support" className="font-medium text-brand-600 hover:underline">
          ← Liste
        </Link>
        {ticket.userId ? (
          <Link
            href={`/admin/membres/${ticket.userId}`}
            className="font-medium text-brand-600 hover:underline"
          >
            Voir le membre
          </Link>
        ) : null}
      </div>

      <form action={updateSupportTicketAction} className="ui-card flex flex-wrap items-end gap-2 p-4">
        <input type="hidden" name="ticketId" value={ticket.id} />
        <label className="text-sm">
          <span className="mb-1 block text-ink-muted">Statut</span>
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
        <StatusBadge value={ticket.status} label={ticketStatusLabel(ticket.status)} />
      </form>

      <ul className="space-y-3">
        {messages.map((m) => {
          const staffSide = ticket.userId ? m.senderId !== ticket.userId : false;
          return (
            <li
              key={m.id}
              className={`ui-card p-4 text-sm ${staffSide ? "border-brand-200 bg-brand-50/30" : ""}`}
            >
              <p className="text-xs text-ink-muted">
                {staffSide ? "Équipe" : "Apprenant"}
                {m.isInternal ? " (interne)" : ""} ·{" "}
                {new Date(m.createdAt).toLocaleString("fr-FR")}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-ink">{m.message}</p>
            </li>
          );
        })}
      </ul>

      <form action={replySupportTicketAction} className="ui-card space-y-3 p-5">
        <input type="hidden" name="ticketId" value={ticket.id} />
        <label className="block text-sm">
          <span className="font-medium text-ink">Répondre à l&apos;apprenant</span>
          <textarea
            name="message"
            required
            minLength={2}
            rows={5}
            className="mt-1 w-full rounded-soft border border-canvas-border px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Envoyer la réponse
        </button>
      </form>
    </div>
  );
}
