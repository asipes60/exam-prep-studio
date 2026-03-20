-- Migration: Admin infrastructure, Knowledge Base, and Audit Log
-- Adds is_admin to profiles, creates admin_knowledge_base and audit_log tables

-- ─── Add is_admin to profiles ──────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- ─── Knowledge Base Table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('regulatory', 'course_content', 'notes', 'corrections')),
  content text NOT NULL,
  source_url text,
  tags text[] DEFAULT '{}',
  license_types text[] DEFAULT '{}',
  topics text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-update updated_at on knowledge base
CREATE TRIGGER handle_kb_updated_at
  BEFORE UPDATE ON public.admin_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- GIN indexes for array columns
CREATE INDEX IF NOT EXISTS idx_kb_tags ON public.admin_knowledge_base USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_kb_license_types ON public.admin_knowledge_base USING GIN (license_types);
CREATE INDEX IF NOT EXISTS idx_kb_topics ON public.admin_knowledge_base USING GIN (topics);
CREATE INDEX IF NOT EXISTS idx_kb_category ON public.admin_knowledge_base (category);

-- RLS for knowledge base
ALTER TABLE public.admin_knowledge_base ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read KB entries
CREATE POLICY "Authenticated users can read KB"
  ON public.admin_knowledge_base FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert KB entries
CREATE POLICY "Admins can insert KB"
  ON public.admin_knowledge_base FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Only admins can update KB entries
CREATE POLICY "Admins can update KB"
  ON public.admin_knowledge_base FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Only admins can delete KB entries
CREATE POLICY "Admins can delete KB"
  ON public.admin_knowledge_base FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ─── Audit Log Table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt_text text,
  output_text text,
  system_prompt text,
  license_type text,
  study_format text,
  topic text,
  difficulty text,
  model_used text,
  tokens_in integer,
  tokens_out integer,
  generation_time_ms integer,
  flagged boolean DEFAULT false,
  flag_reason text,
  admin_notes text,
  kb_entries_used uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_user_id ON public.audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_flagged ON public.audit_log (flagged) WHERE flagged = true;
CREATE INDEX IF NOT EXISTS idx_audit_license_type ON public.audit_log (license_type);
CREATE INDEX IF NOT EXISTS idx_audit_study_format ON public.audit_log (study_format);

-- RLS for audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Users can insert their own audit entries
CREATE POLICY "Users can insert own audit entries"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can read their own entries; admins can read all
CREATE POLICY "Users read own, admins read all"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Only admins can update audit entries (for flagging, notes)
CREATE POLICY "Admins can update audit entries"
  ON public.audit_log FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );
