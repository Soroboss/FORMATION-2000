import Link from "next/link";
import { redirect } from "next/navigation";
import { Compass, Heart, PlayCircle } from "lucide-react";
import { CoverImage } from "@/components/media/cover-image";
import { PageHeader } from "@/components/app/page-header";
import { coverImageAlt } from "@/lib/media/cover-image";
import { getSession } from "@/lib/auth/session";
import { getCourseById } from "@/server/repositories/catalog";
import { listFavoritesForUser } from "@/server/repositories/learning";

export default async function FavorisPage() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/tableau-de-bord");
  }
  const favorites = await listFavoritesForUser(session.user.id);

  const items = await Promise.all(
    favorites.map(async (fav) => {
      const course = fav.entityType === "course" ? await getCourseById(fav.entityId) : null;
      return { fav, course };
    }),
  );

  return (
    <section className="space-y-6">
      <PageHeader
        icon={Heart}
        title="Favoris"
        subtitle="Formations et leçons que vous avez enregistrées."
        tone="action"
      />

      {items.length === 0 ? (
        <div className="ui-card border-dashed p-6 text-center sm:p-8">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-action-50 text-action-600">
            <Heart className="h-6 w-6" strokeWidth={2} aria-hidden />
          </span>
          <p className="font-display font-semibold text-ink">Aucun favori</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            Ajoutez une formation ou une leçon depuis le lecteur pour la retrouver ici.
          </p>
          <Link
            href="/app/catalogue"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Compass className="h-4 w-4" strokeWidth={2} aria-hidden />
            Explorer le catalogue
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ fav, course }) => {
            if (fav.entityType === "course" && course) {
              return (
                <Link
                  key={fav.id}
                  href={`/app/formations/${course.slug}`}
                  className="ui-card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-28 w-full">
                    {course.thumbnailUrl ? (
                      <CoverImage
                        src={course.thumbnailUrl}
                        alt={coverImageAlt(course.title, "course")}
                        variant="fill"
                        overlay="bottom"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-brand-600 via-brand-500 to-action-500" />
                    )}
                    <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-action-600 shadow-sm">
                      <Heart className="h-4 w-4 fill-current" strokeWidth={2} aria-hidden />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    {course.category?.name ? (
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                        {course.category.name}
                      </p>
                    ) : null}
                    <h2 className="line-clamp-2 font-semibold text-ink group-hover:text-brand-700">
                      {course.title}
                    </h2>
                    <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                      <PlayCircle className="h-4 w-4" strokeWidth={2} aria-hidden />
                      Ouvrir
                    </span>
                  </div>
                </Link>
              );
            }
            return (
              <div key={fav.id} className="ui-card flex flex-col gap-2 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                  Leçon
                </p>
                <p className="font-medium text-ink">{fav.entityId}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
