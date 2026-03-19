-- ============================================================================
-- Exam Prep Studio - Initial Schema Migration
-- Created: 2026-03-19
-- ============================================================================

-- ============================================================================
-- 1. HELPER FUNCTIONS
-- ============================================================================

-- Function to auto-update updated_at columns
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Function to auto-create a profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name'
  );
  return new;
end;
$$;

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  preferred_license text check (preferred_license in ('LPCC', 'LMFT', 'LCSW', 'LAW_ETHICS')),
  subscription_status text not null default 'free' check (subscription_status in ('free', 'pro', 'cancelled')),
  stripe_customer_id text unique,
  daily_generations integer not null default 0,
  daily_generations_reset_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- exam_prep_folders (must come before exam_prep_materials)
create table public.exam_prep_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- exam_prep_materials (saved study materials)
create table public.exam_prep_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  license_type text not null check (license_type in ('LPCC', 'LMFT', 'LCSW', 'LAW_ETHICS')),
  study_format text not null,
  topic text not null,
  content jsonb not null,
  is_favorite boolean not null default false,
  folder_id uuid references public.exam_prep_folders(id) on delete set null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- exam_prep_quiz_sessions
create table public.exam_prep_quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  license_type text not null,
  mode text not null check (mode in ('study', 'test')),
  questions jsonb not null,
  results jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  score integer,
  created_at timestamptz not null default now()
);

-- exam_prep_usage (tracks daily generation counts)
create table public.exam_prep_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  generation_type text not null,
  license_type text not null,
  topic text,
  created_at timestamptz not null default now()
);

-- subscriptions (Stripe subscription tracking)
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null default 'inactive' check (status in ('active', 'inactive', 'past_due', 'cancelled')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================

-- exam_prep_materials
create index idx_exam_prep_materials_user_id on public.exam_prep_materials(user_id);
create index idx_exam_prep_materials_folder_id on public.exam_prep_materials(folder_id);
create index idx_exam_prep_materials_user_license on public.exam_prep_materials(user_id, license_type);
create index idx_exam_prep_materials_user_favorite on public.exam_prep_materials(user_id, is_favorite);

-- exam_prep_quiz_sessions
create index idx_exam_prep_quiz_sessions_user_id on public.exam_prep_quiz_sessions(user_id);
create index idx_exam_prep_quiz_sessions_user_license on public.exam_prep_quiz_sessions(user_id, license_type);

-- exam_prep_usage
create index idx_exam_prep_usage_user_id on public.exam_prep_usage(user_id);
create index idx_exam_prep_usage_user_created on public.exam_prep_usage(user_id, created_at);

-- subscriptions
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_stripe_sub_id on public.subscriptions(stripe_subscription_id);

-- ============================================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.exam_prep_folders enable row level security;
alter table public.exam_prep_materials enable row level security;
alter table public.exam_prep_quiz_sessions enable row level security;
alter table public.exam_prep_usage enable row level security;
alter table public.subscriptions enable row level security;

-- profiles policies (no self-delete)
create policy "Users can view their own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- exam_prep_folders policies
create policy "Users can view their own folders"
  on public.exam_prep_folders for select
  using (user_id = auth.uid());

create policy "Users can insert their own folders"
  on public.exam_prep_folders for insert
  with check (user_id = auth.uid());

create policy "Users can update their own folders"
  on public.exam_prep_folders for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own folders"
  on public.exam_prep_folders for delete
  using (user_id = auth.uid());

-- exam_prep_materials policies
create policy "Users can view their own materials"
  on public.exam_prep_materials for select
  using (user_id = auth.uid());

create policy "Users can insert their own materials"
  on public.exam_prep_materials for insert
  with check (user_id = auth.uid());

create policy "Users can update their own materials"
  on public.exam_prep_materials for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own materials"
  on public.exam_prep_materials for delete
  using (user_id = auth.uid());

-- exam_prep_quiz_sessions policies
create policy "Users can view their own quiz sessions"
  on public.exam_prep_quiz_sessions for select
  using (user_id = auth.uid());

create policy "Users can insert their own quiz sessions"
  on public.exam_prep_quiz_sessions for insert
  with check (user_id = auth.uid());

create policy "Users can update their own quiz sessions"
  on public.exam_prep_quiz_sessions for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own quiz sessions"
  on public.exam_prep_quiz_sessions for delete
  using (user_id = auth.uid());

-- exam_prep_usage policies
create policy "Users can view their own usage"
  on public.exam_prep_usage for select
  using (user_id = auth.uid());

create policy "Users can insert their own usage"
  on public.exam_prep_usage for insert
  with check (user_id = auth.uid());

create policy "Users can update their own usage"
  on public.exam_prep_usage for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own usage"
  on public.exam_prep_usage for delete
  using (user_id = auth.uid());

-- subscriptions policies
create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (user_id = auth.uid());

create policy "Users can insert their own subscription"
  on public.subscriptions for insert
  with check (user_id = auth.uid());

create policy "Users can update their own subscription"
  on public.subscriptions for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own subscription"
  on public.subscriptions for delete
  using (user_id = auth.uid());

-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

-- Auto-create profile on new auth user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Auto-update updated_at on profiles
create trigger on_profiles_updated
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Auto-update updated_at on exam_prep_materials
create trigger on_exam_prep_materials_updated
  before update on public.exam_prep_materials
  for each row
  execute function public.handle_updated_at();

-- Auto-update updated_at on subscriptions
create trigger on_subscriptions_updated
  before update on public.subscriptions
  for each row
  execute function public.handle_updated_at();
