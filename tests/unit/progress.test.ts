import { describe, expect, it } from "vitest";
import {
  calculateCourseProgressPercent,
  calculateQuizScorePercent,
  gradeMultipleChoice,
  gradeSingleChoice,
} from "@/lib/progress/calc";

describe("calculateCourseProgressPercent", () => {
  it("retourne 0 si aucune leçon requise", () => {
    expect(
      calculateCourseProgressPercent({
        totalRequiredLessons: 0,
        completedRequiredLessons: 0,
      }),
    ).toBe(0);
  });

  it("calcule le pourcentage arrondi", () => {
    expect(
      calculateCourseProgressPercent({
        totalRequiredLessons: 3,
        completedRequiredLessons: 1,
      }),
    ).toBe(33.33);
  });

  it("plafonne à 100", () => {
    expect(
      calculateCourseProgressPercent({
        totalRequiredLessons: 2,
        completedRequiredLessons: 5,
      }),
    ).toBe(100);
  });
});

describe("quiz grading", () => {
  it("valide un QCM simple", () => {
    expect(
      gradeSingleChoice({
        selectedOptionId: "b",
        correctOptionIds: ["b"],
      }),
    ).toBe(true);
    expect(
      gradeSingleChoice({
        selectedOptionId: "a",
        correctOptionIds: ["b"],
      }),
    ).toBe(false);
  });

  it("valide un QCM multiple exact", () => {
    expect(
      gradeMultipleChoice({
        selectedOptionIds: ["a", "c"],
        correctOptionIds: ["a", "c"],
      }),
    ).toBe(true);
    expect(
      gradeMultipleChoice({
        selectedOptionIds: ["a"],
        correctOptionIds: ["a", "c"],
      }),
    ).toBe(false);
  });

  it("calcule le score quiz", () => {
    expect(calculateQuizScorePercent({ awardedPoints: 7, totalPoints: 10 })).toBe(70);
    expect(calculateQuizScorePercent({ awardedPoints: 0, totalPoints: 0 })).toBe(0);
  });
});
