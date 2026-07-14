import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCourseById } from "@/server/repositories/catalog";
import { listFavoritesForUser } from "@/server/repositories/learning";

export default async function FavorisPage() {
  const session = await getSession();
  if (!session) return null;
  const favorites = await listFavoritesForUser(session.user.id);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Favoris</h1>
        <p className="mt-1 text-sm text-slate-600">Formations et leçons enregistrées.</p>
      </div>
      {favorites.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          Aucun favori.
        </p>
      ) : (
        <ul className="space-y-3">
          {await Promise.all(
            favorites.map(async (fav) => {
              if (fav.entityType === "course") {
                const course = await getCourseById(fav.entityId);
                return (
                  <li
                    key={fav.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
                  >
                    <p className="text-xs uppercase tracking-wide text-brand-700">Formation</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {course?.title ?? fav.entityId}
                    </p>
                    {course ? (
                      <Link
                        href={`/app/formations/${course.slug}`}
                        className="mt-2 inline-block font-semibold text-brand-700 hover:underline"
                      >
                        Ouvrir
                      </Link>
                    ) : null}
                  </li>
                );
              }
              return (
                <li
                  key={fav.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
                >
                  <p className="text-xs uppercase tracking-wide text-brand-700">Leçon</p>
                  <p className="mt-1 font-medium text-slate-900">{fav.entityId}</p>
                </li>
              );
            }),
          )}
        </ul>
      )}
    </section>
  );
}
