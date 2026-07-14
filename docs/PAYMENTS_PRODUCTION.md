# Paiements production (Mobile Money)

## État actuel

- Fournisseur actif par défaut : **sandbox** (simulation locale)
- Activation d’abonnement **uniquement** via webhook serveur idempotent
- En production : sandbox **interdit** sauf `ALLOW_SANDBOX_IN_PRODUCTION=true`

## Choisir un PSP (Côte d’Ivoire)

Options courantes à évaluer : CinetPay, PayDunya, Flutterwave, Wave, etc.

Critères : Mobile Money CI, webhooks fiables, docs API, frais, KYC.

## Brancher un nouveau provider

1. Implémenter `PaymentProvider` dans `lib/payments/<psp>-provider.ts`
   - `initializePayment`
   - `verifyPayment`
   - `parseWebhook` (signature HMAC / secret)
   - `refundPayment` (si dispo)
2. Enregistrer dans `lib/payments/provider.ts` (`switch`)
3. Variables :
   - `PAYMENT_PROVIDER=<psp>`
   - `PAYMENT_PUBLIC_KEY` / `PAYMENT_SECRET_KEY`
   - `PAYMENT_WEBHOOK_SECRET`
4. Configurer l’URL webhook chez le PSP :
   - `POST /api/webhooks/payments/<psp>`
5. Tester en sandbox PSP puis bascule live

## Soft-launch sans PSP

Utiliser le parcours **Mobile Money + WhatsApp** décrit dans [`MANUAL_PAYMENTS.md`](./MANUAL_PAYMENTS.md) :
l’admin confirme manuellement et active l’abonnement 30 jours.
