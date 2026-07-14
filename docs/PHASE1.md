# Phase 1 — Décisions techniques

## Architecture

- Auth **SSR-first** via `@insforge/sdk` (`isServerMode: true`) + cookies httpOnly.
- Pas de `@insforge/react` / `@insforge/nextjs` (dépréciés).
- Tailwind **3.4** (contrainte InsForge / skill).
- Rôles en tables SQL + helpers TypeScript (`lib/permissions/roles.ts`).
- Middleware Edge : présence de cookies uniquement ; autorisation fine côté serveur (layouts / session).

## Observabilité (baseline)

- `@vercel/analytics` + `@vercel/speed-insights` dans le layout racine.
- Logs JSON structurés sur `/api/health`, `/api/auth/callback`, `/api/auth/refresh`.

## Variables

Voir `.env.example`. Aucune clé secrète n’est commitée.

## Migration

`migrations/20260713220000_phase1_foundations.sql`

Tables : `profiles`, `roles`, `user_roles`, `permissions`, `role_permissions`, `audit_logs`, `app_settings`.

Trigger `on_auth_user_created` → profil + rôle `learner`.

## Hors scope Phase 1

Paiements, catalogue, YouTube, progression, quiz, CRUD admin complet.
