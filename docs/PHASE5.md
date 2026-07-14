# Phase 5 — Administration

## Livré

- Policies RLS : `course_categories`, `user_roles` (écriture admin), quiz/assignments staff write
- Audit : `writeAuditLog` + page `/admin/journaux`
- Repos admin : catalogue, membres, paiements, stats, settings, soumissions
- Actions serveur + API :
  - `POST/GET /api/admin/courses`
  - `GET/PATCH/DELETE /api/admin/courses/[id]`
  - `POST /api/admin/courses/[id]/publish`
  - `POST /api/admin/youtube/import`
  - `POST /api/admin/subscriptions/[id]/extend`
- Pages : tableau de bord, formations (CRUD + modules/leçons YouTube), catégories, membres, abonnements, paiements, projets, paramètres, audit

## Accès admin

Les pages `/admin` exigent les rôles `support`, `admin` ou `super_admin`.

Après inscription, attribuer un rôle (service SQL) :

```sql
INSERT INTO user_roles (user_id, role_id)
SELECT p.id, r.id
FROM profiles p
CROSS JOIN roles r
WHERE p.email = 'votre@email.com'
  AND r.key = 'super_admin'
ON CONFLICT (user_id, role_id) DO NOTHING;
```

```bash
npx @insforge/cli db query "…sql ci-dessus…"
```

## Migration

```bash
npx @insforge/cli db import migrations/20260713224000_phase5_admin.sql
```

## Hors scope

Coupons, remboursements, notifications, équipe avancée, finance détaillée (Phase 6/7).
