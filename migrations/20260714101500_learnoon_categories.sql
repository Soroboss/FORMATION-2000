-- Catalogue catégories Learnoon Academy (offre publique)
-- Met à jour les 3 catégories seed + ajoute les domaines manquants.

-- 1) Alignement des catégories existantes
UPDATE categories
SET
  name = 'Intelligence Artificielle',
  description = 'Comprendre et utiliser l''IA au quotidien : outils, prompts, automatisation.',
  icon = 'sparkles',
  sort_order = 1,
  is_active = TRUE,
  updated_at = NOW()
WHERE slug = 'intelligence-artificielle';

UPDATE categories
SET
  name = 'Développement Web',
  slug = 'developpement-web',
  description = 'HTML, CSS, JavaScript et bases pour créer des sites et applications web.',
  icon = 'code',
  sort_order = 4,
  is_active = TRUE,
  updated_at = NOW()
WHERE slug IN ('creation-de-sites', 'developpement-web');

UPDATE categories
SET
  name = 'Marketing Digital',
  description = 'Visibilité, acquisition et croissance en ligne (réseaux, pubs, contenu).',
  icon = 'megaphone',
  sort_order = 3,
  is_active = TRUE,
  updated_at = NOW()
WHERE slug = 'marketing-digital';

-- 2) Nouvelles catégories
INSERT INTO categories (id, name, slug, description, icon, sort_order, is_active) VALUES
  (
    '11111111-1111-4111-8111-111111111104',
    'Entrepreneuriat & Business',
    'entrepreneuriat-business',
    'Créer, structurer et développer une activité : stratégie, ventes, gestion.',
    'briefcase',
    2,
    TRUE
  ),
  (
    '11111111-1111-4111-8111-111111111105',
    'Design Graphique',
    'design-graphique',
    'Identité visuelle, composition, outils de design pour des créations pro.',
    'palette',
    5,
    TRUE
  ),
  (
    '11111111-1111-4111-8111-111111111106',
    'Création de contenu & Vidéo',
    'creation-contenu-video',
    'Scénariser, filmer et monter des contenus engageants pour le web.',
    'clapperboard',
    6,
    TRUE
  ),
  (
    '11111111-1111-4111-8111-111111111107',
    'Bureautique',
    'bureautique',
    'Word, Excel, PowerPoint : productivité et documents professionnels.',
    'file-spreadsheet',
    7,
    TRUE
  ),
  (
    '11111111-1111-4111-8111-111111111108',
    'Photographie & Vidéo',
    'photographie-video',
    'Prise de vue, lumière, composition et bases de la production visuelle.',
    'camera',
    8,
    TRUE
  ),
  (
    '11111111-1111-4111-8111-111111111109',
    'Finance & Comptabilité',
    'finance-comptabilite',
    'Bases financières, gestion et comptabilité pour particuliers et TPE.',
    'wallet',
    9,
    TRUE
  ),
  (
    '11111111-1111-4111-8111-111111111110',
    'Développement personnel',
    'developpement-personnel',
    'Confiance, productivité, communication et mindset pour réussir.',
    'graduation',
    10,
    TRUE
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  is_active = TRUE,
  updated_at = NOW();
