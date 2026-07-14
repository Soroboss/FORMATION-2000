/** Métadonnées d’affichage pour les paramètres admin (clés → libellés FR). */

export type SettingGroupId = "app" | "subscription" | "manual_payment" | "other";

export type SettingFieldKind = "text" | "number" | "textarea" | "json";

export type SettingMeta = {
  key: string;
  group: SettingGroupId;
  label: string;
  description: string;
  kind: SettingFieldKind;
  unit?: string;
};

export const SETTING_GROUPS: {
  id: SettingGroupId;
  title: string;
  description: string;
}[] = [
  {
    id: "app",
    title: "Application",
    description: "Nom, langue et devise affichés sur la plateforme.",
  },
  {
    id: "subscription",
    title: "Abonnement",
    description: "Prix et durée de l’accès payant pour les apprenants.",
  },
  {
    id: "manual_payment",
    title: "Paiement Mobile Money / WhatsApp",
    description:
      "Numéros, message WhatsApp et consignes du paiement manuel (page /paiement/manuel).",
  },
  {
    id: "other",
    title: "Autres paramètres",
    description: "Clés techniques non classées.",
  },
];

export const KNOWN_SETTINGS: SettingMeta[] = [
  {
    key: "app.name",
    group: "app",
    label: "Nom de la plateforme",
    description: "Affiché dans l’interface et les messages.",
    kind: "text",
  },
  {
    key: "app.locale",
    group: "app",
    label: "Langue",
    description: "Code langue (ex. fr).",
    kind: "text",
  },
  {
    key: "app.currency",
    group: "app",
    label: "Devise",
    description: "Code devise (ex. XOF).",
    kind: "text",
  },
  {
    key: "subscription.price_amount",
    group: "subscription",
    label: "Prix de l’abonnement",
    description: "Montant facturé pour un cycle.",
    kind: "number",
    unit: "FCFA",
  },
  {
    key: "subscription.duration_days",
    group: "subscription",
    label: "Durée d’accès",
    description: "Nombre de jours activés après validation du paiement.",
    kind: "number",
    unit: "jours",
  },
  {
    key: "subscription.grace_days",
    group: "subscription",
    label: "Jours de grâce",
    description: "Délai après expiration avant blocage (0 = immédiat).",
    kind: "number",
    unit: "jours",
  },
];

export const MANUAL_PAYMENT_KEY = "manual_payment.config";

export function getSettingMeta(key: string): SettingMeta {
  const known = KNOWN_SETTINGS.find((s) => s.key === key);
  if (known) return known;
  return {
    key,
    group: key === MANUAL_PAYMENT_KEY ? "manual_payment" : "other",
    label: key,
    description: "Paramètre technique",
    kind: "json",
  };
}

export function formatSettingValueForInput(value: unknown, kind: SettingFieldKind): string {
  if (value == null) return "";
  if (kind === "json" || (typeof value === "object" && value !== null)) {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}
