import Link from "next/link";

export function CatalogSearchForm({
  action,
  defaultQuery = "",
  defaultLevel = "",
}: {
  action: string;
  defaultQuery?: string;
  defaultLevel?: string;
}) {
  return (
    <form action={action} method="get" className="flex flex-col gap-3 sm:flex-row">
      <input
        type="search"
        name="q"
        defaultValue={defaultQuery}
        placeholder="Rechercher une formation…"
        className="h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      />
      <select
        name="level"
        defaultValue={defaultLevel}
        className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm"
      >
        <option value="">Tous les niveaux</option>
        <option value="beginner">Débutant</option>
        <option value="intermediate">Intermédiaire</option>
        <option value="advanced">Avancé</option>
      </select>
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-700 px-5 text-sm font-semibold text-white hover:bg-brand-800"
      >
        Filtrer
      </button>
      {(defaultQuery || defaultLevel) && (
        <Link
          href={action}
          className="inline-flex h-11 items-center justify-center px-3 text-sm font-medium text-slate-600 hover:underline"
        >
          Réinitialiser
        </Link>
      )}
    </form>
  );
}
