import { tryCreateInsForgeServerClient } from "@/lib/insforge/server";

export type EmailSendResult =
  | { ok: true; id?: string; skipped?: string[] }
  | { ok: false; reason: string };

/**
 * Transactional email via InsForge (AWS SES tenant). No SMTP / Resend / SendGrid.
 * Requires a paid InsForge plan for on-demand sends; failures are soft.
 */
export async function sendTransactionalEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<EmailSendResult> {
  const client = tryCreateInsForgeServerClient();
  if (!client) {
    return { ok: false, reason: "insforge_unconfigured" };
  }

  const replyTo =
    input.replyTo ??
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ??
    process.env.EMAIL_REPLY_TO ??
    undefined;

  try {
    const { data, error } = await client.emails.send({
      to: input.to,
      subject: input.subject.slice(0, 500),
      html: input.html,
      from: process.env.NEXT_PUBLIC_APP_NAME ?? "Learnoon Academy",
      ...(replyTo ? { replyTo } : {}),
    });

    if (error) {
      console.error(
        JSON.stringify({
          level: "warn",
          msg: "email_send_failed",
          error: error.message,
        }),
      );
      return { ok: false, reason: error.message };
    }

    const payload = data as { id?: string; skipped?: string[] } | null;

    return {
      ok: true,
      id: payload?.id,
      skipped: payload?.skipped,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(
      JSON.stringify({ level: "warn", msg: "email_send_exception", error: reason }),
    );
    return { ok: false, reason };
  }
}

export function renderNotificationEmailHtml(input: {
  title: string;
  message: string;
  actionUrl?: string | null;
  appName?: string;
}): string {
  const appName = input.appName ?? process.env.NEXT_PUBLIC_APP_NAME ?? "Learnoon Academy";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://learnoon-academy.vercel.app";
  const action = input.actionUrl
    ? input.actionUrl.startsWith("http")
      ? input.actionUrl
      : `${appUrl}${input.actionUrl.startsWith("/") ? "" : "/"}${input.actionUrl}`
    : null;

  return `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f6f4ef;font-family:Georgia,serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e7e2d6;border-radius:12px;padding:28px;">
          <tr><td style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#b45309;">${escapeHtml(appName)}</td></tr>
          <tr><td style="padding-top:12px;font-size:22px;font-weight:700;">${escapeHtml(input.title)}</td></tr>
          <tr><td style="padding-top:14px;font-size:16px;line-height:1.55;color:#333;">${escapeHtml(input.message)}</td></tr>
          ${
            action
              ? `<tr><td style="padding-top:22px;"><a href="${escapeHtml(action)}" style="display:inline-block;background:#c2410c;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;">Ouvrir</a></td></tr>`
              : ""
          }
          <tr><td style="padding-top:28px;font-size:12px;color:#888;">Message automatique — ne pas répondre si vous n'avez pas de question.</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
