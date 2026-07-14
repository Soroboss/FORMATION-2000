import { getSession } from "@/lib/auth/session";
import { listNotesForUser } from "@/server/repositories/learning";

export default async function NotesPage() {
  const session = await getSession();
  if (!session) return null;
  const notes = await listNotesForUser(session.user.id);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Mes notes</h1>
        <p className="mt-1 text-sm text-slate-600">Notes privées prises pendant les leçons.</p>
      </div>
      {notes.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          Aucune note pour le moment.
        </p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="whitespace-pre-wrap text-sm text-slate-800">{note.content}</p>
              <p className="mt-2 text-xs text-slate-500">
                Mis à jour le {new Date(note.updatedAt).toLocaleString("fr-FR")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
