import { createHash, randomBytes } from "node:crypto";
import { getAccessToken } from "@/lib/auth/cookies";
import {
  createInsForgeServerClient,
  tryCreateInsForgeServiceClient,
  tryCreateInsForgeServerClient,
} from "@/lib/insforge/server";

export type Certificate = {
  id: string;
  userId: string;
  courseId: string;
  certificateNumber: string;
  verificationToken: string;
  issuedAt: string;
  revokedAt: string | null;
  courseTitle?: string;
  memberName?: string | null;
};

function mapCertificate(row: Record<string, unknown>): Certificate {
  const metadata =
    row.metadata && typeof row.metadata === "object"
      ? (row.metadata as Record<string, unknown>)
      : {};
  return {
    id: String(row.id),
    userId: String(row.user_id),
    courseId: String(row.course_id),
    certificateNumber: String(row.certificate_number),
    verificationToken: String(row.verification_token),
    issuedAt: String(row.issued_at),
    revokedAt: (row.revoked_at as string | null) ?? null,
    memberName:
      typeof metadata.memberName === "string" ? metadata.memberName : null,
    courseTitle:
      typeof metadata.courseTitle === "string" ? metadata.courseTitle : undefined,
  };
}

function makeCertificateNumber(userId: string, courseId: string): string {
  const digest = createHash("sha256")
    .update(`${userId}:${courseId}:${Date.now()}`)
    .digest("hex")
    .slice(0, 10)
    .toUpperCase();
  return `A2K-${digest}`;
}

function makeVerificationToken(): string {
  return randomBytes(24).toString("hex");
}

async function userClient() {
  const token = await getAccessToken();
  return tryCreateInsForgeServerClient(token);
}

export async function listCertificatesForUser(userId: string): Promise<Certificate[]> {
  const client = await userClient();
  if (!client) return [];
  const { data } = await client.database
    .from("certificates")
    .select(
      "id, user_id, course_id, certificate_number, verification_token, issued_at, revoked_at, metadata",
    )
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });
  if (!Array.isArray(data)) return [];
  return data.map((row) => mapCertificate(row as Record<string, unknown>));
}

export async function getCertificateByToken(token: string): Promise<Certificate | null> {
  const client =
    tryCreateInsForgeServiceClient() ??
    tryCreateInsForgeServerClient() ??
    (await userClient());
  if (!client) return null;

  const { data } = await client.database
    .from("certificates")
    .select(
      "id, user_id, course_id, certificate_number, verification_token, issued_at, revoked_at, metadata",
    )
    .eq("verification_token", token)
    .maybeSingle();

  if (!data || data.revoked_at) return null;
  return mapCertificate(data as Record<string, unknown>);
}

/**
 * Issue an internal pathway attestation when the course enrollment is complete.
 * Idempotent on (user_id, course_id).
 */
export async function issueCertificateIfEligible(input: {
  userId: string;
  courseId: string;
  courseTitle: string;
  progressPercent: number;
  memberName: string;
}): Promise<{ certificate: Certificate; newlyIssued: boolean } | null> {
  if (input.progressPercent < 100) return null;

  const token = await getAccessToken();
  if (!token) return null;
  const client = createInsForgeServerClient(token);

  const { data: existing } = await client.database
    .from("certificates")
    .select(
      "id, user_id, course_id, certificate_number, verification_token, issued_at, revoked_at, metadata",
    )
    .eq("user_id", input.userId)
    .eq("course_id", input.courseId)
    .maybeSingle();

  if (existing && !existing.revoked_at) {
    return {
      certificate: mapCertificate(existing as Record<string, unknown>),
      newlyIssued: false,
    };
  }

  const payload = {
    user_id: input.userId,
    course_id: input.courseId,
    certificate_number: makeCertificateNumber(input.userId, input.courseId),
    verification_token: makeVerificationToken(),
    metadata: {
      courseTitle: input.courseTitle,
      memberName: input.memberName,
      kind: "attestation_interne_parcours",
    },
  };

  const { data, error } = await client.database
    .from("certificates")
    .upsert(payload, { onConflict: "user_id,course_id" })
    .select(
      "id, user_id, course_id, certificate_number, verification_token, issued_at, revoked_at, metadata",
    )
    .single();

  if (error || !data) return null;
  return {
    certificate: mapCertificate(data as Record<string, unknown>),
    newlyIssued: true,
  };
}
