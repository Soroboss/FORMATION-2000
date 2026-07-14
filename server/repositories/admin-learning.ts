import { getAdminDbClient } from "@/lib/admin/client";

export type AdminSubmission = {
  id: string;
  assignmentId: string;
  userId: string;
  content: string | null;
  submissionUrl: string | null;
  status: string;
  score: number | null;
  reviewComment: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
};

export async function listSubmissions(limit = 50): Promise<AdminSubmission[]> {
  const client = await getAdminDbClient();
  const { data } = await client.database
    .from("assignment_submissions")
    .select(
      "id, assignment_id, user_id, content, submission_url, status, score, review_comment, submitted_at, reviewed_at",
    )
    .order("submitted_at", { ascending: false })
    .limit(limit);
  if (!Array.isArray(data)) return [];
  return data.map((row) => ({
    id: String(row.id),
    assignmentId: String(row.assignment_id),
    userId: String(row.user_id),
    content: (row.content as string | null) ?? null,
    submissionUrl: (row.submission_url as string | null) ?? null,
    status: String(row.status),
    score: row.score == null ? null : Number(row.score),
    reviewComment: (row.review_comment as string | null) ?? null,
    submittedAt: (row.submitted_at as string | null) ?? null,
    reviewedAt: (row.reviewed_at as string | null) ?? null,
  }));
}

export async function reviewSubmission(input: {
  submissionId: string;
  reviewerId: string;
  status: "approved" | "rejected" | "needs_changes";
  score?: number;
  reviewComment?: string;
}): Promise<AdminSubmission> {
  const client = await getAdminDbClient();
  const { data, error } = await client.database
    .from("assignment_submissions")
    .update({
      status: input.status,
      score: input.score ?? null,
      review_comment: input.reviewComment || null,
      reviewer_id: input.reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", input.submissionId)
    .select(
      "id, assignment_id, user_id, content, submission_url, status, score, review_comment, submitted_at, reviewed_at",
    )
    .single();

  if (error || !data) throw new Error(error?.message ?? "Revue impossible");
  return {
    id: String(data.id),
    assignmentId: String(data.assignment_id),
    userId: String(data.user_id),
    content: (data.content as string | null) ?? null,
    submissionUrl: (data.submission_url as string | null) ?? null,
    status: String(data.status),
    score: data.score == null ? null : Number(data.score),
    reviewComment: (data.review_comment as string | null) ?? null,
    submittedAt: (data.submitted_at as string | null) ?? null,
    reviewedAt: (data.reviewed_at as string | null) ?? null,
  };
}
