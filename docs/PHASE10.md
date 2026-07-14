# Phase 10 — Feedback apprenant

## Objectif

Fermer la boucle **admin agit → apprenant voit** sans PSP : notifications in-app, feedback exercices, polish attestations, CTA « Reprendre ».

## Livré

### Notifications in-app
- Migration `migrations/20260714193000_phase10_notifications.sql`
- Repo `server/repositories/notifications.ts`
- Page `/app/notifications` + nav apprenant
- Émissions :
  - paiement manuel approuvé / refusé
  - grant accès admin
  - revue exercice
  - statut support
  - attestation nouvellement émise

### Exercices
- Type `AssignmentSubmission` enrichi (`score`, `reviewComment`, `reviewedAt`)
- `listSubmissionsForUser` + page `/app/projets`
- Feedback visible dans le panel leçon

### Attestations
- Affichage `memberName` / titre (metadata) sur liste et page publique `/attestation/[token]`
- Bouton « Copier le lien de vérification »

### Dashboard
- CTA **Reprendre** via `enrollment.lastLessonId` → `getLessonAppPath`

### Health / docs
- `GET /api/health` → `phase: 10`
- Ce document + `AGENTS.md` / `GO_LIVE.md`

## Hors scope

- CinetPay live (clés PSP) — `docs/PAYMENTS_PRODUCTION.md`
- E-mail / WhatsApp outbound
- PDF / QR attestations
- `support_messages`, cron expiration J-7

## Vérifications

```bash
npm run check
curl -s https://learnoon-academy.vercel.app/api/health | jq .phase
```

Admin traite un paiement / exercice / ticket → apprenant voit `/app/notifications`.
