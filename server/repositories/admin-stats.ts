import { getAdminDbClient } from "@/lib/admin/client";

export type DashboardStats = {
  members: number;
  activeSubscriptions: number;
  confirmedPayments: number;
  revenueXof: number;
  publishedCourses: number;
  draftCourses: number;
  pendingSubmissions: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const client = await getAdminDbClient();

  const [
    profiles,
    subscriptions,
    payments,
    publishedCourses,
    draftCourses,
    submissions,
  ] = await Promise.all([
    client.database.from("profiles").select("id"),
    client.database.from("subscriptions").select("id, status").eq("status", "active"),
    client.database
      .from("payments")
      .select("id, amount, status")
      .eq("status", "confirmed"),
    client.database.from("courses").select("id").eq("status", "published"),
    client.database.from("courses").select("id").eq("status", "draft"),
    client.database
      .from("assignment_submissions")
      .select("id")
      .in("status", ["submitted", "in_review"]),
  ]);

  const paymentRows = Array.isArray(payments.data) ? payments.data : [];
  const revenueXof = paymentRows.reduce((acc, row) => acc + Number(row.amount ?? 0), 0);

  return {
    members: Array.isArray(profiles.data) ? profiles.data.length : 0,
    activeSubscriptions: Array.isArray(subscriptions.data) ? subscriptions.data.length : 0,
    confirmedPayments: paymentRows.length,
    revenueXof,
    publishedCourses: Array.isArray(publishedCourses.data) ? publishedCourses.data.length : 0,
    draftCourses: Array.isArray(draftCourses.data) ? draftCourses.data.length : 0,
    pendingSubmissions: Array.isArray(submissions.data) ? submissions.data.length : 0,
  };
}
