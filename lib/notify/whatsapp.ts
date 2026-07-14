/**
 * WhatsApp Cloud API (Meta) — optional outbound channel.
 * Without WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID, sends are skipped (in-app/email still work).
 */

export type WhatsAppSendResult =
  | { ok: true; messageId?: string }
  | { ok: false; reason: string };

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Normalize CI / international numbers to E.164 digits without +. */
export function normalizeWhatsAppRecipient(phone: string): string | null {
  let digits = digitsOnly(phone);
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith("0")) {
    digits = `225${digits}`;
  }
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

export function isWhatsAppOutboundConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID,
  );
}

export async function sendWhatsAppText(input: {
  to: string;
  body: string;
}): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    return { ok: false, reason: "whatsapp_unconfigured" };
  }

  const to = normalizeWhatsAppRecipient(input.to);
  if (!to) return { ok: false, reason: "invalid_phone" };

  const body = input.body.trim().slice(0, 4000);
  if (!body) return { ok: false, reason: "empty_body" };

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { preview_url: false, body },
      }),
    });

    const json = (await res.json().catch(() => ({}))) as {
      messages?: Array<{ id?: string }>;
      error?: { message?: string };
    };

    if (!res.ok) {
      const reason = json.error?.message ?? `http_${res.status}`;
      console.error(
        JSON.stringify({ level: "warn", msg: "whatsapp_send_failed", error: reason }),
      );
      return { ok: false, reason };
    }

    return { ok: true, messageId: json.messages?.[0]?.id };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(
      JSON.stringify({ level: "warn", msg: "whatsapp_send_exception", error: reason }),
    );
    return { ok: false, reason };
  }
}
