import { tryCreateInsForgeServerClient } from "@/lib/insforge/server";
import { getAccessToken } from "@/lib/auth/cookies";
import { calculateCourseProgressPercent } from "@/lib/progress/calc";
import type {
  AssignmentSubmission,
  AssignmentSummary,
  Enrollment,
  Favorite,
  LessonProgress,
  Note,
  QuizPublic,
} from "@/types/learning";

async function clientForUser() {
  const token = await getAccessToken();
  const client = tryCreateInsForgeServerClient(token);
  if (!client) throw new Error("InsForge non configuré.");
  return client;
}

function mapEnrollment(row: Record<string, unknown>): Enrollment {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    courseId: String(row.course_id),
    status: String(row.status),
    progressPercent: Number(row.progress_percent ?? 0),
    lastLessonId: (row.last_lesson_id as string | null) ?? null,
    startedAt: String(row.started_at),
    completedAt: (row.completed_at as string | null) ?? null,
  };
}

function mapProgress(row: Record<string, unknown>): LessonProgress {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    lessonId: String(row.lesson_id),
    status: row.status as LessonProgress["status"],
    progressPercent: Number(row.progress_percent ?? 0),
    lastPositionSeconds: Number(row.last_position_seconds ?? 0),
    startedAt: (row.started_at as string | null) ?? null,
    completedAt: (row.completed_at as string | null) ?? null,
  };
}

function mapNote(row: Record<string, unknown>): Note {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    lessonId: (row.lesson_id as string | null) ?? null,
    courseId: (row.course_id as string | null) ?? null,
    content: String(row.content),
    updatedAt: String(row.updated_at),
  };
}

function mapFavorite(row: Record<string, unknown>): Favorite {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    entityType: row.entity_type as Favorite["entityType"],
    entityId: String(row.entity_id),
    createdAt: String(row.created_at),
  };
}

export async function ensureEnrollment(userId: string, courseId: string): Promise<Enrollment> {
  const client = await clientForUser();
  const { data: existing } = await client.database
    .from("enrollments")
    .select("id, user_id, course_id, status, progress_percent, last_lesson_id, started_at, completed_at")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing) return mapEnrollment(existing as Record<string, unknown>);

  const { data, error } = await client.database
    .from("enrollments")
    .insert([{ user_id: userId, course_id: courseId, status: "active" }])
    .select("id, user_id, course_id, status, progress_percent, last_lesson_id, started_at, completed_at")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Inscription formation impossible");
  return mapEnrollment(data as Record<string, unknown>);
}

export async function listEnrollmentsForUser(userId: string): Promise<Enrollment[]> {
  const client = await clientForUser();
  const { data, error } = await client.database
    .from("enrollments")
    .select("id, user_id, course_id, status, progress_percent, last_lesson_id, started_at, completed_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error || !Array.isArray(data)) return [];
  return data.map((row) => mapEnrollment(row as Record<string, unknown>));
}

export async function getLessonProgress(
  userId: string,
  lessonId: string,
): Promise<LessonProgress | null> {
  const client = await clientForUser();
  const { data } = await client.database
    .from("lesson_progress")
    .select(
      "id, user_id, lesson_id, status, progress_percent, last_position_seconds, started_at, completed_at",
    )
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (!data) return null;
  return mapProgress(data as Record<string, unknown>);
}

export async function listLessonProgressForCourse(
  userId: string,
  lessonIds: string[],
): Promise<LessonProgress[]> {
  if (lessonIds.length === 0) return [];
  const client = await clientForUser();
  const { data, error } = await client.database
    .from("lesson_progress")
    .select(
      "id, user_id, lesson_id, status, progress_percent, last_position_seconds, started_at, completed_at",
    )
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);

  if (error || !Array.isArray(data)) return [];
  return data.map((row) => mapProgress(row as Record<string, unknown>));
}

export async function upsertLessonProgress(input: {
  userId: string;
  lessonId: string;
  status: LessonProgress["status"];
  progressPercent: number;
  lastPositionSeconds?: number;
}): Promise<LessonProgress> {
  const client = await clientForUser();
  const now = new Date().toISOString();
  const existing = await getLessonProgress(input.userId, input.lessonId);

  const payload: Record<string, unknown> = {
    user_id: input.userId,
    lesson_id: input.lessonId,
    status: input.status,
    progress_percent: input.progressPercent,
    last_position_seconds: input.lastPositionSeconds ?? existing?.lastPositionSeconds ?? 0,
    last_activity_at: now,
    started_at: existing?.startedAt ?? now,
    completed_at:
      input.status === "completed" ? existing?.completedAt ?? now : existing?.completedAt ?? null,
  };

  if (existing) {
    const { data, error } = await client.database
      .from("lesson_progress")
      .update(payload)
      .eq("id", existing.id)
      .select(
        "id, user_id, lesson_id, status, progress_percent, last_position_seconds, started_at, completed_at",
      )
      .single();
    if (error || !data) throw new Error(error?.message ?? "Mise à jour progression impossible");
    return mapProgress(data as Record<string, unknown>);
  }

  const { data, error } = await client.database
    .from("lesson_progress")
    .insert([payload])
    .select(
      "id, user_id, lesson_id, status, progress_percent, last_position_seconds, started_at, completed_at",
    )
    .single();

  if (error || !data) throw new Error(error?.message ?? "Création progression impossible");
  return mapProgress(data as Record<string, unknown>);
}

