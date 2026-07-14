-- Phase 5: admin policies (role assignment, course_categories write, quizzes write)

CREATE POLICY course_categories_staff_write ON course_categories
  FOR ALL TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator'))
  WITH CHECK (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator'));

CREATE POLICY user_roles_admin_write ON user_roles
  FOR ALL TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin'))
  WITH CHECK (public.has_role('admin') OR public.has_role('super_admin'));

CREATE POLICY quizzes_staff_write ON quizzes
  FOR ALL TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator') OR public.has_role('instructor'))
  WITH CHECK (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator') OR public.has_role('instructor'));

CREATE POLICY quiz_questions_staff_write ON quiz_questions
  FOR ALL TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator') OR public.has_role('instructor'))
  WITH CHECK (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator') OR public.has_role('instructor'));

CREATE POLICY quiz_options_staff_write ON quiz_options
  FOR ALL TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator') OR public.has_role('instructor'))
  WITH CHECK (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator') OR public.has_role('instructor'));

CREATE POLICY assignments_staff_write ON assignments
  FOR ALL TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator') OR public.has_role('instructor'))
  WITH CHECK (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('curator') OR public.has_role('instructor'));
