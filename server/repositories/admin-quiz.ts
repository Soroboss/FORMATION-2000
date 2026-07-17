import { tryCreateInsForgeServiceClient } from "@/lib/insforge/server";

export type QuizQuestionType = "single" | "multiple" | "true_false" | "short";
export type QuizStatus = "draft" | "published" | "archived";

export type AdminQuizOption = {
  id: string;
  label: string;
  isCorrect: boolean;
  sortOrder: number;
};

export type AdminQuizQuestion = {
  id: string;
  questionType: QuizQuestionType;
  question: string;
  explanation: string | null;
  points: number;
  sortOrder: number;
  options: AdminQuizOption[];
};

export type AdminQuizSummary = {
  id: string;
  title: string;
  status: QuizStatus;
  courseId: string | null;
  lessonId: string | null;
  passingScore: number;
  questionCount: number;
};

export type AdminQuizDetail = AdminQuizSummary & {
  description: string | null;
  questions: AdminQuizQuestion[];
};

function service() {
  const client = tryCreateInsForgeServiceClient();
  if (!client) throw new Error("INSFORGE_SERVICE_KEY is required for quiz administration.");
  return client;
}

export async function listQuizzesAdmin(): Promise<AdminQuizSummary[]> {
  const client = service();
  const { data } = await client.database
    .from("quizzes")
    .select("id, title, status, course_id, lesson_id, passing_score")
    .order("created_at", { ascending: false });
  if (!Array.isArray(data)) return [];

  const quizIds = data.map((row) => String(row.id));
  const counts = new Map<string, number>();
  if (quizIds.length > 0) {
    const { data: questions } = await client.database
      .from("quiz_questions")
      .select("quiz_id")
      .in("quiz_id", quizIds);
    if (Array.isArray(questions)) {
      for (const q of questions) {
        const key = String(q.quiz_id);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
  }

  return data.map((row) => ({
    id: String(row.id),
    title: String(row.title),
    status: String(row.status) as QuizStatus,
    courseId: (row.course_id as string | null) ?? null,
    lessonId: (row.lesson_id as string | null) ?? null,
    passingScore: Number(row.passing_score ?? 0),
    questionCount: counts.get(String(row.id)) ?? 0,
  }));
}

export async function getQuizAdmin(id: string): Promise<AdminQuizDetail | null> {
  const client = service();
  const { data } = await client.database
    .from("quizzes")
    .select("id, title, description, status, course_id, lesson_id, passing_score")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;

  const { data: questionRows } = await client.database
    .from("quiz_questions")
    .select("id, question_type, question, explanation, points, sort_order")
    .eq("quiz_id", id)
    .order("sort_order", { ascending: true });

  const questions: AdminQuizQuestion[] = [];
  if (Array.isArray(questionRows)) {
    const questionIds = questionRows.map((q) => String(q.id));
    const optionsByQuestion = new Map<string, AdminQuizOption[]>();
    if (questionIds.length > 0) {
      const { data: optionRows } = await client.database
        .from("quiz_options")
        .select("id, question_id, label, is_correct, sort_order")
        .in("question_id", questionIds)
        .order("sort_order", { ascending: true });
      if (Array.isArray(optionRows)) {
        for (const opt of optionRows) {
          const key = String(opt.question_id);
          const list = optionsByQuestion.get(key) ?? [];
          list.push({
            id: String(opt.id),
            label: String(opt.label),
            isCorrect: Boolean(opt.is_correct),
            sortOrder: Number(opt.sort_order ?? 0),
          });
          optionsByQuestion.set(key, list);
        }
      }
    }
    for (const q of questionRows) {
      questions.push({
        id: String(q.id),
        questionType: String(q.question_type) as QuizQuestionType,
        question: String(q.question),
        explanation: (q.explanation as string | null) ?? null,
        points: Number(q.points ?? 1),
        sortOrder: Number(q.sort_order ?? 0),
        options: optionsByQuestion.get(String(q.id)) ?? [],
      });
    }
  }

  return {
    id: String(data.id),
    title: String(data.title),
    description: (data.description as string | null) ?? null,
    status: String(data.status) as QuizStatus,
    courseId: (data.course_id as string | null) ?? null,
    lessonId: (data.lesson_id as string | null) ?? null,
    passingScore: Number(data.passing_score ?? 0),
    questionCount: questions.length,
    questions,
  };
}

export async function createQuiz(input: {
  title: string;
  description: string | null;
  courseId: string | null;
  passingScore: number;
}): Promise<string> {
  const client = service();
  const { data, error } = await client.database
    .from("quizzes")
    .insert([
      {
        title: input.title,
        description: input.description,
        course_id: input.courseId,
        passing_score: input.passingScore,
        status: "draft",
      },
    ])
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Création du quiz impossible");
  return String(data.id);
}

export async function updateQuizMeta(
  id: string,
  patch: { title?: string; description?: string | null; passingScore?: number },
): Promise<void> {
  const client = service();
  const update: Record<string, unknown> = {};
  if (patch.title !== undefined) update.title = patch.title;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.passingScore !== undefined) update.passing_score = patch.passingScore;
  if (Object.keys(update).length === 0) return;
  const { error } = await client.database.from("quizzes").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setQuizStatus(id: string, status: QuizStatus): Promise<void> {
  const client = service();
  const { error } = await client.database.from("quizzes").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteQuiz(id: string): Promise<void> {
  const client = service();
  await client.database.from("quizzes").delete().eq("id", id);
}

export async function addQuestion(input: {
  quizId: string;
  questionType: QuizQuestionType;
  question: string;
  explanation: string | null;
  points: number;
  options: { label: string; isCorrect: boolean }[];
}): Promise<void> {
  const client = service();

  const { data: existing } = await client.database
    .from("quiz_questions")
    .select("sort_order")
    .eq("quiz_id", input.quizId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder =
    Array.isArray(existing) && existing[0]
      ? Number((existing[0] as { sort_order?: number }).sort_order ?? 0) + 1
      : 0;

  const { data: question, error } = await client.database
    .from("quiz_questions")
    .insert([
      {
        quiz_id: input.quizId,
        question_type: input.questionType,
        question: input.question,
        explanation: input.explanation,
        points: input.points,
        sort_order: nextOrder,
      },
    ])
    .select("id")
    .single();
  if (error || !question) throw new Error(error?.message ?? "Ajout de la question impossible");

  if (input.options.length > 0) {
    const rows = input.options.map((opt, index) => ({
      question_id: String(question.id),
      label: opt.label,
      is_correct: opt.isCorrect,
      sort_order: index,
    }));
    const { error: optError } = await client.database.from("quiz_options").insert(rows);
    if (optError) throw new Error(optError.message);
  }
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const client = service();
  await client.database.from("quiz_questions").delete().eq("id", questionId);
}
