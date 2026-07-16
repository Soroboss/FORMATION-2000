import Link from "next/link";
import { redirect } from "next/navigation";
import { LifeBuoy, MessageSquarePlus, Send } from "lucide-react";
import { createSupportTicketAction } from "@/server/actions/support";
import { getSession } from "@/lib/auth/session";
import { listSupportTicketsForUser } from "@/server/repositories/support";
import { PageHeader, StatusBadge } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { ActionFlash } from "@/components/ui/action-flash";

function ticketTone(status: string): "brand" | "progress" | "action" | "neutral" {
  const s = status.toLowerCase();
  if (["resolved", "closed", "answered"].includes(s)) return "progress";
  if (["open", "pending", "in_progress", "waiting"].includes(s)) return "action";
  return "neutral";
}

const FIELD_CLASS =
  "mt-1 w-full rounded-soft border border-canvas-border bg-canvas-card px-3 py-2 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const flash = await searchParams;
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/tableau-de-bord");
  }
  const tickets = await listSupportTicketsForUser(session.user.id);

  return (
    <section className="space-y-6">
      <ActionFlash ok={flash.ok} error={flash.error} />
      <PageHeader
        icon={LifeBuoy}
        title="Support"
        subtitle={
          <>
            Décrivez votre problème, l&apos;équipe vous répond au plus vite. Paiement urgent ?{" "}
            <Link href="/paiement/manuel" className="font-semibold text-brand-600 underline">
              WhatsApp / Mobile Money
            </Link>
            .
          </>
        }
      />

      <form action={createSupportTicketAction} className="ui-card space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="h-5 w-5 text-brand-600" strokeWidth={2} aria-hidden />
          <h2 className="font-display font-semibold text-ink">Nouvelle demande</h2>
        </div>
        <input type="hidden" name="returnTo" value="/app/support" />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-ink">Sujet</span>
            <input name="subject" required minLength={3} className={FIELD_CLASS} />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-ink">Catégorie</span>
            <select name="category" className={FIELD_CLASS}>
              <option value="paiement">Paiement</option>
              <option value="acces">Accès / abonnement</option>
              <option value="contenu">Contenu / leçon</option>
              <option value="autre">Autre</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="font-medium text-ink">Message</span>
          <textarea name="message" required minLength={10} rows={5} className={FIELD_CLASS} />
        </label>
        <Button type="submit" className="inline-flex items-center gap-2">
          <Send className="h-4 w-4" strokeWidth={2} aria-hidden />
          Envoyer
        </Button>
      </form>

      <div className="space-y-3">
        <h2 className="font-display font-semibold text-ink">Vos demandes</h2>
        {tickets.length === 0 ? (
          <p className="ui-card p-5 text-sm text-ink-muted">
            Aucune demande pour le moment.
          </p>
        ) : (
          <ul className="space-y-3">
            {tickets.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/app/support/${t.id}`}
                  className="ui-card block p-4 transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold text-ink">{t.subject}</p>
                    <StatusBadge label={t.status} tone={ticketTone(t.status)} />
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    {new Date(t.createdAt).toLocaleString("fr-FR")}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{t.message}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
