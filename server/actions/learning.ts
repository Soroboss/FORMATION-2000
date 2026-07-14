"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { canAccessPremiumContent, canWatchLesson } from "@/lib/subscriptions/access";
import {
  calculateQuizScorePercent,
  gradeMultipleChoice,
  gradeSingleChoice,
} from "@/lib/progress/calc";
import { getCourseBySlug, getLessonDetail } from "@/server/repositories/catalog";
import {
  countQuizAttempts,
  createQuizAttempt,
  ensureEnrollment,
  getAssignmentForLesson,
  getCorrectOptionIds,
  getPublishedQuizForCourse,
  recalculateEnrollmentProgress,
  submitAssignment,
  toggleFavorite,
  upsertLessonNote,
  upsertLessonProgress,
} from "@/server/repositories/learning";

export type LearningActionResult = {
  success: boolean;
  error?: string;
  data?: unknown;
};

async function assertCanAccessLesson(courseSlug: string, lessonId: string) {
  const session = await requireSession();
  const detail = await getLessonDetail({ courseSlug, lessonId });
  if (!detail) throw new Error("LESSON_NOT_FOUND");

  const hasPremium = await canAccessPremiumContent(session.user.id);
  const allowed = canWatchLesson({
    isPreview: detail.lesson.isPreview,
    courseAccessType: detail.course.accessType,
    hasPremiumAccess: hasPremium,
  });
  if (!allowed) throw new Error("FORBIDDEN");

  return { session, ...detail };
}

export async function startLessonAction(formData: FormData): Promise<LearningActionResult> {
  try {
    const courseSlug = String(formData.get("courseSlug") ?? "");
    const lessonId = String(formData.get("lessonId") ?? "");
    const { session, course, lesson } = await assertCanAccessLesson(courseSlug, lessonId);

    await ensureEnrollment(session.user.id, course.id);
    const progress = await upsertLessonProgress({
      userId: session.user.id,
      lessonId: lesson.id,
      status: "in_progress",
      progressPercent: 10,
    });

    revalidatePath(`/app/formations/${courseSlug}/lecons/${lessonId}`);
    revalidatePath("/app/progression");
    return { success: true, data: progress };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Impossible de démarrer la leçon.",
    };
  }
}

export async function completeLessonAction(formData: FormData): Promise<LearningActionResult> {
  try {
    const courseSlug = String(formData.get("courseSlug") ?? "");
    const lessonId = String(formData.get("lessonId") ?? "");
    const { session, course, lesson } = await assertCanAccessLesson(courseSlug, lessonId);

    await ensureEnrollment(session.user.id, course.id);
    const progress = await upsertLessonProgress({
      userId: session.user.id,
      lessonId: lesson.id,
      status: "completed",
      progressPercent: 100,
    });

    const requiredLessonIds = course.modules
      .flatMap((m) => m.lessons)
      .filter((l) => l.isRequired)
      .map((l) => l.id);

    const enrollment = await recalculateEnrollmentProgress({
      userId: session.user.id,
      courseId: course.id,
      requiredLessonIds,
      lastLessonId: lesson.id,
    });

    let certificate = null;
    if (enrollment.progressPercent >= 100) {
      const { issueCertificateIfEligible } = await import(
        "@/server/repositories/certificates"
      );
      const fromNames = [session.profile?.firstName, session.profile?.lastName]
        .filter(Boolean)
        .join(" ");
      const memberName =
        session.profile?.displayName || fromNames || session.user.email;
      const issued = await issueCertificateIfEligible({
        userId: session.user.id,
        courseId: course.id,
        courseTitle: course.title,
        progressPercent: enrollment.progressPercent,
        memberName,
      });
      certificate = issued?.certificate ?? null;
      if (issued?.newlyIssued) {
        const { notifyUser } = await import("@/server/services/notify");
        await notifyUser({
          userId: session.user.id,
          type: "certificate_issued",
          title: "Attestation disponible",
          message: `Félicitations ! Votre attestation pour « ${course.title} » est prête.`,
          actionUrl: "/app/certificats",
        });
        revalidatePath("/app/notifications");
      }
      revalidatePath("/app/certificats");
    }

    revalidatePath(`/app/formations/${courseSlug}`);
    revalidatePath(`/app/formations/${courseSlug}/lecons/${lessonId}`);
    revalidatePath("/app/progression");
    revalidatePath("/app/mes-formations");
    revalidatePath("/app/tableau-de-bord");

    return { success: true, data: { progress, enrollment, certificate } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Impossible de terminer la leçon.",
    };
  }
}

