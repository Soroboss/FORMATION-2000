import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { listActivePlans } from "@/server/repositories/payments";
import { CheckoutButton } from "@/features/payments/checkout-button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Paiement",
  robots: { index: false, follow: false },
};

export default async function PaiementPage() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/paiement");
  }

  const plans = await listActivePlans();
  const plan = plans[0];

  return (
    <section className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-2xl font-semibold text-slate-900">Paiement</h1>
        <p className="mt-2 text-sm text-slate-600">
          Activez 30 jours d&apos;accès à toutes les formations incluses.
        </p>

        {plan ? (
          <div className="mt-6 rounded-xl bg-brand-50 p-4">
            <p className="text-sm font-semibold text-brand-800">{plan.name}</p>
            <p className="mt-1 font-display text-3xl font-bold text-slate-900">
              {plan.priceAmount.toLocaleString("fr-FR")}{" "}
              <span className="text-base font-semibold">{plan.currency}</span>
            </p>
            <p className="mt-1 text-sm text-slate-600">{plan.durationDays} jours d&apos;accès</p>
            <ul className="mt-3 space-y-1 text-sm text-slate-700">
              {plan.features.map((feature) => (
                <li key={feature}>· {feature}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-6 text-sm text-amber-800">
            Aucun plan actif en base. Appliquez la migration Phase 3.
          </p>
        )}

        <div className="mt-6">
          {plan ? <CheckoutButton planSlug={plan.slug} /> : null}
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-700">Le paiement en ligne ne passe pas ?</p>
          <Link
            href="/paiement/manuel"
            className="mt-2 inline-flex h-11 items-center justify-center rounded-lg border border-brand-200 bg-white px-4 text-sm font-semibold text-brand-900 hover:bg-brand-50"
          >
            Payer par Mobile Money (WhatsApp)
          </Link>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Mode en ligne : <code>{process.env.PAYMENT_PROVIDER ?? "sandbox"}</code>
        </p>
        <p className="mt-2 text-center text-sm">
          <Link href="/app/abonnement" className="font-semibold text-brand-700 hover:underline">
            Retour à mon abonnement
          </Link>
        </p>
      </div>
    </section>
  );
}
