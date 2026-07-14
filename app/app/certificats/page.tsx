import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getAppUrl } from "@/lib/utils";
import { getCourseById } from "@/server/repositories/catalog";
import { listCertificatesForUser } from "@/server/repositories/certificates";

export default async function CertificatsPage() {
  const session = await getSession();
  if (!session) return null;

  const certificates = await listCertificatesForUser(session.user.id);
  const appUrl = getAppUrl();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">
          Attestations internes
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Attestations de parcours délivrées à 100&nbsp;% de progression. Ce n&apos;est pas un
          diplôme d&apos;État.
        </p>
      </div>

      {certificates.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          Aucune attestation pour le moment. Terminez une formation pour en obtenir une.
        </p>
      ) : (
        <ul className="space-y-3">
          {await Promise.all(
            certificates.map(async (cert) => {
              const course = await getCourseById(cert.courseId);
              const verifyUrl = `${appUrl}/attestation/${cert.verificationToken}`;
              return (
                <li
                  key={cert.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <p className="font-semibold text-slate-900">
                    {course?.title ?? "Formation"}
                  </p>
                  <p className="mt-1 font-mono text-xs text-slate-500">
                    {cert.certificateNumber}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Délivrée le {new Date(cert.issuedAt).toLocaleDateString("fr-FR")}
                  </p>
                  <Link
                    href={`/attestation/${cert.verificationToken}`}
                    className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline"
                  >
                    Voir / vérifier
                  </Link>
                  <p className="mt-1 break-all text-xs text-slate-400">{verifyUrl}</p>
                </li>
              );
            }),
          )}
        </ul>
      )}
    </section>
  );
}
