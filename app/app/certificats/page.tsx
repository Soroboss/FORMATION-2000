import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, Download, ShieldCheck } from "lucide-react";
import { CopyVerifyLinkButton } from "@/components/app/copy-verify-link-button";
import { PageHeader } from "@/components/app/page-header";
import { getSession } from "@/lib/auth/session";
import { getAppUrl } from "@/lib/utils";
import { getCourseById } from "@/server/repositories/catalog";
import { listCertificatesForUser } from "@/server/repositories/certificates";

export default async function CertificatsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/tableau-de-bord");
  }

  const certificates = await listCertificatesForUser(session.user.id);
  const appUrl = getAppUrl();

  const items = await Promise.all(
    certificates.map(async (cert) => {
      const course = cert.courseTitle ? null : await getCourseById(cert.courseId);
      return {
        cert,
        title: cert.courseTitle ?? course?.title ?? "Formation",
      };
    }),
  );

  return (
    <section className="space-y-6">
      <PageHeader
        icon={Award}
        title="Attestations"
        subtitle="Attestations de parcours délivrées à 100 % de progression. Ce n’est pas un diplôme d’État."
        tone="action"
      />

      {items.length === 0 ? (
        <div className="ui-card border-dashed p-6 text-center sm:p-8">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-action-50 text-action-600">
            <Award className="h-6 w-6" strokeWidth={2} aria-hidden />
          </span>
          <p className="font-display font-semibold text-ink">Aucune attestation pour le moment</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            Terminez une formation à 100 % pour obtenir votre attestation vérifiable.
          </p>
          <Link
            href="/app/catalogue"
            className="mt-4 inline-flex h-10 items-center rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Choisir une formation
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {items.map(({ cert, title }) => {
            const verifyUrl = `${appUrl}/attestation/${cert.verificationToken}`;
            return (
              <article
                key={cert.id}
                className="ui-card overflow-hidden"
              >
                {/* Bandeau diplôme. */}
                <div className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-action-500 p-5 text-white">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-sm">
                      <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                      Attestation vérifiable
                    </span>
                    <Award className="h-8 w-8 opacity-90" strokeWidth={1.5} aria-hidden />
                  </div>
                  <h2 className="mt-4 font-display text-lg font-bold leading-snug">{title}</h2>
                  {cert.memberName ? (
                    <p className="mt-1 text-sm text-white/85">Délivrée à {cert.memberName}</p>
                  ) : null}
                </div>

                {/* Détails. */}
                <div className="space-y-3 p-5">
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                        Numéro
                      </dt>
                      <dd className="mt-0.5 font-mono text-xs text-ink">{cert.certificateNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                        Délivrée le
                      </dt>
                      <dd className="mt-0.5 text-ink">
                        {new Date(cert.issuedAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex flex-wrap items-center gap-3 border-t border-canvas-border pt-3">
                    <Link
                      href={`/attestation/${cert.verificationToken}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-brand bg-brand-600 px-3 text-sm font-semibold text-white hover:bg-brand-700"
                    >
                      <ShieldCheck className="h-4 w-4" strokeWidth={2} aria-hidden />
                      Vérifier
                    </Link>
                    <a
                      href={`/api/attestations/${cert.verificationToken}/pdf`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-brand border-2 border-brand-600 px-3 text-sm font-semibold text-brand-600 hover:bg-brand-50"
                    >
                      <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
                      PDF + QR
                    </a>
                    <CopyVerifyLinkButton url={verifyUrl} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
