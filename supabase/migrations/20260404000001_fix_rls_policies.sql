-- ============================================================================
-- RLS Policy Fixes
-- Created: 2026-04-04
-- Fixes: subscription self-write, usage record mutability, is_admin escalation
-- ============================================================================

-- ============================================================================
-- 1. SUBSCRIPTIONS — Remove user write access (only Stripe webhook via
--    service role should insert/update/delete subscriptions)
-- ============================================================================

DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscription" ON public.subscriptions;

-- ============================================================================
-- 2. EXAM_PREP_USAGE — Make append-only (no update/delete)
-- ============================================================================

DROP POLICY IF EXISTS "Users can update their own usage" ON public.exam_prep_usage;
DROP POLICY IF EXISTS "Users can delete their own usage" ON public.exam_prep_usage;

-- ============================================================================
-- 3. PROFILES — Prevent users from escalating to admin via self-update
--    Replace the existing update policy with one that blocks is_admin changes.
-- ============================================================================

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND is_admin IS NOT DISTINCT FROM (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );
