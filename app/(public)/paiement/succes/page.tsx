import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { tryGetPaymentAsUser } from "@/server/repositories/payments-status";
import { canAccessPremiumContent } from "@/lib/subscriptions/access";

export const metadata: Metadata = {
  title: "Paiement réussi",
  robots: { index: false, follow: false },
};

export default async function PaiementSuccesPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;
  const session = await getSession();
  const payment =
    session && params.ref
      ? await tryGetPaymentAsUser(params.ref, session.user.id)
      : null;
  const hasPremium = session ? await canAccessPremiumContent(session.user.id) : false;

  return (
    <section className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-2xl font-semibold text-emerald-800">
          Paiement confirmé
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {hasPremium
            ? "Votre accès premium est actif. Bonne formation !"
            : "Si le webhook vient d'arriver, l'accès sera disponible dans quelques secondes. Rechargez la page si besoin."}
        </p>
        {payment ? (
          <dl className="mt-4 space-y-1 text-sm text-slate-700">
            <div>Référence : {payment.internalReference}</div>
            <div>Statut : {payment.status}</div>
            <div>
              Montant : {payment.amount} {payment.currency}
            </div>
          </dl>
        ) : null}
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/app/tableau-de-bord"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-action-600 px-4 text-sm font-semibold text-white hover:bg-action-700"
          >
            Aller au tableau de bord
          </Link>
          <Link
            href="/app/catalogue"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-brand-200 px-4 text-sm font-semibold text-brand-900 hover:bg-brand-50"
          >
            Ouvrir le catalogue
          </Link>
        </div>
      </div>
    </section>
  );
}