export async function saveNoteAction(formData: FormData): Promise<LearningActionResult> {
  try {
    const courseSlug = String(formData.get("courseSlug") ?? "");
    const lessonId = String(formData.get("lessonId") ?? "");
    const content = String(formData.get("content") ?? "").trim();
    if (!content) return { success: false, error: "La note ne peut pas être vide." };

    const { session, course, lesson } = await assertCanAccessLesson(courseSlug, lessonId);
    const note = await upsertLessonNote({
      userId: session.user.id,
      lessonId: lesson.id,
      courseId: course.id,
      content,
    });

    revalidatePath(`/app/formations/${courseSlug}/lecons/${lessonId}`);
    revalidatePath("/app/notes");
    return { success: true, data: note };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Impossible d'enregistrer la note.",
    };
  }
}

export async function toggleFavoriteAction(formData: FormData): Promise<LearningActionResult> {
  try {
    const session = await requireSession();
    const entityType = String(formData.get("entityType") ?? "") as "course" | "lesson";
    const entityId = String(formData.get("entityId") ?? "");
    if (entityType !== "course" && entityType !== "lesson") {
      return { success: false, error: "Type de favori invalide." };
    }
    const result = await toggleFavorite({
      userId: session.user.id,
      entityType,
      entityId,
    });
    revalidatePath("/app/favoris");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Impossible de mettre à jour le favori.",
    };
  }
}

export async function submitAssignmentAction(formData: FormData): Promise<LearningActionResult> {
  try {
    const courseSlug = String(formData.get("courseSlug") ?? "");
    const lessonId = String(formData.get("lessonId") ?? "");
    const content = String(formData.get("content") ?? "").trim();
    const submissionUrl = String(formData.get("submissionUrl") ?? "").trim();

    if (!content && !submissionUrl) {
      return { success: false, error: "Ajoutez un texte ou un lien de livrable." };
    }

    const { session, lesson } = await assertCanAccessLesson(courseSlug, lessonId);
    const assignment = await getAssignmentForLesson(lesson.id);
    if (!assignment) return { success: false, error: "Aucun exercice pour cette leçon." };

    const submission = await submitAssignment({
      userId: session.user.id,
      assignmentId: assignment.id,
      content,
      submissionUrl: submissionUrl || undefined,
    });

    revalidatePath(`/app/formations/${courseSlug}/lecons/${lessonId}`);
    revalidatePath("/app/projets");
    return { success: true, data: submission };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Soumission impossible.",
    };
  }
}

const quizAnswerSchema = z.record(z.string(), z.union([z.string(), z.array(z.string())]));

export async function submitQuizAction(formData: FormData): Promise<LearningActionResult> {
  try {
    const courseSlug = String(formData.get("courseSlug") ?? "");
    const answersRaw = String(formData.get("answers") ?? "{}");
    const parsedAnswers = quizAnswerSchema.safeParse(JSON.parse(answersRaw));
    if (!parsedAnswers.success) {
      return { success: false, error: "Réponses invalides." };
    }

    const session = await requireSession();
    const course = await getCourseBySlug(courseSlug);
    if (!course) return { success: false, error: "Formation introuvable." };

    const hasPremium = await canAccessPremiumContent(session.user.id);
    if (course.accessType !== "free" && !hasPremium) {
      return { success: false, error: "Abonnement requis pour le quiz." };
    }

    const quiz = await getPublishedQuizForCourse(course.id);
    if (!quiz) return { success: false, error: "Aucun quiz publié." };

    const attempts = await countQuizAttempts(session.user.id, quiz.id);
    if (quiz.maxAttempts != null && attempts >= quiz.maxAttempts) {
      return { success: false, error: "Nombre maximum de tentatives atteint." };
    }

    const correctMap = await getCorrectOptionIds(quiz.questions.map((q) => q.id));
    let awarded = 0;
    let total = 0;
    const graded = quiz.questions.map((question) => {
      total += question.points;
      const answer = parsedAnswers.data[question.id];
      const correctIds = correctMap.get(question.id) ?? [];
      let isCorrect = false;

      if (question.questionType === "multiple") {
        const selected = Array.isArray(answer) ? answer : answer ? [answer] : [];
        isCorrect = gradeMultipleChoice({
          selectedOptionIds: selected,
          correctOptionIds: correctIds,
        });
      } else {
        const selected = Array.isArray(answer) ? answer[0] : answer;
        isCorrect = gradeSingleChoice({
          selectedOptionId: selected,
          correctOptionIds: correctIds,
        });
      }

      const pointsAwarded = isCorrect ? question.points : 0;
      awarded += pointsAwarded;
      return {
        questionId: question.id,
        answer: answer ?? null,
        isCorrect,
        pointsAwarded,
      };
    });

    const score = calculateQuizScorePercent({
      awardedPoints: awarded,
      totalPoints: total,
    });
    const passed = score >= quiz.passingScore;

    const attempt = await createQuizAttempt({
      userId: session.user.id,
      quizId: quiz.id,
      attemptNumber: attempts + 1,
      score,
      passed,
      answers: graded,
    });

    revalidatePath(`/app/formations/${courseSlug}`);
    return {
      success: true,
      data: {
        attemptId: attempt.attemptId,
        score,
        passed,
        passingScore: quiz.passingScore,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Soumission du quiz impossible.",
    };
  }
}
