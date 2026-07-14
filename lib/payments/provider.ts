import { SandboxPaymentProvider } from "@/lib/payments/sandbox-provider";
import { assertSandboxPaymentsAllowed } from "@/lib/launch/safety";
import type { PaymentProvider } from "@/types/payments";

export function getPaymentProvider(): PaymentProvider {
  const name = (process.env.PAYMENT_PROVIDER ?? "sandbox").toLowerCase();

  switch (name) {
    case "sandbox":
    case "":
      assertSandboxPaymentsAllowed("getPaymentProvider");
      return new SandboxPaymentProvider();
    default:
      // Brancher ici CinetPay / PayDunya / Flutterwave / Wave après choix PSP.
      // Voir docs/PAYMENTS_PRODUCTION.md
      throw new Error(
        `Payment provider "${name}" is not configured yet. Use PAYMENT_PROVIDER=sandbox in non-production, or implement the provider adapter.`,
      );
  }
}

