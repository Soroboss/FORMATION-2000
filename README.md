# Learnoon Academy

Plateforme de formation par abonnement (2 000 FCFA / 30 jours) pour la Côte d’Ivoire et l’Afrique francophone.

**Source de vérité :** [`docs/PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md) · [`docs/BRAND_IDENTITY.md`](docs/BRAND_IDENTITY.md) · [`AGENTS.md`](AGENTS.md)

## Stack

- Next.js 15 (App Router) + TypeScript strict
- Tailwind CSS **3.4**
- InsForge (Auth, PostgreSQL, Storage)
- GitHub + Vercel

## Phase 1 (fondations)

- Structure du dépôt et layouts (public, auth, `/app`, `/admin`)
- Authentification SSR InsForge (cookies httpOnly)
- Schéma profils / rôles / permissions / audit / settings
- Middleware de protection des espaces privés
- CI GitHub Actions (`lint`, `typecheck`, `test`, `build`)
- Observabilité de base (Analytics, Speed Insights, logs structurés API)

## Phase 2 (catalogue)

- Catégories, formations, modules, leçons, sources YouTube
- Pages publiques + espace apprenant
- Lecteur YouTube officiel + crédits créateur
- Recherche / filtres + API catalogue
- Aperçus gratuits ; premium verrouillé jusqu’à Phase 3

## Phase 3 (abonnement)

- Plans / subscriptions / payments / payment_events
- Fournisseur sandbox + webhook idempotent
- Activation / renouvellement 30 jours côté serveur
- Pages paiement + historique abonné
- Accès premium basé sur abonnement actif

## Phase 4 (apprentissage)

- Enrollments, progression leçon / formation, notes, favoris
- Quiz simple + exercices (soumission apprenant)
- Pages `/app/mes-formations`, `/app/progression`, `/app/notes`, `/app/favoris`, `/app/projets`
- Panel d’apprentissage sur chaque leçon

## Phase 5 (administration)

- Tableau de bord stats, CRUD formations/catégories/modules/leçons YouTube
- Membres (statut + rôles), abonnements (prolongation), paiements
- Revue exercices, paramètres, journaux d’audit
- API `/api/admin/*` protégées par `requireAdminSession`

## Phase 6 (qualité)

- CSP / en-têtes sécurité, rate limiting, `x-request-id`
- Menu mobile, skip-link, focus visible, pages erreur/404/loading
- Health check enrichi, logs structurés, runbook sauvegarde

## Phase 7 (lancement)

- Attestations internes + vérification publique
- Support tickets apprenant
- Garde-fous production (sandbox), health readiness, robots/sitemap
- Docs go-live / smoke tests / paiements prod

## Phase 8 (favicon + polish go-live)

- Icônes carrées universelles (`favicon.ico`, `icon.png`, apple-touch)
- Open Graph 1200×630 + web app manifest
- Docs brand / `PHASE8.md` — régénération via `npm run icons:generate`

**PSP Mobile Money réel** : non branché tant que le fournisseur n’est pas choisi.

## Démarrage local

```bash
# 1. Installer
npm install

# 2. Authentifier InsForge (interactif)
npx @insforge/cli login
npx @insforge/cli create --json --name learnoon-academy --template blank --region us-east
# ou : npx @insforge/cli link

# 3. Récupérer les clés
npx @insforge/cli secrets get ANON_KEY
# API key / service key : présente dans .insforge/project.json (ne jamais committer)

# 4. Configurer l'environnement
cp .env.example .env.local
# Renseigner NEXT_PUBLIC_INSFORGE_URL, NEXT_PUBLIC_INSFORGE_ANON_KEY, INSFORGE_SERVICE_KEY

# 5. Appliquer la migration Phase 1
npx @insforge/cli db migrations fetch
# Copier/placer le fichier migrations/20260713220000_phase1_foundations.sql si besoin
npx @insforge/cli db migrations up --all

# 6. Lancer
npm run dev
```

## Commandes

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run test` | Tests unitaires Vitest |
| `npm run build` | Build production |
| `npm run check` | lint + typecheck + test + build |

## Architecture (Phase 1)

```text
app/(public)   → site marketing / SEO
app/(auth)     → connexion, inscription, reset
app/app        → espace apprenant (session requise)
app/admin      → back-office (rôles support+)
server/actions → mutations auth côté serveur
lib/insforge   → clients SDK (server / browser)
migrations/    → SQL InsForge versionné
```

Auth : tokens dans cookies httpOnly, pas de secrets dans le navigateur, permissions vérifiées côté serveur.

## Prochaine étape

Suivre [`docs/GO_LIVE.md`](docs/GO_LIVE.md) pour déployer, puis brancher un PSP réel (`docs/PAYMENTS_PRODUCTION.md`).
