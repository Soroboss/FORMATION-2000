# CAHIER DES CHARGES TECHNIQUE — PLATEFORME DE FORMATION PAR ABONNEMENT

> **Nom de travail :** Académie 2000  
> **Version :** 1.0  
> **Statut :** Spécification fonctionnelle et technique prête pour développement  
> **Stack cible :** Next.js + TypeScript + Tailwind CSS + InsForge + GitHub + Vercel  
> **Prix initial :** 2 000 FCFA pour 30 jours d’accès  
> **Langue initiale :** Français  
> **Zone prioritaire :** Côte d’Ivoire et Afrique francophone

---

## 1. Vision du produit

Créer une plateforme de formation accessible par abonnement mensuel permettant à toute personne de se former à partir de parcours pédagogiques structurés.

Les parcours utilisent principalement des vidéos YouTube publiques intégrées avec le lecteur officiel YouTube. La valeur de la plateforme ne repose pas sur la propriété des vidéos, mais sur :

- la sélection des meilleures ressources gratuites ;
- l’organisation des vidéos dans un ordre pédagogique ;
- les explications complémentaires ;
- les prérequis ;
- les outils à installer ;
- les exercices pratiques ;
- les quiz ;
- les projets de validation ;
- le suivi de progression ;
- les attestations ou certificats internes ;
- les rappels et l’accompagnement.

### Promesse produit

> Une personne entre sans compétence, suit un parcours clair, pratique après chaque leçon et ressort capable de produire un résultat concret.

---

## 2. Principes obligatoires

### 2.1 Respect de YouTube et des créateurs

La plateforme doit :

- utiliser exclusivement le lecteur YouTube officiel intégré ;
- ne jamais télécharger, copier ou réhéberger les vidéos YouTube ;
- ne jamais supprimer les contrôles, crédits ou liens obligatoires de YouTube ;
- afficher le nom de la chaîne ou du créateur ;
- afficher un bouton « Voir sur YouTube » ;
- vérifier que l’intégration de la vidéo est autorisée ;
- permettre à un créateur de demander le retrait d’une vidéo ;
- conserver la source originale de chaque ressource ;
- ne pas prétendre être l’auteur des vidéos externes.

### 2.2 Valeur vendue

L’abonnement donne accès à la plateforme pédagogique, et non à la propriété des vidéos.

La plateforme vend :

- la curation ;
- la structuration ;
- les exercices ;
- les ressources ;
- le suivi ;
- la progression ;
- les évaluations ;
- les projets ;
- les outils communautaires ;
- l’accompagnement.

### 2.3 Sécurité

Aucune clé secrète ne doit être présente dans le navigateur ou dans le dépôt GitHub.

Toutes les opérations sensibles doivent être exécutées côté serveur :

- validation de paiement ;
- activation d’abonnement ;
- gestion des rôles ;
- statistiques financières ;
- génération de documents ;
- fonctions administrateur ;
- traitement des webhooks.

---

## 3. Objectifs métier

1. Permettre l’inscription par email ou téléphone.
2. Permettre le paiement de 2 000 FCFA.
3. Activer automatiquement 30 jours d’accès après paiement confirmé.
4. Bloquer les contenus premium après expiration.
5. Permettre le renouvellement avant ou après expiration.
6. Organiser les contenus par catégories, parcours, modules et leçons.
7. Mesurer la progression de chaque apprenant.
8. Fournir des instructions et exercices sous chaque vidéo.
9. Permettre à l’administration de gérer toute la plateforme.
10. Suivre les paiements, revenus, renouvellements et abonnements.
11. Produire un système extensible pour plusieurs pays, devises et offres.
12. Permettre plus tard l’ajout de formations propriétaires.

---

## 4. Utilisateurs et rôles

### 4.1 Visiteur

Peut :

- voir l’accueil ;
- voir les catégories ;
- consulter les fiches publiques des formations ;
- voir les tarifs ;
- créer un compte ;
- se connecter ;
- contacter le support.

Ne peut pas :

- regarder les leçons premium ;
- accéder aux exercices complets ;
- télécharger les ressources premium ;
- passer les évaluations.

### 4.2 Membre sans abonnement actif

Peut :

- accéder à son compte ;
- consulter son historique ;
- voir les formations disponibles ;
- voir un aperçu des parcours ;
- payer ou renouveler son abonnement.

Ne peut pas accéder aux contenus premium.

### 4.3 Apprenant actif

Peut :

- consulter toutes les formations publiées incluses dans son offre ;
- regarder les vidéos intégrées ;
- suivre sa progression ;
- prendre des notes ;
- enregistrer des favoris ;
- répondre aux quiz ;
- effectuer les exercices ;
- soumettre des projets ;
- obtenir une attestation interne ;
- contacter le support.

### 4.4 Curateur ou formateur

Peut, selon ses permissions :

- créer des brouillons de formation ;
- ajouter des vidéos ;
- écrire des résumés ;
- créer des exercices et quiz ;
- modifier uniquement ses contenus ;
- envoyer ses contenus en validation.

Ne peut pas :

- gérer les paiements ;
- gérer les rôles sensibles ;
- accéder aux données financières globales ;
- publier sans autorisation si la validation est activée.

### 4.5 Support

Peut :

- consulter les membres ;
- consulter les abonnements ;
- voir les paiements sans données sensibles ;
- répondre aux demandes ;
- ajouter des notes internes ;
- prolonger exceptionnellement un accès si autorisé.

### 4.6 Administrateur

Peut :

- gérer les formations ;
- gérer les membres ;
- gérer les abonnements ;
- gérer les paiements ;
- gérer les catégories ;
- gérer les coupons ;
- gérer les notifications ;
- consulter les statistiques ;
- gérer certains paramètres.

### 4.7 Super administrateur

Dispose de tous les droits, notamment :

- rôles et permissions ;
- paramètres critiques ;
- intégrations ;
- clés de paiement ;
- journaux de sécurité ;
- suppression ou restauration ;
- gestion des administrateurs.

---

## 5. Parcours utilisateur principal

### 5.1 Inscription et achat

1. Le visiteur clique sur « Commencer ».
2. Il crée un compte.
3. Il confirme son email ou son téléphone si nécessaire.
4. Il choisit l’offre mensuelle de 2 000 FCFA.
5. Il sélectionne son moyen de paiement.
6. Le prestataire de paiement traite la transaction.
7. Un webhook serveur confirme le paiement.
8. La plateforme crée ou prolonge l’abonnement.
9. L’utilisateur reçoit une confirmation.
10. Il est redirigé vers son tableau de bord.

### 5.2 Apprentissage

1. L’apprenant choisit une catégorie.
2. Il sélectionne une formation.
3. Il consulte les objectifs et prérequis.
4. Il commence la première leçon.
5. Il regarde la vidéo intégrée.
6. Il lit le résumé.
7. Il installe les outils recommandés.
8. Il exécute la mission pratique.
9. Il marque la leçon comme terminée.
10. Il passe au chapitre suivant.
11. Il réalise le projet final.
12. Il termine le quiz final.
13. Il reçoit une attestation interne si les conditions sont remplies.

---

## 6. Arborescence publique

```text
/
├── /formations
├── /formations/[slug]
├── /categories
├── /categories/[slug]
├── /tarifs
├── /comment-ca-marche
├── /a-propos
├── /contact
├── /faq
├── /connexion
├── /inscription
├── /mot-de-passe-oublie
├── /paiement
├── /paiement/succes
├── /paiement/echec
├── /conditions-utilisation
├── /politique-confidentialite
├── /politique-remboursement
└── /retrait-contenu
```

---

## 7. Espace apprenant

```text
/app
├── /app/tableau-de-bord
├── /app/catalogue
├── /app/categories/[slug]
├── /app/formations/[slug]
├── /app/formations/[slug]/lecons/[lessonId]
├── /app/mes-formations
├── /app/favoris
├── /app/notes
├── /app/progression
├── /app/projets
├── /app/certificats
├── /app/abonnement
├── /app/paiements
├── /app/notifications
├── /app/support
└── /app/profil
```

---

## 8. Back-office

```text
/admin
├── /admin/tableau-de-bord
├── /admin/formations
├── /admin/formations/nouvelle
├── /admin/formations/[id]
├── /admin/categories
├── /admin/modules
├── /admin/lecons
├── /admin/quiz
├── /admin/projets
├── /admin/ressources
├── /admin/membres
├── /admin/abonnements
├── /admin/paiements
├── /admin/remboursements
├── /admin/coupons
├── /admin/notifications
├── /admin/support
├── /admin/createurs
├── /admin/demandes-retrait
├── /admin/statistiques
├── /admin/finances
├── /admin/equipe
├── /admin/roles
├── /admin/journaux
└── /admin/parametres
```

---

## 9. Pages publiques

### 9.1 Accueil

Sections :

1. Barre de navigation.
2. Proposition de valeur.
3. Bouton « Accéder à toutes les formations pour 2 000 FCFA ».
4. Catégories populaires.
5. Formations populaires.
6. Méthode d’apprentissage.
7. Résultats concrets possibles.
8. Témoignages.
9. Tarif.
10. FAQ.
11. Pied de page légal.

### 9.2 Catalogue public

Filtres :

- catégorie ;
- niveau ;
- durée ;
- outil ;
- compétence ;
- langue ;
- populaire ;
- récent.

Chaque carte affiche :

- image ;
- titre ;
- catégorie ;
- niveau ;
- durée totale ;
- nombre de leçons ;
- résultat attendu ;
- badge gratuit ou abonnement.

### 9.3 Fiche formation publique

Doit afficher :

- titre ;
- image ;
- résumé ;
- objectifs ;
- compétences acquises ;
- niveau ;
- durée ;
- nombre de modules ;
- nombre de leçons ;
- outils nécessaires ;
- prérequis ;
- projet final ;
- sommaire ;
- auteurs ou chaînes sources ;
- bouton d’abonnement.

Les vidéos premium ne doivent pas être accessibles sans autorisation.

---

## 10. Tableau de bord apprenant

Afficher :

- message de bienvenue ;
- état de l’abonnement ;
- date d’expiration ;
- bouton de renouvellement ;
- dernière formation consultée ;
- bouton « Continuer » ;
- progression globale ;
- temps d’apprentissage estimé ;
- nombre de leçons terminées ;
- formations commencées ;
- formations terminées ;
- projets soumis ;
- certificats obtenus ;
- recommandations ;
- nouvelles formations ;
- notifications importantes.

---

## 11. Structure pédagogique

### 11.1 Catégorie

Exemples :

- Intelligence artificielle ;
- Marketing digital ;
- Création de sites ;
- E-commerce ;
- Graphisme ;
- Canva ;
- Montage vidéo ;
- Bureautique ;
- Entrepreneuriat ;
- Comptabilité ;
- Langues ;
- Photographie ;
- Communication ;
- Développement personnel.

### 11.2 Formation

Une formation contient :

- une catégorie principale ;
- plusieurs catégories secondaires éventuelles ;
- des modules ;
- des leçons ;
- des outils ;
- des ressources ;
- des quiz ;
- un projet final ;
- des critères de validation.

### 11.3 Module

Un module contient :

- un titre ;
- une description ;
- un ordre ;
- des objectifs ;
- plusieurs leçons ;
- un quiz facultatif.

### 11.4 Leçon

Une leçon peut être de type :

- vidéo YouTube ;
- texte ;
- exercice ;
- quiz ;
- ressource ;
- projet ;
- lien externe ;
- vidéo propriétaire future.

Chaque leçon doit pouvoir contenir :

- titre ;
- objectif ;
- description ;
- contenu ;
- lien YouTube ;
- identifiant YouTube ;
- durée ;
- nom de la chaîne ;
- lien de la chaîne ;
- résumé ;
- points clés ;
- instructions ;
- outils à installer ;
- ressources ;
- mission pratique ;
- résultat attendu ;
- erreurs fréquentes ;
- conseils ;
- ordre ;
- statut ;
- accès gratuit ou premium.

---

## 12. Lecteur de leçon

### 12.1 Zone vidéo

Utiliser l’API YouTube IFrame officielle.

Fonctions :

- lecture ;
- pause ;
- plein écran ;
- sous-titres lorsque disponibles ;
- vitesse lorsque disponible ;
- détection facultative de fin ;
- reprise de la dernière position si techniquement et juridiquement acceptable.

### 12.2 Informations sous la vidéo

Afficher :

1. Objectif de la leçon.
2. Résumé.
3. Points importants.
4. Outils requis.
5. Liens officiels.
6. Instructions pratiques.
7. Exercice.
8. Résultat attendu.
9. Erreurs fréquentes.
10. Ressources.
11. Crédit du créateur.
12. Bouton « Voir sur YouTube ».
13. Bouton « Signaler un problème ».
14. Bouton « Marquer comme terminée ».

### 12.3 Navigation

- leçon précédente ;
- leçon suivante ;
- sommaire latéral ;
- pourcentage de progression ;
- verrouillage séquentiel configurable ;
- sauvegarde de la position dans le parcours.

---

## 13. Progression

La progression ne doit pas dépendre uniquement du temps vidéo.

Une leçon peut être considérée comme terminée lorsque :

- l’utilisateur clique sur « Marquer comme terminée » ;
- ou la vidéo atteint un seuil défini ;
- ou l’exercice est validé ;
- ou le quiz est réussi ;
- ou le projet est soumis.

### Calcul

```text
progression_formation =
nombre_de_lecons_terminees / nombre_total_de_lecons_obligatoires * 100
```

Prévoir :

- progression par leçon ;
- progression par module ;
- progression par formation ;
- progression globale ;
- historique des activités ;
- dernière position ;
- temps d’apprentissage déclaré ou estimé.

---

## 14. Quiz

Fonctions :

- choix unique ;
- choix multiple ;
- vrai ou faux ;
- réponse courte ;
- ordre logique ;
- correspondance future.

Paramètres :

- note minimale ;
- nombre de tentatives ;
- correction immédiate ou finale ;
- questions aléatoires ;
- explication de réponse ;
- durée facultative.

Stocker :

- réponses ;
- score ;
- date ;
- durée ;
- tentative ;
- statut réussi ou échoué.

---

## 15. Exercices et projets

### 15.1 Exercice

Peut demander :

- une réponse texte ;
- un lien ;
- une image ;
- un document ;
- une vidéo ;
- une confirmation manuelle.

