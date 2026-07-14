-- Phase 2: catalogue pédagogique (categories, courses, modules, lessons, YouTube)

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON categories (parent_id);
CREATE INDEX IF NOT EXISTS categories_is_active_sort_idx ON categories (is_active, sort_order);

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  author_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  thumbnail_url TEXT,
  level TEXT CHECK (level IS NULL OR level IN ('beginner', 'intermediate', 'advanced')),
  language TEXT NOT NULL DEFAULT 'fr',
  estimated_duration_minutes INT NOT NULL DEFAULT 0 CHECK (estimated_duration_minutes >= 0),
  learning_outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
  prerequisites JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_tools JSONB NOT NULL DEFAULT '[]'::jsonb,
  final_project_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'in_review', 'validated', 'scheduled', 'published', 'archived')),
  access_type TEXT NOT NULL DEFAULT 'subscription'
    CHECK (access_type IN ('free', 'subscription', 'purchase')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS courses_slug_idx ON courses (slug);
CREATE INDEX IF NOT EXISTS courses_status_idx ON courses (status);
CREATE INDEX IF NOT EXISTS courses_category_id_idx ON courses (category_id);
CREATE INDEX IF NOT EXISTS courses_featured_published_idx ON courses (is_featured, published_at DESC);

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TABLE IF NOT EXISTS course_categories (
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, category_id)
);

CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INT NOT NULL CHECK (sort_order >= 0),
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, sort_order)
);

CREATE INDEX IF NOT EXISTS modules_course_sort_idx ON modules (course_id, sort_order);

CREATE TRIGGER modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT,
  lesson_type TEXT NOT NULL
    CHECK (lesson_type IN ('youtube', 'text', 'exercise', 'quiz', 'resource', 'project', 'external_link', 'owned_video')),
  description TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  estimated_duration_minutes INT NOT NULL DEFAULT 0 CHECK (estimated_duration_minutes >= 0),
  sort_order INT NOT NULL CHECK (sort_order >= 0),
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  is_preview BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  completion_rule TEXT NOT NULL DEFAULT 'manual'
    CHECK (completion_rule IN ('manual', 'video_threshold', 'exercise', 'quiz', 'project')),
  completion_threshold INT NOT NULL DEFAULT 80 CHECK (completion_threshold BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (module_id, sort_order)
);

CREATE INDEX IF NOT EXISTS lessons_module_sort_idx ON lessons (module_id, sort_order);
CREATE INDEX IF NOT EXISTS lessons_status_idx ON lessons (status);

CREATE TRIGGER lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TABLE IF NOT EXISTS youtube_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID UNIQUE NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  youtube_video_id TEXT NOT NULL,
  video_url TEXT NOT NULL,
  channel_id TEXT,
  channel_name TEXT,
  channel_url TEXT,
  original_title TEXT,
  thumbnail_url TEXT,
  duration_seconds INT CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  published_at TIMESTAMPTZ,
  embed_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (embed_status IN (
      'unknown', 'healthy', 'unavailable', 'embedding_disabled',
      'private', 'deleted', 'geo_restricted', 'needs_review'
    )),
  last_checked_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS youtube_sources_video_id_idx ON youtube_sources (youtube_video_id);
CREATE INDEX IF NOT EXISTS youtube_sources_embed_status_idx ON youtube_sources (embed_status);

CREATE TRIGGER youtube_sources_updated_at
  BEFORE UPDATE ON youtube_sources
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TABLE IF NOT EXISTS lesson_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID UNIQUE NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  objective TEXT,
  summary TEXT,
  key_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_result TEXT,
  common_mistakes JSONB NOT NULL DEFAULT '[]'::jsonb,
  tips JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER lesson_instructions_updated_at
  BEFORE UPDATE ON lesson_instructions
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

-- Helpers
CREATE OR REPLACE FUNCTION public.course_is_published(p_course_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = p_course_id AND c.status = 'published'
  );
$$;

CREATE OR REPLACE FUNCTION public.lesson_belongs_to_published_course(p_lesson_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = p_lesson_id
      AND c.status = 'published'
      AND l.status = 'published'
  );
$$;

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_instructions ENABLE ROW LEVEL SECURITY;

CREATE POLICY categories_public_read ON categories
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE OR public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator'));

