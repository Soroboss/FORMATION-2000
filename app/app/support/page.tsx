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
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Support</h1>
        <p className="mt-1 text-sm text-slate-600">
          Décrivez votre problème. L&apos;équipe vous répondra dès que possible.
        </p>
      </div>

      <form action={createSupportTicketAction} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <label className="block text-sm">
          <span className="font-medium">Sujet</span>
          <input
            name="subject"
            required
            minLength={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Catégorie</span>
          <select name="category" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="paiement">Paiement</option>
            <option value="acces">Accès / abonnement</option>
            <option value="contenu">Contenu / leçon</option>
            <option value="autre">Autre</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Message</span>
          <textarea
            name="message"
            required
            minLength={10}
            rows={5}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <Button type="submit">Envoyer</Button>
      </form>

      <div>
        <h2 className="font-semibold text-slate-900">Vos demandes</h2>
        {tickets.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Aucune demande.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {tickets.map((t) => (
              <li key={t.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                <p className="font-medium text-slate-900">{t.subject}</p>
                <p className="text-xs text-slate-500">
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
