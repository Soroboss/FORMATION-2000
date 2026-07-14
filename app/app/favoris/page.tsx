import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getCourseById } from "@/server/repositories/catalog";
import { listFavoritesForUser } from "@/server/repositories/learning";

export default async function FavorisPage() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/tableau-de-bord");
  }
  const favorites = await listFavoritesForUser(session.user.id);

  return (
    <section className="space-y-6">
      <div className="ui-card p-5 sm:p-6">
        <h1 className="font-display text-2xl font-bold text-ink">Favoris</h1>
        <p className="mt-1 text-sm text-ink-muted">Formations et leçons enregistrées.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="ui-card border-dashed p-6 text-center">
          <p className="font-display font-semibold text-ink">Aucun favori</p>
          <p className="mt-2 text-sm text-ink-muted">
            Ajoutez une formation ou une leçon depuis le lecteur pour la retrouver ici.
          </p>
          <Link
            href="/app/catalogue"
            className="mt-4 inline-flex h-10 items-center rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Explorer le catalogue
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {await Promise.all(
            favorites.map(async (fav) => {
              if (fav.entityType === "course") {
                const course = await getCourseById(fav.entityId);
                return (
                  <li key={fav.id} className="ui-card p-4 text-sm">
                    <p className="text-xs uppercase tracking-wide text-brand-700">Formation</p>
                    <p className="mt-1 font-medium text-ink">{course?.title ?? fav.entityId}</p>
                    {course ? (
                      <Link
                        href={`/app/formations/${course.slug}`}
                        className="mt-2 inline-block font-semibold text-brand-600 hover:underline"
                      >
                        Ouvrir
                      </Link>
                    ) : null}
                  </li>
                );
              }
              return (
                <li key={fav.id} className="ui-card p-4 text-sm">
                  <p className="text-xs uppercase tracking-wide text-brand-700">Leçon</p>
                  <p className="mt-1 font-medium text-ink">{fav.entityId}</p>
                </li>
              );
            }),
          )}
        </ul>
      )}
    </section>
  );
}
