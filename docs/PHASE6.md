# Phase 6 — Qualité

## Livré

### Responsive
- Menu mobile public (`MobileNav`) avec `aria-expanded` / labels
- Cibles tactiles ≥ 40px sur actions header
- Nav admin / apprenant scrollable horizontalement sur mobile

### Accessibilité
- Lien « Aller au contenu »
- `lang="fr"`, focus visible global
- `aria-label` sur navigations
- Pages `error` / `not-found` / `loading` avec messages lisibles

### Sécurité
- En-têtes : CSP (YouTube + InsForge + Vercel), HSTS, `X-Frame-Options`, `nosniff`, Permissions-Policy
- Rate limiting soft (auth mutations + APIs paiement/webhook/auth)
- `x-request-id` sur réponses middleware
- `safeInternalPath` (anti open-redirect) déjà en place + tests
- Cookies auth httpOnly / Secure en prod / SameSite=Lax

### Tests
- Unitaires CSP, rate-limit, redaction logs, redirections

### Performance / monitoring
- Analytics + Speed Insights (déjà)
- Health check `/api/health` (phase 6 + checks config)
- Logs structurés JSON (`lib/observability/log.ts`) sans secrets

### Sauvegarde
Voir [`docs/BACKUP.md`](./BACKUP.md).

## Hors scope Phase 6

E2E Playwright complets, WAF, rate-limit distribué Redis, antivirus uploads, attestation PDF (Phase 7).
