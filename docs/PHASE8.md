# Phase 8 — Favicon universel + polish go-live

## Livré

- Icônes **carrées** générées depuis `public/brand/logo-mark.png` (script `npm run icons:generate`)
- `app/icon.png` (512×512), `app/apple-icon.png` (180×180), `app/favicon.ico` + `public/favicon.ico`
- `public/brand/icon-512.png` / `icon-180.png` (référence brand)
- `app/opengraph-image.png` (1200×630) pour partages WhatsApp / réseaux
- `app/manifest.ts` (PWA légère : thème `#2563EB`, fond `#F8FAFC`)
- Metadata `icons` dans `app/layout.tsx` — plus de PNG paysage en favicon

## Génération

```bash
npm run icons:generate
# = node scripts/generate-brand-icons.mjs
```

Relancer après toute mise à jour du mark source (`logo-mark.png`).

## Hors scope

- PSP Mobile Money réel → Phase 9 (`docs/PAYMENTS_PRODUCTION.md`)
- Édition profil / notifications
- Enrichissement massif du catalogue
