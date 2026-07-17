"use client";

import { refundPaymentAction } from "@/server/actions/admin-refunds";

export function RefundButton({ paymentId }: { paymentId: string }) {
  return (
    <form
      action={refundPaymentAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Rembourser ce paiement ? L'abonnement lié sera révoqué immédiatement.",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="paymentId" value={paymentId} />
      <button
        type="submit"
        className="text-sm font-semibold text-red-700 hover:text-red-800"
      >
        Rembourser
      </button>
    </form>
  );
}
