import Link from "next/link";
import { redirect } from "next/navigation";
import { Compass, NotebookPen } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { getSession } from "@/lib/auth/session";
import { listNotesForUser } from "@/server/repositories/learning";

export default async function NotesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/tableau-de-bord");
  }
  const notes = await listNotesForUser(session.user.id);

  return (
    <section className="space-y-6">
      <PageHeader
        icon={NotebookPen}
        title="Mes notes"
        subtitle="Notes privées prises pendant les leçons."
      />

      {notes.length === 0 ? (
        <div className="ui-card border-dashed p-6 text-center sm:p-8">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <NotebookPen className="h-6 w-6" strokeWidth={2} aria-hidden />
          </span>
          <p className="font-display font-semibold text-ink">Aucune note pour le moment</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            Ouvrez une leçon pour prendre des notes pendant le visionnage.
          </p>
          <Link
            href="/app/catalogue"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Compass className="h-4 w-4" strokeWidth={2} aria-hidden />
            Aller au catalogue
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {notes.map((note) => (
            <article
              key={note.id}
              className="ui-card relative overflow-hidden p-4 pl-5 sm:p-5 sm:pl-6"
            >
              <span
                className="absolute left-0 top-0 h-full w-1.5 bg-brand-500"
                aria-hidden
              />
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                {note.content}
              </p>
              <p className="mt-3 border-t border-canvas-border pt-2 text-xs text-ink-muted">
                Mis à jour le{" "}
                {new Date(note.updatedAt).toLocaleString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
