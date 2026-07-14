import { NextResponse } from "next/server";
import { buildVerificationQrPng } from "@/lib/certificates/pdf";
import { getAppUrl } from "@/lib/utils";
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

  const verifyUrl = `${getAppUrl()}/attestation/${certificate.verificationToken}`;
  const png = await buildVerificationQrPng(verifyUrl);

  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
