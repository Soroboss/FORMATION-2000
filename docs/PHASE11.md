# Phase 11 — Outbound, attestations PDF/QR, support fil, cron J-7

## Objectif

Livrer les 4 items hors Phase 10 :

1. E-mail / WhatsApp outbound
2. PDF / QR attestations
3. `support_messages` (fil de discussion)
4. Cron expiration J-7 / J-3 / J-1 + marquage expiré

## Livré

### Outbound
- `lib/notify/email.ts` — `insforge.emails.send` (pas de SMTP)
- `lib/notify/whatsapp.ts` — Meta Cloud API si `WHATSAPP_*` configurés
- `server/services/notify.ts` — fan-out in-app + e-mail + WhatsApp
- Branqué sur paiements manuels, activation accès, review exercices, attestations, support

### Attestations
- `GET /api/attestations/[token]/pdf` — PDF A4 + QR
- `GET /api/attestations/[token]/qr` — PNG QR
- Page publique `/attestation/[token]` et `/app/certificats` mises à jour

### Support
- Migration `support_messages` + backfill du message initial
- UI fil apprenant `/app/support/[id]` et admin `/admin/support/[id]`
- Réponse admin → notification + outbound

### Cron
- `vercel.json` : tous les jours 08:00 UTC → `/api/cron/subscription-reminders`
- Auth `Authorization: Bearer $CRON_SECRET`
- Idempotence via `subscription_reminder_logs`
- Marque `active`/`grace_period` → `expired` si `ends_at` passé

## Variables

```bash
CRON_SECRET=...                 # obligatoire en prod pour le cron
WHATSAPP_ACCESS_TOKEN=...       # optionnel
WHATSAPP_PHONE_NUMBER_ID=...    # optionnel
```

E-mail : InsForge plan payant (sinon soft-fail, in-app reste OK).

## Migration

`migrations/20260714210000_phase11_outbound_support_cron.sql`

```bash
npx @insforge/cli db migrations up --all
```

## Smoke

1. Créer un ticket support → répondre côté admin → apprenant voit le fil + notif
2. Ouvrir `/attestation/{token}` → QR + PDF
3. `curl -H "Authorization: Bearer $CRON_SECRET" https://…/api/cron/subscription-reminders`
4. Health `phase: 11`
