export type ManualPaymentContact = {
  label: string;
  number: string;
  name?: string;
};

export type ManualPaymentConfig = {
  enabled: boolean;
  whatsapp: string;
  whatsappMessage: string;
  contacts: ManualPaymentContact[];
  instructions: string;
};

const DEFAULT_CONFIG: ManualPaymentConfig = {
  enabled: true,
  whatsapp: "",
  whatsappMessage:
    "Bonjour, j'ai payé mon abonnement Learnoon Academy (2 000 FCFA). Voici la capture d'écran.",
  contacts: [],
  instructions:
    "1) Payez 2 000 FCFA via Mobile Money aux numéros ci-dessous.\n2) Envoyez la capture sur WhatsApp.\n3) Remplissez le formulaire.\n4) Après vérification, votre accès est activé.",
};

function parseContactsFromEnv(): ManualPaymentContact[] {
  const contacts: ManualPaymentContact[] = [];
  if (process.env.MANUAL_PAYMENT_ORANGE) {
    contacts.push({
      label: "Orange Money",
      number: process.env.MANUAL_PAYMENT_ORANGE,
      name: process.env.MANUAL_PAYMENT_ORANGE_NAME ?? "Learnoon Academy",
    });
  }
  if (process.env.MANUAL_PAYMENT_MTN) {
    contacts.push({
      label: "MTN MoMo",
      number: process.env.MANUAL_PAYMENT_MTN,
      name: process.env.MANUAL_PAYMENT_MTN_NAME ?? "Learnoon Academy",
    });
  }
  if (process.env.MANUAL_PAYMENT_WAVE) {
    contacts.push({
      label: "Wave",
      number: process.env.MANUAL_PAYMENT_WAVE,
      name: process.env.MANUAL_PAYMENT_WAVE_NAME ?? "Learnoon Academy",
    });
  }
  return contacts;
}

/** Merge DB setting (optional) with env fallbacks for WhatsApp / numéros. */
export function resolveManualPaymentConfig(dbValue?: unknown): ManualPaymentConfig {
  const fromDb =
    dbValue && typeof dbValue === "object" ? (dbValue as Partial<ManualPaymentConfig>) : {};

  const envContacts = parseContactsFromEnv();
  const contacts =
    Array.isArray(fromDb.contacts) && fromDb.contacts.length > 0
      ? fromDb.contacts
      : envContacts;

  const whatsapp =
    (typeof fromDb.whatsapp === "string" && fromDb.whatsapp.trim()) ||
    process.env.MANUAL_PAYMENT_WHATSAPP ||
    "";

  return {
    enabled: fromDb.enabled !== false && process.env.MANUAL_PAYMENT_ENABLED !== "false",
    whatsapp: whatsapp.replace(/\D/g, ""),
    whatsappMessage:
      (typeof fromDb.whatsappMessage === "string" && fromDb.whatsappMessage) ||
      process.env.MANUAL_PAYMENT_WHATSAPP_MESSAGE ||
      DEFAULT_CONFIG.whatsappMessage,
    contacts,
    instructions:
      (typeof fromDb.instructions === "string" && fromDb.instructions) ||
      DEFAULT_CONFIG.instructions,
  };
}

export function buildWhatsAppUrl(config: ManualPaymentConfig, extraText?: string): string | null {
  if (!config.whatsapp) return null;
  const text = [config.whatsappMessage, extraText].filter(Boolean).join("\n\n");
  return `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(text)}`;
}
