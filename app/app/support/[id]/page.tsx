import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { replySupportTicketAsLearnerAction } from "@/server/actions/support";
import { getSession } from "@/lib/auth/session";
import {
  getSupportTicketForUser,
  listSupportMessages,
} from "@/server/repositories/support";
import { Button } from "@/components/ui/button";

export default async function SupportTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/support");
  }
  const { id } = await params;
  const ticket = await getSupportTicketForUser({
    ticketId: id,
    userId: session.user.id,
  });
  if (!ticket) notFound();

  const messages = await listSupportMessages(id, { includeInternal: false });
  const canReply = ticket.status !== "closed";

  return (
    <section className="space-y-6">
      <div className="ui-card p-5 sm:p-6">
        <Link href="/app/support" className="text-sm font-medium text-brand-600 hover:underline">
          ← Retour au support
        </Link>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">{ticket.subject}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {ticket.status}
          {ticket.category ? ` · ${ticket.category}` : ""} · ouvert le{" "}
          {new Date(ticket.createdAt).toLocaleString("fr-FR")}
        </p>
      </div>

      <ul className="space-y-3">
        {messages.map((m) => {
          const mine = m.senderId === session.user.id;
          return (
            <li
              key={m.id}
              className={`ui-card p-4 text-sm ${mine ? "border-brand-200 bg-brand-50/40" : ""}`}
            >
              <p className="text-xs font-medium text-ink-muted">
                {mine ? "Vous" : "Support"} · {new Date(m.createdAt).toLocaleString("fr-FR")}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-ink">{m.message}</p>
            </li>
          );
        })}
      </ul>

      {canReply ? (
        <form action={replySupportTicketAsLearnerAction} className="ui-card space-y-3 p-5 sm:p-6">
          <input type="hidden" name="ticketId" value={ticket.id} />
          <label className="block text-sm">
            <span className="font-medium text-ink">Votre réponse</span>
            <textarea
              name="message"
              required
              minLength={2}
              rows={4}
              className="mt-1 w-full rounded-soft border border-canvas-border px-3 py-2 text-ink"
            />
          </label>
          <Button type="submit">Envoyer</Button>
        </form>
      ) : (
        <p className="text-sm text-ink-muted">Ce ticket est fermé.</p>
      )}
    </section>
  );
}
