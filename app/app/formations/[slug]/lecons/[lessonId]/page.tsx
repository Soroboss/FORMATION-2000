import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonInstructionsPanel } from "@/components/learning/lesson-instructions-panel";
import { LessonVideoStudio } from "@/components/learning/lesson-video-studio";
import { LessonLearningPanel } from "@/features/learning/lesson-learning-panel";
import { getSession } from "@/lib/auth/session";
import { canAccessPremiumContent, canWatchLesson } from "@/lib/subscriptions/access";
import { findAdjacentLessons, getLessonDetail } from "@/server/repositories/catalog";
import {
  ensureEnrollment,
  getAssignmentForLesson,
  getLessonProgress,
  getNoteForLesson,
  getPublishedQuizForCourse,
  getSubmissionForAssignment,
  isFavorite,
} from "@/server/repositories/learning";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const detail = await getLessonDetail({ courseSlug: slug, lessonId });
  if (!detail) notFound();

  const { course, lesson } = detail;
  const session = await getSession();
  const hasPremium = await canAccessPremiumContent(session?.user.id);
  const canWatch = canWatchLesson({
    isPreview: lesson.isPreview,
    courseAccessType: course.accessType,
    hasPremiumAccess: hasPremium,
  });
  const { previous, next } = findAdjacentLessons(course, lesson.id);

  let noteContent = "";
  let progressStatus = "not_started";
  let lessonFav = false;
  let courseFav = false;
  let assignment = null;
  let submission = null;
  let quiz = null;

  if (session && canWatch) {
    await ensureEnrollment(session.user.id, course.id);
    const [note, progress, favLesson, favCourse, assignmentData, quizData] = await Promise.all([
      getNoteForLesson(session.user.id, lesson.id),
      getLessonProgress(session.user.id, lesson.id),
      isFavorite(session.user.id, "lesson", lesson.id),
      isFavorite(session.user.id, "course", course.id),
      getAssignmentForLesson(lesson.id),
      getPublishedQuizForCourse(course.id),
    ]);
    noteContent = note?.content ?? "";
    progressStatus = progress?.status ?? "not_started";
    lessonFav = favLesson;
    courseFav = favCourse;
    assignment = assignmentData;
    quiz = quizData;
    if (assignmentData) {
      submission = await getSubmissionForAssignment(session.user.id, assignmentData.id);
    }
  }

  return (
    <section className="space-y-6">
      <div className="ui-card p-5 sm:p-6">
        <Link
          href={`/app/formations/${course.slug}`}
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          ← {course.title}
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink">{lesson.title}</h1>
        {lesson.description ? (
          <p className="mt-1 text-sm text-ink-muted">{lesson.description}</p>
        ) : null}
        {progressStatus === "completed" ? (
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-progress-700">
            Terminée
          </p>
        ) : null}
      </div>

      {canWatch && lesson.youtube ? (
        <LessonVideoStudio
          videoId={lesson.youtube.youtubeVideoId}
          lessonId={lesson.id}
          title={lesson.title}
          channelName={lesson.youtube.channelName}
          channelUrl={lesson.youtube.channelUrl}
          courseSlug={course.slug}
          initialNote={noteContent}
          showNotes={Boolean(session)}
        />
      ) : (
        <div className="ui-card border-dashed border-action-200 bg-action-50/50 p-6 text-sm text-ink">
          <p className="font-display font-semibold text-ink">Leçon verrouillée</p>
          <p className="mt-2 text-ink-muted">
            Cette leçon nécessite un abonnement actif (2&nbsp;000&nbsp;FCFA / 30 jours). Après
            paiement, elle s&apos;ouvrira ici et la formation apparaîtra dans Mes formations.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/paiement"
              className="inline-flex h-10 items-center rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Payer maintenant
            </Link>
            <Link
              href="/paiement/manuel"
              className="inline-flex h-10 items-center rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-white"
            >
              WhatsApp / Mobile Money
            </Link>
            <Link
              href={`/app/formations/${course.slug}`}
              className="inline-flex h-10 items-center rounded-brand border border-canvas-border px-4 text-sm font-semibold text-ink hover:bg-white"
            >
              Voir le parcours
            </Link>
          </div>
        </div>
      )}

      <div className="ui-card p-5 sm:p-6">
        <h2 className="font-display font-semibold text-ink">Continuer la leçon</h2>
        <div className="mt-4">
          <LessonInstructionsPanel instructions={lesson.instructions} redacted={!canWatch} />
        </div>
        {canWatch && session ? (
          <div className="mt-6">
            <LessonLearningPanel
              courseSlug={course.slug}
              courseId={course.id}
              lessonId={lesson.id}
              initialNote={noteContent}
              isLessonFavorite={lessonFav}
              isCourseFavorite={courseFav}
              progressStatus={progressStatus}
              assignment={assignment}
              submission={submission}
              quiz={quiz}
              hideNotes
            />
          </div>
        ) : null}
        <Link
          href="/app/support"
          className="mt-4 inline-flex h-10 items-center rounded-brand border border-canvas-border px-4 text-sm font-semibold text-ink hover:bg-canvas"
        >
          Signaler un problème
        </Link>
      </div>

      <nav className="flex items-center justify-between gap-3">
        {previous ? (
          <Link
            href={`/app/formations/${course.slug}/lecons/${previous.id}`}
            className="text-sm font-semibold text-brand-600 hover:underline"
          >
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/app/formations/${course.slug}/lecons/${next.id}`}
            className="text-sm font-semibold text-brand-600 hover:underline"
          >
            {next.title} →
          </Link>
        ) : null}
      </nav>
    </section>
  );
}
