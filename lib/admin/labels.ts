/** Libellés FR pour l’espace admin (affichage uniquement). */

const COURSE_STATUS: Record<string, string> = {
  draft: "Brouillon",
  in_review: "En revue",
  published: "Publié",
  archived: "Archivé",
};

const ACCESS_TYPE: Record<string, string> = {
  free: "Gratuit",
  subscription: "Abonnement",
  purchase: "Achat",
};

const MEMBER_STATUS: Record<string, string> = {
  active: "Actif",
  suspended: "Suspendu",
  deleted: "Supprimé",
};

const SUBSCRIPTION_STATUS: Record<string, string> = {
  active: "Actif",
  expired: "Expiré",
  canceled: "Annulé",
  pending: "En attente",
  inactive: "Inactif",
};

const PAYMENT_STATUS: Record<string, string> = {
  pending: "En attente",
  initiated: "Initié",
  confirmed: "Confirmé",
  failed: "Échoué",
  refunded: "Remboursé",
  cancelled: "Annulé",
};

const SUBMISSION_STATUS: Record<string, string> = {
  pending: "À revoir",
  submitted: "Soumis",
  approved: "Validé",
  rejected: "Refusé",
  needs_changes: "À corriger",
};

const ROLE_LABEL: Record<string, string> = {
  learner: "Apprenant",
  curator: "Curateur",
  instructor: "Formateur",
  support: "Support",
  admin: "Administrateur",
  super_admin: "Super admin",
};

const LESSON_TYPE: Record<string, string> = {
  youtube: "Vidéo",
  text: "Texte",
  exercise: "Exercice",
  quiz: "Quiz",
  assignment: "Exercice",
  resource: "Ressource",
  project: "Projet",
};

function label(map: Record<string, string>, value: string | null | undefined): string {
  if (!value) return "—";
  return map[value] ?? value;
}

export function courseStatusLabel(value: string) {
  return label(COURSE_STATUS, value);
}

export function accessTypeLabel(value: string) {
  return label(ACCESS_TYPE, value);
}

export function memberStatusLabel(value: string) {
  return label(MEMBER_STATUS, value);
}

export function subscriptionStatusLabel(value: string) {
  return label(SUBSCRIPTION_STATUS, value);
}

export function paymentStatusLabel(value: string) {
  return label(PAYMENT_STATUS, value);
}

export function submissionStatusLabel(value: string) {
  return label(SUBMISSION_STATUS, value);
}

export function roleLabel(value: string) {
  return label(ROLE_LABEL, value);
}

export function lessonTypeLabel(value: string) {
  return label(LESSON_TYPE, value);
}

export function statusTone(
  value: string,
): "neutral" | "success" | "warning" | "danger" | "info" {
  if (["published", "active", "confirmed", "approved"].includes(value)) return "success";
  if (["draft", "pending", "initiated", "in_review", "submitted", "needs_changes"].includes(value))
    return "warning";
  if (["failed", "rejected", "deleted", "canceled", "cancelled", "suspended"].includes(value))
    return "danger";
  if (["subscription", "free", "purchase"].includes(value)) return "info";
  return "neutral";
}
