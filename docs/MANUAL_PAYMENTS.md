# Paiement manuel Mobile Money + WhatsApp

## Parcours apprenant

1. `/paiement` ou `/paiement/echec` → bouton **Payer par Mobile Money (WhatsApp)**
2. Page `/paiement/manuel` : numéros, bouton WhatsApp (capture), formulaire de déclaration
3. Statut de la demande visible sur la même page

## Parcours admin

1. Menu **Paiements WhatsApp** (`/admin/paiements-manuels`)
2. Vérifier la capture reçue sur WhatsApp
3. **Approuver** → paiement `manual` + abonnement 30 jours activé
4. **Refuser** → demande fermée sans accès

## Configuration (`.env.local`)

```bash
MANUAL_PAYMENT_WHATSAPP=22507XXXXXXXX
MANUAL_PAYMENT_ORANGE=07 XX XX XX XX
MANUAL_PAYMENT_MTN=05 XX XX XX XX
MANUAL_PAYMENT_WAVE=01 XX XX XX XX
```

Ou via `app_settings` clé `manual_payment.config` (admin Paramètres).

## Migration

```bash
npx @insforge/cli db import migrations/20260714093000_manual_payments.sql
```