### 15.2 Projet final

Doit contenir :

- consigne ;
- objectif ;
- critères de réussite ;
- livrables ;
- ressources ;
- exemple ;
- date de soumission ;
- statut ;
- commentaire du correcteur ;
- score facultatif.

Statuts :

- brouillon ;
- soumis ;
- en révision ;
- corrections demandées ;
- validé ;
- refusé.

---

## 16. Notes personnelles

L’apprenant peut :

- prendre des notes par leçon ;
- modifier ses notes ;
- rechercher dans ses notes ;
- exporter ses notes plus tard ;
- conserver ses notes après expiration, selon la politique commerciale.

Les notes sont privées.

---

## 17. Favoris

L’utilisateur peut ajouter aux favoris :

- formations ;
- leçons ;
- ressources ;
- outils.

---

## 18. Certificats et attestations

Pour la première version, utiliser le terme :

> Attestation interne de parcours

Ne pas présenter automatiquement l’attestation comme un diplôme reconnu par l’État.

Conditions configurables :

- progression à 100 % ;
- score minimal au quiz ;
- projet final validé ;
- abonnement actif au moment de la délivrance.

Informations :

- numéro unique ;
- nom du membre ;
- formation ;
- date ;
- score éventuel ;
- URL ou QR code de vérification ;
- statut valide ou révoqué.

---

## 19. Abonnements

### 19.1 Offre initiale

```yaml
nom: Accès mensuel
prix: 2000
devise: XOF
durée: 30 jours
renouvellement_automatique: false par défaut
accès: toutes les formations incluses
```

### 19.2 Statuts

- pending ;
- active ;
- grace_period ;
- expired ;
- cancelled ;
- suspended ;
- refunded.

### 19.3 Règle d’activation

L’abonnement ne doit être activé qu’après confirmation serveur du paiement.

Ne jamais faire confiance uniquement à la redirection « paiement réussi ».

### 19.4 Renouvellement

Si un abonnement est encore actif :

```text
nouvelle_fin = date_fin_actuelle + 30 jours
```

S’il est expiré :

```text
nouvelle_fin = date_confirmation_paiement + 30 jours
```

### 19.5 Période de grâce

Prévoir une option configurable de 0 à 3 jours, désactivée par défaut.

---

## 20. Paiements

Créer une architecture indépendante du fournisseur.

### 20.1 Interface de paiement

```ts
interface PaymentProvider {
  initializePayment(input: InitializePaymentInput): Promise<PaymentSession>;
  verifyPayment(reference: string): Promise<PaymentVerification>;
  parseWebhook(request: Request): Promise<PaymentWebhookEvent>;
  refundPayment?(reference: string, amount?: number): Promise<RefundResult>;
}
```

### 20.2 Fournisseurs possibles

Le premier fournisseur sera choisi après vérification :

- prise en charge de la Côte d’Ivoire ;
- Mobile Money disponible ;
- Wave éventuel ;
- Orange Money ;
- MTN Money ;
- Moov Money ;
- cartes bancaires ;
- webhooks ;
- environnement test ;
- documentation ;
- coûts ;
- délai de reversement.

### 20.3 Statuts de transaction

- initiated ;
- pending ;
- successful ;
- failed ;
- cancelled ;
- expired ;
- refunded ;
- partially_refunded.

### 20.4 Idempotence

Chaque webhook doit être idempotent.

Une même notification reçue plusieurs fois ne doit jamais :

- créer plusieurs paiements ;
- prolonger plusieurs fois l’abonnement ;
- envoyer plusieurs reçus.

### 20.5 Réconciliation

Prévoir une tâche serveur qui vérifie les paiements encore en attente.

---

## 21. Gestion des membres

Fiche membre :

- identifiant ;
- nom ;
- prénom ;
- email ;
- téléphone ;
- pays ;
- ville facultative ;
- photo ;
- date d’inscription ;
- dernière connexion ;
- statut ;
- rôle ;
- abonnement actuel ;
- historique des abonnements ;
- historique des paiements ;
- progression ;
- projets ;
- certificats ;
- notes internes support ;
- consentements.

Actions administrateur :

- consulter ;
- modifier ;
- suspendre ;
- réactiver ;
- prolonger ;
- attribuer une offre ;
- réinitialiser un mot de passe via procédure sécurisée ;
- exporter ;
- anonymiser ;
- supprimer selon les règles légales.

---

## 22. Gestion des formations

### Workflow éditorial

```text
Brouillon → En révision → Validée → Programmée → Publiée → Archivée
```

### Fonctions

- créer ;
- modifier ;
- dupliquer ;
- prévisualiser ;
- publier ;
- dépublier ;
- archiver ;
- réordonner ;
- ajouter des collaborateurs ;
- définir une date de publication ;
- afficher un historique des modifications.

### Import d’une vidéo YouTube

À partir d’une URL :

1. valider le domaine ;
2. extraire l’identifiant ;
3. vérifier l’existence ;
4. vérifier si l’intégration fonctionne ;
5. récupérer les métadonnées autorisées ;
6. enregistrer la source ;
7. permettre l’ajout du contenu pédagogique.

Données proposées :

- titre original ;
- titre pédagogique interne ;
- miniature ;
- durée ;
- chaîne ;
- identifiant de chaîne ;
- URL ;
- langue ;
- date de publication ;
- statut d’intégration ;
- date de dernière vérification.

---

## 23. Contrôle des liens YouTube

Créer une tâche régulière qui détecte :

- vidéo supprimée ;
- vidéo privée ;
- intégration désactivée ;
- restriction géographique ;
- changement de titre ;
- miniature indisponible.

Statuts :

- healthy ;
- unavailable ;
- embedding_disabled ;
- private ;
- deleted ;
- geo_restricted ;
- needs_review.

Le back-office doit afficher une alerte.

---

## 24. Gestion des créateurs et retraits

Créer un registre des créateurs :

- nom de chaîne ;
- identifiant ;
- URL ;
- contact public éventuel ;
- nombre de vidéos utilisées ;
- statut ;
- autorisation explicite facultative ;
- date de contact ;
- notes.

Créer une page de demande de retrait.

Une demande contient :

- nom ;
- email ;
- chaîne ;
- URL de la vidéo ;
- motif ;
- preuve facultative ;
- statut ;
- date ;
- décision ;
- note interne.

Statuts :

- received ;
- reviewing ;
- accepted ;
- rejected ;
- completed.

---

## 25. Support

Système de tickets :

- sujet ;
- catégorie ;
- priorité ;
- statut ;
- membre ;
- messages ;
- pièces jointes ;
- responsable ;
- date de résolution.

Catégories :

- paiement ;
- accès ;
- abonnement ;
- formation ;
- vidéo indisponible ;
- certificat ;
- compte ;
- autre.

---

## 26. Notifications

Canaux :

- notification interne ;
- email ;
- SMS futur ;
- WhatsApp futur.

Événements :

- bienvenue ;
- paiement reçu ;
- paiement échoué ;
- abonnement activé ;
- expiration dans 7 jours ;
- expiration dans 3 jours ;
- expiration demain ;
- abonnement expiré ;
- renouvellement ;
- nouvelle formation ;
- formation terminée ;
- projet validé ;
- réponse du support.

