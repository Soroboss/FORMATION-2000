-- Phase 4: learning progress, notes, favorites, simple quiz & exercises

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0
    CHECK (progress_percent >= 0 AND progress_percent <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS enrollments_user_id_idx ON enrollments (user_id);
CREATE INDEX IF NOT EXISTS enrollments_course_id_idx ON enrollments (course_id);

CREATE TRIGGER enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0
    CHECK (progress_percent >= 0 AND progress_percent <= 100),
  last_position_seconds INT NOT NULL DEFAULT 0 CHECK (last_position_seconds >= 0),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS lesson_progress_user_id_idx ON lesson_progress (user_id);
CREATE INDEX IF NOT EXISTS lesson_progress_lesson_id_idx ON lesson_progress (lesson_id);

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes (user_id);
CREATE INDEX IF NOT EXISTS notes_lesson_id_idx ON notes (lesson_id);

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('course', 'lesson', 'resource', 'tool')),
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites (user_id);

CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score NUMERIC(5,2) NOT NULL DEFAULT 70
    CHECK (passing_score >= 0 AND passing_score <= 100),
  max_attempts INT CHECK (max_attempts IS NULL OR max_attempts > 0),
  time_limit_minutes INT CHECK (time_limit_minutes IS NULL OR time_limit_minutes > 0),
  shuffle_questions BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL
    CHECK (question_type IN ('single', 'multiple', 'true_false', 'short')),
  question TEXT NOT NULL,
  explanation TEXT,
  points NUMERIC(8,2) NOT NULL DEFAULT 1 CHECK (points >= 0),
  sort_order INT NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quiz_questions_quiz_sort_idx ON quiz_questions (quiz_id, sort_order);

CREATE TRIGGER quiz_questions_updated_at
  BEFORE UPDATE ON quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TABLE IF NOT EXISTS quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0 CHECK (sort_order >= 0)
);

CREATE INDEX IF NOT EXISTS quiz_options_question_id_idx ON quiz_options (question_id);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_number INT NOT NULL CHECK (attempt_number > 0),
  score NUMERIC(5,2),
  passed BOOLEAN,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  duration_seconds INT,
  UNIQUE (quiz_id, user_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS quiz_attempts_user_id_idx ON quiz_attempts (user_id);

CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer JSONB NOT NULL,
  is_correct BOOLEAN,
  points_awarded NUMERIC(8,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  expected_deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
  evaluation_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  submission_url TEXT,
  storage_paths JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'in_review', 'changes_requested', 'validated', 'rejected')),
  score NUMERIC(5,2),
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_comment TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS assignment_submissions_user_id_idx ON assignment_submissions (user_id);

CREATE TRIGGER assignment_submissions_updated_at
  BEFORE UPDATE ON assignment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

-- RLS
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY enrollments_own ON enrollments
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('support'))
  WITH CHECK (user_id = auth.uid() OR public.has_role('admin') OR public.has_role('super_admin'));

CREATE POLICY lesson_progress_own ON lesson_progress
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('support'))
  WITH CHECK (user_id = auth.uid() OR public.has_role('admin') OR public.has_role('super_admin'));

CREATE POLICY notes_own ON notes
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role('admin') OR public.has_role('super_admin'))
  WITH CHECK (user_id = auth.uid());

CREATE POLICY favorites_own ON favorites
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role('admin') OR public.has_role('super_admin'))
  WITH CHECK (user_id = auth.uid());

CREATE POLICY quizzes_public_read ON quizzes
  FOR SELECT TO authenticated
  USING (status = 'published' OR public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator'));

CREATE POLICY quiz_questions_public_read ON quiz_questions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_questions.quiz_id
        AND (q.status = 'published' OR public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator'))
    )
  );

-- Options readable, but grading must hide is_correct in app layer before submit.
CREATE POLICY quiz_options_public_read ON quiz_options
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.quiz_questions qq
      JOIN public.quizzes q ON q.id = qq.quiz_id
      WHERE qq.id = quiz_options.question_id
        AND (q.status = 'published' OR public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator'))
    )
  );

CREATE POLICY quiz_attempts_own ON quiz_attempts
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role('admin') OR public.has_role('super_admin'))
  WITH CHECK (user_id = auth.uid());

CREATE POLICY quiz_answers_own ON quiz_answers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts a
      WHERE a.id = quiz_answers.attempt_id
        AND (a.user_id = auth.uid() OR public.has_role('admin') OR public.has_role('super_admin'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts a
      WHERE a.id = quiz_answers.attempt_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY assignments_public_read ON assignments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY assignment_submissions_own ON assignment_submissions
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('instructor'))
  WITH CHECK (user_id = auth.uid() OR public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('instructor'));

-- Seed: simple quiz linked to first demo course + exercise on preview lesson
INSERT INTO quizzes (
  id, course_id, title, description, passing_score, max_attempts, status
) VALUES (
  '77777777-7777-4777-8777-777777777701',
  '22222222-2222-4222-8222-222222222201',
  'Quiz — Bases du web',
  'Vérifiez vos acquis sur HTML et CSS.',
  70,
  5,
  'published'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO quiz_questions (id, quiz_id, question_type, question, explanation, points, sort_order) VALUES
(
  '88888888-8888-4888-8888-888888888801',
  '77777777-7777-4777-8777-777777777701',
  'single',
  'Quelle balise définit le titre visible dans l''onglet du navigateur ?',
  'La balise <title> se place dans <head>.',
  1,
  1
),
(
  '88888888-8888-4888-8888-888888888802',
  '77777777-7777-4777-8777-777777777701',
  'true_false',
  'Le CSS externe se lie avec une balise <link> dans le <head>.',
  'Oui, via rel="stylesheet" href="...".',
  1,
  2
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO quiz_options (id, question_id, label, is_correct, sort_order) VALUES
  ('99999999-9999-4999-8999-999999999901', '88888888-8888-4888-8888-888888888801', '<title>', TRUE, 1),
  ('99999999-9999-4999-8999-999999999902', '88888888-8888-4888-8888-888888888801', '<header>', FALSE, 2),
  ('99999999-9999-4999-8999-999999999903', '88888888-8888-4888-8888-888888888801', '<h1>', FALSE, 3),
  ('99999999-9999-4999-8999-999999999904', '88888888-8888-4888-8888-888888888802', 'Vrai', TRUE, 1),
  ('99999999-9999-4999-8999-999999999905', '88888888-8888-4888-8888-888888888802', 'Faux', FALSE, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO assignments (
  id, course_id, lesson_id, title, instructions, expected_deliverables, evaluation_criteria, is_required
) VALUES (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  '22222222-2222-4222-8222-222222222201',
  '44444444-4444-4444-8444-444444444401',
  'Exercice — Créer index.html',
  'Créez un fichier index.html avec DOCTYPE, html, head (title) et body contenant un h1 avec votre prénom.',
  '["Lien vers un gist / Drive / capture", "Ou collez le code HTML"]'::jsonb,
  '["DOCTYPE présent", "title renseigné", "h1 visible"]'::jsonb,
  TRUE
)
ON CONFLICT (id) DO NOTHING;
