# Phase 9 — Ops apprenant & support

## Objectif

Finaliser le parcours quotidien hors PSP : activation d’accès côté admin, édition de profil apprenant, file support admin. Le checkout Mobile Money réel reste optionnel tant que les clés CinetPay ne sont pas fournies.

## Livré

### Admin — activation / prolongation d’accès
- Fiche membre `/admin/membres/[id]` : bloc **Accès formations (premium)**
- Action `activateLearnerAccessAction` → `activateOrExtendSubscription` (plan `acces-mensuel`, source `admin_grant:<adminId>`)
- Audit `member.access.activate`

### Apprenant — édition profil
- `/app/profil` : formulaire prénom, nom, nom affiché, WhatsApp
- Action `updateProfileAction` (Zod + RLS `profiles_update_own`)
- E-mail et abonnement restent en lecture seule / liens dédiés

### Admin — support
- Page `/admin/support` : liste des tickets, changement de statut
- Audit `support.ticket.status`

### Health / docs
- `GET /api/health` → `phase: 9`
- Ce document + mise à jour `AGENTS.md` / `GO_LIVE.md`

## Hors scope (reste Phase 9+)

- Brancher `PAYMENT_PROVIDER=cinetpay` + secrets `CINETPAY_*` (`docs/PAYMENTS_PRODUCTION.md`)
- Notifications push / e-mail outbound hors InsForge Auth
- Enrichissement massif du catalogue

## Vérifications

```bash
npm run check
curl -s https://learnoon-academy.vercel.app/api/health | jq .phase
```

Admin → Membres → fiche → Activer/Prolonger (ex. 30 jours).  
Apprenant → Profil → enregistrer.  
Admin → Support → mettre à jour un ticket.
