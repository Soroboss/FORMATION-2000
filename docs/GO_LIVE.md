# Go-live — Learnoon Academy

Checklist avant bascule production.

## 1. Comptes & infra

- [ ] Projet InsForge lié (`npx @insforge/cli current`)
- [ ] Migrations 1→7 appliquées (`db import` ou migrations CLI)
- [ ] Projet Vercel créé, repo GitHub connecté
- [ ] Domaine custom + HTTPS
- [ ] Au moins un compte `super_admin` (voir `docs/PHASE5.md`)

## 2. Variables d’environnement (Vercel Production)

```bash
NEXT_PUBLIC_APP_URL=https://votre-domaine.ci
NEXT_PUBLIC_APP_NAME=Learnoon Academy
NEXT_PUBLIC_APP_SHORT_NAME=Learnoon
NEXT_PUBLIC_INSFORGE_URL=https://….insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=anon_…
INSFORGE_SERVICE_KEY=ik_…
PAYMENT_PROVIDER=sandbox   # ou le PSP réel une fois branché
PAYMENT_WEBHOOK_SECRET=…   # fort, unique
# ALLOW_SANDBOX_IN_PRODUCTION=true   # uniquement soft-launch explicite
```

- [ ] Aucun secret dans le repo
- [ ] Preview vs Production séparés

## 3. Auth InsForge

- [ ] Redirect URLs autorisées : `/connexion`, `/api/auth/callback`, domaine prod
- [ ] E-mail de reset testé

## 4. Paiements

- [ ] Soft-launch sandbox **ou** PSP réel documenté dans `PAYMENTS_PRODUCTION.md`
- [ ] Webhook URL configurée côté PSP : `/api/webhooks/payments/[provider]`
- [ ] Test : paiement OK → abo 30 j ; échec → aucun accès ; double webhook → une activation

## 5. Contenu

- [ ] Catégories / formations publiées
- [ ] Leçons aperçu gratuites OK
- [ ] Crédits YouTube visibles

## 6. Vérifications

```bash
curl -s https://votre-domaine.ci/api/health | jq
npm run check   # en CI
```

- [ ] Health `ok: true`, `phase: 10`
- [ ] Parcours smoke (`SMOKE_TESTS.md`)
- [ ] Backup initial (`BACKUP.md`)

## 7. Après déploiement

- [ ] Tag Git `v1.0.0-launch`
- [ ] Monitoring Vercel Analytics / Speed Insights
- [ ] Canal support surveillé (`/app/support` + e-mail)
