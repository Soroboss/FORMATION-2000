"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function SandboxCheckoutClient({
  internalReference,
  providerReference,
  amount,
  currency,
  webhookSecretConfigured,
}: {
  internalReference: string;
  providerReference: string;
  amount: string;
  currency: string;
  webhookSecretConfigured: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"success" | "failed" | null>(null);

  async function simulate(status: "successful" | "failed") {
    setError(null);
    setLoading(status === "successful" ? "success" : "failed");

    try {
      const response = await fetch("/api/payments/sandbox/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internalReference,
          providerReference,
          status,
          amount: Number(amount),
          currency,
        }),
      });

      const json = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) {
        throw new Error(json.error?.message ?? "Simulation impossible");
      }

      router.push(
        status === "successful"
          ? `/paiement/succes?ref=${encodeURIComponent(internalReference)}`
          : `/paiement/echec?ref=${encodeURIComponent(internalReference)}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de simulation");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {!webhookSecretConfigured ? (
        <Alert variant="error">
          Configurez `INSFORGE_SERVICE_KEY` dans `.env.local` pour activer la simulation.
        </Alert>
      ) : null}
      {error ? <Alert variant="error">{error}</Alert> : null}
      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={!webhookSecretConfigured || loading !== null}
        onClick={() => void simulate("successful")}
      >
        {loading === "success" ? "Confirmation…" : "Simuler un paiement réussi"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        disabled={!webhookSecretConfigured || loading !== null}
        onClick={() => void simulate("failed")}
      >
        {loading === "failed" ? "Échec…" : "Simuler un échec"}
      </Button>
      <p className="text-xs text-slate-500">
        La redirection « succès » seule n&apos;active jamais l&apos;abonnement — seul le traitement
        serveur (webhook / simulation) le fait, de façon idempotente.
      </p>
    </div>
  );
}
