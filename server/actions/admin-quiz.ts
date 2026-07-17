"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCatalogWriteSession } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit/write";
import {
  addQuestion,
  createQuiz,
  deleteQuestion,
  deleteQuiz,
  setQuizStatus,
  updateQuizMeta,
  type QuizQuestionType,
  type QuizStatus,
} from "@/server/repositories/admin-quiz";

function clampScore(value: FormDataEntryValue | null): number {
  const n = Number(String(value ?? "").trim());
  if (!Number.isFinite(n)) return 70;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export async function createQuizAction(formData: FormData): Promise<void> {
  const session = await requireCatalogWriteSession();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const id = await createQuiz({
    title,
    description: String(formData.get("description") ?? "").trim() || null,
    courseId: String(formData.get("courseId") ?? "").trim() || null,
    passingScore: clampScore(formData.get("passingScore")),
  });
  await writeAuditLog({
    actorUserId: session.user.id,
    action: "quiz.create",
    entityType: "quiz",
    entityId: id,
    newValues: { title },
  });
  revalidatePath("/admin/quiz");
  redirect(`/admin/quiz/${id}`);
}

export async function updateQuizMetaAction(formData: FormData): Promise<void> {
  const session = await requireCatalogWriteSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await updateQuizMeta(id, {
    title: String(formData.get("title") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? "").trim() || null,
    passingScore: clampScore(formData.get("passingScore")),
  });
  await writeAuditLog({
    actorUserId: session.user.id,
    action: "quiz.update",
    entityType: "quiz",
    entityId: id,
  });
  revalidatePath(`/admin/quiz/${id}`);
}

export async function setQuizStatusAction(formData: FormData): Promise<void> {
  const session = await requireCatalogWriteSession();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "") as QuizStatus;
  if (!id || !["draft", "published", "archived"].includes(status)) return;
  await setQuizStatus(id, status);
  await writeAuditLog({
    actorUserId: session.user.id,
    action: `quiz.${status}`,
    entityType: "quiz",
    entityId: id,
  });
  revalidatePath(`/admin/quiz/${id}`);
  revalidatePath("/admin/quiz");
}

export async function deleteQuizAction(formData: FormData): Promise<void> {
  const session = await requireCatalogWriteSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await deleteQuiz(id);
  await writeAuditLog({
    actorUserId: session.user.id,
    action: "quiz.delete",
    entityType: "quiz",
    entityId: id,
  });
  revalidatePath("/admin/quiz");
  redirect("/admin/quiz");
}

function parseOptions(
  type: QuizQuestionType,
  formData: FormData,
): { label: string; isCorrect: boolean }[] {
  if (type === "true_false") {
    const correct = String(formData.get("correctBool") ?? "true");
    return [
      { label: "Vrai", isCorrect: correct === "true" },
      { label: "Faux", isCorrect: correct === "false" },
    ];
  }
  if (type === "short") {
    const expected = String(formData.get("expectedAnswer") ?? "").trim();
    return expected ? [{ label: expected, isCorrect: true }] : [];
  }
  // single / multiple : une option par ligne, préfixe "*" = bonne réponse.
  return String(formData.get("options") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const isCorrect = line.startsWith("*");
      return { label: isCorrect ? line.slice(1).trim() : line, isCorrect };
    })
    .filter((opt) => opt.label.length > 0);
}

export async function addQuestionAction(formData: FormData): Promise<void> {
  const session = await requireCatalogWriteSession();
  const quizId = String(formData.get("quizId") ?? "").trim();
  const question = String(formData.get("question") ?? "").trim();
  const questionType = String(formData.get("questionType") ?? "single") as QuizQuestionType;
  if (!quizId || !question) return;
  if (!["single", "multiple", "true_false", "short"].includes(questionType)) return;

  const points = Math.max(0, Number(String(formData.get("points") ?? "1")) || 1);
  const options = parseOptions(questionType, formData);

  if (
    (questionType === "single" || questionType === "multiple") &&
    !options.some((o) => o.isCorrect)
  ) {
    // Refus silencieux : au moins une bonne réponse est requise.
    return;
  }

  await addQuestion({
    quizId,
    questionType,
    question,
    explanation: String(formData.get("explanation") ?? "").trim() || null,
    points,
    options,
  });
  await writeAuditLog({
    actorUserId: session.user.id,
    action: "quiz.question.add",
    entityType: "quiz",
    entityId: quizId,
  });
  revalidatePath(`/admin/quiz/${quizId}`);
}

export async function deleteQuestionAction(formData: FormData): Promise<void> {
  const session = await requireCatalogWriteSession();
  const questionId = String(formData.get("questionId") ?? "").trim();
  const quizId = String(formData.get("quizId") ?? "").trim();
  if (!questionId) return;
  await deleteQuestion(questionId);
  await writeAuditLog({
    actorUserId: session.user.id,
    action: "quiz.question.delete",
    entityType: "quiz",
    entityId: quizId,
  });
  if (quizId) revalidatePath(`/admin/quiz/${quizId}`);
}
