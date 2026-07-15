import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteLessonAction,
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
  nextLessonSortOrder,
} from "@/server/repositories/admin-catalog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/ui";
import { accessTypeLabel, courseStatusLabel, lessonTypeLabel } from "@/lib/admin/labels";

export default async function AdminFormationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { id } = await params;
  const flash = await searchParams;
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
  const nextModuleSortOrder =
    modules.length === 0 ? 0 : Math.max(...modules.map((m) => m.sortOrder)) + 1;

  return (
    <section className="space-y-8">
      {flash.error ? (
        <div
          role="alert"
          className="rounded-soft border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {flash.error}
        </div>
      ) : null}
      {flash.ok ? (
        <div
          role="status"
          className="rounded-soft border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          {flash.ok}
        </div>
      ) : null}
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
            <input
              type="hidden"
              name="returnTo"
              value={`/admin/formations/${course.id}`}
            />
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
        {modules.length > 0 ? (
          <label className="block text-sm">
            <span className="font-medium text-ink">Module cible</span>
            <select
              name="moduleId"
              defaultValue={modules[0]?.id}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {modules.map((mod) => (
                <option key={mod.id} value={mod.id}>
                  {mod.title}
                </option>
              ))}
            </select>
          </label>
        ) : null}

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
            inputMode="url"
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
        <input type="hidden" name="returnTo" value={`/admin/formations/${course.id}`} />
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
        <label className="block text-sm">
          <span className="font-medium">Ce qu’ils vont apprendre</span>
          <textarea
            name="learningOutcomes"
            defaultValue={course.learningOutcomes.join("\n")}
            rows={5}
            placeholder={"Une compétence par ligne\nEx. Créer une page HTML\nPublier un site"}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <span className="mt-1 block text-xs text-ink-muted">Une ligne = un objectif.</span>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Exercices / projet à faire</span>
          <textarea
            name="finalProjectDescription"
            defaultValue={course.finalProjectDescription ?? ""}
            rows={4}
            placeholder="Décrivez le ou les exercices pratiques à réaliser pendant la formation…"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Outils nécessaires</span>
          <textarea
            name="requiredTools"
            defaultValue={course.requiredTools.join("\n")}
            rows={4}
            placeholder={"Un outil par ligne\nEx. VS Code\nCompte Canva\nTéléphone Android"}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <span className="mt-1 block text-xs text-ink-muted">
            Laissez vide s’il n’y a aucun outil particulier. Une ligne = un outil.
          </span>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Image de couverture (URL)</span>
          <input
            name="thumbnailUrl"
            type="url"
            defaultValue={course.thumbnailUrl ?? ""}
            placeholder="https://… (sinon prise auto depuis YouTube)"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          {course.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.thumbnailUrl}
              alt=""
              className="mt-2 h-28 w-full max-w-sm rounded-soft object-cover"
            />
          ) : null}
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
            <span className="font-medium">Niveau</span>
            <select name="level" defaultValue={course.level ?? ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
              <option value="">—</option>
              <option value="beginner">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
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
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium">Statut</span>
            <select name="status" defaultValue={course.status} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
              <option value="draft">Brouillon</option>
              <option value="in_review">En revue</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Durée estimée (min)</span>
            <input
              name="estimatedDurationMinutes"
              type="number"
              defaultValue={course.estimatedDurationMinutes}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" defaultChecked={course.isFeatured} />
          Mise en avant
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="submit">Enregistrer</Button>
        </div>
      </form>

      {course.status !== "published" ? (
        <form action={publishCourseAction} className="ui-card p-5 sm:p-6">
          <input type="hidden" name="id" value={course.id} />
          <input type="hidden" name="returnTo" value={`/admin/formations/${course.id}`} />
          <p className="text-sm text-ink-muted">
            Publiez la formation pour la rendre visible dans le catalogue apprenant.
          </p>
          <Button type="submit" className="mt-3" variant="secondary">
            Publier la formation
          </Button>
        </form>
      ) : null}

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
            defaultValue={nextModuleSortOrder}
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
                  className="rounded-soft bg-canvas px-3 py-2 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
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
                  </div>
                  <details className="mt-2 border-t border-canvas-border pt-2">
                    <summary className="cursor-pointer text-xs font-semibold text-brand-600">
                      Modifier / supprimer
                    </summary>
                    <form action={saveLessonAction} className="mt-3 grid gap-2 sm:grid-cols-2">
                      <input type="hidden" name="courseId" value={course.id} />
                      <input type="hidden" name="moduleId" value={mod.id} />
                      <input type="hidden" name="id" value={lesson.id} />
                      <input
                        name="title"
                        defaultValue={lesson.title}
                        required
                        className="rounded-soft border border-canvas-border px-3 py-2 text-sm sm:col-span-2"
                      />
                      <input
                        name="youtubeUrl"
                        defaultValue={lesson.youtubeUrl ?? ""}
                        inputMode="url"
                        placeholder="Lien YouTube"
                        className="rounded-soft border border-canvas-border px-3 py-2 text-sm sm:col-span-2"
                      />
                      <select
                        name="status"
                        defaultValue={lesson.status}
                        className="rounded-soft border border-canvas-border px-3 py-2 text-sm"
                      >
                        <option value="published">Publié</option>
                        <option value="draft">Brouillon</option>
                      </select>
                      <input type="hidden" name="lessonType" value={lesson.lessonType} />
                      <input type="hidden" name="sortOrder" value={lesson.sortOrder} />
                      <label className="flex items-center gap-2 text-sm text-ink">
                        <input type="checkbox" name="isPreview" defaultChecked={lesson.isPreview} />
                        Aperçu gratuit
                      </label>
                      <label className="flex items-center gap-2 text-sm text-ink">
                        <input type="checkbox" name="isRequired" defaultChecked={lesson.isRequired} />
                        Obligatoire
                      </label>
                      <Button type="submit" size="sm" className="sm:col-span-2">
                        Enregistrer la leçon
                      </Button>
                    </form>
                    <form action={deleteLessonAction} className="mt-2">
                      <input type="hidden" name="courseId" value={course.id} />
                      <input type="hidden" name="lessonId" value={lesson.id} />
                      <Button type="submit" size="sm" variant="outline">
                        Supprimer la leçon
                      </Button>
                    </form>
                  </details>
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
                  defaultValue={nextLessonSortOrder(mod.lessons)}
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