export async function recalculateEnrollmentProgress(input: {
  userId: string;
  courseId: string;
  requiredLessonIds: string[];
  lastLessonId?: string;
}): Promise<Enrollment> {
  const client = await clientForUser();
  const progressRows = await listLessonProgressForCourse(input.userId, input.requiredLessonIds);
  const completed = progressRows.filter((p) => p.status === "completed").length;
  const percent = calculateCourseProgressPercent({
    totalRequiredLessons: input.requiredLessonIds.length,
    completedRequiredLessons: completed,
  });

  const status = percent >= 100 ? "completed" : "active";
  const completedAt = percent >= 100 ? new Date().toISOString() : null;

  await ensureEnrollment(input.userId, input.courseId);

  const { data, error } = await client.database
    .from("enrollments")
    .update({
      progress_percent: percent,
      status,
      completed_at: completedAt,
      last_lesson_id: input.lastLessonId ?? null,
    })
    .eq("user_id", input.userId)
    .eq("course_id", input.courseId)
    .select("id, user_id, course_id, status, progress_percent, last_lesson_id, started_at, completed_at")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Recalcul progression impossible");
  return mapEnrollment(data as Record<string, unknown>);
}

export async function getNoteForLesson(userId: string, lessonId: string): Promise<Note | null> {
  const client = await clientForUser();
  const { data } = await client.database
    .from("notes")
    .select("id, user_id, lesson_id, course_id, content, updated_at")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return mapNote(data as Record<string, unknown>);
}

