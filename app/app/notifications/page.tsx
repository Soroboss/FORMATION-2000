import Link from "next/link";
import { redirect } from "next/navigation";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/server/actions/notifications";
import { getSession } from "@/lib/auth/session";
import { listNotificationsForUser } from "@/server/repositories/notifications";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/notifications");
  }

  const notifications = await listNotificationsForUser(session.user.id);
  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <section className="space-y-6">
      <div className="ui-card flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Notifications</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {unread > 0
              ? `${unread} non lue${unread > 1 ? "s" : ""}`
              : "Toutes vos alertes sont à jour."}
          </p>
        </div>
        {unread > 0 ? (
          <form action={markAllNotificationsReadAction}>
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-brand border border-canvas-border px-4 text-sm font-semibold text-ink hover:bg-canvas"
            >
              Tout marquer comme lu
            </button>
          </form>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <div className="ui-card border-dashed p-6 text-center">
          <p className="font-display font-semibold text-ink">Aucune notification</p>
          <p className="mt-2 text-sm text-ink-muted">
            Les validations de paiement, exercices et réponses support apparaîtront ici.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`ui-card p-4 sm:p-5 ${n.readAt ? "opacity-80" : "ring-1 ring-brand-200"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    {new Date(n.createdAt).toLocaleString("fr-FR")}
                    {!n.readAt ? " · Nouveau" : ""}
                  </p>
                  <h2 className="mt-1 font-semibold text-ink">{n.title}</h2>
                  <p className="mt-1 text-sm text-ink-muted whitespace-pre-wrap">{n.message}</p>
                  {n.actionUrl ? (
                    <Link
                      href={n.actionUrl}
                      className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline"
                    >
                      Ouvrir
                    </Link>
                  ) : null}
                </div>
                {!n.readAt ? (
                  <form action={markNotificationReadAction}>
                    <input type="hidden" name="notificationId" value={n.id} />
                    <button
                      type="submit"
                      className="text-sm font-semibold text-brand-600 hover:underline"
                    >
                      Marquer lu
                    </button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
