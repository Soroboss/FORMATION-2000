import Link from "next/link";
import { notFound } from "next/navigation";
import {
  publishCourseAction,
  quickAddVideoLessonAction,
  saveCourseAction,
  saveLessonAction,
  saveModuleAction,
} from "@/server/actions/admin-catalog";
import {
  getAdminCourse,
  listAdminCategories,
  listLessonsForModule,
  listModulesForCourse,
} from "@/server/repositories/admin-catalog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/ui";
import { accessTypeLabel, courseStatusLabel, lessonTypeLabel } from "@/lib/admin/labels";

export default async function AdminFormationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getAdminCourse(id);
  if (!course) notFound();

  const [categories, modules] = await Promise.all([
    listAdminCategories(),
    listModulesForCourse(id),
  ]);

  const modulesWithLessons = await Promise.all(
    modules.map(async (mod) => ({
      ...mod,
      lessons: await listLessonsForModule(mod.id),
    })),
  );

  const allLessons = modulesWithLessons.flatMap((m) => m.lessons);
  const publishedVideos = allLessons.filter(
    (l) => l.status === "published" && Boolean(l.youtubeUrl),
  ).length;
  const coursePublished = course.status === "published";
  const readyForLearners = coursePublished && publishedVideos > 0;

  return (
    <section className="space-y-8">
      <div className="ui-card p-5 sm:p-6">
        <Link href="/admin/formations" className="text-sm font-semibold text-brand-600 hover:underline">
          ← Formations
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">{course.title}</h1>
            <p className="mt-1 text-sm text-ink-muted">{course.slug}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge value={course.status} label={courseStatusLabel(course.status)} />
              <StatusBadge
                value={course.accessType}
                label={accessTypeLabel(course.accessType)}
              />
            </div>
          </div>
          {coursePublished ? (
            <Link
              href={`/app/formations/${course.slug}`}
              className="inline-flex h-10 items-center rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              Voir côté apprenant
            </Link>
          ) : null}
        </div>
      </div>

      <div
        className={`ui-card border-2 p-5 sm:p-6 ${
          readyForLearners ? "border-emerald-300 bg-emerald-50/40" : "border-amber-300 bg-amber-50/40"
        }`}
      >
        <h2 className="font-display text-lg font-semibold text-ink">
          {readyForLearners
            ? "Prêt pour les apprenants abonnés"
            : "Checklist pour afficher la formation"}
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-ink">
          <li className="flex gap-2">
            <span aria-hidden>{coursePublished ? "✓" : "○"}</span>
            <span>
              Formation publiée
              {!coursePublished ? " — cliquez sur Publier ci-dessous ou cochez l’option à l’ajout vidéo" : ""}
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden>{publishedVideos > 0 ? "✓" : "○"}</span>
            <span>
              Au moins une vidéo publiée avec lien YouTube
              {publishedVideos > 0 ? ` (${publishedVideos})` : ""}
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden>
              {course.accessType === "subscription" || course.accessType === "free" ? "✓" : "○"}
            </span>
            <span>
              Accès : {accessTypeLabel(course.accessType)} — les abonnés payants voient le contenu
              « Abonnement »
            </span>
          </li>
        </ul>
        {!coursePublished ? (
          <form action={publishCourseAction} className="mt-4">
            <input type="hidden" name="id" value={course.id} />
            <Button type="submit" size="sm">
              Publier la formation maintenant
            </Button>
          </form>
        ) : null}
      </div>

      <form
        action={quickAddVideoLessonAction}
        className="ui-card space-y-4 border-2 border-brand-200 p-5 sm:p-6"
      >
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">
            Ajouter une vidéo YouTube
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Collez le lien de la vidéo. Un module est créé automatiquement s’il n’y en a pas encore.
          </p>
        </div>
        <input type="hidden" name="courseId" value={course.id} />
        {modules[0] ? <input type="hidden" name="moduleId" value={modules[0].id} /> : null}

        <label className="block text-sm">
          <span className="font-medium text-ink">Titre de la leçon</span>
          <input
            name="title"
            required
            placeholder="Ex. Introduction à Canva"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-ink">Lien YouTube</span>
          <input
            name="youtubeUrl"
            required
            type="url"
            placeholder="https://www.youtube.com/watch?v=… ou https://youtu.be/…"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-ink">Visibilité</span>
          <select
            name="visibility"
            defaultValue="subscribers"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="subscribers">Publié — réservé aux abonnés payants</option>
            <option value="preview">Publié — aperçu gratuit (sans abonnement)</option>
            <option value="draft">Brouillon — invisible côté apprenant</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className="font-medium text-ink">Consignes sous la vidéo (optionnel)</span>
          <textarea
            name="instructions"
            rows={3}
            placeholder="Ce que l’apprenant doit retenir ou faire après avoir regardé…"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <div className="rounded-soft border border-dashed border-canvas-border bg-canvas/60 p-4 space-y-3">
          <p className="text-sm font-semibold text-ink">Exercice lié (optionnel)</p>
          <label className="block text-sm">
            <span className="font-medium text-ink-muted">Titre de l’exercice</span>
            <input
              name="exerciseTitle"
              placeholder="Ex. Créer votre première affiche"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-ink-muted">Consignes de l’exercice</span>
            <textarea
              name="exerciseInstructions"
              rows={3}
              placeholder="Décrivez le rendu attendu…"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
        </div>

        {!coursePublished ? (
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="publishCourse" defaultChecked />
            Publier aussi la formation (nécessaire pour l’afficher aux apprenants)
          </label>
        ) : null}

        <Button type="submit">Ajouter la vidéo</Button>
      </form>

      <form action={saveCourseAction} className="ui-card space-y-4 p-5 sm:p-6">
        <input type="hidden" name="id" value={course.id} />
        <h2 className="font-display font-semibold text-ink">Métadonnées de la formation</h2>
        <label className="block text-sm">
          <span className="font-medium">Titre</span>
          <input name="title" defaultValue={course.title} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Slug</span>
          <input name="slug" defaultValue={course.slug} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Résumé</span>
          <textarea name="shortDescription" defaultValue={course.shortDescription ?? ""} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Description</span>
          <textarea name="description" defaultValue={course.description ?? ""} rows={4} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="font-medium">Catégorie</span>
            <select name="categoryId" defaultValue={course.categoryId ?? ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Accès</span>
            <select name="accessType" defaultValue={course.accessType} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
              <option value="free">Gratuit</option>
              <option value="subscription">Abonnement</option>
              <option value="purchase">Achat</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Statut</span>
            <select name="status" defaultValue={course.status} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
              <option value="draft">Brouillon</option>
              <option value="in_review">En revue</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="font-medium">Durée estimée (min)</span>
          <input
            name="estimatedDurationMinutes"
            type="number"
            defaultValue={course.estimatedDurationMinutes}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" defaultChecked={course.isFeatured} />
          Mise en avant
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="submit">Enregistrer</Button>
          {course.status !== "published" ? (
            <Button formAction={publishCourseAction} type="submit" variant="secondary">
              Publier
            </Button>
          ) : null}
        </div>
      </form>

      <div className="space-y-4">
        <h2 className="font-display font-semibold text-ink">Modules & leçons</h2>
        <form
          action={saveModuleAction}
          className="ui-card grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto]"
        >
          <input type="hidden" name="courseId" value={course.id} />
          <input
            name="title"
            placeholder="Titre du module"
            required
            className="rounded-soft border border-canvas-border px-3 py-2 text-sm"
          />
          <input
            name="sortOrder"
            type="number"
            defaultValue={modules.length}
            className="w-24 rounded-soft border border-canvas-border px-3 py-2 text-sm"
          />
          <Button type="submit" size="sm">
            Ajouter module
          </Button>
        </form>

        {modulesWithLessons.length === 0 ? (
          <p className="ui-card border-dashed p-5 text-sm text-ink-muted">
            Aucun module encore — utilisez « Ajouter une vidéo YouTube » ci-dessus, un module sera créé
            automatiquement.
          </p>
        ) : null}

        {modulesWithLessons.map((mod) => (
          <div key={mod.id} className="ui-card p-4 sm:p-5">
            <h3 className="font-display font-semibold text-ink">
              {mod.sortOrder}. {mod.title}
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {mod.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-soft bg-canvas px-3 py-2"
                >
                  <div className="min-w-0">
                    <span className="font-medium text-ink">{lesson.title}</span>
                    {lesson.youtubeUrl ? (
                      <a
                        href={lesson.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 block truncate text-xs text-brand-600 hover:underline"
                      >
                        {lesson.youtubeUrl}
                      </a>
                    ) : (
                      <span className="mt-0.5 block text-xs text-amber-700">
                        Pas de lien vidéo
                      </span>
                    )}
                  </div>
                  <span className="flex flex-wrap gap-2 text-xs text-ink-muted">
                    <StatusBadge
                      value={lesson.status}
                      label={courseStatusLabel(lesson.status)}
                    />
                    <span>{lessonTypeLabel(lesson.lessonType)}</span>
                    {lesson.isPreview ? <span>Aperçu gratuit</span> : null}
                  </span>
                </li>
              ))}
              {mod.lessons.length === 0 ? (
                <li className="text-xs text-ink-muted">Aucune leçon dans ce module.</li>
              ) : null}
            </ul>
            <details className="mt-4 border-t border-canvas-border pt-4">
              <summary className="cursor-pointer text-sm font-semibold text-ink-muted">
                Ajout avancé (module, type, chaîne…)
              </summary>
              <form
                action={saveLessonAction}
                className="mt-3 grid gap-2 sm:grid-cols-2"
              >
                <input type="hidden" name="courseId" value={course.id} />
                <input type="hidden" name="moduleId" value={mod.id} />
                <input
                  name="title"
                  placeholder="Titre leçon"
                  required
                  className="rounded-soft border border-canvas-border px-3 py-2 text-sm"
                />
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={mod.lessons.length}
                  className="rounded-soft border border-canvas-border px-3 py-2 text-sm"
                />
                <select
                  name="lessonType"
                  defaultValue="youtube"
                  className="rounded-soft border border-canvas-border px-3 py-2 text-sm"
                >
                  <option value="youtube">Vidéo</option>
                  <option value="text">Texte</option>
                  <option value="exercise">Exercice</option>
                </select>
                <select
                  name="status"
                  defaultValue="published"
                  className="rounded-soft border border-canvas-border px-3 py-2 text-sm"
                >
                  <option value="published">Publié</option>
                  <option value="draft">Brouillon</option>
                </select>
                <input
                  name="youtubeUrl"
                  placeholder="Lien YouTube"
                  className="rounded-soft border border-canvas-border px-3 py-2 text-sm sm:col-span-2"
                />
                <input
                  name="channelName"
                  placeholder="Chaîne / créateur"
                  className="rounded-soft border border-canvas-border px-3 py-2 text-sm"
                />
                <input
                  name="channelUrl"
                  placeholder="URL chaîne"
                  className="rounded-soft border border-canvas-border px-3 py-2 text-sm"
                />
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" name="isPreview" />
                  Aperçu gratuit
                </label>
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" name="isRequired" defaultChecked />
                  Obligatoire
                </label>
                <Button type="submit" size="sm" className="sm:col-span-2">
                  Ajouter la leçon
                </Button>
              </form>
            </details>
          </div>
        ))}
      </div>
    </section>
  );
}
