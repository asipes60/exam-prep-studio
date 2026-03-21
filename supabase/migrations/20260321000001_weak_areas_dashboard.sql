-- ============================================================================
-- Weak Areas + Dashboard Migration
-- Created: 2026-03-21
-- Adds: assessments table, domain scores table, quiz session columns
-- ============================================================================

-- ============================================================================
-- 1. NEW TABLES
-- ============================================================================

-- Assessment results (manual self-assessment + AI study plans)
create table public.exam_prep_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  license_type text not null check (license_type in ('LPCC', 'LMFT', 'LCSW', 'LAW_ETHICS')),
  ratings jsonb not null default '[]'::jsonb,
  weak_areas text[] not null default '{}',
  strong_areas text[] not null default '{}',
  suggested_plan jsonb,
  created_at timestamptz not null default now()
);

-- Domain performance scores (accumulated from quiz results)
create table public.exam_prep_domain_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  license_type text not null check (license_type in ('LPCC', 'LMFT', 'LCSW', 'LAW_ETHICS')),
  domain_id text not null,
  domain_name text not null,
  total_questions integer not null default 0,
  correct_answers integer not null default 0,
  last_quiz_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, license_type, domain_id)
);

-- ============================================================================
-- 2. ALTER EXISTING TABLES
-- ============================================================================

-- Add format and topic columns to quiz sessions
alter table public.exam_prep_quiz_sessions
  add column if not exists format text,
  add column if not exists topic text;

-- ============================================================================
-- 3. INDEXES
-- ============================================================================

create index idx_exam_prep_assessments_user_id
  on public.exam_prep_assessments(user_id);
create index idx_exam_prep_assessments_user_license
  on public.exam_prep_assessments(user_id, license_type);

create index idx_exam_prep_domain_scores_user_id
  on public.exam_prep_domain_scores(user_id);
create index idx_exam_prep_domain_scores_user_license
  on public.exam_prep_domain_scores(user_id, license_type);

-- ============================================================================
-- 4. TRIGGERS
-- ============================================================================

create trigger handle_exam_prep_domain_scores_updated_at
  before update on public.exam_prep_domain_scores
  for each row
  execute function public.handle_updated_at();

-- ============================================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================================

alter table public.exam_prep_assessments enable row level security;
alter table public.exam_prep_domain_scores enable row level security;

-- exam_prep_assessments policies
create policy "Users can view their own assessments"
  on public.exam_prep_assessments for select
  using (user_id = auth.uid());

create policy "Users can insert their own assessments"
  on public.exam_prep_assessments for insert
  with check (user_id = auth.uid());

create policy "Users can delete their own assessments"
  on public.exam_prep_assessments for delete
  using (user_id = auth.uid());

-- exam_prep_domain_scores policies
create policy "Users can view their own domain scores"
  on public.exam_prep_domain_scores for select
  using (user_id = auth.uid());

create policy "Users can insert their own domain scores"
  on public.exam_prep_domain_scores for insert
  with check (user_id = auth.uid());

create policy "Users can update their own domain scores"
  on public.exam_prep_domain_scores for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own domain scores"
  on public.exam_prep_domain_scores for delete
  using (user_id = auth.uid());
