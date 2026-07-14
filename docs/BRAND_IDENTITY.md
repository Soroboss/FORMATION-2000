# Identité visuelle — Learnoon Academy

> Source de vérité design pour l’UI. Palette, typo, composants et ton.

## Positionnement

Plateforme d’apprentissage en ligne nouvelle génération qui démocratise l’accès aux meilleures formations grâce à un abonnement simple, abordable et accessible à tous.

**Représente :** apprentissage continu · réussite professionnelle · montée en compétences · tech au service de l’éducation · excellence accessible.

## Palette

| Rôle | Nom | Hex | Usage |
|------|-----|-----|--------|
| Primaire | Learnoon Blue | `#2563EB` | Logo, CTA, liens, icônes |
| Secondaire | Success Orange | `#F59E0B` | Promos, badges, nouveautés |
| Accent | Growth Green | `#22C55E` | Progression, validation, certifs |
| Texte | Ink | `#111827` | Titres, menus, texte principal |
| Fond UI | Canvas | `#F8FAFC` | Fond général |
| Carte | White | `#FFFFFF` | Cartes, surfaces |
| Bordure | | `#E5E7EB` | Contours, track progress |
| Texte secondaire | | `#6B7280` | Métadonnées, aide |
| Erreur | | `#EF4444` | Alertes erreur |
| Info | | `#0EA5E9` | Messages info |

Tokens Tailwind : `brand`, `action`, `progress`, `ink`, `canvas`, `danger`, `info`.

## Typographie

- **Titres :** Poppins 600 / 700 (`font-display`)
- **Corps :** Inter 400 / 500 (`font-sans`)

## Composants

- **Bouton principal :** fond `#2563EB`, hover `#1D4ED8`, radius `14px` (`rounded-brand`)
- **Bouton secondaire :** transparent, bordure + texte bleu
- **Cartes :** fond blanc, radius `16px` (`rounded-card`), ombre `shadow-card`
- **Progression :** track `#E5E7EB`, fill `#22C55E` (classes `.progress-bar` / `.progress-bar-fill`)
- **Badges niveau :** Débutant bleu · Intermédiaire orange · Expert vert

## Style

Minimaliste, premium, tech, épuré · beaucoup d’espace blanc · ombres légères · animations fluides (`ease-brand`) · icônes outline 2px (Lucide).

## Slogan principal

**Apprends aujourd’hui. Réussis demain.**

## Ton

Simple · professionnel · motivant · accessible · inspirant · jamais compliqué · toujours positif.

## Fichiers liés

- `tailwind.config.js` — tokens
- `app/globals.css` — variables CSS + utilitaires
- Mark : `/public/brand/logo-mark.png` (favicon / headers)
- Full : `/public/brand/logo-official.png` (auth, hero)
