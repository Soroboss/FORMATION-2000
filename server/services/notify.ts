import {
  renderNotificationEmailHtml,
  sendTransactionalEmail,
} from "@/lib/notify/email";
import { sendWhatsAppText } from "@/lib/notify/whatsapp";
import { getAccessToken } from "@/lib/auth/cookies";
import {
  tryCreateInsForgeServerClient,
  tryCreateInsForgeServiceClient,
} from "@/lib/insforge/server";
import { createNotification } from "@/server/repositories/notifications";

export type NotifyChannels = {
  inApp?: boolean;
  email?: boolean;
  whatsapp?: boolean;
};

async function getProfileContact(userId: string): Promise<{
  email: string | null;
  phone: string | null;
  displayName: string | null;
} | null> {
  const client =
    tryCreateInsForgeServiceClient() ??
    tryCreateInsForgeServerClient(await getAccessToken());
  if (!client) return null;

  const { data } = await client.database
    .from("profiles")
    .select("email, phone, display_name, first_name, last_name")
    .eq("id", userId)
    .maybeSingle();

  if (!data) return null;
  const row = data as Record<string, unknown>;
  const first = (row.first_name as string | null) ?? "";
  const last = (row.last_name as string | null) ?? "";
  const composed = `${first} ${last}`.trim();
  return {
    email: (row.email as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    displayName: ((row.display_name as string | null) || composed || null) ?? null,
  };
}

/**
 * Fan-out: in-app notification + optional e-mail (InsForge) + optional WhatsApp (Meta).
 * Soft-fails channels independently so a paid-plan email outage never blocks in-app.
 */
export async function notifyUser(input: {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  channels?: NotifyChannels;
}): Promise<{
  inApp: boolean;
  email: boolean;
  whatsapp: boolean;
}> {
  const channels: Required<NotifyChannels> = {
    inApp: input.channels?.inApp ?? true,
    email: input.channels?.email ?? true,
    whatsapp: input.channels?.whatsapp ?? true,
  };

  const result = { inApp: false, email: false, whatsapp: false };

  if (channels.inApp) {
    const created = await createNotification({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      actionUrl: input.actionUrl,
    });
    result.inApp = Boolean(created);
  }

  if (!channels.email && !channels.whatsapp) {
    return result;
  }

  const contact = await getProfileContact(input.userId);
  if (!contact) return result;

  if (channels.email && contact.email) {
    const sent = await sendTransactionalEmail({
      to: contact.email,
      subject: input.title,
      html: renderNotificationEmailHtml({
        title: input.title,
        message: input.message,
        actionUrl: input.actionUrl,
      }),
    });
    result.email = sent.ok;
  }

  if (channels.whatsapp && contact.phone) {
    const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Learnoon Academy";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const link =
      input.actionUrl && appUrl
        ? `\n${appUrl}${input.actionUrl.startsWith("/") ? "" : "/"}${input.actionUrl}`
        : "";
    const sent = await sendWhatsAppText({
      to: contact.phone,
      body: `${appName}\n${input.title}\n${input.message}${link}`,
    });
    result.whatsapp = sent.ok;
  }

  return result;
}
