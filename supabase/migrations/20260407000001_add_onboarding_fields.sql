-- Add onboarding tracking fields to profiles
alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists selected_exams text[] default '{}';

-- Comment for clarity
comment on column public.profiles.onboarding_completed_at is 'Timestamp when user completed the onboarding wizard. NULL = not completed.';
comment on column public.profiles.selected_exams is 'Array of exam track IDs the user selected during onboarding (e.g. LMFT, LAW_ETHICS).';
