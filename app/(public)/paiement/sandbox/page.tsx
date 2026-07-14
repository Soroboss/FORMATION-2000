import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { SandboxCheckoutClient } from "@/features/payments/sandbox-checkout-client";

export const metadata: Metadata = {
  title: "Paiement sandbox",
  robots: { index: false, follow: false },
};

export default async function PaiementSandboxPage({
  searchParams,
}: {
  searchParams: Promise<{
    ref?: string;
    provider_ref?: string;
    amount?: string;
    currency?: string;
  }>;
}) {
  const session = await getSession();
  if (!session) redirect("/connexion?next=/paiement");

  const params = await searchParams;
  if (!params.ref || !params.provider_ref) {
    redirect("/paiement");
  }

  const serviceConfigured = Boolean(process.env.INSFORGE_SERVICE_KEY);

  return (
    <section className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-dashed border-action-300 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-action-700">
          Environnement sandbox
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900">
          Simulateur de paiement
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Réf. interne : <code className="text-xs">{params.ref}</code>
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Montant : {params.amount} {params.currency}
        </p>
        <div className="mt-6">
          <SandboxCheckoutClient
            internalReference={params.ref}
            providerReference={params.provider_ref}
            amount={params.amount ?? "2000"}
            currency={params.currency ?? "XOF"}
            webhookSecretConfigured={serviceConfigured}
          />
        </div>
      </div>
    </section>
  );
}
