import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-3xl font-semibold text-slate-900">Page introuvable</h1>
      <p className="mt-2 text-sm text-slate-600">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-lg bg-action-600 px-5 text-sm font-semibold text-white hover:bg-action-700"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
