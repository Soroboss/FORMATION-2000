export type LessonProgressStatus = "not_started" | "in_progress" | "completed";

export type LessonProgress = {
  id: string;
  userId: string;
  lessonId: string;
  status: LessonProgressStatus;
  progressPercent: number;
  lastPositionSeconds: number;
  startedAt: string | null;
  completedAt: string | null;
};

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  progressPercent: number;
  lastLessonId: string | null;
  startedAt: string;
  completedAt: string | null;
};

export type Note = {
  id: string;
  userId: string;
  lessonId: string | null;
  courseId: string | null;
  content: string;
  updatedAt: string;
};

export type Favorite = {
  id: string;
  userId: string;
  entityType: "course" | "lesson" | "resource" | "tool";
  entityId: string;
  createdAt: string;
};

export type QuizPublicQuestion = {
  id: string;
  questionType: string;
  question: string;
  points: number;
  sortOrder: number;
  options: Array<{ id: string; label: string; sortOrder: number }>;
};

export type QuizPublic = {
  id: string;
  courseId: string | null;
  title: string;
  description: string | null;
  passingScore: number;
  maxAttempts: number | null;
  questions: QuizPublicQuestion[];
};

export type AssignmentSummary = {
  id: string;
  lessonId: string | null;
  title: string;
  instructions: string;
  expectedDeliverables: string[];
};

export type AssignmentSubmission = {
  id: string;
  assignmentId: string;
  status: string;
  content: string | null;
  submissionUrl: string | null;
  submittedAt: string | null;
};