export async function listNotesForUser(userId: string): Promise<Note[]> {
  const client = await clientForUser();
  const { data, error } = await client.database
    .from("notes")
    .select("id, user_id, lesson_id, course_id, content, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error || !Array.isArray(data)) return [];
  return data.map((row) => mapNote(row as Record<string, unknown>));
}

export async function upsertLessonNote(input: {
  userId: string;
  lessonId: string;
  courseId: string;
  content: string;
}): Promise<Note> {
  const client = await clientForUser();
  const existing = await getNoteForLesson(input.userId, input.lessonId);

  if (existing) {
    const { data, error } = await client.database
      .from("notes")
      .update({ content: input.content })
      .eq("id", existing.id)
      .select("id, user_id, lesson_id, course_id, content, updated_at")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Mise à jour note impossible");
    return mapNote(data as Record<string, unknown>);
  }

  const { data, error } = await client.database
    .from("notes")
    .insert([
      {
        user_id: input.userId,
        lesson_id: input.lessonId,
        course_id: input.courseId,
        content: input.content,
      },
    ])
    .select("id, user_id, lesson_id, course_id, content, updated_at")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Création note impossible");
  return mapNote(data as Record<string, unknown>);
}

export async function listFavoritesForUser(userId: string): Promise<Favorite[]> {
  const client = await clientForUser();
  const { data, error } = await client.database
    .from("favorites")
    .select("id, user_id, entity_type, entity_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !Array.isArray(data)) return [];
  return data.map((row) => mapFavorite(row as Record<string, unknown>));
}

export async function isFavorite(
  userId: string,
  entityType: Favorite["entityType"],
  entityId: string,
): Promise<boolean> {
  const client = await clientForUser();
  const { data } = await client.database
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .maybeSingle();
  return Boolean(data);
}

export async function toggleFavorite(input: {
  userId: string;
  entityType: Favorite["entityType"];
  entityId: string;
}): Promise<{ favorited: boolean }> {
  const client = await clientForUser();
  const { data: existing } = await client.database
    .from("favorites")
    .select("id")
    .eq("user_id", input.userId)
    .eq("entity_type", input.entityType)
    .eq("entity_id", input.entityId)
    .maybeSingle();

  if (existing) {
    await client.database.from("favorites").delete().eq("id", (existing as { id: string }).id);
    return { favorited: false };
  }

  const { error } = await client.database.from("favorites").insert([
    {
      user_id: input.userId,
      entity_type: input.entityType,
      entity_id: input.entityId,
    },
  ]);
  if (error) throw new Error(error.message);
  return { favorited: true };
}

export async function getPublishedQuizForCourse(courseId: string): Promise<QuizPublic | null> {
  const client = await clientForUser();
  const { data: quiz } = await client.database
    .from("quizzes")
    .select("id, course_id, title, description, passing_score, max_attempts, status")
    .eq("course_id", courseId)
    .eq("status", "published")
    .limit(1)
    .maybeSingle();

  if (!quiz) return null;
  const quizRow = quiz as Record<string, unknown>;

  const { data: questions } = await client.database
    .from("quiz_questions")
    .select("id, question_type, question, points, sort_order")
    .eq("quiz_id", quizRow.id)
    .order("sort_order", { ascending: true });

  const questionRows = Array.isArray(questions) ? (questions as Record<string, unknown>[]) : [];
  const questionIds = questionRows.map((q) => String(q.id));

  let optionRows: Record<string, unknown>[] = [];
  if (questionIds.length > 0) {
    const { data: options } = await client.database
      .from("quiz_options")
      .select("id, question_id, label, sort_order")
      .in("question_id", questionIds)
      .order("sort_order", { ascending: true });
    optionRows = Array.isArray(options) ? (options as Record<string, unknown>[]) : [];
  }

  return {
    id: String(quizRow.id),
    courseId: (quizRow.course_id as string | null) ?? null,
    title: String(quizRow.title),
    description: (quizRow.description as string | null) ?? null,
    passingScore: Number(quizRow.passing_score ?? 70),
    maxAttempts: quizRow.max_attempts == null ? null : Number(quizRow.max_attempts),
    questions: questionRows.map((q) => ({
      id: String(q.id),
      questionType: String(q.question_type),
      question: String(q.question),
      points: Number(q.points ?? 1),
      sortOrder: Number(q.sort_order ?? 0),
      options: optionRows
        .filter((o) => String(o.question_id) === String(q.id))
        .map((o) => ({
          id: String(o.id),
          label: String(o.label),
          sortOrder: Number(o.sort_order ?? 0),
        })),
    })),
  };
}

export async function getCorrectOptionIds(questionIds: string[]): Promise<Map<string, string[]>> {
  const client = await clientForUser();
  const map = new Map<string, string[]>();
  if (questionIds.length === 0) return map;

  const { data, error } = await client.database
    .from("quiz_options")
    .select("id, question_id, is_correct")
    .in("question_id", questionIds)
    .eq("is_correct", true);

  if (error || !Array.isArray(data)) return map;
  for (const row of data as Record<string, unknown>[]) {
    const qid = String(row.question_id);
    const list = map.get(qid) ?? [];
    list.push(String(row.id));
    map.set(qid, list);
  }
  return map;
}

export async function countQuizAttempts(userId: string, quizId: string): Promise<number> {
  const client = await clientForUser();
  const { data } = await client.database
    .from("quiz_attempts")
    .select("id")
    .eq("user_id", userId)
    .eq("quiz_id", quizId);
  return Array.isArray(data) ? data.length : 0;
}

export async function createQuizAttempt(input: {
  userId: string;
  quizId: string;
  attemptNumber: number;
  score: number;
  passed: boolean;
  answers: Array<{
    questionId: string;
    answer: unknown;
    isCorrect: boolean;
    pointsAwarded: number;
  }>;
}): Promise<{ attemptId: string }> {
  const client = await clientForUser();
  const { data: attempt, error } = await client.database
    .from("quiz_attempts")
    .insert([
      {
        quiz_id: input.quizId,
        user_id: input.userId,
        attempt_number: input.attemptNumber,
        score: input.score,
        passed: input.passed,
        submitted_at: new Date().toISOString(),
      },
    ])
    .select("id")
    .single();

  if (error || !attempt) throw new Error(error?.message ?? "Tentative quiz impossible");

  const attemptId = String((attempt as { id: string }).id);
  if (input.answers.length > 0) {
    const { error: answersError } = await client.database.from("quiz_answers").insert(
      input.answers.map((a) => ({
        attempt_id: attemptId,
        question_id: a.questionId,
        answer: a.answer,
        is_correct: a.isCorrect,
        points_awarded: a.pointsAwarded,
      })),
    );
    if (answersError) throw new Error(answersError.message);
  }

  return { attemptId };
}

export async function getAssignmentForLesson(lessonId: string): Promise<AssignmentSummary | null> {
  const client = await clientForUser();
  const { data } = await client.database
    .from("assignments")
    .select("id, lesson_id, title, instructions, expected_deliverables")
    .eq("lesson_id", lessonId)
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  const row = data as Record<string, unknown>;
  return {
    id: String(row.id),
    lessonId: (row.lesson_id as string | null) ?? null,
    title: String(row.title),
    instructions: String(row.instructions),
    expectedDeliverables: Array.isArray(row.expected_deliverables)
      ? (row.expected_deliverables as string[])
      : [],
  };
}

export async function getSubmissionForAssignment(
  userId: string,
  assignmentId: string,
): Promise<AssignmentSubmission | null> {
  const client = await clientForUser();
  const { data } = await client.database
    .from("assignment_submissions")
    .select(
      "id, assignment_id, status, content, submission_url, submitted_at, score, review_comment, reviewed_at",
    )
    .eq("user_id", userId)
    .eq("assignment_id", assignmentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return mapSubmission(data as Record<string, unknown>);
}

function mapSubmission(row: Record<string, unknown>): AssignmentSubmission {
  return {
    id: String(row.id),
    assignmentId: String(row.assignment_id),
    status: String(row.status),
    content: (row.content as string | null) ?? null,
    submissionUrl: (row.submission_url as string | null) ?? null,
    submittedAt: (row.submitted_at as string | null) ?? null,
    score: row.score == null ? null : Number(row.score),
    reviewComment: (row.review_comment as string | null) ?? null,
    reviewedAt: (row.reviewed_at as string | null) ?? null,
  };
}

export async function listSubmissionsForUser(
  userId: string,
): Promise<
  Array<
    AssignmentSubmission & {
      assignmentTitle: string;
      lessonId: string | null;
      courseId: string | null;
      courseSlug: string | null;
    }
  >
> {
  const client = await clientForUser();
  const { data } = await client.database
    .from("assignment_submissions")
    .select(
      "id, assignment_id, status, content, submission_url, submitted_at, score, review_comment, reviewed_at",
    )
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false })
    .limit(50);

  if (!Array.isArray(data) || data.length === 0) return [];

  const submissions = data.map((row) => mapSubmission(row as Record<string, unknown>));
  const assignmentIds = [...new Set(submissions.map((s) => s.assignmentId))];

  const { data: assignments } = await client.database
    .from("assignments")
    .select("id, title, lesson_id, course_id")
    .in("id", assignmentIds);

  const assignmentMap = new Map<
    string,
    { title: string; lessonId: string | null; courseId: string | null }
  >();
  if (Array.isArray(assignments)) {
    for (const row of assignments) {
      const r = row as Record<string, unknown>;
      assignmentMap.set(String(r.id), {
        title: String(r.title),
        lessonId: (r.lesson_id as string | null) ?? null,
        courseId: (r.course_id as string | null) ?? null,
      });
    }
  }

  const courseIds = [
    ...new Set(
      [...assignmentMap.values()]
        .map((a) => a.courseId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const courseSlugById = new Map<string, string>();
  if (courseIds.length > 0) {
    const { data: courses } = await client.database
      .from("courses")
      .select("id, slug")
      .in("id", courseIds);
    if (Array.isArray(courses)) {
      for (const row of courses) {
        const r = row as Record<string, unknown>;
        courseSlugById.set(String(r.id), String(r.slug));
      }
    }
  }

  return submissions.map((s) => {
    const meta = assignmentMap.get(s.assignmentId);
    const courseId = meta?.courseId ?? null;
    return {
      ...s,
      assignmentTitle: meta?.title ?? "Exercice",
      lessonId: meta?.lessonId ?? null,
      courseId,
      courseSlug: courseId ? courseSlugById.get(courseId) ?? null : null,
    };
  });
}

export async function submitAssignment(input: {
  userId: string;
  assignmentId: string;
  content: string;
  submissionUrl?: string;
}): Promise<AssignmentSubmission> {
  const client = await clientForUser();
  const existing = await getSubmissionForAssignment(input.userId, input.assignmentId);
  const payload = {
    assignment_id: input.assignmentId,
    user_id: input.userId,
    content: input.content,
    submission_url: input.submissionUrl || null,
    status: "submitted",
    submitted_at: new Date().toISOString(),
  };

  if (existing) {
    const { data, error } = await client.database
      .from("assignment_submissions")
      .update(payload)
      .eq("id", existing.id)
      .select(
        "id, assignment_id, status, content, submission_url, submitted_at, score, review_comment, reviewed_at",
      )
      .single();
    if (error || !data) throw new Error(error?.message ?? "Soumission impossible");
    return mapSubmission(data as Record<string, unknown>);
  }

  const { data, error } = await client.database
    .from("assignment_submissions")
    .insert([payload])
    .select(
      "id, assignment_id, status, content, submission_url, submitted_at, score, review_comment, reviewed_at",
    )
    .single();

  if (error || !data) throw new Error(error?.message ?? "Soumission impossible");
  return mapSubmission(data as Record<string, unknown>);
}
