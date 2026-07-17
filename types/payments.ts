export type Plan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceAmount: number;
  currency: string;
  durationDays: number;
  isActive: boolean;
  features: string[];
};

export type SubscriptionStatus =
  | "pending"
  | "active"
  | "grace_period"
  | "expired"
  | "cancelled"
  | "suspended"
  | "refunded";

export type PaymentStatus =
  | "initiated"
  | "pending"
  | "successful"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded"
  | "partially_refunded";

export type Subscription = {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startsAt: string | null;
  endsAt: string | null;
  graceEndsAt: string | null;
  cancelledAt: string | null;
  source: string | null;
};

export type Payment = {
  id: string;
  userId: string;
  subscriptionId: string | null;
  planId: string | null;
  provider: string;
  providerReference: string | null;
  internalReference: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string | null;
  confirmedAt: string | null;
  failedAt: string | null;
  initiatedAt: string;
  couponCode: string | null;
  discountAmount: number;
};

export type InitializePaymentInput = {
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  internalReference: string;
  customerEmail: string;
  customerName?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};

export type PaymentSession = {
  provider: string;
  providerReference: string;
  checkoutUrl: string;
  status: PaymentStatus;
};

export type PaymentVerification = {
  providerReference: string;
  status: PaymentStatus;
  amount?: number;
  currency?: string;
  paidAt?: string | null;
  raw?: unknown;
};

export type PaymentWebhookEvent = {
  eventId: string;
  eventType: string;
  providerReference: string;
  internalReference?: string;
  status: PaymentStatus;
  amount?: number;
  currency?: string;
  paidAt?: string | null;
  raw: unknown;
};

export type RefundResult = {
  status: "refunded" | "partially_refunded" | "failed";
  providerReference: string;
};

export interface PaymentProvider {
  readonly name: string;
  initializePayment(input: InitializePaymentInput): Promise<PaymentSession>;
  verifyPayment(reference: string): Promise<PaymentVerification>;
  parseWebhook(request: Request): Promise<PaymentWebhookEvent>;
  refundPayment?(reference: string, amount?: number): Promise<RefundResult>;
}
