import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseById } from "@/server/repositories/catalog";
import { getCertificateByToken } from "@/server/repositories/certificates";

export default async function AttestationVerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const certificate = await getCertificateByToken(token);
  if (!certificate) notFound();

  const course = await getCourseById(certificate.courseId);
  const memberName = certificate.memberName;
  const courseTitle = certificate.courseTitle ?? course?.title ?? "Formation";
  const pdfHref = `/api/attestations/${certificate.verificationToken}/pdf`;
  const qrHref = `/api/attestations/${certificate.verificationToken}/qr`;

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-wide text-progress-700">
        Attestation interne de parcours
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">{courseTitle}</h1>
      <p className="mt-4 text-sm text-slate-600">
        Cette attestation confirme l&apos;achèvement du parcours sur la plateforme. Elle n&apos;est
        pas un diplôme reconnu par l&apos;État.
      </p>
      <dl className="mt-8 space-y-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm">
        {memberName ? (
          <div>
            <dt className="text-xs uppercase text-slate-500">Apprenant</dt>
            <dd className="mt-1 font-semibold text-slate-900">{memberName}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs uppercase text-slate-500">Formation</dt>
          <dd className="mt-1 text-slate-800">{courseTitle}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-slate-500">Numéro</dt>
          <dd className="mt-1 font-mono font-semibold text-slate-900">
            {certificate.certificateNumber}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-slate-500">Date</dt>
          <dd className="mt-1 text-slate-800">
            {new Date(certificate.issuedAt).toLocaleDateString("fr-FR")}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-slate-500">Statut</dt>
          <dd className="mt-1 font-semibold text-progress-700">Valide</dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrHref}
          alt="QR code de vérification"
          width={160}
          height={160}
          className="rounded-lg border border-slate-200 bg-white p-2"
        />
        <div className="space-y-3 text-sm">
          <p className="text-slate-600">Scannez le QR pour vérifier cette attestation.</p>
          <Link
            href={pdfHref}
            className="inline-flex h-10 items-center rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Télécharger le PDF
          </Link>
        </div>
      </div>
    </main>
  );
}
