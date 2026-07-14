import Link from "next/link";
import { redirect } from "next/navigation";
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
      <div className="ui-card p-5 sm:p-6">
        <h1 className="font-display text-2xl font-bold text-ink">Mes notes</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Notes privées prises pendant les leçons.
        </p>
      </div>

      {notes.length === 0 ? (
        <div className="ui-card border-dashed p-6 text-center">
          <p className="font-display font-semibold text-ink">Aucune note pour le moment</p>
          <p className="mt-2 text-sm text-ink-muted">
            Ouvrez une leçon pour prendre des notes pendant le visionnage.
          </p>
          <Link
            href="/app/catalogue"
            className="mt-4 inline-flex h-10 items-center rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Aller au catalogue
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="ui-card p-4">
              <p className="whitespace-pre-wrap text-sm text-ink">{note.content}</p>
              <p className="mt-2 text-xs text-ink-muted">
                Mis à jour le {new Date(note.updatedAt).toLocaleString("fr-FR")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
