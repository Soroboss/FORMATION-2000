import type { FinancePayment } from "@/server/repositories/admin-payments";

/** Statut d'un paiement réellement encaissé. */
export const SETTLED_STATUS = "successful";

export type ProviderBreakdown = {
  provider: string;
  count: number;
  gross: number;
  fees: number;
  net: number;
};

export type MonthBreakdown = {
  month: string; // YYYY-MM
  label: string;
  count: number;
  gross: number;
  fees: number;
  net: number;
};

export type FinanceSummary = {
  currency: string;
  grossTotal: number;
  feesTotal: number;
  netTotal: number;
  settledCount: number;
  failedCount: number;
  pendingCount: number;
  last30Net: number;
  last30Count: number;
  byProvider: ProviderBreakdown[];
  byMonth: MonthBreakdown[];
};

/** Un paiement est encaissé s'il porte le statut `successful` ou une date de confirmation. */
export function isSettled(payment: Pick<FinancePayment, "status" | "confirmedAt">): boolean {
  return payment.status === SETTLED_STATUS || payment.confirmedAt != null;
}

function settledAt(payment: FinancePayment): Date {
  return new Date(payment.confirmedAt ?? payment.initiatedAt);
}

function pickCurrency(payments: FinancePayment[]): string {
  const counts = new Map<string, number>();
  for (const p of payments) {
    counts.set(p.currency, (counts.get(p.currency) ?? 0) + 1);
  }
  let best = "XOF";
  let bestCount = -1;
  for (const [currency, count] of counts) {
    if (count > bestCount) {
      best = currency;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Agrège les paiements en un tableau de bord financier :
 * CA brut, frais PSP, CA net, ventilation par fournisseur et par mois.
 */
export function computeFinanceSummary(
  payments: FinancePayment[],
  now: Date = new Date(),
): FinanceSummary {
  let grossTotal = 0;
  let feesTotal = 0;
  let netTotal = 0;
  let settledCount = 0;
  let failedCount = 0;
  let pendingCount = 0;
  let last30Net = 0;
  let last30Count = 0;

  const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  const providers = new Map<string, ProviderBreakdown>();
  const months = new Map<string, MonthBreakdown>();

  for (const payment of payments) {
    if (payment.status === "failed") failedCount += 1;
    if (payment.status === "pending") pendingCount += 1;
    if (!isSettled(payment)) continue;

    settledCount += 1;
    grossTotal += payment.amount;
    feesTotal += payment.providerFee;
    netTotal += payment.netAmount;

    const at = settledAt(payment);
    if (at.getTime() >= thirtyDaysAgo) {
      last30Net += payment.netAmount;
      last30Count += 1;
    }

    const prov = providers.get(payment.provider) ?? {
      provider: payment.provider,
      count: 0,
      gross: 0,
      fees: 0,
      net: 0,
    };
    prov.count += 1;
    prov.gross += payment.amount;
    prov.fees += payment.providerFee;
    prov.net += payment.netAmount;
    providers.set(payment.provider, prov);

    const monthKey = `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}`;
    const month = months.get(monthKey) ?? {
      month: monthKey,
      label: at.toLocaleDateString("fr-FR", { month: "short", year: "numeric" }),
      count: 0,
      gross: 0,
      fees: 0,
      net: 0,
    };
    month.count += 1;
    month.gross += payment.amount;
    month.fees += payment.providerFee;
    month.net += payment.netAmount;
    months.set(monthKey, month);
  }

  const byProvider = [...providers.values()].sort((a, b) => b.gross - a.gross);
  const byMonth = [...months.values()]
    .sort((a, b) => (a.month < b.month ? 1 : -1))
    .slice(0, 6);

  return {
    currency: pickCurrency(payments),
    grossTotal,
    feesTotal,
    netTotal,
    settledCount,
    failedCount,
    pendingCount,
    last30Net,
    last30Count,
    byProvider,
    byMonth,
  };
}

/** Génère le contenu CSV (séparateur `;`, compatible Excel FR) des paiements. */
export function buildPaymentsCsv(payments: FinancePayment[]): string {
  const header = [
    "reference",
    "statut",
    "fournisseur",
    "montant_brut",
    "frais",
    "montant_net",
    "devise",
    "confirme_le",
    "initie_le",
  ];
  const escape = (value: string | number): string => {
    const str = String(value);
    return /[";\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const rows = payments.map((p) =>
    [
      p.internalReference,
      p.status,
      p.provider,
      p.amount,
      p.providerFee,
      p.netAmount,
      p.currency,
      p.confirmedAt ?? "",
      p.initiatedAt,
    ]
      .map(escape)
      .join(";"),
  );
  return [header.join(";"), ...rows].join("\r\n");
}
