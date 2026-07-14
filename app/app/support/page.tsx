import Link from "next/link";
import { createSupportTicketAction } from "@/server/actions/support";
import { getSession } from "@/lib/auth/session";
import { listSupportTicketsForUser } from "@/server/repositories/support";
import { Button } from "@/components/ui/button";

export default async function SupportPage() {
  const session = await getSession();
  if (!session) return null;
  const tickets = await listSupportTicketsForUser(session.user.id);

  return (
    <section className="space-y-6">
      <div className="ui-card p-5 sm:p-6">
        <h1 className="font-display text-2xl font-bold text-ink">Support</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Décrivez votre problème. L&apos;équipe vous répondra dès que possible. Pour un paiement
          urgent, utilisez aussi{" "}
          <Link href="/paiement/manuel" className="font-semibold text-brand-600 underline">
            WhatsApp / Mobile Money
          </Link>
          .
        </p>
      </div>

      <form action={createSupportTicketAction} className="ui-card space-y-3 p-5 sm:p-6">
        <label className="block text-sm">
          <span className="font-medium text-ink">Sujet</span>
          <input
            name="subject"
            required
            minLength={3}
            className="mt-1 w-full rounded-soft border border-canvas-border px-3 py-2 text-ink"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Catégorie</span>
          <select
            name="category"
            className="mt-1 w-full rounded-soft border border-canvas-border px-3 py-2 text-ink"
          >
            <option value="paiement">Paiement</option>
            <option value="acces">Accès / abonnement</option>
            <option value="contenu">Contenu / leçon</option>
            <option value="autre">Autre</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Message</span>
          <textarea
            name="message"
            required
            minLength={10}
            rows={5}
            className="mt-1 w-full rounded-soft border border-canvas-border px-3 py-2 text-ink"
          />
        </label>
        <Button type="submit">Envoyer</Button>
      </form>

      <div className="ui-card p-5 sm:p-6">
        <h2 className="font-display font-semibold text-ink">Vos demandes</h2>
        {tickets.length === 0 ? (
          <p className="mt-2 text-sm text-ink-muted">Aucune demande.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {tickets.map((t) => (
              <li key={t.id} className="rounded-soft border border-canvas-border bg-canvas/50 p-3 text-sm">
                <p className="font-medium text-ink">{t.subject}</p>
                <p className="text-xs text-ink-muted">
                  {t.status} · {new Date(t.createdAt).toLocaleString("fr-FR")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