Toutes les notifications doivent utiliser des modèles modifiables.

---

## 27. Statistiques administratives

### Tableau de bord

- membres totaux ;
- nouveaux membres ;
- membres actifs ;
- abonnements actifs ;
- abonnements expirés ;
- revenus du jour ;
- revenus de la semaine ;
- revenus du mois ;
- paiements réussis ;
- paiements échoués ;
- taux de renouvellement ;
- taux de conversion ;
- formations populaires ;
- taux de complétion ;
- leçons abandonnées ;
- vidéos indisponibles ;
- tickets ouverts.

### Définitions

```text
MRR simplifié = nombre d’abonnements mensuels actifs × prix mensuel
```

Le MRR doit être présenté comme une estimation si le renouvellement automatique n’est pas activé.

```text
taux_renouvellement =
abonnements_renouvelés / abonnements_arrivés_à_expiration
```

```text
taux_completion =
membres_ayant_terminé / membres_ayant_commencé
```

---

## 28. Module financier

Afficher :

- chiffre d’affaires brut ;
- frais de paiement ;
- remboursements ;
- chiffre d’affaires net estimé ;
- transactions par fournisseur ;
- transactions par moyen de paiement ;
- ventes par période ;
- export CSV ;
- références de transaction ;
- anomalies ;
- rapprochement.

Ne jamais stocker les numéros complets de carte bancaire.

---

## 29. Paramètres

### Général

- nom ;
- logo ;
- favicon ;
- couleurs ;
- contact ;
- adresse ;
- devise ;
- fuseau horaire ;
- langue ;
- maintenance.

### Abonnement

- prix ;
- durée ;
- période de grâce ;
- règle de renouvellement ;
- contenus gratuits ;
- nombre d’appareils futur.

### Pédagogie

- seuil de complétion ;
- verrouillage séquentiel ;
- score minimal ;
- certificats ;
- projets.

### Paiements

- fournisseur actif ;
- mode test ;
- URLs webhook ;
- moyens autorisés.

### Notifications

- expéditeur ;
- modèles ;
- délais de rappel.

### Juridique

- conditions ;
- confidentialité ;
- remboursement ;
- copyright ;
- demandes de retrait.

---

## 30. Architecture technique

### 30.1 Frontend

- Next.js avec App Router ;
- TypeScript strict ;
- React ;
- Tailwind CSS ;
- composants accessibles ;
- bibliothèque de composants de type shadcn/ui facultative ;
- React Hook Form ;
- validation Zod ;
- interface responsive mobile-first ;
- rendu serveur lorsque pertinent ;
- pages SEO publiques ;
- espace privé protégé.

### 30.2 Backend

InsForge doit fournir, selon les fonctions disponibles dans le projet :

- PostgreSQL ;
- authentification ;
- stockage ;
- fonctions serveur ou edge functions ;
- temps réel lorsque nécessaire ;
- SDK TypeScript ;
- MCP pour les agents de développement.

### 30.3 Hébergement

- code : GitHub ;
- frontend : Vercel ;
- backend et base : InsForge ;
- médias internes : stockage InsForge ;
- vidéos externes : YouTube IFrame.

### 30.4 Environnements

- local ;
- preview ;
- staging facultatif ;
- production.

Chaque environnement doit avoir ses propres variables et clés.

---

## 31. Structure du dépôt

```text
/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── app/
│   ├── admin/
│   └── api/
├── components/
│   ├── ui/
│   ├── public/
│   ├── learning/
│   ├── admin/
│   └── forms/
├── features/
│   ├── auth/
│   ├── courses/
│   ├── subscriptions/
│   ├── payments/
│   ├── progress/
│   ├── quizzes/
│   ├── projects/
│   ├── certificates/
│   ├── notifications/
│   └── support/
├── lib/
│   ├── insforge/
│   ├── auth/
│   ├── payments/
│   ├── youtube/
│   ├── permissions/
│   ├── validation/
│   └── utils/
├── server/
│   ├── actions/
│   ├── services/
│   ├── repositories/
│   └── jobs/
├── types/
├── hooks/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
├── scripts/
├── docs/
├── .env.example
├── AGENTS.md
├── README.md
└── package.json
```

---

## 32. Modèle de données

> Les noms sont en anglais pour faciliter le développement.  
> Utiliser des UUID.  
> Ajouter `created_at` et `updated_at` aux tables principales.

### 32.1 profiles

```sql
id uuid primary key
auth_user_id uuid unique not null
first_name text
last_name text
display_name text
email text
phone text
country_code text
city text
avatar_url text
status text not null default 'active'
last_login_at timestamptz
created_at timestamptz
updated_at timestamptz
```

### 32.2 roles

```sql
id uuid primary key
key text unique not null
name text not null
description text
```

Valeurs :

- learner ;
- curator ;
- instructor ;
- support ;
- admin ;
- super_admin.

### 32.3 user_roles

```sql
id uuid primary key
user_id uuid not null
role_id uuid not null
created_at timestamptz
unique(user_id, role_id)
```

### 32.4 permissions

```sql
id uuid primary key
key text unique not null
name text not null
description text
```

### 32.5 role_permissions

```sql
role_id uuid not null
permission_id uuid not null
primary key(role_id, permission_id)
```

### 32.6 categories

```sql
id uuid primary key
parent_id uuid null
name text not null
slug text unique not null
description text
image_url text
icon text
sort_order int default 0
is_active boolean default true
created_at timestamptz
updated_at timestamptz
```

### 32.7 courses

```sql
id uuid primary key
category_id uuid
author_user_id uuid
title text not null
slug text unique not null
short_description text
description text
thumbnail_url text
level text
language text default 'fr'
estimated_duration_minutes int default 0
learning_outcomes jsonb
prerequisites jsonb
required_tools jsonb
final_project_description text
status text default 'draft'
access_type text default 'subscription'
is_featured boolean default false
published_at timestamptz
created_at timestamptz
updated_at timestamptz
```

### 32.8 course_categories

```sql
course_id uuid not null
category_id uuid not null
primary key(course_id, category_id)
```

### 32.9 modules

```sql
id uuid primary key
course_id uuid not null
title text not null
description text
objectives jsonb
sort_order int not null
is_required boolean default true
created_at timestamptz
updated_at timestamptz
```

### 32.10 lessons

```sql
id uuid primary key
module_id uuid not null
title text not null
slug text
lesson_type text not null
description text
content jsonb
estimated_duration_minutes int default 0
sort_order int not null
is_required boolean default true
is_preview boolean default false
status text default 'draft'
completion_rule text default 'manual'
completion_threshold int default 80
created_at timestamptz
updated_at timestamptz
```

### 32.11 youtube_sources

```sql
id uuid primary key
lesson_id uuid unique not null
youtube_video_id text not null
video_url text not null
channel_id text
channel_name text
channel_url text
original_title text
thumbnail_url text
duration_seconds int
published_at timestamptz
embed_status text default 'unknown'
last_checked_at timestamptz
metadata jsonb
created_at timestamptz
updated_at timestamptz
```

### 32.12 lesson_instructions

```sql
id uuid primary key
lesson_id uuid unique not null
objective text
summary text
key_points jsonb
steps jsonb
expected_result text
common_mistakes jsonb
tips jsonb
created_at timestamptz
updated_at timestamptz
```

