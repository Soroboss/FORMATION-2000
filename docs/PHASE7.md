# Phase 7 — Lancement

## Livré

- Migration : `certificates`, `support_tickets`
- Attestations internes à 100 % de progression (`/app/certificats`, vérification publique `/attestation/[token]`)
- Support simple apprenant (`/app/support`)
- Garde-fous production : sandbox bloqué en prod (sauf `ALLOW_SANDBOX_IN_PRODUCTION=true`)
- Simulation paiement interdite en production réelle
- Health check phase 7 + readiness
- `robots.ts` / `sitemap.ts`
- Docs : `GO_LIVE.md`, `PAYMENTS_PRODUCTION.md`, `SMOKE_TESTS.md`

## Paiements réels

Le branchement Mobile Money (CinetPay / PayDunya / Flutterwave / Wave…) **n’est pas activé** tant que le PSP n’est pas choisi et les clés fournies.
Voir [`PAYMENTS_PRODUCTION.md`](./PAYMENTS_PRODUCTION.md).

## Mise en prod

Suivre [`GO_LIVE.md`](./GO_LIVE.md) puis [`SMOKE_TESTS.md`](./SMOKE_TESTS.md).

## Migration

```bash
npx @insforge/cli db import migrations/20260714090000_phase7_launch.sql
```
