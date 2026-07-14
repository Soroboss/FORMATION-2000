/**
 * progression_formation =
 * completed_required_lessons / total_required_lessons * 100
 */
export function calculateCourseProgressPercent(input: {
  totalRequiredLessons: number;
  completedRequiredLessons: number;
}): number {
  if (input.totalRequiredLessons <= 0) return 0;
  const raw = (input.completedRequiredLessons / input.totalRequiredLessons) * 100;
  return Math.min(100, Math.max(0, Math.round(raw * 100) / 100));
}

export function gradeSingleChoice(input: {
  selectedOptionId: string | null | undefined;
  correctOptionIds: string[];
}): boolean {
  if (!input.selectedOptionId) return false;
  return input.correctOptionIds.length === 1 && input.correctOptionIds[0] === input.selectedOptionId;
}

export function gradeMultipleChoice(input: {
  selectedOptionIds: string[];
  correctOptionIds: string[];
}): boolean {
  const selected = new Set(input.selectedOptionIds);
  const correct = new Set(input.correctOptionIds);
  if (selected.size !== correct.size) return false;
  for (const id of correct) {
    if (!selected.has(id)) return false;
  }
  return true;
}

export function calculateQuizScorePercent(input: {
  awardedPoints: number;
  totalPoints: number;
}): number {
  if (input.totalPoints <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((input.awardedPoints / input.totalPoints) * 10000) / 100));
}
