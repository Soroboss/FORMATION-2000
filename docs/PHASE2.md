# Phase 2 — Catalogue

## Livré

- Tables : `categories`, `courses`, `course_categories`, `modules`, `lessons`, `youtube_sources`, `lesson_instructions`
- Seed démo (2 formations, modules, leçons, sources YouTube créditées)
- Pages publiques : `/formations`, `/formations/[slug]`, `/categories`, `/categories/[slug]`
- Espace apprenant : `/app/catalogue`, `/app/formations/[slug]`, `/app/formations/[slug]/lecons/[lessonId]`
- Lecteur YouTube officiel (`YouTubeLessonPlayer`) + bouton « Voir sur YouTube »
- Recherche / filtre niveau
- API : `GET /api/categories`, `GET /api/courses`, `GET /api/courses/[slug]`, `GET /api/courses/[slug]/curriculum`
- Accès premium verrouillé jusqu’à la Phase 3 (aperçus `is_preview` ouverts)

## Migration

`migrations/20260713221000_phase2_catalog.sql`

## Hors scope

Paiements, activation abonnement, progression manuelle persistée, admin CRUD formations.