### 32.13 tools

```sql
id uuid primary key
name text not null
slug text unique not null
description text
official_url text
download_url text
logo_url text
pricing_type text
platforms jsonb
is_active boolean default true
created_at timestamptz
updated_at timestamptz
```

### 32.14 lesson_tools

```sql
lesson_id uuid not null
tool_id uuid not null
instructions text
is_required boolean default false
primary key(lesson_id, tool_id)
```

### 32.15 resources

```sql
id uuid primary key
lesson_id uuid
course_id uuid
title text not null
resource_type text not null
url text
storage_path text
description text
is_downloadable boolean default false
access_type text default 'subscription'
created_at timestamptz
updated_at timestamptz
```

### 32.16 enrollments

```sql
id uuid primary key
user_id uuid not null
course_id uuid not null
status text default 'active'
started_at timestamptz
completed_at timestamptz
last_lesson_id uuid
progress_percent numeric default 0
created_at timestamptz
updated_at timestamptz
unique(user_id, course_id)
```

### 32.17 lesson_progress

```sql
id uuid primary key
user_id uuid not null
lesson_id uuid not null
status text default 'not_started'
progress_percent numeric default 0
last_position_seconds int default 0
started_at timestamptz
completed_at timestamptz
last_activity_at timestamptz
metadata jsonb
unique(user_id, lesson_id)
```

### 32.18 notes

```sql
id uuid primary key
user_id uuid not null
lesson_id uuid
course_id uuid
content text not null
created_at timestamptz
updated_at timestamptz
```

### 32.19 favorites

```sql
id uuid primary key
user_id uuid not null
entity_type text not null
entity_id uuid not null
created_at timestamptz
unique(user_id, entity_type, entity_id)
```

### 32.20 quizzes

```sql
id uuid primary key
course_id uuid
module_id uuid
lesson_id uuid
title text not null
description text
passing_score numeric default 70
max_attempts int
time_limit_minutes int
shuffle_questions boolean default false
status text default 'draft'
created_at timestamptz
updated_at timestamptz
```

### 32.21 quiz_questions

```sql
id uuid primary key
quiz_id uuid not null
question_type text not null
question text not null
explanation text
points numeric default 1
sort_order int
metadata jsonb
created_at timestamptz
updated_at timestamptz
```

### 32.22 quiz_options

```sql
id uuid primary key
question_id uuid not null
label text not null
is_correct boolean default false
sort_order int
```

La colonne `is_correct` ne doit jamais être envoyée au navigateur avant la soumission.

### 32.23 quiz_attempts

```sql
id uuid primary key
quiz_id uuid not null
user_id uuid not null
attempt_number int not null
score numeric
passed boolean
started_at timestamptz
submitted_at timestamptz
duration_seconds int
```

### 32.24 quiz_answers

```sql
id uuid primary key
attempt_id uuid not null
question_id uuid not null
answer jsonb
is_correct boolean
points_awarded numeric
```

### 32.25 assignments

```sql
id uuid primary key
course_id uuid
module_id uuid
lesson_id uuid
title text not null
instructions text not null
expected_deliverables jsonb
evaluation_criteria jsonb
is_required boolean default true
created_at timestamptz
updated_at timestamptz
```

### 32.26 assignment_submissions

```sql
id uuid primary key
assignment_id uuid not null
user_id uuid not null
content text
submission_url text
storage_paths jsonb
status text default 'draft'
score numeric
reviewer_id uuid
review_comment text
submitted_at timestamptz
reviewed_at timestamptz
created_at timestamptz
updated_at timestamptz
```

### 32.27 plans

```sql
id uuid primary key
name text not null
slug text unique not null
description text
price_amount bigint not null
currency text default 'XOF'
duration_days int default 30
is_active boolean default true
features jsonb
created_at timestamptz
updated_at timestamptz
```

Montants financiers stockés en unité entière la plus petite adaptée. Pour le XOF, stocker le nombre de FCFA.

### 32.28 subscriptions

```sql
id uuid primary key
user_id uuid not null
plan_id uuid not null
status text not null
starts_at timestamptz
ends_at timestamptz
grace_ends_at timestamptz
cancelled_at timestamptz
source text
created_at timestamptz
updated_at timestamptz
```

### 32.29 payments

```sql
id uuid primary key
user_id uuid not null
subscription_id uuid
plan_id uuid
provider text not null
provider_reference text unique
internal_reference text unique not null
amount bigint not null
currency text default 'XOF'
status text not null
payment_method text
provider_fee bigint
net_amount bigint
initiated_at timestamptz
confirmed_at timestamptz
failed_at timestamptz
metadata jsonb
created_at timestamptz
updated_at timestamptz
```

### 32.30 payment_events

```sql
id uuid primary key
payment_id uuid
provider text not null
event_id text
event_type text
payload_hash text
payload jsonb
processed boolean default false
processed_at timestamptz
created_at timestamptz
unique(provider, event_id)
```

### 32.31 coupons

```sql
id uuid primary key
code text unique not null
discount_type text not null
discount_value bigint not null
currency text
max_redemptions int
redemption_count int default 0
starts_at timestamptz
ends_at timestamptz
is_active boolean default true
created_at timestamptz
updated_at timestamptz
```

### 32.32 certificates

```sql
id uuid primary key
user_id uuid not null
course_id uuid not null
certificate_number text unique not null
verification_token text unique not null
issued_at timestamptz
revoked_at timestamptz
metadata jsonb
created_at timestamptz
```

### 32.33 notifications

```sql
id uuid primary key
user_id uuid not null
type text not null
title text not null
message text not null
action_url text
read_at timestamptz
created_at timestamptz
```

### 32.34 support_tickets

```sql
id uuid primary key
user_id uuid
subject text not null
category text
priority text default 'normal'
status text default 'open'
assigned_to uuid
created_at timestamptz
updated_at timestamptz
resolved_at timestamptz
```

### 32.35 support_messages

```sql
id uuid primary key
ticket_id uuid not null
sender_id uuid not null
message text not null
attachments jsonb
is_internal boolean default false
created_at timestamptz
```

### 32.36 creator_channels

```sql
id uuid primary key
platform text default 'youtube'
external_channel_id text
name text not null
url text not null
contact_email text
permission_status text default 'not_contacted'
contacted_at timestamptz
notes text
created_at timestamptz
updated_at timestamptz
```

### 32.37 takedown_requests

```sql
id uuid primary key
requester_name text not null
requester_email text not null
channel_url text
video_url text not null
reason text not null
proof_storage_path text
status text default 'received'
decision_notes text
processed_by uuid
created_at timestamptz
updated_at timestamptz
completed_at timestamptz
```

### 32.38 audit_logs

```sql
id uuid primary key
actor_user_id uuid
action text not null
entity_type text
entity_id text
old_values jsonb
new_values jsonb
ip_hash text
user_agent text
created_at timestamptz
```

### 32.39 app_settings

```sql
id uuid primary key
key text unique not null
value jsonb not null
is_public boolean default false
updated_by uuid
updated_at timestamptz
```

---

## 33. Relations et index

Créer des index sur :

