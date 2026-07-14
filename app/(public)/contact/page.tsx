import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-slate-900">Contact</h1>
      <p className="mt-4 text-slate-700">Le formulaire de support complet arrive en Phase 5.</p>
    </section>
  );
}
