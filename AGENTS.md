# Instructions agents

## Source of truth

- `docs/PRODUCT_SPEC.md`
- migrations de base (`migrations/`)
- documentation officielle InsForge + skills `insforge` / `insforge-cli`
- tests automatisés

## Stack

- Next.js App Router
- TypeScript strict
- Tailwind CSS **v3.4** (ne pas monter en v4)
- InsForge (PostgreSQL, Auth, Storage, fonctions)
- GitHub + Vercel

## Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run check
```

## InsForge

```bash
npx @insforge/cli whoami
npx @insforge/cli login
npx @insforge/cli create   # ou link
npx @insforge/cli current
npx @insforge/cli metadata
npx @insforge/cli secrets get ANON_KEY
npx @insforge/cli db migrations new <name>
npx @insforge/cli db migrations up --all
```

## Mandatory

- TypeScript strict
- no secrets in client or Git
- server-side authorization
- input validation (Zod)
- payment webhook idempotency (Phase 3+)
- audit sensitive admin actions
- mobile-first responsive UI
- run `npm run check` before completion

## Forbidden

- downloading YouTube videos
- bypassing YouTube player requirements
- activating subscriptions from client callbacks
- exposing quiz answers before submission
- editing production data without explicit instruction
- destructive commands without backup and approval
- inventing InsForge APIs
- installing `@insforge/react`, `@insforge/nextjs`, or SMTP packages for auth mail

## Phase discipline

Ne pas implémenter plusieurs phases en une seule demande.
Phase courante : **Phase 8 — Favicon universel + polish go-live**.
Paiements Mobile Money réels : à brancher après choix du PSP (`docs/PAYMENTS_PRODUCTION.md`) — Phase 9.
Ne jamais activer un abonnement depuis une redirection client seule.
Ne jamais simuler un paiement réussi en production Vercel.
