# API Agent — Claude Code / scripts

Permet à un agent (Claude Code, script `curl`, etc.) de **créer des formations en brouillon**.  
Tu les relis et tu les **publies** depuis l’admin. Aucune publication automatique.

## Prérequis

1. Variable Vercel / `.env.local` :
   ```bash
   AGENT_API_KEY=une-cle-longue-et-secrete-min-16-caracteres
   INSFORGE_SERVICE_KEY=...   # déjà utilisée pour l’admin/storage
   NEXT_PUBLIC_APP_URL=https://learnoon-academy.vercel.app
   ```
2. Générer une clé : `openssl rand -hex 32`
3. Sur Vercel : Project → Settings → Environment Variables → `AGENT_API_KEY` (Production)

## Endpoints

Base : `https://learnoon-academy.vercel.app`

| Méthode | Chemin | Rôle |
|---------|--------|------|
| `GET` | `/api/agent/categories` | Liste id / slug des catégories |
| `GET` | `/api/agent/courses` | Liste des brouillons |
| `POST` | `/api/agent/courses` | Crée une formation **draft** |

Auth obligatoire :

```http
Authorization: Bearer <AGENT_API_KEY>
Content-Type: application/json
```

## Exemple rapide (une vidéo)

```bash
curl -sS -X POST "$APP_URL/api/agent/courses" \
  -H "Authorization: Bearer $AGENT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction à ChatGPT",
    "shortDescription": "Les bases pour démarrer avec ChatGPT.",
    "categorySlug": "intelligence-artificielle",
    "level": "beginner",
    "youtubeUrl": "https://www.youtube.com/watch?v=XXXXXXXXXXX",
    "estimatedDurationMinutes": 25
  }'
```

Réponse : `201` + `data.adminUrl` → ouvre cette URL, vérifie, clique **Publier**.

## Exemple complet (modules + leçons)

```json
{
  "title": "Marketing digital pour débutants",
  "categorySlug": "marketing-digital",
  "level": "beginner",
  "shortDescription": "Parcours guidé pour lancer sa présence en ligne.",
  "description": "Contenu détaillé…",
  "learningOutcomes": [
    "Comprendre le funnel marketing",
    "Créer une première campagne"
  ],
  "modules": [
    {
      "title": "Fondations",
      "lessons": [
        {
          "title": "Qu’est-ce que le marketing digital ?",
          "youtubeUrl": "https://www.youtube.com/watch?v=AAAAAAAAAAA",
          "isPreview": true,
          "estimatedDurationMinutes": 12
        },
        {
          "title": "Définir son audience",
          "youtubeUrl": "https://www.youtube.com/watch?v=BBBBBBBBBBB",
          "estimatedDurationMinutes": 18
        }
      ]
    }
  ]
}
```

## Règles de sécurité

- Statut course **toujours** `draft` (ignoré / absent du payload).
- L’agent **ne peut pas publier**.
- Rate limit : 20 requêtes / minute / IP.
- Journal d’audit : `agent.course.create_draft`.

## Prompt type pour Claude Code

> Utilise l’API Learnoon (`POST /api/agent/courses` avec `AGENT_API_KEY`).  
> Crée des formations uniquement en brouillon.  
> Récupère d’abord `GET /api/agent/categories` pour choisir le bon `categorySlug`.  
> Renvoie-moi le `adminUrl` pour que je publie moi-même.

Ne committe jamais `AGENT_API_KEY` dans le dépôt.
