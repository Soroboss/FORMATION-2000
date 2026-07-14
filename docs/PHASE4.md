# Phase 4 — Apprentissage

## Livré

- Tables : `enrollments`, `lesson_progress`, `notes`, `favorites`, `quizzes`, `quiz_questions`, `quiz_options`, `quiz_attempts`, `quiz_answers`, `assignments`, `assignment_submissions`
- Seed : quiz + exercice sur la formation HTML d’aperçu
- Calculs purs : `lib/progress/calc.ts` (progression formation, correction QCM, score)
- Repo : `server/repositories/learning.ts`
- Actions serveur : démarrer / terminer leçon, notes, favoris, exercice, quiz (`is_correct` jamais exposé avant soumission)
- API : `POST|GET /api/progress/lesson`
- UI leçon : `LessonLearningPanel` (progression, notes, favoris, quiz, exercice)
- Pages app : `/app/mes-formations`, `/app/progression`, `/app/notes`, `/app/favoris`, `/app/projets`

## Règles

- Inscription formation à la première leçon démarrée / terminée
- Progression formation = leçons requises terminées / total leçons requises
- Notes et favoris liés à l’utilisateur connecté uniquement
- Quiz noté côté serveur ; options correctes non envoyées au client avant tentative
- Accès premium inchangé (Phase 3) pour leçons non aperçu

## Hors scope

Correction admin des exercices, analytics avancées, certificats, CRUD quiz (Phase 5).