- `courses.slug` ;
- `courses.status` ;
- `courses.category_id` ;
- `lessons.module_id, sort_order` ;
- `modules.course_id, sort_order` ;
- `lesson_progress.user_id` ;
- `lesson_progress.lesson_id` ;
- `subscriptions.user_id, status` ;
- `subscriptions.ends_at` ;
- `payments.user_id` ;
- `payments.status` ;
- `payments.provider_reference` ;
- `notifications.user_id, read_at` ;
- `audit_logs.actor_user_id, created_at` ;
- recherche textuelle des formations.

Créer des contraintes pour empêcher :

- prix négatifs ;
- dates de fin antérieures aux dates de début ;
- doublons de progression ;
- doublons de transaction ;
- ordre négatif ;
- scores hors intervalle.

---

## 34. Autorisation et politiques d’accès

### Règles essentielles

1. Un utilisateur peut lire et modifier uniquement son profil.
2. Un apprenant peut lire uniquement sa progression, ses notes, ses soumissions et ses paiements.
3. Un apprenant ne peut pas modifier directement son abonnement.
4. Un apprenant ne peut jamais définir un paiement comme réussi.
5. Seule une fonction serveur peut activer un abonnement.
6. Les réponses correctes d’un quiz ne sont pas exposées avant soumission.
7. Les données financières globales sont réservées aux rôles autorisés.
8. Les journaux d’audit ne sont pas modifiables par les rôles ordinaires.
9. Les contenus brouillons ne sont visibles que par l’équipe autorisée.
10. Les contenus premium exigent un abonnement actif, sauf aperçu.

### Vérification serveur d’accès

```ts
async function canAccessPremiumContent(userId: string): Promise<boolean> {
  // Vérifier une souscription active dont ends_at > maintenant.
  // Ne jamais se baser uniquement sur un état stocké côté client.
  return true;
}
```

---

## 35. Authentification

Fonctions minimales :

- inscription email et mot de passe ;
- connexion ;
- déconnexion ;
- confirmation d’email si disponible ;
- mot de passe oublié ;
- réinitialisation ;
- session persistante sécurisée ;
- protection contre les tentatives abusives ;
- OAuth Google facultatif ;
- téléphone/OTP futur.

Après inscription, créer automatiquement le profil et le rôle `learner`.

---

## 36. API et actions serveur

### Auth

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

Utiliser de préférence les mécanismes InsForge plutôt que recréer l’authentification.

### Catalogue

```text
GET /api/categories
GET /api/courses
GET /api/courses/[slug]
GET /api/courses/[id]/curriculum
```

### Progression

```text
POST /api/progress/lesson/start
POST /api/progress/lesson/update
POST /api/progress/lesson/complete
GET  /api/progress/course/[courseId]
```

### Paiement

```text
POST /api/payments/initialize
GET  /api/payments/[reference]/status
POST /api/webhooks/payments/[provider]
```

### Admin

```text
POST   /api/admin/courses
PATCH  /api/admin/courses/[id]
DELETE /api/admin/courses/[id]
POST   /api/admin/courses/[id]/publish
POST   /api/admin/youtube/import
POST   /api/admin/subscriptions/[id]/extend
```

Toutes les routes doivent :

- valider les entrées ;
- vérifier la session ;
- vérifier les permissions ;
- journaliser les actions sensibles ;
- retourner des erreurs structurées.

---

## 37. Intégration YouTube

### Extraction d’identifiant

Accepter notamment :

```text
https://www.youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
https://www.youtube.com/embed/VIDEO_ID
https://www.youtube.com/shorts/VIDEO_ID
```

Valider strictement l’identifiant.

### Lecteur

Créer un composant :

```tsx
<YouTubeLessonPlayer
  videoId="..."
  lessonId="..."
  startAt={0}
  onProgress={...}
  onEnded={...}
/>
```

### Confidentialité

Prévoir l’utilisation du domaine d’intégration renforçant la confidentialité lorsque compatible avec les besoins, sans contourner les obligations du lecteur.

### Interdictions

- pas de téléchargement ;
- pas de proxy vidéo ;
- pas de suppression trompeuse du branding ;
- pas de superposition empêchant les interactions obligatoires ;
- pas de faux compteur de vues ;
- pas de lecture cachée ;
- pas de lecture automatisée pour générer artificiellement des vues.

---

## 38. SEO

Pages publiques indexables :

- accueil ;
- catégories ;
- formations publiées ;
- articles futurs.

Prévoir :

- métadonnées ;
- Open Graph ;
- sitemap ;
- robots.txt ;
- canonical ;
- données structurées Course lorsque pertinentes ;
- URLs propres ;
- images optimisées ;
- contenu unique.

Les espaces `/app` et `/admin` ne doivent pas être indexés.

---

## 39. Performance

Objectifs :

- interface rapide sur mobile ;
- images optimisées ;
- chargement différé ;
- pagination ;
- requêtes limitées ;
- cache contrôlé ;
- squelette de chargement ;
- pas de requêtes N+1 ;
- lecteur YouTube chargé seulement lorsqu’il est visible ou demandé ;
- Web Vitals surveillés.

---

## 40. Responsive

La plateforme doit fonctionner sur :

- mobile 360 px ;
- mobile 390 px ;
- tablette ;
- ordinateur portable ;
- grand écran.

Contraintes :

- aucune largeur fixe destructrice ;
- pas de débordement horizontal ;
- tableaux administratifs transformés en cartes ou scroll contrôlé ;
- menu mobile ;
- lecteur 16:9 responsive ;
- boutons tactiles suffisamment grands ;
- formulaires utilisables sur mobile ;
- sidebar repliable.

---

## 41. Accessibilité

- navigation clavier ;
- focus visible ;
- labels de formulaire ;
- contrastes suffisants ;
- textes alternatifs ;
- titres hiérarchiques ;
- messages d’erreur lisibles ;
- composants compatibles lecteurs d’écran ;
- ne pas dépendre uniquement de la couleur.

---

## 42. Sécurité

Mettre en place :

- validation Zod ;
- échappement du contenu ;
- protection XSS ;
- prévention CSRF selon l’architecture ;
- limitation de débit ;
- contrôle d’accès serveur ;
- secrets uniquement côté serveur ;
- politique de mots de passe ;
- cookies sécurisés ;
- journalisation ;
- sauvegardes ;
- restriction des uploads ;
- contrôle MIME ;
- taille maximale ;
- noms de fichiers générés ;
- scan antivirus futur ;
- Content Security Policy compatible YouTube ;
- protection contre les redirections ouvertes.

### Content Security Policy

Autoriser uniquement les domaines nécessaires :

- application ;
- InsForge ;
- YouTube ;
- fournisseur de paiement ;
- service email ;
- analytics approuvé.

---

## 43. Confidentialité

Collecter seulement les données nécessaires.

Prévoir :

- consentement aux conditions ;
- consentement marketing séparé ;
- export des données ;
- correction ;
- demande de suppression ;
- anonymisation lorsque la conservation financière est obligatoire ;
- durée de conservation ;
- politique de cookies si outils de suivi.

Les obligations légales exactes doivent être validées avec un professionnel compétent dans les pays ciblés.

---

## 44. Journal d’audit

Journaliser :

- connexion administrative ;
- création et suppression de contenus ;
- publication ;
- modification de prix ;
- prolongation d’abonnement ;
- remboursement ;
- changement de rôle ;
- modification des paramètres ;
- traitement d’une demande de retrait.

