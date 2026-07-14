# Smoke tests utilisateurs (lancement)

Exécuter manuellement sur preview puis production.

| # | Scénario | Attendu |
|---|----------|---------|
| 1 | Inscription → connexion | Session + profil |
| 2 | Catalogue public | Formations publiées listées |
| 3 | Aperçu leçon gratuite | Lecteur YouTube + crédits |
| 4 | Leçon premium sans abo | Verrouillée |
| 5 | Paiement sandbox (non-prod) | Webhook → abo 30 j |
| 6 | Paiement échoué | Aucun accès |
| 7 | Double webhook | Une seule activation |
| 8 | Terminer toutes les leçons requises | Progression 100 % + attestation |
| 9 | Vérifier `/attestation/[token]` | Page publique valide |
| 10 | Ticket `/app/support` | Ticket visible |
| 11 | Membre → `/admin` | Redirigé hors admin |
| 12 | Admin → CRUD formation | Création / publication OK |
| 13 | Mobile | Menu, lecture, paiement utilisables |
| 14 | `/api/health` | `ok: true`, phase 8 |

Cocher et conserver la date + environnement (preview / prod).
