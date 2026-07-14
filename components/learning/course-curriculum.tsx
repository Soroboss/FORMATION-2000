import Link from "next/link";
import type { CourseDetail, LessonSummary } from "@/types/catalog";

export function CourseCurriculum({
  course,
  hrefBase = "/app/formations",
  locked = false,
}: {
  course: CourseDetail;
  hrefBase?: string;
  locked?: boolean;
}) {
  return (
    <div className="space-y-4">
      {course.modules.map((module) => (
        <section key={module.id} className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-slate-900">{module.title}</h3>
          {module.description ? (
            <p className="mt-1 text-sm text-slate-600">{module.description}</p>
          ) : null}
          <ul className="mt-3 space-y-2">
            {module.lessons.map((lesson) => (
              <CurriculumLessonRow
                key={lesson.id}
                lesson={lesson}
                href={`${hrefBase}/${course.slug}/lecons/${lesson.id}`}
                locked={locked && !lesson.isPreview}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function CurriculumLessonRow({
  lesson,
  href,
  locked,
}: {
  lesson: LessonSummary;
  href: string;
  locked: boolean;
}) {
  const content = (
    <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm hover:bg-brand-50">
      <div>
        <p className="font-medium text-slate-800">{lesson.title}</p>
        <p className="text-xs text-slate-500">
          {lesson.estimatedDurationMinutes} min
          {lesson.isPreview ? " · Aperçu gratuit" : ""}
        </p>
      </div>
      <span className="text-xs font-semibold text-brand-700">
        {locked ? "Verrouillé" : "Ouvrir"}
      </span>
    </div>
  );

  if (locked) {
    return <li className="opacity-70">{content}</li>;
  }

  return (
    <li>
      <Link href={href}>{content}</Link>
    </li>
  );
}