Ne pas exposer les journaux aux utilisateurs ordinaires.

---

## 45. Tests

### Unitaires

- calcul de date d’abonnement ;
- calcul de progression ;
- validation d’URL YouTube ;
- calcul de réduction ;
- règles d’accès ;
- conversion des statuts ;
- idempotence du webhook.

### Intégration

- inscription ;
- paiement ;
- webhook ;
- activation ;
- expiration ;
- renouvellement ;
- progression ;
- quiz ;
- soumission de projet ;
- permissions.

### E2E

Scénarios obligatoires :

1. Visiteur → inscription → paiement → accès.
2. Paiement échoué → aucun accès.
3. Double webhook → une seule activation.
4. Abonnement expiré → contenu verrouillé.
5. Renouvellement actif → prolongation depuis la date de fin.
6. Membre ne peut pas ouvrir `/admin`.
7. Curateur ne peut pas voir les finances.
8. Admin crée et publie une formation.
9. Vidéo indisponible → alerte.
10. Apprenant termine une formation.
11. Quiz échoué puis réussi.
12. Attestation générée.
13. Demande de retrait traitée.

---

## 46. Observabilité

Prévoir :

- erreurs frontend ;
- erreurs serveur ;
- taux de webhooks échoués ;
- paiements bloqués ;
- tâches planifiées ;
- vidéos invalides ;
- alertes administratives ;
- identifiants de corrélation ;
- logs sans secrets.

---

## 47. Sauvegardes

- sauvegarde de la base ;
- vérification régulière de restauration ;
- conservation définie ;
- export des contenus ;
- dépôt GitHub protégé ;
- branches ;
- tags de version ;
- aucun secret dans Git.

---

## 48. CI/CD

À chaque Pull Request :

1. installation ;
2. vérification TypeScript ;
3. lint ;
4. tests unitaires ;
5. tests d’intégration essentiels ;
6. build ;
7. preview Vercel.

Pour la branche principale :

1. mêmes contrôles ;
2. migrations contrôlées ;
3. déploiement production ;
4. vérification de santé ;
5. possibilité de rollback.

---

## 49. GitHub

### Branches

```text
main
develop facultative
feature/*
fix/*
chore/*
```

### Protection de `main`

- Pull Request obligatoire ;
- checks obligatoires ;
- interdiction de force push ;
- revue avant fusion si équipe ;
- historique propre.

### Commits

Format recommandé :

```text
feat: add subscription activation webhook
fix: prevent duplicate payment processing
docs: update InsForge setup
test: add expired subscription access test
```

---

## 50. Variables d’environnement

Créer `.env.example` sans valeurs secrètes :

```bash
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=
NEXT_PUBLIC_INSFORGE_URL=
NEXT_PUBLIC_INSFORGE_ANON_KEY=

INSFORGE_SERVICE_KEY=

YOUTUBE_API_KEY=

PAYMENT_PROVIDER=
PAYMENT_PUBLIC_KEY=
PAYMENT_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=

EMAIL_PROVIDER=
EMAIL_API_KEY=
EMAIL_FROM=

CRON_SECRET=
CERTIFICATE_SIGNING_SECRET=
```

Les noms exacts doivent être adaptés au SDK InsForge et au prestataire de paiement choisi.

---

## 51. Design system

### Direction

- moderne ;
- rassurant ;
- africain francophone sans surcharge décorative ;
- pédagogique ;
- mobile-first ;
- simple ;
- accessible.

### Couleurs proposées

```text
Bleu profond : confiance
Vert : progression
Orange : action
Fond clair : lisibilité
Rouge : erreur uniquement
```

### Composants

- boutons ;
- cartes ;
- badges ;
- barres de progression ;
- tableaux ;
- modales ;
- menus ;
- onglets ;
- accordéons ;
- formulaires ;
- alertes ;
- graphiques ;
- lecteurs ;
- éditeur de contenu.

---

## 52. MVP

Le MVP doit inclure uniquement :

1. accueil ;
2. inscription et connexion ;
3. catalogue ;
4. catégories ;
5. fiche formation ;
6. abonnement 2 000 FCFA ;
7. paiement ;
8. activation 30 jours ;
9. lecture YouTube intégrée ;
10. modules et leçons ;
11. instructions et ressources ;
12. progression manuelle ;
13. tableau de bord apprenant ;
14. profil ;
15. back-office formations ;
16. back-office membres ;
17. back-office paiements ;
18. statistiques essentielles ;
19. paramètres essentiels ;
20. contrôle de rôle ;
21. support simple ;
22. pages légales ;
23. journal d’audit minimal.

Ne pas bloquer le MVP avec :

- gamification complexe ;
- application mobile native ;
- intelligence artificielle ;
- streaming propriétaire ;
- réseau social ;
- marketplace de formateurs ;
- visioconférence ;
- correction automatique avancée.

---

## 53. Phases

### Phase 0 — Préparation

- nom du produit ;
- identité ;
- domaine ;
- compte GitHub ;
- projet InsForge ;
- projet Vercel ;
- fournisseur de paiement ;
- règles juridiques ;
- premières catégories ;
- premières formations.

### Phase 1 — Fondations

- dépôt ;
- Next.js ;
- TypeScript strict ;
- Tailwind ;
- InsForge ;
- authentification ;
- structure des rôles ;
- layout ;
- CI.

### Phase 2 — Catalogue

- catégories ;
- formations ;
- modules ;
- leçons ;
- lecteur YouTube ;
- pages publiques ;
- recherche.

### Phase 3 — Abonnement et paiement

- plans ;
- paiement ;
- webhook ;
- activation ;
- expiration ;
- renouvellement ;
- historique.

### Phase 4 — Apprentissage

- inscription à une formation ;
- progression ;
- notes ;
- favoris ;
- exercices ;
- quiz simple.

### Phase 5 — Administration

- tableau de bord ;
- CRUD formations ;
- membres ;
- abonnements ;
- paiements ;
- statistiques ;
- paramètres ;
- audit.

### Phase 6 — Qualité

- responsive ;
- accessibilité ;
- sécurité ;
- tests ;
- performance ;
- monitoring ;
- sauvegarde.

### Phase 7 — Lancement

- contenus ;
- paiements réels ;
- tests utilisateurs ;
- corrections ;
- documentation ;
- production.

---

## 54. Critères d’acceptation du MVP

Le MVP est considéré comme livré si :

- un utilisateur peut créer un compte ;
- il peut payer ;
- le webhook confirme la transaction ;
- son accès est actif pendant exactement la durée prévue ;
- un paiement échoué n’active rien ;
- une expiration bloque les contenus premium ;
- un renouvellement prolonge correctement l’accès ;
- l’administrateur peut créer une catégorie ;
- l’administrateur peut créer une formation ;
- il peut ajouter des modules et leçons ;
- il peut coller un lien YouTube valide ;
- la vidéo s’affiche via le lecteur officiel ;
- le créateur est crédité ;
- l’apprenant peut terminer une leçon ;
- sa progression est sauvegardée ;
- l’administrateur voit les membres, abonnements et paiements ;
- les rôles empêchent les accès interdits ;
- le site fonctionne correctement sur mobile ;
- les tests critiques passent ;
- aucune clé secrète n’est exposée.

