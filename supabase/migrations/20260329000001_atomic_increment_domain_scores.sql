-- Atomic upsert for domain scores — prevents race conditions from concurrent quiz completions.
-- Inserts a new row or increments existing totals in a single statement.
CREATE OR REPLACE FUNCTION public.upsert_domain_score(
  p_user_id uuid,
  p_license_type text,
  p_domain_id text,
  p_domain_name text,
  p_correct integer,
  p_total integer
) RETURNS void
LANGUAGE sql
AS $$
  INSERT INTO public.exam_prep_domain_scores (user_id, license_type, domain_id, domain_name, correct_answers, total_questions, last_quiz_at)
  VALUES (p_user_id, p_license_type, p_domain_id, p_domain_name, p_correct, p_total, now())
  ON CONFLICT (user_id, license_type, domain_id)
  DO UPDATE SET
    correct_answers = exam_prep_domain_scores.correct_answers + EXCLUDED.correct_answers,
    total_questions = exam_prep_domain_scores.total_questions + EXCLUDED.total_questions,
    last_quiz_at = now(),
    updated_at = now();
$$;