CREATE POLICY courses_public_read ON courses
  FOR SELECT TO anon, authenticated
  USING (
    status = 'published'
    OR public.has_role('admin')
    OR public.has_role('super_admin')
    OR public.has_role('curator')
    OR public.has_role('instructor')
  );

CREATE POLICY course_categories_public_read ON course_categories
  FOR SELECT TO anon, authenticated
  USING (
    public.course_is_published(course_id)
    OR public.has_role('admin')
    OR public.has_role('super_admin')
    OR public.has_role('curator')
  );

CREATE POLICY modules_public_read ON modules
  FOR SELECT TO anon, authenticated
  USING (
    public.course_is_published(course_id)
    OR public.has_role('admin')
    OR public.has_role('super_admin')
    OR public.has_role('curator')
  );

CREATE POLICY lessons_public_read ON lessons
  FOR SELECT TO anon, authenticated
  USING (
    (
      status = 'published'
      AND EXISTS (
        SELECT 1 FROM public.modules m
        JOIN public.courses c ON c.id = m.course_id
        WHERE m.id = lessons.module_id AND c.status = 'published'
      )
    )
    OR public.has_role('admin')
    OR public.has_role('super_admin')
    OR public.has_role('curator')
  );

CREATE POLICY youtube_sources_public_read ON youtube_sources
  FOR SELECT TO anon, authenticated
  USING (
    public.lesson_belongs_to_published_course(lesson_id)
    OR public.has_role('admin')
    OR public.has_role('super_admin')
    OR public.has_role('curator')
  );

CREATE POLICY lesson_instructions_public_read ON lesson_instructions
  FOR SELECT TO anon, authenticated
  USING (
    public.lesson_belongs_to_published_course(lesson_id)
    OR public.has_role('admin')
    OR public.has_role('super_admin')
    OR public.has_role('curator')
  );

