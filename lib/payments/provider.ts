import { SandboxPaymentProvider } from "@/lib/payments/sandbox-provider";
import { CinetPayPaymentProvider, isCinetPayConfigured } from "@/lib/payments/cinetpay-provider";
import { assertSandboxPaymentsAllowed } from "@/lib/launch/safety";
import type { PaymentProvider } from "@/types/payments";

export function getPaymentProvider(): PaymentProvider {
  const name = (process.env.PAYMENT_PROVIDER ?? "sandbox").toLowerCase();

  switch (name) {
    case "cinetpay":
      if (!isCinetPayConfigured()) {
        throw new Error(
          "CinetPay non configuré. Ajoutez CINETPAY_API_KEY et CINETPAY_SITE_ID (voir docs/PAYMENTS_PRODUCTION.md).",
        );
      }
      return new CinetPayPaymentProvider();
    case "sandbox":
    case "":
      assertSandboxPaymentsAllowed("getPaymentProvider");
      return new SandboxPaymentProvider();
    default:
      throw new Error(
        `Payment provider "${name}" is not configured yet. Use PAYMENT_PROVIDER=sandbox, cinetpay, or implement the provider adapter.`,
      );
  }
}
