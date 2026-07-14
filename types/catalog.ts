export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type CourseAccessType = "free" | "subscription" | "purchase";
export type CourseStatus =
  | "draft"
  | "in_review"
  | "validated"
  | "scheduled"
  | "published"
  | "archived";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  icon: string | null;
  sortOrder: number;
};

export type CourseListItem = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  level: CourseLevel | null;
  language: string;
  estimatedDurationMinutes: number;
  accessType: CourseAccessType;
  isFeatured: boolean;
  category: Pick<Category, "id" | "name" | "slug"> | null;
  lessonCount: number;
};

export type YouTubeSourcePublic = {
  youtubeVideoId: string;
  videoUrl: string;
  channelName: string | null;
  channelUrl: string | null;
  originalTitle: string | null;
  thumbnailUrl: string | null;
  embedStatus: string;
};

export type LessonInstructions = {
  objective: string | null;
  summary: string | null;
  keyPoints: string[];
  steps: string[];
  expectedResult: string | null;
  commonMistakes: string[];
  tips: string[];
};

export type LessonSummary = {
  id: string;
  moduleId: string;
  title: string;
  slug: string | null;
  lessonType: string;
  estimatedDurationMinutes: number;
  sortOrder: number;
  isPreview: boolean;
  isRequired: boolean;
};

export type LessonDetail = LessonSummary & {
  description: string | null;
  youtube: YouTubeSourcePublic | null;
  instructions: LessonInstructions | null;
};

export type ModuleWithLessons = {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  lessons: LessonSummary[];
};

export type CourseDetail = CourseListItem & {
  description: string | null;
  learningOutcomes: string[];
  prerequisites: string[];
  requiredTools: string[];
  finalProjectDescription: string | null;
  modules: ModuleWithLessons[];
};

export type CourseFilters = {
  categorySlug?: string;
  level?: CourseLevel;
  q?: string;
  featured?: boolean;
};