-- Staff write policies (Phase 5 will expand admin UI)
CREATE POLICY categories_staff_write ON categories
  FOR ALL TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator'))
  WITH CHECK (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator'));

CREATE POLICY courses_staff_write ON courses
  FOR ALL TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator') OR public.has_role('instructor'))
  WITH CHECK (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator') OR public.has_role('instructor'));

CREATE POLICY modules_staff_write ON modules
  FOR ALL TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator') OR public.has_role('instructor'))
  WITH CHECK (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator') OR public.has_role('instructor'));

CREATE POLICY lessons_staff_write ON lessons
  FOR ALL TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator') OR public.has_role('instructor'))
  WITH CHECK (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator') OR public.has_role('instructor'));

CREATE POLICY youtube_sources_staff_write ON youtube_sources
  FOR ALL TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator') OR public.has_role('instructor'))
  WITH CHECK (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator') OR public.has_role('instructor'));

CREATE POLICY lesson_instructions_staff_write ON lesson_instructions
  FOR ALL TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator') OR public.has_role('instructor'))
  WITH CHECK (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator') OR public.has_role('instructor'));

-- Seed demo catalogue (fixed UUIDs)
INSERT INTO categories (id, name, slug, description, icon, sort_order, is_active) VALUES
  ('11111111-1111-4111-8111-111111111101', 'Intelligence artificielle', 'intelligence-artificielle', 'Comprendre et utiliser l''IA au quotidien.', 'sparkles', 1, TRUE),
  ('11111111-1111-4111-8111-111111111102', 'Création de sites', 'creation-de-sites', 'HTML, CSS, et bases du web.', 'globe', 2, TRUE),
  ('11111111-1111-4111-8111-111111111103', 'Marketing digital', 'marketing-digital', 'Visibilité et acquisition en ligne.', 'megaphone', 3, TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO courses (
  id, category_id, title, slug, short_description, description, thumbnail_url,
  level, language, estimated_duration_minutes, learning_outcomes, prerequisites,
  required_tools, final_project_description, status, access_type, is_featured, published_at
) VALUES
(
  '22222222-2222-4222-8222-222222222201',
  '11111111-1111-4111-8111-111111111102',
  'Bases du web en pratique',
  'bases-du-web-en-pratique',
  'Créez votre première page web structurée.',
  'Parcours d''initiation au HTML et CSS avec des leçons YouTube curées, des exercices et un mini-projet.',
  'https://i.ytimg.com/vi/PkZNo7MFNFg/hqdefault.jpg',
  'beginner',
  'fr',
  180,
  '["Structurer une page HTML", "Appliquer du CSS de base", "Publier un premier résultat"]'::jsonb,
  '["Navigateur moderne", "Éditeur de texte (VS Code recommandé)"]'::jsonb,
  '["VS Code", "Navigateur Chrome ou Firefox"]'::jsonb,
  'Créer une page « À propos » personnelle responsive.',
  'published',
  'subscription',
  TRUE,
  NOW()
),
(
  '22222222-2222-4222-8222-222222222202',
  '11111111-1111-4111-8111-111111111101',
  'Premiers pas avec l''IA',
  'premiers-pas-avec-lia',
  'Utiliser ChatGPT et outils IA sans jargon.',
  'Découvrez comment formuler des prompts utiles et produire des résultats concrets.',
  'https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg',
  'beginner',
  'fr',
  90,
  '["Comprendre ce qu''est un prompt", "Obtenir un résultat actionnable"]'::jsonb,
  '["Compte e-mail", "Accès Internet"]'::jsonb,
  '["Navigateur web"]'::jsonb,
  'Rédiger un prompt qui produit un plan de formation personnalisé.',
  'published',
  'subscription',
  TRUE,
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO course_categories (course_id, category_id) VALUES
  ('22222222-2222-4222-8222-222222222201', '11111111-1111-4111-8111-111111111102'),
  ('22222222-2222-4222-8222-222222222202', '11111111-1111-4111-8111-111111111101')
ON CONFLICT DO NOTHING;

INSERT INTO modules (id, course_id, title, description, objectives, sort_order, is_required) VALUES
  ('33333333-3333-4333-8333-333333333301', '22222222-2222-4222-8222-222222222201', 'Démarrer', 'Les bases pour écrire du HTML.', '["Ouvrir un fichier HTML", "Comprendre la structure"]'::jsonb, 1, TRUE),
  ('33333333-3333-4333-8333-333333333302', '22222222-2222-4222-8222-222222222201', 'Styliser', 'Appliquer du CSS simple.', '["Lier une feuille CSS", "Modifier couleurs et mise en page"]'::jsonb, 2, TRUE),
  ('33333333-3333-4333-8333-333333333303', '22222222-2222-4222-8222-222222222202', 'Comprendre l''IA', 'Concepts essentiels.', '["Définir un prompt clair"]'::jsonb, 1, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO lessons (
  id, module_id, title, slug, lesson_type, description, estimated_duration_minutes,
  sort_order, is_required, is_preview, status, completion_rule
) VALUES
  ('44444444-4444-4444-8444-444444444401', '33333333-3333-4333-8333-333333333301', 'Introduction au HTML', 'introduction-html', 'youtube', 'Découvrir la structure d''une page.', 25, 1, TRUE, TRUE, 'published', 'manual'),
  ('44444444-4444-4444-8444-444444444402', '33333333-3333-4333-8333-333333333301', 'Balises essentielles', 'balises-essentielles', 'youtube', 'Titres, paragraphes et liens.', 30, 2, TRUE, FALSE, 'published', 'manual'),
  ('44444444-4444-4444-8444-444444444403', '33333333-3333-4333-8333-333333333302', 'CSS de base', 'css-de-base', 'youtube', 'Couleurs, marges et typographie.', 35, 1, TRUE, FALSE, 'published', 'manual'),
  ('44444444-4444-4444-8444-444444444404', '33333333-3333-4333-8333-333333333303', 'Qu''est-ce qu''un prompt ?', 'quest-ce-quun-prompt', 'youtube', 'Les bases d''une bonne instruction.', 20, 1, TRUE, TRUE, 'published', 'manual')
ON CONFLICT DO NOTHING;

INSERT INTO youtube_sources (
  id, lesson_id, youtube_video_id, video_url, channel_name, channel_url,
  original_title, thumbnail_url, embed_status
) VALUES
  (
    '55555555-5555-4555-8555-555555555501',
    '44444444-4444-4444-8444-444444444401',
    'PkZNo7MFNFg',
    'https://www.youtube.com/watch?v=PkZNo7MFNFg',
    'freeCodeCamp.org',
    'https://www.youtube.com/@freecodecamp',
    'Learn JavaScript - Full Course for Beginners',
    'https://i.ytimg.com/vi/PkZNo7MFNFg/hqdefault.jpg',
    'healthy'
  ),
  (
    '55555555-5555-4555-8555-555555555502',
    '44444444-4444-4444-8444-444444444402',
    'qz0aGYrrlhU',
    'https://www.youtube.com/watch?v=qz0aGYrrlhU',
    'Programming with Mosh',
    'https://www.youtube.com/@programmingwithmosh',
    'HTML Tutorial for Beginners',
    'https://i.ytimg.com/vi/qz0aGYrrlhU/hqdefault.jpg',
    'healthy'
  ),
  (
    '55555555-5555-4555-8555-555555555503',
    '44444444-4444-4444-8444-444444444403',
    '1Rs2ND1ryYc',
    'https://www.youtube.com/watch?v=1Rs2ND1ryYc',
    'freeCodeCamp.org',
    'https://www.youtube.com/@freecodecamp',
    'CSS Tutorial - Zero to Hero',
    'https://i.ytimg.com/vi/1Rs2ND1ryYc/hqdefault.jpg',
    'healthy'
  ),
  (
    '55555555-5555-4555-8555-555555555504',
    '44444444-4444-4444-8444-444444444404',
    'jNQXAC9IVRw',
    'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    'jawed',
    'https://www.youtube.com/@jawed',
    'Me at the zoo',
    'https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg',
    'healthy'
  )
ON CONFLICT (lesson_id) DO NOTHING;

INSERT INTO lesson_instructions (
  lesson_id, objective, summary, key_points, steps, expected_result, common_mistakes, tips
) VALUES
(
  '44444444-4444-4444-8444-444444444401',
  'Comprendre la structure minimale d''une page HTML.',
  'Vous allez voir comment une page web est organisée et pourquoi chaque balise compte.',
  '["DOCTYPE", "html / head / body", "Titre de page"]'::jsonb,
  '["Ouvrir VS Code", "Créer index.html", "Reproduire la structure vue dans la vidéo"]'::jsonb,
  'Un fichier index.html qui s''ouvre dans le navigateur avec un titre visible.',
  '["Oublier la balise title", "Ouvrir le fichier sans extension .html"]'::jsonb,
  '["Gardez la vidéo en pause et reproduisez étape par étape."]'::jsonb
),
(
  '44444444-4444-4444-8444-444444444402',
  'Utiliser les balises de contenu de base.',
  'Apprenez h1–h3, p, a et img.',
  '["Titres hiérarchiques", "Liens", "Images avec alt"]'::jsonb,
  '["Ajouter un titre", "Écrire deux paragraphes", "Insérer un lien externe"]'::jsonb,
  'Une page avec titre, texte et un lien cliquable.',
  '["Sauter des niveaux de titres", "Lien sans texte descriptif"]'::jsonb,
  '["Testez chaque lien après l''avoir ajouté."]'::jsonb
),
(
  '44444444-4444-4444-8444-444444444403',
  'Appliquer des styles CSS simples.',
  'Couleur, police, marges et centrage basique.',
  '["Sélecteurs", "Propriétés courantes", "Lien stylesheet"]'::jsonb,
  '["Créer styles.css", "Lier le fichier", "Changer la couleur du titre"]'::jsonb,
  'Le titre de la page change de couleur via CSS externe.',
  '["Chemin incorrect vers le CSS", "Oublier le point-virgule"]'::jsonb,
  '["Inspectez l''élément dans le navigateur pour vérifier."]'::jsonb
),
(
  '44444444-4444-4444-8444-444444444404',
  'Écrire un premier prompt clair.',
  'Une bonne instruction donne un meilleur résultat.',
  '["Contexte", "Objectif", "Contraintes"]'::jsonb,
  '["Définir votre objectif", "Ajouter 3 contraintes", "Tester le prompt"]'::jsonb,
  'Un prompt qui produit un plan en 5 étapes.',
  '["Prompt trop vague", "Aucune contrainte de format"]'::jsonb,
  '["Demandez toujours le format de sortie souhaité."]'::jsonb
)
ON CONFLICT (lesson_id) DO NOTHING;