---

## 55. Instructions obligatoires pour l’agent de développement

### Règles générales

1. Lire tout ce document avant de modifier le code.
2. Créer un plan avant chaque grande phase.
3. Ne pas développer toutes les phases en une seule demande.
4. Ne jamais supprimer un fichier ou une fonction sans justification.
5. Ne jamais écraser une fonctionnalité existante.
6. Vérifier le schéma de base avant toute migration.
7. Produire des migrations réversibles lorsque possible.
8. Utiliser TypeScript strict.
9. Ne pas utiliser `any` sans justification documentée.
10. Valider toutes les entrées.
11. Vérifier les autorisations côté serveur.
12. Écrire les tests au fur et à mesure.
13. Exécuter lint, typecheck, tests et build avant de déclarer une tâche terminée.
14. Ne jamais simuler une réussite de paiement en production.
15. Ne jamais exposer une clé secrète.
16. Ne jamais inventer une API InsForge.
17. Consulter la documentation InsForge actuelle et son fichier `skill.md`.
18. Utiliser MCP InsForge si disponible et correctement configuré.
19. Documenter chaque variable d’environnement.
20. Mettre à jour le README après chaque phase majeure.

### Règles de modification

Avant modification :

```text
- inspecter les fichiers concernés ;
- identifier les dépendances ;
- vérifier les tests existants ;
- annoncer les fichiers qui seront modifiés.
```

Après modification :

```text
- résumer les changements ;
- afficher les migrations ;
- indiquer les variables ajoutées ;
- exécuter les contrôles ;
- signaler toute limitation.
```

---

## 56. Fichier AGENTS.md recommandé

Créer à la racine :

```md
# Instructions agents

## Source of truth
- `docs/PRODUCT_SPEC.md`
- migrations de base
- documentation officielle InsForge
- tests automatisés

## Commands
- install
- dev
- lint
- typecheck
- test
- test:e2e
- build

## Mandatory
- TypeScript strict
- no secrets
- server-side authorization
- input validation
- payment webhook idempotency
- audit sensitive admin actions
- mobile-first responsive UI
- run checks before completion

## Forbidden
- downloading YouTube videos
- bypassing YouTube player requirements
- activating subscriptions from client callbacks
- exposing quiz answers before submission
- editing production data without explicit instruction
- destructive commands without backup and approval
```

---

## 57. Premier prompt à donner à Cursor, Codex, Claude Code ou Antigravity

```text
Tu es l’architecte et développeur principal de ce projet.

Lis entièrement le fichier docs/PRODUCT_SPEC.md et considère-le comme la source de vérité fonctionnelle. Lis également AGENTS.md.

Notre stack imposée est :
- Next.js App Router
- TypeScript strict
- Tailwind CSS
- InsForge pour PostgreSQL, Auth, Storage et fonctions serveur
- GitHub
- Vercel

Avant d’écrire du code :

1. Inspecte le dépôt.
2. Consulte la documentation officielle actuelle d’InsForge.
3. Récupère et respecte le workflow canonique indiqué dans le skill.md d’InsForge.
4. Propose une architecture détaillée.
5. Découpe le MVP en petites Pull Requests.
6. Identifie les risques techniques.
7. Liste les variables d’environnement.
8. Propose le schéma initial et les migrations.
9. Ne commence que par la Phase 1 : fondations, authentification, profils, rôles, layouts et CI.
10. N’implémente pas encore les paiements ni les formations.

Contraintes absolues :
- ne supprime ni n’écrase du code existant ;
- aucune clé secrète côté client ;
- aucune API inventée ;
- toutes les permissions sensibles côté serveur ;
- validation Zod ;
- TypeScript strict ;
- tests ;
- responsive mobile-first ;
- lint, typecheck, tests et build avant conclusion.

À la fin, fournis :
- les fichiers créés ou modifiés ;
- les commandes exécutées ;
- les résultats des contrôles ;
- les migrations ;
- les décisions techniques ;
- les points restant à faire.
```

---

## 58. Méthode de travail recommandée avec l’IA

Ne jamais demander :

> Crée toute la plateforme complète.

Demander une étape à la fois :

1. initialisation ;
2. auth ;
3. rôles ;
4. catégories ;
5. formations ;
6. modules ;
7. leçons ;
8. YouTube ;
9. abonnement ;
10. paiement ;
11. progression ;
12. admin ;
13. tests ;
14. déploiement.

Pour chaque étape :

```text
Plan → Implémentation → Tests → Revue → Commit → Pull Request
```

---

## 59. Choix de l’outil de développement

### Recommandation principale : Cursor

Utiliser Cursor comme environnement central parce qu’il permet :

- de visualiser tout le projet ;
- de modifier plusieurs fichiers ;
- d’utiliser des règles persistantes ;
- de connecter InsForge par MCP ;
- de revoir les différences avant validation ;
- de travailler facilement avec Git.

### Agent complémentaire : Claude Code ou Codex

Utiliser un second agent pour :

- auditer l’architecture ;
- trouver les régressions ;
- revoir la sécurité ;
- analyser une Pull Request ;
- corriger les tests ;
- vérifier les migrations.

### Antigravity

Peut être utilisé pour :

- prototypage ;
- exécution autonome ;
- validation navigateur ;
- scénarios multi-agents.

Mais il ne faut jamais lui donner une autorisation destructive globale sur les fichiers ou la base de production.

### Workflow conseillé

```text
Cursor : développement principal
Claude Code ou Codex : revue et tâches terminal
GitHub : versionnage et Pull Requests
Vercel : preview et production
InsForge : backend
```

---

## 60. Définition de terminé

Une tâche n’est terminée que si :

- le besoin est implémenté ;
- les permissions sont correctes ;
- les erreurs sont gérées ;
- l’interface mobile est testée ;
- le code est typé ;
- les tests passent ;
- le build passe ;
- la documentation est mise à jour ;
- aucune régression visible n’est présente ;
- aucun secret n’est exposé ;
- les modifications sont prêtes à être revues dans une Pull Request.

---

## 61. Décisions à prendre avant le paiement réel

À confirmer avant la Phase 3 :

- nom final ;
- domaine ;
- fournisseur de paiement ;
- moyens Mobile Money ;
- politique de remboursement ;
- activation manuelle ou automatique ;
- renouvellement automatique ou manuel ;
- justificatif ou facture ;
- règles fiscales ;
- statut juridique ;
- conditions d’utilisation ;
- processus de retrait de contenu ;
- prix promotionnels ;
- possibilité d’essai gratuit.

---

## 62. Évolutions après MVP

- application mobile ;
- PWA et accès hors ligne pour les contenus propriétaires ;
- assistant IA pédagogique ;
- recommandation personnalisée ;
- gamification ;
- communauté ;
- commentaires ;
- cohortes ;
- mentorat ;
- live ;
- marketplace de formateurs ;
- offres entreprises ;
- affiliation ;
- parrainage ;
- plusieurs plans ;
- achats à l’unité ;
- contenus propriétaires ;
- sous-titrage ;
- langues locales ;
- WhatsApp ;
- badges vérifiables ;
- API publique.

---

# FIN DU CAHIER DES CHARGES
