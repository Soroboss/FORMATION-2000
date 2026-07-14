import { NextResponse } from "next/server";
import { buildAttestationPdf } from "@/lib/certificates/pdf";
import { getAppUrl } from "@/lib/utils";
import { getCourseById } from "@/server/repositories/catalog";
import { getCertificateByToken } from "@/server/repositories/certificates";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const certificate = await getCertificateByToken(token);
  if (!certificate) {
    return NextResponse.json({ error: "Attestation introuvable" }, { status: 404 });
  }

  const course = await getCourseById(certificate.courseId);
  const courseTitle = certificate.courseTitle ?? course?.title ?? "Formation";
  const memberName = certificate.memberName ?? "Apprenant";
  const verifyUrl = `${getAppUrl()}/attestation/${certificate.verificationToken}`;

  const bytes = await buildAttestationPdf({
    memberName,
    courseTitle,
    certificateNumber: certificate.certificateNumber,
    issuedAt: certificate.issuedAt,
    verifyUrl,
  });

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="attestation-${certificate.certificateNumber}.pdf"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
