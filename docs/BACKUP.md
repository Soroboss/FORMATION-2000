# Sauvegardes & restauration

## Base InsForge

Exporter le schéma / données :

```bash
cd "/chemin/vers/learnoon-academy"
npx @insforge/cli whoami
npx @insforge/cli current
npx @insforge/cli db export --output "backups/learnoon-$(date +%Y%m%d-%H%M%S).sql"
```

Restaurer (environnement de secours uniquement — **jamais** sur prod sans validation) :

```bash
npx @insforge/cli db import backups/learnoon-YYYYMMDD-HHMMSS.sql
```

## Contenu applicatif

- Code source : GitHub (branches protégées, tags de version)
- Migrations versionnées dans `migrations/`
- Ne jamais committer `.env.local`, `.insforge/`, ni dumps avec données personnelles

## Vérification

1. Restaurer un dump sur un projet InsForge de staging / branch
2. Lancer `npm run check`
3. Vérifier `GET /api/health`
4. Smoke test : connexion, catalogue, paiement sandbox

## Conservation (MVP)

- Dumps locaux hors dépôt, chiffrés si possible
- Fréquence recommandée : avant chaque migration majeure + hebdomadaire
- Rotation : conserver au moins les 4 dernières sauvegardes
