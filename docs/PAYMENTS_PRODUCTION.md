# Paiements production (Mobile Money)

## État actuel

- **Manuel (WhatsApp)** : toujours disponible (`/paiement/manuel`) — validation admin
- **Automatique** : CinetPay (`PAYMENT_PROVIDER=cinetpay`) quand les clés sont configurées
- **Sandbox** : simulateur local uniquement ; **interdit en production** sauf `ALLOW_SANDBOX_IN_PRODUCTION=true` (soft-launch de test — n’activez pas avec de vrais clients)

## Activer le paiement automatique (CinetPay)

1. Créer un compte marchand sur [CinetPay](https://cinetpay.com/)
2. Récupérer :
   - `apikey` → `CINETPAY_API_KEY`
   - `site_id` → `CINETPAY_SITE_ID`
   - clé secrète HMAC (notifications) → `CINETPAY_SECRET_KEY`
3. Sur Vercel (Production) :
   ```bash
   vercel env add PAYMENT_PROVIDER production   # valeur: cinetpay
   vercel env add CINETPAY_API_KEY production
   vercel env add CINETPAY_SITE_ID production
   vercel env add CINETPAY_SECRET_KEY production
   ```
4. Webhook / notify URL à déclarer chez CinetPay :
   - `https://learnoon-academy.vercel.app/api/webhooks/payments/cinetpay`
5. Redeploy, puis tester un paiement Orange Money / MTN / Wave

Tant que les clés manquent, le bouton « Payer 2 000 FCFA » oriente automatiquement vers le parcours **Mobile Money + WhatsApp** (pas d’erreur technique).

## Soft-launch sandbox (tests uniquement)

```bash
vercel env add ALLOW_SANDBOX_IN_PRODUCTION production  # true
# garder PAYMENT_PROVIDER=sandbox
```

⚠️ N’importe qui pourrait alors simuler un paiement réussi. À réserver aux tests internes.

## Brancher un autre PSP

1. Implémenter `PaymentProvider` dans `lib/payments/<psp>-provider.ts`
2. Enregistrer dans `lib/payments/provider.ts`
3. Variables `PAYMENT_PROVIDER=<psp>` + clés
4. Webhook : `POST /api/webhooks/payments/<psp>`
