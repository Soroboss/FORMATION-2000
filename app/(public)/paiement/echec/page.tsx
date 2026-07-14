import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Paiement échoué",
  robots: { index: false, follow: false },
};

export default async function PaiementEchecPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;

  return (
    <section className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-2xl font-semibold text-red-800">Paiement non abouti</h1>
        <p className="mt-2 text-sm text-slate-600">
          Aucun accès premium n&apos;a été activé. Vous pouvez réessayer quand vous voulez.
        </p>
        {params.ref ? (
          <p className="mt-3 text-xs text-slate-500">Référence : {params.ref}</p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/paiement"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-action-600 px-4 text-sm font-semibold text-white hover:bg-action-700"
          >
            Réessayer en ligne
          </Link>
          <Link
            href="/paiement/manuel"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-brand-200 bg-white px-4 text-sm font-semibold text-brand-900 hover:bg-brand-50"
          >
            Payer par Mobile Money (WhatsApp)
          </Link>
        </div>
      </div>
    </section>
  );
}
