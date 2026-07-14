# Phase 3 — Abonnement et paiement

## Livré

- Tables : `plans`, `subscriptions`, `payments`, `payment_events`
- Plan seed : Accès mensuel 2 000 XOF / 30 jours
- Interface `PaymentProvider` + fournisseur **sandbox**
- Initialisation paiement (server action + `POST /api/payments/initialize`)
- Webhook idempotent `POST /api/webhooks/payments/[provider]`
- Simulation sandbox authentifiée `POST /api/payments/sandbox/simulate`
- Activation / renouvellement serveur uniquement (jamais via redirect client)
- Pages : `/paiement`, `/paiement/sandbox`, `/paiement/succes`, `/paiement/echec`
- Espace app : `/app/abonnement`, `/app/paiements`
- `canAccessPremiumContent` lit les abonnements actifs

## Variables

```bash
PAYMENT_PROVIDER=sandbox
PAYMENT_WEBHOOK_SECRET=change-me
INSFORGE_SERVICE_KEY=...   # obligatoire pour écrire paiements / abonnements
```

## Règles

- Double webhook → une seule activation
- Abonnement actif → `nouvelle_fin = ends_at + 30j`
- Abonnement expiré → `nouvelle_fin = confirmed_at + 30j`
- Paiement échoué → aucun accès

## Hors scope

Branchements Mobile Money réels (CinetPay / PayDunya / Flutterwave / Wave…), factures fiscales, renouvellement automatique.
