import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { buildWhatsAppUrl } from "@/lib/payments/manual-config";
import { submitManualPaymentRequestAction } from "@/server/actions/manual-payments";
import {
  getManualPaymentConfig,
  listManualPaymentRequestsForUser,
} from "@/server/repositories/manual-payments";
import { listActivePlans } from "@/server/repositories/payments";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Paiement Mobile Money",
  robots: { index: false, follow: false },
};

export default async function PaiementManuelPage() {
  const session = await getSession();
  if (!session) redirect("/connexion?next=/paiement/manuel");

  const [config, plans, requests] = await Promise.all([
    getManualPaymentConfig(),
    listActivePlans(),
    listManualPaymentRequestsForUser(session.user.id),
  ]);
  const plan = plans[0];
  const whatsappUrl = buildWhatsAppUrl(
    config,
    `Mon e-mail : ${session.user.email}\nMontant : ${plan?.priceAmount ?? 2000} XOF`,
  );

  if (!config.enabled) {
    return (
      <section className="mx-auto max-w-lg px-4 py-12">
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Le paiement manuel est temporairement indisponible.{" "}
          <Link href="/paiement" className="font-semibold text-brand-700 underline">
            Retour au paiement
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-lg space-y-6 px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-slate-900">
          Paiement Mobile Money
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Si le paiement en ligne ne passe pas : payez manuellement, envoyez la capture WhatsApp,
          puis validez le formulaire. Un administrateur active votre accès après vérification.
        </p>

        <div className="mt-4 rounded-xl bg-action-50 p-4 text-sm text-slate-800">
          <p className="font-semibold text-action-800">
            Montant : {(plan?.priceAmount ?? 2000).toLocaleString("fr-FR")}{" "}
            {plan?.currency ?? "XOF"} / {plan?.durationDays ?? 30} jours
          </p>
          <p className="mt-2 whitespace-pre-line text-slate-700">{config.instructions}</p>
        </div>

        {config.contacts.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {config.contacts.map((c) => (
              <li
                key={`${c.label}-${c.number}`}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              >
                <p className="font-semibold text-slate-900">{c.label}</p>
                <p className="mt-1 font-mono text-base text-brand-800">{c.number}</p>
                {c.name ? <p className="text-xs text-slate-500">Au nom de : {c.name}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Les numéros Mobile Money ne sont pas encore configurés. Ajoutez-les dans{" "}
            <code>.env.local</code> (<code>MANUAL_PAYMENT_*</code>) ou dans les paramètres admin.
          </p>
        )}

        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#25D366] px-4 text-sm font-semibold text-white hover:opacity-95"
          >
            Envoyer ma capture sur WhatsApp
          </a>
        ) : (
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Configurez <code>MANUAL_PAYMENT_WHATSAPP</code> (ex. 22507XXXXXXXX) pour afficher le
            bouton WhatsApp.
          </p>
        )}
      </div>

      <form
        action={submitManualPaymentRequestAction}
        className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="font-semibold text-slate-900">Déclarer mon paiement</h2>
        <input type="hidden" name="planSlug" value={plan?.slug ?? "acces-mensuel"} />
        <label className="block text-sm">
          <span className="font-medium">Numéro qui a payé</span>
          <input
            name="payerPhone"
            required
            placeholder="07 XX XX XX XX"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Votre nom (optionnel)</span>
          <input name="payerName" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Réseau</span>
          <select name="network" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="Orange Money">Orange Money</option>
            <option value="MTN MoMo">MTN MoMo</option>
            <option value="Wave">Wave</option>
            <option value="Moov Money">Moov Money</option>
            <option value="Autre">Autre</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Référence SMS / transaction (si disponible)</span>
          <input
            name="transactionRef"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Note</span>
          <textarea
            name="note"
            rows={3}
            placeholder="J’ai envoyé la capture sur WhatsApp…"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <Button type="submit" className="w-full">
          J&apos;ai payé — en attente de confirmation
        </Button>
      </form>

      {requests.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Mes demandes</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {requests.map((r) => (
              <li key={r.id} className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="font-medium">{r.status}</span>
                <span className="ml-2 text-xs text-slate-500">
                  {r.amount.toLocaleString("fr-FR")} {r.currency} ·{" "}
                  {new Date(r.createdAt).toLocaleString("fr-FR")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-center text-sm">
        <Link href="/paiement" className="font-semibold text-brand-700 hover:underline">
          ← Retour au paiement en ligne
        </Link>
      </p>
    </section>
  );
}
