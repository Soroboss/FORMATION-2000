import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Award,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  LifeBuoy,
  MessageCircle,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/server/actions/notifications";
import { getSession } from "@/lib/auth/session";
import { listNotificationsForUser } from "@/server/repositories/notifications";
import { PageHeader } from "@/components/app/page-header";
import { ActionFlash } from "@/components/ui/action-flash";

const NOTIF_VISUAL: Record<string, { icon: LucideIcon; badge: string }> = {
  certificate_issued: { icon: Award, badge: "bg-action-50 text-action-600" },
  subscription_activated: { icon: CreditCard, badge: "bg-progress-50 text-progress-600" },
  project_reviewed: { icon: ClipboardCheck, badge: "bg-brand-50 text-brand-600" },
  support_update: { icon: LifeBuoy, badge: "bg-brand-50 text-brand-600" },
  support_reply: { icon: MessageCircle, badge: "bg-brand-50 text-brand-600" },
  payment_approved: { icon: CheckCircle2, badge: "bg-progress-50 text-progress-600" },
  payment_rejected: { icon: XCircle, badge: "bg-danger-50 text-danger-700" },
};

function visualFor(type: string) {
  return NOTIF_VISUAL[type] ?? { icon: Bell, badge: "bg-brand-50 text-brand-600" };
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const flash = await searchParams;
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/notifications");
  }

  const notifications = await listNotificationsForUser(session.user.id);
  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <section className="space-y-6">
      <ActionFlash ok={flash.ok} error={flash.error} />
      <PageHeader
        icon={Bell}
        title="Notifications"
        subtitle={
          unread > 0
            ? `${unread} non lue${unread > 1 ? "s" : ""} · paiements, exercices et support`
            : "Toutes vos alertes sont à jour."
        }
        action={
          unread > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <input type="hidden" name="returnTo" value="/app/notifications" />
              <button
                type="submit"
                className="inline-flex h-10 items-center rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-brand-50"
              >
                Tout marquer lu
              </button>
            </form>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <div className="ui-card border-dashed p-6 text-center sm:p-8">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Bell className="h-6 w-6" strokeWidth={2} aria-hidden />
          </span>
          <p className="font-display font-semibold text-ink">Aucune notification</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            Les validations de paiement, les exercices corrigés et les réponses du support
            apparaîtront ici.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => {
            const { icon: Icon, badge } = visualFor(n.type);
            const isUnread = !n.readAt;
            return (
              <li
                key={n.id}
                className={`ui-card p-4 sm:p-5 ${isUnread ? "ring-1 ring-brand-300" : ""}`}
              >
                <div className="flex gap-3 sm:gap-4">
                  <span
                    className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-soft ${badge}`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                    {isUnread ? (
                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-brand-600 ring-2 ring-canvas-card" />
                    ) : null}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h2 className="font-semibold text-ink">{n.title}</h2>
                      {isUnread ? (
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                          Nouveau
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-ink-muted">{formatDate(n.createdAt)}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">{n.message}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      {n.actionUrl ? (
                        <Link
                          href={n.actionUrl}
                          className="text-sm font-semibold text-brand-600 hover:underline"
                        >
                          Ouvrir
                        </Link>
                      ) : null}
                      {isUnread ? (
                        <form action={markNotificationReadAction}>
                          <input type="hidden" name="notificationId" value={n.id} />
                          <input type="hidden" name="returnTo" value="/app/notifications" />
                          <button
                            type="submit"
                            className="text-sm font-semibold text-ink-muted hover:text-ink hover:underline"
                          >
                            Marquer lu
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
