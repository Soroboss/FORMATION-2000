import Link from "next/link";
import { notFound } from "next/navigation";
import {
  publishCourseAction,
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
          {course.status === "published" ? (
            <Link
              href={`/app/formations/${course.slug}`}
              className="inline-flex h-10 items-center rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              Voir côté apprenant
            </Link>
          ) : null}
        </div>
      </div>

      <form action={saveCourseAction} className="ui-card space-y-4 p-5 sm:p-6">
        <input type="hidden" name="id" value={course.id} />
        <h2 className="font-display font-semibold text-ink">Métadonnées</h2>
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
            Aucun module. Ajoutez le premier module ci-dessus.
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
                  <span className="font-medium text-ink">{lesson.title}</span>
                  <span className="flex flex-wrap gap-2 text-xs text-ink-muted">
                    <StatusBadge
                      value={lesson.status}
                      label={courseStatusLabel(lesson.status)}
                    />
                    <span>{lessonTypeLabel(lesson.lessonType)}</span>
                    {lesson.isPreview ? <span>Aperçu</span> : null}
                  </span>
                </li>
              ))}
              {mod.lessons.length === 0 ? (
                <li className="text-xs text-ink-muted">Aucune leçon dans ce module.</li>
              ) : null}
            </ul>
            <form
              action={saveLessonAction}
              className="mt-4 grid gap-2 border-t border-canvas-border pt-4 sm:grid-cols-2"
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
                defaultValue="draft"
                className="rounded-soft border border-canvas-border px-3 py-2 text-sm"
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
              <input
                name="youtubeUrl"
                placeholder="Lien vidéo (source)"
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
          </div>
        ))}
      </div>
    </section>
  );
}
