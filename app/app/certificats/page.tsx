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
      <div className="ui-card p-5 sm:p-6">
        <h1 className="font-display text-2xl font-bold text-ink">Attestations internes</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Attestations de parcours délivrées à 100&nbsp;% de progression. Ce n&apos;est pas un
          diplôme d&apos;État.
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="ui-card border-dashed p-6 text-center">
          <p className="font-display font-semibold text-ink">Aucune attestation pour le moment</p>
          <p className="mt-2 text-sm text-ink-muted">
            Terminez une formation à 100&nbsp;% pour en obtenir une.
          </p>
          <Link
            href="/app/catalogue"
            className="mt-4 inline-flex h-10 items-center rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Choisir une formation
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {await Promise.all(
            certificates.map(async (cert) => {
              const course = await getCourseById(cert.courseId);
              const verifyUrl = `${appUrl}/attestation/${cert.verificationToken}`;
              return (
                <li key={cert.id} className="ui-card p-4">
                  <p className="font-semibold text-ink">{course?.title ?? "Formation"}</p>
                  <p className="mt-1 font-mono text-xs text-ink-muted">{cert.certificateNumber}</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    Délivrée le {new Date(cert.issuedAt).toLocaleDateString("fr-FR")}
                  </p>
                  <Link
                    href={`/attestation/${cert.verificationToken}`}
                    className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline"
                  >
                    Voir / vérifier
                  </Link>
                  <p className="mt-1 break-all text-xs text-ink-muted">{verifyUrl}</p>
                </li>
              );
            }),
          )}
        </ul>
      )}
    </section>
  );
}
